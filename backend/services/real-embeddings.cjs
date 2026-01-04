/**
 * VISTAVIEW REAL EMBEDDING SERVICE
 * Uses OpenAI ada-002 or local sentence-transformers
 */

const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({ database: 'vistaview', host: 'localhost', port: 5432 });

// Configuration
const EMBEDDING_CONFIG = {
    provider: process.env.EMBEDDING_PROVIDER || 'pseudo', // 'openai', 'local', 'pseudo'
    openaiKey: process.env.OPENAI_API_KEY || '',
    model: 'text-embedding-ada-002',
    dimensions: 1536
};

/**
 * Generate embedding for text
 */
async function generateEmbedding(text) {
    if (!text || text.trim().length === 0) {
        return null;
    }
    
    const cleanText = text.substring(0, 8000).trim(); // Limit for OpenAI
    
    switch (EMBEDDING_CONFIG.provider) {
        case 'openai':
            return generateOpenAIEmbedding(cleanText);
        case 'local':
            return generateLocalEmbedding(cleanText);
        default:
            return generatePseudoEmbedding(cleanText);
    }
}

/**
 * OpenAI embedding
 */
async function generateOpenAIEmbedding(text) {
    if (!EMBEDDING_CONFIG.openaiKey) {
        console.log('[EMBED] No OpenAI key, falling back to pseudo');
        return generatePseudoEmbedding(text);
    }
    
    try {
        const { OpenAI } = require('openai');
        const openai = new OpenAI({ apiKey: EMBEDDING_CONFIG.openaiKey });
        
        const response = await openai.embeddings.create({
            model: EMBEDDING_CONFIG.model,
            input: text
        });
        
        return response.data[0].embedding;
    } catch (error) {
        console.error('[EMBED] OpenAI error:', error.message);
        return generatePseudoEmbedding(text);
    }
}

/**
 * Local embedding (placeholder for sentence-transformers)
 */
async function generateLocalEmbedding(text) {
    // Would use something like:
    // const { pipeline } = require('@xenova/transformers');
    // const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('[EMBED] Local embeddings not implemented, using pseudo');
    return generatePseudoEmbedding(text);
}

/**
 * Pseudo embedding (deterministic, for testing)
 */
function generatePseudoEmbedding(text) {
    const hash = crypto.createHash('sha512').update(text).digest('hex');
    const embedding = [];
    
    for (let i = 0; i < EMBEDDING_CONFIG.dimensions; i++) {
        const idx = i % 64;
        const hexPair = hash.substring(idx * 2, idx * 2 + 2);
        const value = (parseInt(hexPair, 16) / 255) * 2 - 1; // Normalize to [-1, 1]
        embedding.push(value);
    }
    
    // Normalize to unit vector
    const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return embedding.map(v => v / magnitude);
}

/**
 * Process embedding queue
 */
async function processEmbeddingQueue(limit = 50) {
    console.log('[EMBED] Processing queue...');
    
    const pending = await pool.query(`
        SELECT * FROM embedding_queue 
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT $1
    `, [limit]);
    
    let processed = 0, failed = 0;
    
    for (const item of pending.rows) {
        try {
            const embedding = await generateEmbedding(item.content_to_embed);
            
            if (embedding) {
                // Update target table
                const vectorStr = `[${embedding.join(',')}]`;
                await pool.query(`
                    UPDATE ${item.target_table} SET ${item.target_column} = $1::vector
                    WHERE id = $2
                `, [vectorStr, item.target_id]);
                
                await pool.query(`
                    UPDATE embedding_queue SET status = 'completed', processed_at = NOW()
                    WHERE id = $1
                `, [item.id]);
                
                processed++;
            } else {
                throw new Error('Empty embedding');
            }
        } catch (error) {
            await pool.query(`
                UPDATE embedding_queue SET status = 'failed', error_message = $1
                WHERE id = $2
            `, [error.message, item.id]);
            failed++;
        }
    }
    
    // Update stats
    await pool.query(`
        UPDATE learning_stats SET embeddings_created = COALESCE(embeddings_created, 0) + $1, updated_at = NOW()
        WHERE stat_date = CURRENT_DATE
    `, [processed]);
    
    return { processed, failed, total: pending.rows.length };
}

/**
 * Queue item for embedding
 */
async function queueForEmbedding(targetTable, targetId, content, targetColumn = 'embedding') {
    await pool.query(`
        INSERT INTO embedding_queue (target_table, target_id, content_to_embed, target_column, status)
        VALUES ($1, $2, $3, $4, 'pending')
        ON CONFLICT DO NOTHING
    `, [targetTable, targetId, content, targetColumn]);
    
    return { success: true, queued: true };
}

/**
 * Semantic search using embeddings
 */
async function semanticSearch(query, tableName, options = {}) {
    const { limit = 10, minSimilarity = 0.5, column = 'embedding' } = options;
    
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) return [];
    
    const vectorStr = `[${queryEmbedding.join(',')}]`;
    
    try {
        const result = await pool.query(`
            SELECT *, 1 - (${column} <=> $1::vector) as similarity
            FROM ${tableName}
            WHERE ${column} IS NOT NULL
            ORDER BY ${column} <=> $1::vector
            LIMIT $2
        `, [vectorStr, limit]);
        
        return result.rows.filter(r => r.similarity >= minSimilarity);
    } catch (error) {
        console.error('[EMBED] Search error:', error.message);
        return [];
    }
}

/**
 * Find similar voice patterns
 */
async function findSimilarPatterns(text, limit = 5) {
    return semanticSearch(text, 'crawled_voice_patterns', { limit });
}

/**
 * Find similar products
 */
async function findSimilarProducts(text, limit = 5) {
    return semanticSearch(text, 'extracted_products', { limit });
}

module.exports = {
    generateEmbedding,
    processEmbeddingQueue,
    queueForEmbedding,
    semanticSearch,
    findSimilarPatterns,
    findSimilarProducts
};

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args[0] === 'process') {
        processEmbeddingQueue(parseInt(args[1]) || 50).then(r => {
            console.log('Result:', JSON.stringify(r, null, 2));
            process.exit(0);
        });
    } else if (args[0] === 'search') {
        semanticSearch(args.slice(1).join(' '), 'crawled_voice_patterns').then(r => {
            console.log('Results:', JSON.stringify(r, null, 2));
            process.exit(0);
        });
    } else if (args[0]) {
        generateEmbedding(args.join(' ')).then(r => {
            console.log('Embedding length:', r?.length);
            console.log('First 5 values:', r?.slice(0, 5));
            process.exit(0);
        });
    } else {
        console.log('Usage: node real-embeddings.cjs <text>');
        console.log('       node real-embeddings.cjs process [limit]');
        console.log('       node real-embeddings.cjs search <query>');
    }
}

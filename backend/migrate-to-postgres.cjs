const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  database: 'vistaview',
  host: 'localhost',
  port: 5432
});

async function migrate() {
  console.log('Starting migration...');
  
  // Load JSON data
  const dataFile = path.join(__dirname, 'ai-data.json');
  let jsonData = {};
  
  try {
    jsonData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    console.log('Loaded JSON data');
  } catch (e) {
    console.log('No JSON data to migrate');
    return;
  }
  
  const client = await pool.connect();
  
  try {
    // Migrate memories to ai_memories
    if (jsonData.memories && jsonData.memories.length > 0) {
      console.log(`Migrating ${jsonData.memories.length} memories...`);
      
      for (const mem of jsonData.memories) {
        await client.query(`
          INSERT INTO ai_memories (memory_type, category, key_concept, learned_data, confidence_score, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
        `, [
          mem.memory_type || 'fact',
          mem.context || 'general',
          mem.id || '',
          JSON.stringify(mem.learned_data || mem),
          mem.confidence_score || 0.8,
          mem.created_at || new Date()
        ]);
      }
      console.log('✅ Memories migrated');
    }
    
    // Migrate stats to learning_stats
    if (jsonData.stats) {
      console.log('Migrating stats...');
      const s = jsonData.stats;
      
      await client.query(`
        INSERT INTO learning_stats (stat_date, total_interactions, patterns_learned, market_prices_learned, accuracy_score)
        VALUES (CURRENT_DATE, $1, $2, $3, $4)
        ON CONFLICT (stat_date) DO UPDATE SET
          total_interactions = EXCLUDED.total_interactions,
          patterns_learned = EXCLUDED.patterns_learned,
          market_prices_learned = EXCLUDED.market_prices_learned,
          accuracy_score = EXCLUDED.accuracy_score,
          updated_at = NOW()
      `, [
        s.total_interactions || 0,
        s.learned_patterns || 0,
        s.market_prices_learned || 0,
        parseFloat(s.accuracy_score) || 85
      ]);
      console.log('✅ Stats migrated');
    }
    
    // Migrate team knowledge
    if (jsonData.team_knowledge) {
      console.log('Migrating team knowledge...');
      await client.query(`
        INSERT INTO knowledge_base (category, topic, content, metadata)
        VALUES ('team', 'vistaview_team', $1, $2)
        ON CONFLICT DO NOTHING
      `, [
        JSON.stringify(jsonData.team_knowledge),
        JSON.stringify({ source: 'json_migration' })
      ]);
    }
    
    // Migrate about_us_knowledge
    if (jsonData.about_us_knowledge) {
      await client.query(`
        INSERT INTO knowledge_base (category, topic, content, metadata)
        VALUES ('company', 'about_us', $1, $2)
        ON CONFLICT DO NOTHING
      `, [
        JSON.stringify(jsonData.about_us_knowledge),
        JSON.stringify({ source: 'json_migration' })
      ]);
    }
    
    // Migrate how_it_works_knowledge
    if (jsonData.how_it_works_knowledge) {
      await client.query(`
        INSERT INTO knowledge_base (category, topic, content, metadata)
        VALUES ('product', 'how_it_works', $1, $2)
        ON CONFLICT DO NOTHING
      `, [
        JSON.stringify(jsonData.how_it_works_knowledge),
        JSON.stringify({ source: 'json_migration' })
      ]);
    }
    
    // Migrate vendor_flow
    if (jsonData.vendor_flow) {
      await client.query(`
        INSERT INTO knowledge_base (category, topic, content, metadata)
        VALUES ('process', 'vendor_flow', $1, $2)
        ON CONFLICT DO NOTHING
      `, [
        JSON.stringify(jsonData.vendor_flow),
        JSON.stringify({ source: 'json_migration' })
      ]);
    }
    
    console.log('✅ Knowledge base migrated');
    console.log('Migration complete!');
    
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);

/**
 * VISTAVIEW REAL WEB CRAWLER
 * Uses Puppeteer for JS-rendered pages, Cheerio for static pages
 * Extracts voice patterns, commands, and UI text
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({ database: 'vistaview', host: 'localhost', port: 5432 });

// Voice pattern detection regex
const VOICE_PATTERNS = {
    commands: /\b(say|tell|ask|play|open|show|navigate|go to|search for|find|create|add|remove|delete|update|save|send|call|text|email|schedule|set|turn on|turn off|start|stop|pause|resume|next|previous|skip|repeat|louder|quieter|mute|unmute)\b/gi,
    queries: /\b(what is|what's|how do|how to|where is|when is|who is|why is|can you|could you|would you|will you|is there|are there|do you|does it)\b/gi,
    responses: /\b(okay|ok|sure|yes|no|done|got it|understood|working on it|here you go|i found|i can|i cannot|sorry|thank you|you're welcome)\b/gi,
    navigation: /\b(home|back|forward|up|down|left|right|scroll|click|tap|swipe|zoom|close|exit|menu|settings|profile|dashboard)\b/gi
};

// Sites known for voice UI patterns
const VOICE_UI_SITES = [
    { url: 'https://developer.amazon.com/en-US/docs/alexa/custom-skills/voice-interaction-model.html', domain: 'amazon', type: 'voice_assistant' },
    { url: 'https://developers.google.com/assistant/conversational/design', domain: 'google', type: 'voice_assistant' },
    { url: 'https://developer.apple.com/design/human-interface-guidelines/siri', domain: 'apple', type: 'voice_assistant' },
    { url: 'https://www.zillow.com/homes/', domain: 'zillow', type: 'real_estate' },
    { url: 'https://www.realtor.com/', domain: 'realtor', type: 'real_estate' },
    { url: 'https://www.homedepot.com/', domain: 'homedepot', type: 'home_improvement' },
    { url: 'https://www.lowes.com/', domain: 'lowes', type: 'home_improvement' }
];

/**
 * Crawl a single URL and extract content
 */
async function crawlUrl(url, options = {}) {
    const { useHeadless = true, depth = 0, maxDepth = 2, parentUrl = null } = options;
    
    console.log(`[CRAWLER] Crawling: ${url} (depth: ${depth})`);
    
    let browser = null;
    try {
        // Record in crawl_queue
        const queueResult = await pool.query(`
            INSERT INTO crawl_queue (url, domain, depth, max_depth, parent_url, status, started_at)
            VALUES ($1, $2, $3, $4, $5, 'crawling', NOW())
            RETURNING id
        `, [url, new URL(url).hostname, depth, maxDepth, parentUrl]);
        const queueId = queueResult.rows[0].id;
        
        let html, pageTitle, links = [];
        
        // Try Puppeteer first for JS-rendered content
        try {
            browser = await puppeteer.launch({
                headless: useHeadless ? 'new' : false,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setUserAgent('VistaView-Crawler/1.0 (+https://vistaview.ai/bot)');
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            html = await page.content();
            pageTitle = await page.title();
            
            // Extract all links
            links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a[href]'))
                    .map(a => a.href)
                    .filter(href => href.startsWith('http'));
            });
            
            await browser.close();
            browser = null;
        } catch (puppeteerError) {
            console.log(`[CRAWLER] Puppeteer failed, trying axios: ${puppeteerError.message}`);
            // Fallback to axios for static pages
            const response = await axios.get(url, {
                timeout: 15000,
                headers: { 'User-Agent': 'VistaView-Crawler/1.0' }
            });
            html = response.data;
        }
        
        // Parse with Cheerio
        const $ = cheerio.load(html);
        pageTitle = pageTitle || $('title').text().trim();
        const metaDescription = $('meta[name="description"]').attr('content') || '';
        
        // Extract text content
        $('script, style, noscript, iframe').remove();
        const textContent = $('body').text().replace(/\s+/g, ' ').trim();
        
        // Extract voice patterns
        const extractedPatterns = extractVoicePatterns(textContent);
        
        // Extract links if not already done
        if (links.length === 0) {
            $('a[href]').each((i, el) => {
                const href = $(el).attr('href');
                if (href && href.startsWith('http')) links.push(href);
            });
        }
        
        // Update crawl_queue
        await pool.query(`
            UPDATE crawl_queue SET 
                status = 'completed',
                page_title = $1,
                meta_description = $2,
                extracted_content = $3,
                extracted_patterns = $4,
                discovered_links = $5,
                completed_at = NOW()
            WHERE id = $6
        `, [pageTitle, metaDescription, textContent.substring(0, 50000), extractedPatterns, links.slice(0, 100), queueId]);
        
        // Store patterns in crawled_voice_patterns
        const domain = new URL(url).hostname.replace('www.', '');
        for (const pattern of extractedPatterns) {
            await pool.query(`
                INSERT INTO crawled_voice_patterns (source_url, source_domain, source_type, pattern_text, pattern_type, pattern_category, confidence)
                VALUES ($1, $2, 'web_crawl', $3, $4, $5, 0.7)
                ON CONFLICT DO NOTHING
            `, [url, domain, pattern.text, pattern.type, pattern.category]);
        }
        
        // Update stats
        await pool.query(`
            UPDATE learning_stats 
            SET web_pages_crawled = web_pages_crawled + 1,
                patterns_learned = patterns_learned + $1,
                updated_at = NOW()
            WHERE stat_date = CURRENT_DATE
        `, [extractedPatterns.length]);
        
        // Queue child links if depth allows
        if (depth < maxDepth) {
            const sameDomainLinks = links.filter(link => {
                try {
                    return new URL(link).hostname === new URL(url).hostname;
                } catch { return false; }
            }).slice(0, 10); // Limit to 10 child pages
            
            for (const childUrl of sameDomainLinks) {
                await pool.query(`
                    INSERT INTO crawl_queue (url, domain, depth, max_depth, parent_url, status, priority)
                    VALUES ($1, $2, $3, $4, $5, 'pending', 3)
                    ON CONFLICT DO NOTHING
                `, [childUrl, new URL(childUrl).hostname, depth + 1, maxDepth, url]);
            }
        }
        
        return {
            success: true,
            url,
            title: pageTitle,
            patternsFound: extractedPatterns.length,
            linksDiscovered: links.length,
            patterns: extractedPatterns
        };
        
    } catch (error) {
        console.error(`[CRAWLER] Error crawling ${url}:`, error.message);
        
        await pool.query(`
            UPDATE crawl_queue SET status = 'failed', error_message = $1, retry_count = retry_count + 1
            WHERE url = $2 AND status = 'crawling'
        `, [error.message, url]);
        
        return { success: false, url, error: error.message };
    } finally {
        if (browser) await browser.close();
    }
}

/**
 * Extract voice patterns from text
 */
function extractVoicePatterns(text) {
    const patterns = [];
    const seenPatterns = new Set();
    
    // Extract command patterns
    const commandMatches = text.match(VOICE_PATTERNS.commands) || [];
    for (const match of commandMatches) {
        const key = match.toLowerCase();
        if (!seenPatterns.has(key)) {
            seenPatterns.add(key);
            patterns.push({ text: match, type: 'command', category: 'action' });
        }
    }
    
    // Extract query patterns
    const queryMatches = text.match(VOICE_PATTERNS.queries) || [];
    for (const match of queryMatches) {
        const key = match.toLowerCase();
        if (!seenPatterns.has(key)) {
            seenPatterns.add(key);
            patterns.push({ text: match, type: 'query', category: 'information' });
        }
    }
    
    // Extract navigation patterns
    const navMatches = text.match(VOICE_PATTERNS.navigation) || [];
    for (const match of navMatches) {
        const key = match.toLowerCase();
        if (!seenPatterns.has(key)) {
            seenPatterns.add(key);
            patterns.push({ text: match, type: 'navigation', category: 'ui' });
        }
    }
    
    return patterns.slice(0, 50); // Limit per page
}

/**
 * Process pending crawl queue
 */
async function processCrawlQueue(limit = 10) {
    console.log('[CRAWLER] Processing crawl queue...');
    
    const pending = await pool.query(`
        SELECT * FROM crawl_queue 
        WHERE status = 'pending' AND retry_count < max_retries
        ORDER BY priority DESC, created_at ASC
        LIMIT $1
    `, [limit]);
    
    const results = [];
    for (const job of pending.rows) {
        const result = await crawlUrl(job.url, {
            depth: job.depth,
            maxDepth: job.max_depth,
            parentUrl: job.parent_url
        });
        results.push(result);
        
        // Small delay between requests
        await new Promise(r => setTimeout(r, 1000));
    }
    
    return results;
}

/**
 * Start crawling voice UI sites
 */
async function crawlVoiceUISites() {
    console.log('[CRAWLER] Starting voice UI sites crawl...');
    
    // Create crawl job
    const job = await pool.query(`
        INSERT INTO crawl_jobs (job_type, target_url, target_domain, status, started_at)
        VALUES ('voice_patterns', 'multiple', 'voice_ui_sites', 'running', NOW())
        RETURNING id
    `);
    const jobId = job.rows[0].id;
    
    let totalPatterns = 0;
    let pagesProcessed = 0;
    
    for (const site of VOICE_UI_SITES) {
        // Queue the site
        await pool.query(`
            INSERT INTO crawl_queue (url, domain, depth, max_depth, status, priority)
            VALUES ($1, $2, 0, 2, 'pending', 10)
            ON CONFLICT DO NOTHING
        `, [site.url, site.domain]);
    }
    
    // Process queue
    const results = await processCrawlQueue(VOICE_UI_SITES.length);
    
    for (const r of results) {
        if (r.success) {
            totalPatterns += r.patternsFound || 0;
            pagesProcessed++;
        }
    }
    
    // Update job
    await pool.query(`
        UPDATE crawl_jobs SET 
            status = 'completed',
            pages_crawled = $1,
            patterns_found = $2,
            completed_at = NOW()
        WHERE id = $3
    `, [pagesProcessed, totalPatterns, jobId]);
    
    return { jobId, pagesProcessed, totalPatterns };
}

/**
 * Add URL to crawl queue
 */
async function queueUrl(url, options = {}) {
    const { priority = 5, maxDepth = 2 } = options;
    try {
        const domain = new URL(url).hostname;
        await pool.query(`
            INSERT INTO crawl_queue (url, domain, depth, max_depth, priority, status)
            VALUES ($1, $2, 0, $3, $4, 'pending')
            ON CONFLICT DO NOTHING
        `, [url, domain, maxDepth, priority]);
        return { success: true, url };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

module.exports = {
    crawlUrl,
    processCrawlQueue,
    crawlVoiceUISites,
    queueUrl,
    extractVoicePatterns
};

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args[0] === 'queue') {
        processCrawlQueue(parseInt(args[1]) || 10).then(r => {
            console.log('Results:', JSON.stringify(r, null, 2));
            process.exit(0);
        });
    } else if (args[0] === 'voice-sites') {
        crawlVoiceUISites().then(r => {
            console.log('Results:', JSON.stringify(r, null, 2));
            process.exit(0);
        });
    } else if (args[0]) {
        crawlUrl(args[0]).then(r => {
            console.log('Result:', JSON.stringify(r, null, 2));
            process.exit(0);
        });
    } else {
        console.log('Usage: node real-crawler.cjs <url>');
        console.log('       node real-crawler.cjs queue [limit]');
        console.log('       node real-crawler.cjs voice-sites');
    }
}

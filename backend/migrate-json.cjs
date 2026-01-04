const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ database: 'vistaview', host: 'localhost', port: 5432 });

async function migrate() {
  const dataFile = path.join(__dirname, 'ai-data.json');
  
  if (!fs.existsSync(dataFile)) {
    console.log('No JSON file to migrate');
    return;
  }
  
  const jsonData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  console.log('Loaded JSON data');
  
  const client = await pool.connect();
  
  try {
    // Migrate memories
    if (jsonData.memories && jsonData.memories.length > 0) {
      console.log(`Migrating ${jsonData.memories.length} memories...`);
      
      for (const mem of jsonData.memories.slice(0, 500)) {
        await client.query(`
          INSERT INTO ai_memories (memory_type, category, key_concept, learned_data, confidence_score)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          mem.memory_type || 'fact',
          mem.context || 'general',
          (mem.id || '').toString().substring(0, 100),
          JSON.stringify(mem.learned_data || mem),
          mem.confidence_score || 0.8
        ]);
      }
      console.log('✅ Memories migrated');
    }
    
    // Migrate knowledge
    const knowledgeItems = [
      { cat: 'team', topic: 'team_knowledge', data: jsonData.team_knowledge },
      { cat: 'company', topic: 'about_us', data: jsonData.about_us_knowledge },
      { cat: 'product', topic: 'how_it_works', data: jsonData.how_it_works_knowledge },
      { cat: 'process', topic: 'vendor_flow', data: jsonData.vendor_flow }
    ];
    
    for (const item of knowledgeItems) {
      if (item.data) {
        await client.query(`
          INSERT INTO knowledge_base (category, topic, content, metadata)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT DO NOTHING
        `, [item.cat, item.topic, JSON.stringify(item.data), JSON.stringify({ source: 'json_migration' })]);
      }
    }
    console.log('✅ Knowledge migrated');
    
    console.log('Migration complete!');
  } catch (e) {
    console.error('Migration error:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

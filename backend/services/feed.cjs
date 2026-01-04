const icons = { voice_input:'🎤', navigation:'🧭', pattern:'🧠', error:'❌', success:'✅', tts:'🔊' };
async function add(pool, type, title, desc, sessionId, userType, page) {
    try {
        await pool.query(`INSERT INTO realtime_feed (feed_type,title,description,session_id,user_type,page_context,icon) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [type,title,desc,sessionId,userType,page,icons[type]||'📌']);
    } catch(e) {}
}
module.exports = { add };

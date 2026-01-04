async function getResponse(pool, analysis, userType) {
    try {
        const r = await pool.query(`SELECT * FROM tts_responses WHERE trigger_type='emotion' AND trigger_value=$1 AND (user_type=$2 OR user_type='any') AND is_active=true ORDER BY priority DESC LIMIT 1`, [analysis.emotion, userType]);
        if (r.rows.length > 0) {
            await pool.query(`UPDATE tts_responses SET times_used=times_used+1, last_used=NOW() WHERE id=$1`, [r.rows[0].id]);
            return { text: r.rows[0].response_text, tone: r.rows[0].response_tone, speed: r.rows[0].speaking_speed };
        }
        return { text: "I understand. How can I help?", tone: 'neutral', speed: 'normal' };
    } catch(e) { return { text: "I'm here to help.", tone: 'neutral', speed: 'normal' }; }
}
module.exports = { getResponse };

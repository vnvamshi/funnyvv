async function learn(pool, text, analysis, userType) {
    try {
        const existing = await pool.query(`SELECT id FROM learned_patterns WHERE $1 = ANY(trigger_phrases) LIMIT 1`, [text.toLowerCase()]);
        if (existing.rows.length > 0) {
            await pool.query(`UPDATE learned_patterns SET occurrence_count=occurrence_count+1, last_used=NOW(), last_reinforced_by=$1 WHERE id=$2`, [userType, existing.rows[0].id]);
            return { id: existing.rows[0].id, isNew: false };
        } else {
            const r = await pool.query(`INSERT INTO learned_patterns (pattern_type,pattern_category,pattern_name,trigger_phrases,first_seen_by,last_reinforced_by) VALUES ($1,$2,$3,$4,$5,$5) RETURNING id`,
                [analysis.intent.startsWith('system')?'system':'command', analysis.emotion, `${analysis.intent}: ${text.substring(0,50)}`, [text.toLowerCase()], userType]);
            return { id: r.rows[0].id, isNew: true };
        }
    } catch(e) { return null; }
}
module.exports = { learn };

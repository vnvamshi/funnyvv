async function log(pool, action, desc, actor, table=null, id=null) {
    try {
        await pool.query(`INSERT INTO audit_trail (action_type,action_description,actor_type,actor_id,target_table,target_id) VALUES ($1,$2,'user',$3,$4,$5)`, [action,desc,actor,table,id]);
    } catch(e) { console.error('[Audit]',e.message); }
}
module.exports = { log };

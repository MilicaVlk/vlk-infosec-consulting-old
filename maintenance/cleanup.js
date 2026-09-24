// Separate scheduled Worker, D1 binding DB; no HTTP operations or personal-data logs.
export default {
 async scheduled(_event, env) {
  if (!env.DB) throw new Error('D1 binding DB is required');
  const now = Math.floor(Date.now()/1000);
  await env.DB.batch([
   env.DB.prepare('DELETE FROM challenges WHERE expires < ?').bind(now),
   env.DB.prepare('DELETE FROM rate_limits WHERE expires < ?').bind(now)
  ]);
 }
};

const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  try {
    const planIds = await kv.smembers(`study_plans:${userId}`) || [];
    const plans = [];
    
    for (const planId of planIds) {
      const plan = await kv.get(`study_plan:${planId}`);
      if (plan) {
        plans.push(plan);
      }
    }
    
    res.json({ count: plans.length, plans });
  } catch (err) {
    console.error('Error getting study plans count:', err.message);
    res.status(500).json({ error: 'Failed to get study plans count' });
  }
}
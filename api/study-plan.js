import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      // Save study plan
      const { planId, userId, title, description } = req.body;
      
      const studyPlan = {
        id: planId,
        userId,
        title,
        description,
        createdAt: new Date().toISOString()
      };

      await kv.set(`study_plan:${planId}`, studyPlan);
      await kv.sadd(`study_plans:${userId}`, planId);
      
      res.json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error saving study plan:', err.message);
    res.status(500).json({ error: 'Failed to save study plan' });
  }
}



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

  const { planId, userId } = req.query;

  try {
    if (req.method === 'GET') {
      // Get study plan
      const studyPlan = await kv.get(`study_plan:${planId}`);
      
      if (!studyPlan || studyPlan.userId !== userId) {
        return res.status(404).json({ error: 'Study plan not found or not owned by user' });
      }
      
      res.json({ studyPlan });
    } else if (req.method === 'DELETE') {
      // Delete study plan
      const studyPlan = await kv.get(`study_plan:${planId}`);
      
      if (!studyPlan || studyPlan.userId !== userId) {
        return res.status(404).json({ error: 'Study plan not found or not owned by user' });
      }

      // Delete the study plan
      await kv.del(`study_plan:${planId}`);
      await kv.srem(`study_plans:${userId}`, planId);
      
      // Delete associated messages and generated content
      await kv.del(`messages:${userId}:${planId}`);
      const contentIds = await kv.smembers(`generated_content:${userId}:${planId}`) || [];
      for (const contentId of contentIds) {
        await kv.del(`generated_content:${contentId}`);
      }
      await kv.del(`generated_content:${userId}:${planId}`);
      
      res.json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error with study plan:', err.message);
    res.status(500).json({ error: 'Failed to process study plan' });
  }
}
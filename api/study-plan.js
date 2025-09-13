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

  try {
    const { planId, userId, action } = req.query;

    if (req.method === 'POST') {
      // Save study plan
      const { planId: bodyPlanId, userId: bodyUserId, title, description } = req.body;
      
      const studyPlan = {
        id: bodyPlanId,
        userId: bodyUserId,
        title,
        description,
        createdAt: new Date().toISOString()
      };

      await kv.set(`study_plan:${bodyPlanId}`, studyPlan);
      await kv.sadd(`study_plans:${bodyUserId}`, bodyPlanId);
      
      res.json({ success: true });
    } else if (req.method === 'GET' && planId && userId) {
      // Get specific study plan
      const studyPlan = await kv.get(`study_plan:${planId}`);
      
      if (!studyPlan || studyPlan.userId !== userId) {
        return res.status(404).json({ error: 'Study plan not found or not owned by user' });
      }
      
      res.json({ studyPlan });
    } else if (req.method === 'GET' && userId && action === 'count') {
      // Get user's study plans count
      const planIds = await kv.smembers(`study_plans:${userId}`) || [];
      const plans = [];
      
      for (const id of planIds) {
        const plan = await kv.get(`study_plan:${id}`);
        if (plan) {
          plans.push(plan);
        }
      }
      
      res.json({ count: plans.length, plans });
    } else if (req.method === 'DELETE' && planId && userId) {
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



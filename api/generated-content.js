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
    const { contentId, userId, studyPlanId, action } = req.query;

    if (req.method === 'POST') {
      // Save generated content
      const { contentId: bodyContentId, userId: bodyUserId, studyPlanId: bodyStudyPlanId, type, title, data } = req.body;
      
      const content = {
        id: bodyContentId,
        userId: bodyUserId,
        studyPlanId: bodyStudyPlanId,
        type,
        title,
        data,
        createdAt: new Date().toISOString()
      };

      await kv.set(`generated_content:${bodyContentId}`, content);
      await kv.sadd(`generated_content:${bodyUserId}:${bodyStudyPlanId}`, bodyContentId);
      
      res.json({ success: true });
    } else if (req.method === 'GET' && userId && studyPlanId) {
      // Get generated content for a study plan
      const contentIds = await kv.smembers(`generated_content:${userId}:${studyPlanId}`) || [];
      const content = [];
      
      for (const id of contentIds) {
        const item = await kv.get(`generated_content:${id}`);
        if (item) {
          content.push(item);
        }
      }
      
      res.json({ content });
    } else if (req.method === 'DELETE' && contentId && action === 'delete') {
      // Delete generated content
      const { userId: bodyUserId } = req.body;
      const content = await kv.get(`generated_content:${contentId}`);
      
      if (!content || content.userId !== bodyUserId) {
        return res.status(404).json({ error: 'Content not found or not owned by user' });
      }

      await kv.del(`generated_content:${contentId}`);
      await kv.srem(`generated_content:${bodyUserId}:${content.studyPlanId}`, contentId);
      
      res.json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error with generated content:', err.message);
    res.status(500).json({ error: 'Failed to process generated content' });
  }
}
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
    if (req.method === 'POST') {
      // Save generated content
      const { contentId, userId, studyPlanId, type, title, data } = req.body;
      
      const content = {
        id: contentId,
        userId,
        studyPlanId,
        type,
        title,
        data,
        createdAt: new Date().toISOString()
      };

      await kv.set(`generated_content:${contentId}`, content);
      await kv.sadd(`generated_content:${userId}:${studyPlanId}`, contentId);
      
      res.json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error saving generated content:', err.message);
    res.status(500).json({ error: 'Failed to save generated content' });
  }
}
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

  const { contentId, userId } = req.query;

  try {
    if (req.method === 'DELETE') {
      // Delete generated content
      const content = await kv.get(`generated_content:${contentId}`);
      
      if (!content || content.userId !== userId) {
        return res.status(404).json({ error: 'Content not found or not owned by user' });
      }

      await kv.del(`generated_content:${contentId}`);
      await kv.srem(`generated_content:${userId}:${content.studyPlanId}`, contentId);
      
      res.json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error deleting generated content:', err.message);
    res.status(500).json({ error: 'Failed to delete generated content' });
  }
}
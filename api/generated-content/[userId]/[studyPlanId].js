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

  const { userId, studyPlanId } = req.query;

  try {
    if (req.method === 'GET') {
      // Get generated content for a study plan
      const contentIds = await kv.smembers(`generated_content:${userId}:${studyPlanId}`) || [];
      const content = [];
      
      for (const contentId of contentIds) {
        const item = await kv.get(`generated_content:${contentId}`);
        if (item) {
          content.push(item);
        }
      }
      
      res.json({ content });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error fetching generated content:', err.message);
    res.status(500).json({ error: 'Failed to fetch generated content' });
  }
}
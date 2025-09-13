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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, studyPlanId } = req.query;

  try {
    const messages = await kv.get(`messages:${userId}:${studyPlanId}`) || [];
    // Count only user messages (questions/actions)
    const userMessages = messages.filter(msg => msg.type === 'user');
    res.json({ count: userMessages.length, totalMessages: messages.length });
  } catch (err) {
    console.error('Error getting message count:', err.message);
    res.status(500).json({ error: 'Failed to get message count' });
  }
}
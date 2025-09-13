// const { kv } = require('@vercel/kv'); // Commented out for now

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
    const { userId, studyPlanId, action } = req.query;

    if (req.method === 'GET' && userId && studyPlanId) {
      if (action === 'count') {
        // Get message count (simplified - return 0)
        res.json({ count: 0, totalMessages: 0 });
      } else {
        // Get messages for a study plan (simplified - return empty array)
        res.json({ messages: [] });
      }
    } else if (req.method === 'DELETE' && userId && studyPlanId) {
      // Delete messages for a study plan (simplified - return success)
      res.json({ success: true, message: "Messages deleted locally" });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error with messages:', err.message);
    res.status(500).json({ error: 'Failed to process messages' });
  }
}

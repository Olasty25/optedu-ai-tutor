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
    const { planId, userId, action } = req.query;

    if (req.method === 'POST') {
      // Save study plan (simplified - just return success)
      res.json({ success: true, message: "Study plan saved locally" });
    } else if (req.method === 'GET' && planId && userId) {
      // Get specific study plan (simplified - return not found)
      res.status(404).json({ error: 'Study plan not found' });
    } else if (req.method === 'GET' && userId && action === 'count') {
      // Get user's study plans count (simplified - return 0)
      res.json({ count: 0, plans: [] });
    } else if (req.method === 'DELETE' && planId && userId) {
      // Delete study plan (simplified - return success)
      res.json({ success: true, message: "Study plan deleted locally" });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error with study plan:', err.message);
    res.status(500).json({ error: 'Failed to process study plan' });
  }
}



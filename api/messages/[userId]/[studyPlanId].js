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

  const { userId, studyPlanId } = req.query;

  try {
    if (req.method === 'GET') {
      // Get messages for a study plan (simplified - return empty array for now)
      res.json({ messages: [] });
    } else if (req.method === 'DELETE') {
      // Delete messages for a study plan (simplified - return success)
      res.json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error with messages:', err.message);
    res.status(500).json({ error: 'Failed to process messages' });
  }
}




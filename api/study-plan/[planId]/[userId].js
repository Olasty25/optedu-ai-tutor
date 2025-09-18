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

  const { planId, userId } = req.query;

  try {
    if (req.method === 'GET') {
      // Get study plan (simplified - return not found)
      res.status(404).json({ error: 'Study plan not found' });
    } else if (req.method === 'DELETE') {
      // Delete study plan (simplified - return success)
      res.json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error with study plan:', err.message);
    res.status(500).json({ error: 'Failed to process study plan' });
  }
}




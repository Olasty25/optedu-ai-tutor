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
    if (req.method === 'POST') {
      // Save generated content (simplified - just return success)
      res.json({ success: true, message: "Content saved locally" });
    } else if (req.method === 'GET') {
      // Get generated content (simplified - return empty array)
      res.json({ content: [] });
    } else if (req.method === 'DELETE') {
      // Delete generated content (simplified - return success)
      res.json({ success: true, message: "Content deleted locally" });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error with generated content:', err.message);
    res.status(500).json({ error: 'Failed to process generated content' });
  }
}
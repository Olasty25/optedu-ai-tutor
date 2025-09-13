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
    res.json({ 
      message: "Backend is working!",
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({ error: 'Test API failed' });
  }
}

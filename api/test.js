module.exports = (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}




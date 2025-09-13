module.exports = (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
}



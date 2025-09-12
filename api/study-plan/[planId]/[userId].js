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

  if (req.method === "DELETE") {
    try {
      const { planId, userId } = req.query;
      
      // For now, just return success since we don't have database persistence
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting study plan:", err.message);
      res.status(500).json({ error: "Failed to delete study plan" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

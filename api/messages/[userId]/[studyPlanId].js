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

  if (req.method === "GET") {
    try {
      const { userId, studyPlanId } = req.query;
      
      // For now, return empty messages since we don't have database persistence
      // In a real implementation, you'd query your database here
      res.json({ messages: [] });
    } catch (err) {
      console.error("Error fetching messages:", err.message);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { userId, studyPlanId } = req.query;
      
      // For now, just return success since we don't have database persistence
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting messages:", err.message);
      res.status(500).json({ error: "Failed to delete messages" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

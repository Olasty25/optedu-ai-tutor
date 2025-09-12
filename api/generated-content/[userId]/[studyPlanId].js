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
      
      // For now, return empty content since we don't have database persistence
      res.json({ content: [] });
    } catch (err) {
      console.error("Error fetching generated content:", err.message);
      res.status(500).json({ error: "Failed to fetch generated content" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

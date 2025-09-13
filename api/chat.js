const OpenAI = require("openai");

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { type, message, userId, studyPlanId } = req.body;

  let systemPrompt = "You are a helpful AI study assistant.";
  if (type === "flashcards") {
    systemPrompt = "Return ONLY JSON: an array of flashcards [{id, front, back}].";
  }
  if (type === "summary") {
    systemPrompt = "Summarize the provided content as plain text.";
  }
  if (type === "review") {
    systemPrompt = "Return ONLY JSON: an array of questions {id, question, options, correctAnswer, explanation}.";
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    });

    const aiReply = response.choices[0].message.content;

    res.status(200).json({ reply: aiReply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ error: "Failed to communicate with AI" });
  }
}
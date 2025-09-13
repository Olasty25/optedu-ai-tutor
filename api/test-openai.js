const OpenAI = require("openai");

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
    // Check if OpenAI key exists
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: "OPENAI_API_KEY not found",
        message: "Please set OPENAI_API_KEY environment variable in Vercel",
        hasKey: false
      });
    }

    // Test OpenAI API
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: "Say 'Hello from OpenAI API!' and nothing else." }
      ],
      max_tokens: 20
    });

    const aiReply = response.choices[0].message.content;

    res.json({ 
      success: true,
      message: "OpenAI API is working!",
      aiResponse: aiReply,
      hasKey: true,
      keyLength: process.env.OPENAI_API_KEY.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('OpenAI test error:', error);
    res.status(500).json({ 
      error: "OpenAI API test failed",
      message: error.message,
      hasKey: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
    });
  }
}

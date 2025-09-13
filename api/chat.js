const OpenAI = require("openai");
const { kv } = require('@vercel/kv');

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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { type, message, userId, studyPlanId } = req.body;

  // Create user if doesn't exist
  if (userId) {
    try {
      const existingUser = await kv.get(`user:${userId}`);
      if (!existingUser) {
        await kv.set(`user:${userId}`, {
          id: userId,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.log("User creation skipped:", error.message);
    }
  }

  // Create study plan if doesn't exist (for testing)
  if (studyPlanId && userId) {
    try {
      const existingPlan = await kv.get(`study_plan:${studyPlanId}`);
      if (!existingPlan) {
        const studyPlan = {
          id: studyPlanId,
          userId,
          title: "Test Study Plan",
          description: "Auto-created for testing",
          createdAt: new Date().toISOString()
        };
        await kv.set(`study_plan:${studyPlanId}`, studyPlan);
        await kv.sadd(`study_plans:${userId}`, studyPlanId);
      }
    } catch (error) {
      console.log("Study plan creation skipped:", error.message);
    }
  }

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

  // Save user message first (so it's part of history)
  if (userId && studyPlanId && type === "chat") {
    try {
      const userMessageId = Date.now().toString();
      const userMessage = {
        id: userMessageId,
        userId,
        studyPlanId,
        type: "user",
        content: message,
        timestamp: new Date().toISOString()
      };
      
      // Get existing messages and add new one
      const existingMessages = await kv.get(`messages:${userId}:${studyPlanId}`) || [];
      existingMessages.push(userMessage);
      await kv.set(`messages:${userId}:${studyPlanId}`, existingMessages);
    } catch (error) {
      console.log("Message saving failed:", error.message);
    }
  }

  // Build messages with rolling history for chat type
  let messages = [{ role: "system", content: systemPrompt }];
  if (type === "chat" && userId && studyPlanId) {
    try {
      const prior = await kv.get(`messages:${userId}:${studyPlanId}`) || [];
      // Map DB rows to OpenAI chat message roles
      const mapped = prior.map((m) => ({
        role: m.type === "user" ? "user" : "assistant",
        content: m.content
      }));
      // Keep only the last 20 messages to control prompt size
      const tail = mapped.slice(-20);
      messages = [{ role: "system", content: systemPrompt }, ...tail];
    } catch (e) {
      // Fallback to single-turn if history fails
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ];
    }
  } else {
    // Non-chat generation types remain single-turn
    messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ];
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages
    });

    const aiReply = response.choices[0].message.content;

    // Save AI response if userId and studyPlanId provided
    if (userId && studyPlanId && type === "chat") {
      try {
        const aiMessageId = (Date.now() + 1).toString();
        const aiMessage = {
          id: aiMessageId,
          userId,
          studyPlanId,
          type: "ai",
          content: aiReply,
          timestamp: new Date().toISOString()
        };
        
        // Get existing messages and add new one
        const existingMessages = await kv.get(`messages:${userId}:${studyPlanId}`) || [];
        existingMessages.push(aiMessage);
        await kv.set(`messages:${userId}:${studyPlanId}`, existingMessages);
      } catch (error) {
        console.log("AI message saving failed:", error.message);
      }
    }

    res.status(200).json({ reply: aiReply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ error: "Failed to communicate with AI" });
  }
}

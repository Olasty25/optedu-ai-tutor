// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Use environment variable
const client = new OpenAI({
  apiKey: process.env.OPEN_API_KEY   // 🔑 secure!
});

// POST route for chatting with AI
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body; // expects array of {role, content}

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful tutoring assistant." },
        ...messages
      ],
    });

    res.json({
      reply: response.choices[0].message.content
    });
  } catch (err) {
    console.error("OpenAI API error:", err.message);
    res.status(500).send("Error talking to AI");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

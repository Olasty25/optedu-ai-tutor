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
    const { type, message } = req.body;  // message = string od usera
    
    let systemPrompt = "You are a helpful tutoring assistant.";

    if (type === "flashcards") {
      systemPrompt = "Output ONLY valid JSON: an array of flashcards like [{id, front, back}].";
    } else if (type === "summary") {
      systemPrompt = "Output ONLY a study summary in markdown/plaintext.";
    } else if (type === "review") {
      systemPrompt = "Output ONLY valid JSON: an array of MCQs {id, question, options, correctAnswer, explanation}.";
    }

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI API error:", err.message);
    res.status(500).send("Error talking to AI");
  }
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

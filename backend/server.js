// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();
console.log("KEY LOADED:", !!process.env.OPENAI_API_KEY);

//!!!!!!!!!!!!
const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (req, res) => {
  try {
    const { type, message } = req.body;  // <--- tylko string, NIE tablica!

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

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    });

    console.error("OpenAI result:", response);

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI API error:", err.message);
    res.status(500).send("Error talking to AI");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

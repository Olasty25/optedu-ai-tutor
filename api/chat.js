// plik: /api/chat.js
import OpenAI from "openai";

// Ta funkcja to nasz mini-serwer
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

  // Przyjmujemy tylko zapytania typu POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Inicjalizujemy klienta OpenAI, pobierając klucz ze zmiennych środowiskowych
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Wyciągamy dane wysłane z frontendu
  const { type, message, userId, studyPlanId } = req.body;

  // Ustawiamy odpowiedni "rozkaz" dla AI w zależności od typu akcji
  let systemTutorInfo = "You are an educational assistant.";
  
  let systemPrompt = "You are a helpful and patient AI tutor.";
  if (type === "flashcards") {
    systemPrompt = systemTutorInfo + "Respond ONLY with a valid JSON array of flashcard objects in this format: [{id: string, front: string, back: string}]. Do not include any other text or explanations.";
  }
  if (type === "summary") {
    systemPrompt = systemTutorInfo + "Create a concise and clear summary of the provided topic. Respond only with the summary text.";
  }
  if (type === "review") {
    systemPrompt = systemTutorInfo + "Respond ONLY with a valid JSON array of multiple-choice question objects in this format: [{id: string, question: string, options: string[], correctAnswer: number, explanation: string}]. Do not include any other text or explanations.";
  }

  try {
    // Wysyłamy zapytanie do OpenAI
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    // Odsyłamy odpowiedź AI z powrotem do frontendu
    res.status(200).json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ error: "Failed to communicate with AI" });
  }
}

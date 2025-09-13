const OpenAI = require("openai");

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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, description, sources, userId, studyPlanId, goals } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Prepare context from sources
    let sourceContext = "";
    if (sources && sources.length > 0) {
      sourceContext = "\n\nAdditional context from uploaded sources:\n";
      sources.forEach((source, index) => {
        if (source.content) {
          sourceContext += `\n--- Source ${index + 1}: ${source.name} ---\n`;
          sourceContext += source.content.substring(0, 2000) + "\n";
        }
      });
    }

    // Prepare goals context
    let goalsContext = "";
    if (goals) {
      goalsContext = `\n\nLearning Goals:\n`;
      if (goals.what) goalsContext += `- What: ${goals.what}\n`;
      if (goals.why) goalsContext += `- Why: ${goals.why}\n`;
      if (goals.when) goalsContext += `- When: ${goals.when}\n`;
    }

    const systemPrompt = `You are an AI study assistant that creates personalized study plans. 
    Create a comprehensive, structured study plan based on the provided information.
    The plan should be practical, achievable, and tailored to the user's goals and available sources.
    
    Format your response as a JSON object with the following structure:
    {
      "title": "Refined study plan title",
      "description": "Refined study plan description", 
      "modules": [
        {
          "title": "Module title",
          "description": "Module description",
          "duration": "Estimated time",
          "topics": ["Topic 1", "Topic 2"],
          "activities": ["Activity 1", "Activity 2"],
          "resources": ["Resource 1", "Resource 2"]
        }
      ],
      "timeline": "Overall timeline",
      "tips": ["Tip 1", "Tip 2"]
    }`;

    const userMessage = `Create a study plan for:
    Title: ${title}
    Description: ${description}
    ${goalsContext}
    ${sourceContext}
    
    Please create a detailed, personalized study plan that incorporates the provided sources and goals.`;

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    });

    const aiReply = response.choices[0].message.content;

    res.json({ 
      success: true,
      plan: aiReply,
      sources: sources || []
    });
  } catch (error) {
    console.error("Study plan generation error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate study plan",
      success: false 
    });
  }
}



import express from "express";
import cors from "cors";
import multer from "multer";
import OpenAI from "openai";
import mammoth from "mammoth";
import * as cheerio from "cheerio";
import axios from "axios";
import path from "path";

// Import database functions
import {
  createUser,
  saveMessage,
  getMessages,
  deleteMessages,
  saveGeneratedContent,
  getGeneratedContent,
  deleteGeneratedContent,
  createStudyPlan,
  getStudyPlan,
  deleteStudyPlan,
  getUserStudyPlans
} from "./database.js";

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads (in-memory storage for serverless)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt', '.md', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, MD, DOC, DOCX, PNG, JPG, JPEG files are allowed.'));
    }
  }
});

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Check if API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('⚠️ WARNING: OPENAI_API_KEY is not set!');
}

// File processing functions
const processPDF = async (buffer, originalName) => {
  try {
    // For now, we'll return a placeholder for PDF files
    const fileName = originalName;
    return {
      text: `[PDF File: ${fileName}] - PDF content extraction is not yet implemented. Please use text files, Word documents, or web links for now.`,
      pages: 1,
      info: { title: fileName }
    };
  } catch (error) {
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
};

const processWord = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value,
      messages: result.messages
    };
  } catch (error) {
    throw new Error(`Failed to process Word document: ${error.message}`);
  }
};

const processTextFile = async (buffer) => {
  try {
    const text = buffer.toString('utf8');
    return { text };
  } catch (error) {
    throw new Error(`Failed to process text file: ${error.message}`);
  }
};

const processImage = async (buffer, originalName) => {
  try {
    return {
      text: `[Image file: ${originalName}]`,
      type: 'image'
    };
  } catch (error) {
    throw new Error(`Failed to process image: ${error.message}`);
  }
};

const scrapeWebContent = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    // Remove script and style elements
    $('script, style, nav, header, footer, aside').remove();
    
    // Extract main content
    const title = $('title').text().trim() || $('h1').first().text().trim();
    const content = $('body').text().replace(/\s+/g, ' ').trim();
    
    return {
      title,
      text: content.substring(0, 5000), // Limit to 5000 characters
      url
    };
  } catch (error) {
    throw new Error(`Failed to scrape web content: ${error.message}`);
  }
};

const processFile = async (buffer, originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  
  switch (ext) {
    case '.pdf':
      return await processPDF(buffer, originalName);
    case '.doc':
    case '.docx':
      return await processWord(buffer);
    case '.txt':
    case '.md':
      return await processTextFile(buffer);
    case '.png':
    case '.jpg':
    case '.jpeg':
      return await processImage(buffer, originalName);
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
};

// Simple root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Optedu AI Backend Server is running!', status: 'ok' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Optedu AI Backend Server is running!', status: 'ok' });
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { type, message, userId, studyPlanId } = req.body;

    console.log('📨 Chat request received:', { type, userId, studyPlanId, messageLength: message?.length });

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is not set');
      return res.status(500).json({ 
        error: "OpenAI API key is not configured. Please add OPENAI_API_KEY to environment variables." 
      });
    }

    // Create user if doesn't exist
    if (userId) {
      await createUser(userId);
    }

    // Create study plan if doesn't exist (for testing)
    if (studyPlanId && userId) {
      try {
        const existingPlan = await getStudyPlan(studyPlanId);
        if (!existingPlan) {
          await createStudyPlan(studyPlanId, userId, "Test Study Plan", "Auto-created for testing");
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
      const userMessageId = Date.now().toString();
      await saveMessage(userMessageId, userId, studyPlanId, "user", message);
    }

    // Build messages with rolling history for chat type
    let messages = [{ role: "system", content: systemPrompt }];
    if (type === "chat" && userId && studyPlanId) {
      try {
        const prior = await getMessages(userId, studyPlanId) || [];
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

    console.log('🤖 Calling OpenAI API...');
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages
    });

    const aiReply = response.choices[0].message.content;
    console.log('✅ OpenAI response received');

    // Save AI response if userId and studyPlanId provided
    if (userId && studyPlanId && type === "chat") {
      const aiMessageId = (Date.now() + 1).toString();
      await saveMessage(aiMessageId, userId, studyPlanId, "ai", aiReply);
    }

    res.json({ reply: aiReply });
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ 
      error: err.message || "Error talking to AI",
      details: err.response?.data || err.toString()
    });
  }
});

// File upload endpoint
app.post("/upload-file", upload.single('file'), async (req, res) => {
  try {
    console.log("File upload request received");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    if (!req.file) {
      console.log("No file in request");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { userId, studyPlanId } = req.body;
    const buffer = req.file.buffer;
    const originalName = req.file.originalname;
    const fileSize = req.file.size;

    console.log(`Processing file: ${originalName}, size: ${fileSize} bytes`);

    // Process the file
    const processedContent = await processFile(buffer, originalName);
    
    console.log(`File processed successfully. Content length: ${processedContent.text.length}`);

    res.json({
      success: true,
      file: {
        id: Date.now().toString(),
        name: originalName,
        size: fileSize,
        type: 'file',
        status: 'ready',
        content: processedContent.text,
        preview: processedContent.text.substring(0, 200) + '...'
      }
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to process file",
      success: false 
    });
  }
});

// Web scraping endpoint
app.post("/scrape-url", async (req, res) => {
  try {
    const { url, userId, studyPlanId } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const scrapedContent = await scrapeWebContent(url);
    
    res.json({
      success: true,
      file: {
        id: Date.now().toString(),
        name: scrapedContent.title || new URL(url).hostname,
        url: url,
        type: 'link',
        status: 'ready',
        content: scrapedContent.text,
        preview: scrapedContent.text.substring(0, 200) + '...'
      }
    });
  } catch (error) {
    console.error("URL scraping error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to scrape URL",
      success: false 
    });
  }
});

// Generate study plan with sources
app.post("/generate-plan-with-sources", async (req, res) => {
  try {
    const { title, description, sources, userId, studyPlanId, goals } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    // Create user if doesn't exist
    if (userId) {
      await createUser(userId);
    }

    // Create study plan if doesn't exist
    if (studyPlanId && userId) {
      try {
        const existingPlan = await getStudyPlan(studyPlanId);
        if (!existingPlan) {
          await createStudyPlan(studyPlanId, userId, title, description);
        }
      } catch (error) {
        console.log("Study plan creation skipped:", error.message);
      }
    }

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
});

// Get messages for a study plan
app.get("/messages", async (req, res) => {
  try {
    const { userId, studyPlanId, action } = req.query;
    
    // Handle count action
    if (action === 'count') {
      const messages = await getMessages(userId, studyPlanId);
      const userMessages = messages.filter(msg => msg.type === 'user');
      return res.json({ count: userMessages.length, totalMessages: messages.length });
    }
    
    // Regular messages fetch
    const messages = await getMessages(userId, studyPlanId);
    res.json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Delete messages for a study plan
app.delete("/messages", async (req, res) => {
  try {
    const { userId, studyPlanId } = req.query;
    await deleteMessages(userId, studyPlanId);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting messages:", err.message);
    res.status(500).json({ error: "Failed to delete messages" });
  }
});

// Save generated content
app.post("/generated-content", async (req, res) => {
  try {
    const { contentId, userId, studyPlanId, type, title, data } = req.body;
    await saveGeneratedContent(contentId, userId, studyPlanId, type, title, data);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving generated content:", err.message);
    res.status(500).json({ error: "Failed to save generated content" });
  }
});

// Get generated content for a study plan
app.get("/generated-content", async (req, res) => {
  try {
    const { userId, studyPlanId } = req.query;
    const content = await getGeneratedContent(userId, studyPlanId);
    res.json({ content });
  } catch (err) {
    console.error("Error fetching generated content:", err.message);
    res.status(500).json({ error: "Failed to fetch generated content" });
  }
});

// Delete generated content
app.delete("/generated-content", async (req, res) => {
  try {
    const { contentId, userId } = req.query;
    await deleteGeneratedContent(contentId, userId);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting generated content:", err.message);
    res.status(500).json({ error: "Failed to delete generated content" });
  }
});

// Save study plan
app.post("/study-plan", async (req, res) => {
  try {
    const { planId, userId, title, description } = req.body;
    await createStudyPlan(planId, userId, title, description);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving study plan:", err.message);
    res.status(500).json({ error: "Failed to save study plan" });
  }
});

// Delete study plan
app.delete("/study-plan", async (req, res) => {
  try {
    const { planId, userId } = req.query;
    const result = await deleteStudyPlan(planId, userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "Study plan not found or not owned by user" });
    }
    
    // Also delete associated messages and generated content
    await deleteMessages(userId, planId);
    
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting study plan:", err.message);
    res.status(500).json({ error: "Failed to delete study plan" });
  }
});

// Get user study plans count
app.get("/study-plans/count", async (req, res) => {
  try {
    const { userId } = req.query;
    const plans = await getUserStudyPlans(userId);
    res.json({ count: plans.length, plans });
  } catch (err) {
    console.error("Error getting study plans count:", err.message);
    res.status(500).json({ error: "Failed to get study plans count" });
  }
});


// Export for Vercel serverless - wrap Express app in a handler
export default (req, res) => {
  return app(req, res);
};

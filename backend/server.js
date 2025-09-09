// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import OpenAI from "openai";
// PDF processing will be handled differently
import mammoth from "mammoth";
import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { 
  createUser, 
  saveMessage, 
  getMessages, 
  deleteMessages,
  saveGeneratedContent,
  getGeneratedContent,
  deleteGeneratedContent,
  createStudyPlan,
  getStudyPlan
} from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
console.log("KEY LOADED:", !!process.env.OPENAI_API_KEY);

//!!!!!!!!!!!!
const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Simple root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Optedu AI Backend Server is running!', status: 'ok' });
});

// File processing functions
const processPDF = async (filePath) => {
  try {
    // For now, we'll return a placeholder for PDF files
    // In a production environment, you'd want to use a proper PDF parsing library
    // like pdf-parse or pdf2pic with proper Node.js support
    const fileName = path.basename(filePath);
    return {
      text: `[PDF File: ${fileName}] - PDF content extraction is not yet implemented. Please use text files, Word documents, or web links for now.`,
      pages: 1,
      info: { title: fileName }
    };
  } catch (error) {
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
};

const processWord = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return {
      text: result.value,
      messages: result.messages
    };
  } catch (error) {
    throw new Error(`Failed to process Word document: ${error.message}`);
  }
};

const processTextFile = async (filePath) => {
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    return { text };
  } catch (error) {
    throw new Error(`Failed to process text file: ${error.message}`);
  }
};

const processImage = async (filePath) => {
  try {
    // For now, we'll just return a placeholder
    // In a real implementation, you'd use OCR or image analysis
    return {
      text: `[Image file: ${path.basename(filePath)}]`,
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

const processFile = async (filePath, originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  
  switch (ext) {
    case '.pdf':
      return await processPDF(filePath);
    case '.doc':
    case '.docx':
      return await processWord(filePath);
    case '.txt':
    case '.md':
      return await processTextFile(filePath);
    case '.png':
    case '.jpg':
    case '.jpeg':
      return await processImage(filePath);
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
};

app.post("/chat", async (req, res) => {
  try {
    const { type, message, userId, studyPlanId } = req.body;

    // Create user if doesn't exist
    if (userId) {
      createUser(userId);
    }

    // Create study plan if doesn't exist (for testing)
    if (studyPlanId && userId) {
      try {
        const existingPlan = getStudyPlan(studyPlanId);
        if (!existingPlan) {
          createStudyPlan(studyPlanId, userId, "Test Study Plan", "Auto-created for testing");
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

    // Save user message if userId and studyPlanId provided
    if (userId && studyPlanId && type === "chat") {
      const userMessageId = Date.now().toString();
      saveMessage(userMessageId, userId, studyPlanId, "user", message);
    }

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    });

    const aiReply = response.choices[0].message.content;

    // Save AI response if userId and studyPlanId provided
    if (userId && studyPlanId && type === "chat") {
      const aiMessageId = (Date.now() + 1).toString();
      saveMessage(aiMessageId, userId, studyPlanId, "ai", aiReply);
    }

    console.log("OpenAI result:", response);

    res.json({ reply: aiReply });
  } catch (err) {
    console.error("OpenAI API error:", err.message);
    res.status(500).send("Error talking to AI");
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
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const fileSize = req.file.size;

    console.log(`Processing file: ${originalName}, size: ${fileSize} bytes`);

    // Process the file
    const processedContent = await processFile(filePath, originalName);
    
    console.log(`File processed successfully. Content length: ${processedContent.text.length}`);
    
    // Clean up the file after processing
    try {
      fs.unlinkSync(filePath);
      console.log("Temporary file cleaned up");
    } catch (cleanupError) {
      console.warn("Failed to clean up temporary file:", cleanupError.message);
    }

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
      createUser(userId);
    }

    // Create study plan if doesn't exist
    if (studyPlanId && userId) {
      try {
        const existingPlan = getStudyPlan(studyPlanId);
        if (!existingPlan) {
          createStudyPlan(studyPlanId, userId, title, description);
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
app.get("/messages/:userId/:studyPlanId", (req, res) => {
  try {
    const { userId, studyPlanId } = req.params;
    const messages = getMessages(userId, studyPlanId);
    res.json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Delete messages for a study plan
app.delete("/messages/:userId/:studyPlanId", (req, res) => {
  try {
    const { userId, studyPlanId } = req.params;
    deleteMessages(userId, studyPlanId);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting messages:", err.message);
    res.status(500).json({ error: "Failed to delete messages" });
  }
});

// Save generated content
app.post("/generated-content", (req, res) => {
  try {
    const { contentId, userId, studyPlanId, type, title, data } = req.body;
    saveGeneratedContent(contentId, userId, studyPlanId, type, title, data);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving generated content:", err.message);
    res.status(500).json({ error: "Failed to save generated content" });
  }
});

// Get generated content for a study plan
app.get("/generated-content/:userId/:studyPlanId", (req, res) => {
  try {
    const { userId, studyPlanId } = req.params;
    const content = getGeneratedContent(userId, studyPlanId);
    res.json({ content });
  } catch (err) {
    console.error("Error fetching generated content:", err.message);
    res.status(500).json({ error: "Failed to fetch generated content" });
  }
});

// Delete generated content
app.delete("/generated-content/:contentId/:userId", (req, res) => {
  try {
    const { contentId, userId } = req.params;
    deleteGeneratedContent(contentId, userId);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting generated content:", err.message);
    res.status(500).json({ error: "Failed to delete generated content" });
  }
});

// Save study plan
app.post("/study-plan", (req, res) => {
  try {
    const { planId, userId, title, description } = req.body;
    createStudyPlan(planId, userId, title, description);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving study plan:", err.message);
    res.status(500).json({ error: "Failed to save study plan" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

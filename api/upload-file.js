import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import mammoth from "mammoth";
import * as cheerio from "cheerio";
import axios from "axios";

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

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
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: ({ mimetype }) => {
        const allowedTypes = [
          'application/pdf',
          'text/plain',
          'text/markdown',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/png',
          'image/jpeg',
          'image/jpg'
        ];
        return allowedTypes.includes(mimetype);
      }
    });

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { userId, studyPlanId } = fields;
    const filePath = file.filepath;
    const originalName = file.originalFilename;
    const fileSize = file.size;

    console.log(`Processing file: ${originalName}, size: ${fileSize} bytes`);

    // Process the file
    const processedContent = await processFile(filePath, originalName);
    
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
}

// File processing functions
const processPDF = async (filePath) => {
  try {
    // For now, we'll return a placeholder for PDF files
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
    return {
      text: `[Image file: ${path.basename(filePath)}]`,
      type: 'image'
    };
  } catch (error) {
    throw new Error(`Failed to process image: ${error.message}`);
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

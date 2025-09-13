const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const cheerio = require('cheerio');
const axios = require('axios');

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

// File processing functions
const processPDF = async (filePath) => {
  try {
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: ({ name, originalFilename, mimetype }) => {
        const allowedTypes = ['.pdf', '.txt', '.md', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
        const ext = path.extname(originalFilename || '').toLowerCase();
        return allowedTypes.includes(ext);
      }
    });

    const [fields, files] = await form.parse(req);
    
    if (!files.file || !files.file[0]) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = files.file[0];
    const { userId, studyPlanId } = fields;

    console.log(`Processing file: ${file.originalFilename}, size: ${file.size} bytes`);

    // Process the file
    const processedContent = await processFile(file.filepath, file.originalFilename);
    
    console.log(`File processed successfully. Content length: ${processedContent.text.length}`);
    
    // Clean up the file after processing
    try {
      fs.unlinkSync(file.filepath);
      console.log('Temporary file cleaned up');
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary file:', cleanupError.message);
    }

    res.json({
      success: true,
      file: {
        id: Date.now().toString(),
        name: file.originalFilename,
        size: file.size,
        type: 'file',
        status: 'ready',
        content: processedContent.text,
        preview: processedContent.text.substring(0, 200) + '...'
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process file',
      success: false 
    });
  }
}
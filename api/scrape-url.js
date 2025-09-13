import cheerio from 'cheerio';
import axios from 'axios';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, userId, studyPlanId } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

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
    console.error('URL scraping error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to scrape URL',
      success: false 
    });
  }
}
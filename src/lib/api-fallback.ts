// API Fallback System - Tries complex API first, falls back to simple API

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // Try the main API first
    const response = await fetch(endpoint, options);
    if (response.ok) {
      return response;
    }
    throw new Error(`API returned ${response.status}`);
  } catch (error) {
    console.log(`Main API failed for ${endpoint}, trying fallback...`);
    
    // Fallback to simple APIs
    let fallbackEndpoint = endpoint;
    
    if (endpoint === '/api/chat') {
      fallbackEndpoint = '/api/chat-simple';
    } else if (endpoint === '/api/generate-plan-with-sources') {
      fallbackEndpoint = '/api/generate-plan-simple';
    }
    
    try {
      const fallbackResponse = await fetch(fallbackEndpoint, options);
      if (fallbackResponse.ok) {
        console.log(`Fallback API worked for ${fallbackEndpoint}`);
        return fallbackResponse;
      }
      throw new Error(`Fallback API also failed`);
    } catch (fallbackError) {
      console.error(`Both APIs failed for ${endpoint}:`, fallbackError);
      throw fallbackError;
    }
  }
};

// Convenience functions
export const chatAPI = (data: any) => 
  apiCall('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

export const generatePlanAPI = (data: any) => 
  apiCall('/api/generate-plan-with-sources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

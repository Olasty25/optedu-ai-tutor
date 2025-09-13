// Configuration for API endpoints
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Get the base URL for API calls
export const getApiBaseUrl = () => {
  if (isDevelopment) {
    // In development, use localhost
    return 'http://localhost:5000';
  } else {
    // In production, use the current domain
    return window.location.origin;
  }
};

// API endpoints
export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  GENERATE_PLAN: '/api/generate-plan-with-sources',
  UPLOAD_FILE: '/api/upload-file',
  SCRAPE_URL: '/api/scrape-url',
  MESSAGES: '/api/messages',
  GENERATED_CONTENT: '/api/generated-content',
  STUDY_PLAN: '/api/study-plan',
  STUDY_PLANS_COUNT: '/api/study-plans/count',
  MESSAGES_COUNT: '/api/messages/count',
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string) => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};

// Export individual API URLs
export const API_URLS = {
  CHAT: buildApiUrl(API_ENDPOINTS.CHAT),
  GENERATE_PLAN: buildApiUrl(API_ENDPOINTS.GENERATE_PLAN),
  UPLOAD_FILE: buildApiUrl(API_ENDPOINTS.UPLOAD_FILE),
  SCRAPE_URL: buildApiUrl(API_ENDPOINTS.SCRAPE_URL),
  MESSAGES: buildApiUrl(API_ENDPOINTS.MESSAGES),
  GENERATED_CONTENT: buildApiUrl(API_ENDPOINTS.GENERATED_CONTENT),
  STUDY_PLAN: buildApiUrl(API_ENDPOINTS.STUDY_PLAN),
  STUDY_PLANS_COUNT: buildApiUrl(API_ENDPOINTS.STUDY_PLANS_COUNT),
  MESSAGES_COUNT: buildApiUrl(API_ENDPOINTS.MESSAGES_COUNT),
} as const;

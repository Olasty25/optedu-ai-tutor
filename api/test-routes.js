// Test file to verify API route structure
// This file will be deleted after testing

module.exports = async function handler(req, res) {
  res.json({ 
    message: "API routes test",
    timestamp: new Date().toISOString(),
    routes: [
      "/api/chat",
      "/api/generate-plan-with-sources", 
      "/api/upload-file",
      "/api/scrape-url",
      "/api/create-checkout-session",
      "/api/generated-content",
      "/api/generated-content/[userId]/[studyPlanId]",
      "/api/generated-content/delete/[contentId]",
      "/api/messages/[userId]/[studyPlanId]",
      "/api/messages/count/[userId]/[studyPlanId]",
      "/api/study-plan",
      "/api/study-plan/[planId]/[userId]",
      "/api/study-plans/count/[userId]",
      "/api/health"
    ]
  });
}

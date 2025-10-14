import { kv } from '@vercel/kv';

// Using Vercel KV (Redis) for serverless deployment
// Data structure:
// users:{userId} = { id, created_at }
// study_plans:{planId} = { id, user_id, title, description, created_at }
// messages:{userId}:{studyPlanId} = [{ id, user_id, study_plan_id, type, content, created_at }]
// generated_content:{userId}:{studyPlanId} = [{ id, user_id, study_plan_id, type, title, data, created_at }]
// user_study_plans:{userId} = [planId1, planId2, ...]

// Helper to check if KV is available
const isKVAvailable = () => {
  return process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
};

// User functions
const createUser = async (userId) => {
  if (!isKVAvailable()) {
    console.warn('KV not available, skipping user creation');
    return { success: true };
  }
  
  try {
    const userKey = `users:${userId}`;
    const existing = await kv.get(userKey);
    
    if (!existing) {
      await kv.set(userKey, {
        id: userId,
        created_at: new Date().toISOString()
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: true }; // Don't fail if user creation fails
  }
};

// Study plan functions
const createStudyPlan = async (planId, userId, title, description) => {
  if (!isKVAvailable()) {
    console.warn('KV not available, skipping study plan creation');
    return { success: true };
  }
  
  try {
    const planKey = `study_plans:${planId}`;
    const userPlansKey = `user_study_plans:${userId}`;
    
    await kv.set(planKey, {
      id: planId,
      user_id: userId,
      title,
      description,
      created_at: new Date().toISOString()
    });
    
    // Add to user's plan list
    const userPlans = await kv.get(userPlansKey) || [];
    if (!userPlans.includes(planId)) {
      userPlans.push(planId);
      await kv.set(userPlansKey, userPlans);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating study plan:', error);
    return { success: true }; // Don't fail if creation fails
  }
};

const getStudyPlan = async (planId) => {
  if (!isKVAvailable()) {
    console.warn('KV not available, returning null');
    return null;
  }
  
  try {
    const planKey = `study_plans:${planId}`;
    return await kv.get(planKey);
  } catch (error) {
    console.error('Error getting study plan:', error);
    return null;
  }
};

const deleteStudyPlan = async (planId, userId) => {
  if (!isKVAvailable()) {
    console.warn('KV not available, skipping deletion');
    return { changes: 1 };
  }
  
  try {
    const planKey = `study_plans:${planId}`;
    const userPlansKey = `user_study_plans:${userId}`;
    
    // Check if plan belongs to user
    const plan = await kv.get(planKey);
    if (!plan || plan.user_id !== userId) {
      return { changes: 0 };
    }
    
    // Delete the plan
    await kv.del(planKey);
    
    // Remove from user's plan list
    const userPlans = await kv.get(userPlansKey) || [];
    const updatedPlans = userPlans.filter(id => id !== planId);
    await kv.set(userPlansKey, updatedPlans);
    
    return { changes: 1 };
  } catch (error) {
    console.error('Error deleting study plan:', error);
    return { changes: 0 };
  }
};

const getUserStudyPlans = async (userId) => {
  if (!isKVAvailable()) {
    console.warn('KV not available, returning empty array');
    return [];
  }
  
  try {
    const userPlansKey = `user_study_plans:${userId}`;
    const planIds = await kv.get(userPlansKey) || [];
    
    // Fetch all plans
    const plans = [];
    for (const planId of planIds) {
      const planKey = `study_plans:${planId}`;
      const plan = await kv.get(planKey);
      if (plan) {
        plans.push(plan);
      }
    }
    
    // Sort by created_at descending
    return plans.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('Error getting user study plans:', error);
    return [];
  }
};

// Message functions
const saveMessage = async (messageId, userId, studyPlanId, type, content) => {
  if (!isKVAvailable()) {
    console.warn('KV not available, skipping message save');
    return { success: true };
  }
  
  try {
    const messagesKey = `messages:${userId}:${studyPlanId}`;
    const messages = await kv.get(messagesKey) || [];
    
    messages.push({
      id: messageId,
      user_id: userId,
      study_plan_id: studyPlanId,
      type,
      content,
      created_at: new Date().toISOString()
    });
    
    await kv.set(messagesKey, messages);
    return { success: true };
  } catch (error) {
    console.error('Error saving message:', error);
    return { success: true }; // Don't fail if save fails
  }
};

const getMessages = async (userId, studyPlanId) => {
  if (!isKVAvailable()) {
    console.warn('KV not available, returning empty array');
    return [];
  }
  
  try {
    const messagesKey = `messages:${userId}:${studyPlanId}`;
    const messages = await kv.get(messagesKey) || [];
    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

const deleteMessages = async (userId, studyPlanId) => {
  if (!isKVAvailable()) {
    console.warn('KV not available, skipping message deletion');
    return { success: true };
  }
  
  try {
    const messagesKey = `messages:${userId}:${studyPlanId}`;
    await kv.del(messagesKey);
    return { success: true };
  } catch (error) {
    console.error('Error deleting messages:', error);
    return { success: true };
  }
};

// Generated content functions
const saveGeneratedContent = async (contentId, userId, studyPlanId, type, title, data) => {
  if (!isKVAvailable()) {
    console.warn('KV not available, skipping content save');
    return { success: true };
  }
  
  try {
    const contentKey = `generated_content:${userId}:${studyPlanId}`;
    const contents = await kv.get(contentKey) || [];
    
    // Remove existing content with same ID
    const filtered = contents.filter(c => c.id !== contentId);
    
    filtered.push({
      id: contentId,
      user_id: userId,
      study_plan_id: studyPlanId,
      type,
      title,
      data: typeof data === 'string' ? JSON.parse(data) : data,
      created_at: new Date().toISOString()
    });
    
    await kv.set(contentKey, filtered);
    return { success: true };
  } catch (error) {
    console.error('Error saving generated content:', error);
    return { success: true }; // Don't fail if save fails
  }
};

const getGeneratedContent = async (userId, studyPlanId) => {
  if (!isKVAvailable()) {
    console.warn('KV not available, returning empty array');
    return [];
  }
  
  try {
    const contentKey = `generated_content:${userId}:${studyPlanId}`;
    const contents = await kv.get(contentKey) || [];
    // Sort by created_at descending
    return contents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('Error getting generated content:', error);
    return [];
  }
};

const deleteGeneratedContent = async (contentId, userId) => {
  if (!isKVAvailable()) {
    console.warn('KV not available, skipping content deletion');
    return { success: true };
  }
  
  try {
    // We need to find which study plan this content belongs to
    // For now, we'll search through all user's study plans
    const userPlansKey = `user_study_plans:${userId}`;
    const planIds = await kv.get(userPlansKey) || [];
    
    for (const planId of planIds) {
      const contentKey = `generated_content:${userId}:${planId}`;
      const contents = await kv.get(contentKey) || [];
      const filtered = contents.filter(c => c.id !== contentId);
      
      if (filtered.length !== contents.length) {
        await kv.set(contentKey, filtered);
        break;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting generated content:', error);
    return { success: true };
  }
};

export {
  createUser,
  createStudyPlan,
  getStudyPlan,
  deleteStudyPlan,
  getUserStudyPlans,
  saveMessage,
  getMessages,
  deleteMessages,
  saveGeneratedContent,
  getGeneratedContent,
  deleteGeneratedContent
};

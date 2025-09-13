import Database from 'better-sqlite3';
import path from 'path';

// For Vercel, we'll use a simple in-memory database or file-based database
// In production, you might want to use a proper database service
let db;

const initDatabase = () => {
  if (!db) {
    // For Vercel, we'll use a temporary file or in-memory database
    // In production, consider using Vercel KV, PlanetScale, or another database service
    try {
      db = new Database(':memory:'); // In-memory database for serverless
      createTables();
    } catch (error) {
      console.error('Database initialization error:', error);
      // Fallback to file-based database
      db = new Database('/tmp/database.db');
      createTables();
    }
  }
  return db;
};

const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Study plans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS study_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      study_plan_id TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (study_plan_id) REFERENCES study_plans (id)
    )
  `);

  // Generated content table
  db.exec(`
    CREATE TABLE IF NOT EXISTS generated_content (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      study_plan_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (study_plan_id) REFERENCES study_plans (id)
    )
  `);
};

// User functions
const createUser = (userId) => {
  const database = initDatabase();
  try {
    const stmt = database.prepare('INSERT OR IGNORE INTO users (id) VALUES (?)');
    stmt.run(userId);
    return { success: true };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Study plan functions
const createStudyPlan = (planId, userId, title, description) => {
  const database = initDatabase();
  try {
    const stmt = database.prepare(`
      INSERT OR REPLACE INTO study_plans (id, user_id, title, description) 
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(planId, userId, title, description);
    return { success: true };
  } catch (error) {
    console.error('Error creating study plan:', error);
    throw error;
  }
};

const getStudyPlan = (planId) => {
  const database = initDatabase();
  try {
    const stmt = database.prepare('SELECT * FROM study_plans WHERE id = ?');
    return stmt.get(planId);
  } catch (error) {
    console.error('Error getting study plan:', error);
    throw error;
  }
};

const deleteStudyPlan = (planId, userId) => {
  const database = initDatabase();
  try {
    const stmt = database.prepare('DELETE FROM study_plans WHERE id = ? AND user_id = ?');
    return stmt.run(planId, userId);
  } catch (error) {
    console.error('Error deleting study plan:', error);
    throw error;
  }
};

const getUserStudyPlans = (userId) => {
  const database = initDatabase();
  try {
    const stmt = database.prepare('SELECT * FROM study_plans WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
  } catch (error) {
    console.error('Error getting user study plans:', error);
    throw error;
  }
};

// Message functions
const saveMessage = (messageId, userId, studyPlanId, type, content) => {
  const database = initDatabase();
  try {
    const stmt = database.prepare(`
      INSERT INTO messages (id, user_id, study_plan_id, type, content) 
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(messageId, userId, studyPlanId, type, content);
    return { success: true };
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

const getMessages = (userId, studyPlanId) => {
  const database = initDatabase();
  try {
    const stmt = database.prepare(`
      SELECT * FROM messages 
      WHERE user_id = ? AND study_plan_id = ? 
      ORDER BY created_at ASC
    `);
    return stmt.all(userId, studyPlanId);
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

const deleteMessages = (userId, studyPlanId) => {
  const database = initDatabase();
  try {
    const stmt = database.prepare('DELETE FROM messages WHERE user_id = ? AND study_plan_id = ?');
    stmt.run(userId, studyPlanId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting messages:', error);
    throw error;
  }
};

// Generated content functions
const saveGeneratedContent = (contentId, userId, studyPlanId, type, title, data) => {
  const database = initDatabase();
  try {
    const stmt = database.prepare(`
      INSERT OR REPLACE INTO generated_content (id, user_id, study_plan_id, type, title, data) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(contentId, userId, studyPlanId, type, title, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    console.error('Error saving generated content:', error);
    throw error;
  }
};

const getGeneratedContent = (userId, studyPlanId) => {
  const database = initDatabase();
  try {
    const stmt = database.prepare(`
      SELECT * FROM generated_content 
      WHERE user_id = ? AND study_plan_id = ? 
      ORDER BY created_at DESC
    `);
    const results = stmt.all(userId, studyPlanId);
    return results.map(row => ({
      ...row,
      data: JSON.parse(row.data)
    }));
  } catch (error) {
    console.error('Error getting generated content:', error);
    throw error;
  }
};

const deleteGeneratedContent = (contentId, userId) => {
  const database = initDatabase();
  try {
    const stmt = database.prepare('DELETE FROM generated_content WHERE id = ? AND user_id = ?');
    stmt.run(contentId, userId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting generated content:', error);
    throw error;
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

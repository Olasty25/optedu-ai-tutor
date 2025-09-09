// database.js - Message persistence module
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const db = new Database(path.join(__dirname, 'messages.db'));

// Create tables if they don't exist
const initDatabase = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Study plans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS study_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT,
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
      study_plan_id TEXT,
      type TEXT NOT NULL CHECK (type IN ('user', 'ai')),
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (study_plan_id) REFERENCES study_plans (id)
    )
  `);

  // Generated content table
  db.exec(`
    CREATE TABLE IF NOT EXISTS generated_content (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      study_plan_id TEXT,
      type TEXT NOT NULL CHECK (type IN ('flashcards', 'summary', 'review')),
      title TEXT NOT NULL,
      data TEXT NOT NULL, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (study_plan_id) REFERENCES study_plans (id)
    )
  `);

  console.log('✅ Database initialized successfully');
};

// Initialize database on module load
initDatabase();

// User management
export const createUser = (userId, email = null) => {
  const stmt = db.prepare('INSERT OR IGNORE INTO users (id, email) VALUES (?, ?)');
  return stmt.run(userId, email);
};

export const getUser = (userId) => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(userId);
};

// Study plan management
export const createStudyPlan = (planId, userId, title, description = null) => {
  const stmt = db.prepare('INSERT OR REPLACE INTO study_plans (id, user_id, title, description) VALUES (?, ?, ?, ?)');
  return stmt.run(planId, userId, title, description);
};

export const getStudyPlan = (planId) => {
  const stmt = db.prepare('SELECT * FROM study_plans WHERE id = ?');
  return stmt.get(planId);
};

export const getUserStudyPlans = (userId) => {
  const stmt = db.prepare('SELECT * FROM study_plans WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId);
};

// Message management
export const saveMessage = (messageId, userId, studyPlanId, type, content) => {
  const stmt = db.prepare(`
    INSERT INTO messages (id, user_id, study_plan_id, type, content, timestamp) 
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  return stmt.run(messageId, userId, studyPlanId, type, content);
};

export const getMessages = (userId, studyPlanId) => {
  const stmt = db.prepare(`
    SELECT * FROM messages 
    WHERE user_id = ? AND study_plan_id = ? 
    ORDER BY timestamp ASC
  `);
  return stmt.all(userId, studyPlanId);
};

export const deleteMessages = (userId, studyPlanId) => {
  const stmt = db.prepare('DELETE FROM messages WHERE user_id = ? AND study_plan_id = ?');
  return stmt.run(userId, studyPlanId);
};

// Generated content management
export const saveGeneratedContent = (contentId, userId, studyPlanId, type, title, data) => {
  const stmt = db.prepare(`
    INSERT INTO generated_content (id, user_id, study_plan_id, type, title, data) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(contentId, userId, studyPlanId, type, title, JSON.stringify(data));
};

export const getGeneratedContent = (userId, studyPlanId) => {
  const stmt = db.prepare(`
    SELECT * FROM generated_content 
    WHERE user_id = ? AND study_plan_id = ? 
    ORDER BY created_at DESC
  `);
  const results = stmt.all(userId, studyPlanId);
  return results.map(row => ({
    ...row,
    data: JSON.parse(row.data)
  }));
};

export const deleteGeneratedContent = (contentId, userId) => {
  const stmt = db.prepare('DELETE FROM generated_content WHERE id = ? AND user_id = ?');
  return stmt.run(contentId, userId);
};

// Cleanup old data (optional)
export const cleanupOldData = (daysOld = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const stmt = db.prepare('DELETE FROM messages WHERE timestamp < ?');
  return stmt.run(cutoffDate.toISOString());
};

export default db;

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库文件路径
const dbPath = path.join(__dirname, '..', 'data', 'chat.db');

// 确保 data 目录存在
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库连接
const db = new Database(dbPath);

// 启用 WAL 模式以提高性能
db.pragma('journal_mode = WAL');

// 初始化数据库表
db.exec(`
  -- 会话表
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    model TEXT NOT NULL,
    sdk_session_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  -- 消息表
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    model TEXT,
    created_at TEXT NOT NULL,
    tool_calls TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  -- 为会话 ID 创建索引
  CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);

  -- 培训进度表
  CREATE TABLE IF NOT EXISTS training_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    course_id TEXT NOT NULL,
    lesson_id TEXT,
    status TEXT NOT NULL DEFAULT 'not_started',
    progress INTEGER DEFAULT 0,
    score INTEGER,
    passed INTEGER DEFAULT 0,
    started_at TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, course_id)
  );

  -- 测验记录表
  CREATE TABLE IF NOT EXISTS quiz_results (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    course_id TEXT NOT NULL,
    answers TEXT NOT NULL,
    score INTEGER NOT NULL,
    passed INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  -- 课程进度索引
  CREATE INDEX IF NOT EXISTS idx_training_progress_user_course ON training_progress(user_id, course_id);
  CREATE INDEX IF NOT EXISTS idx_quiz_results_user_course ON quiz_results(user_id, course_id);
`);

// 数据库迁移：添加 sdk_session_id 列（如果不存在）
try {
  const tableInfo = db.prepare("PRAGMA table_info(sessions)").all() as Array<{ name: string }>;
  const hasColumn = tableInfo.some(col => col.name === 'sdk_session_id');
  if (!hasColumn) {
    db.exec("ALTER TABLE sessions ADD COLUMN sdk_session_id TEXT");
    console.log("[DB] Added sdk_session_id column to sessions table");
  }
} catch (e) {
  // 忽略错误（列可能已存在）
}

// 类型定义
export interface DbSession {
  id: string;
  title: string;
  model: string;
  sdk_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  model: string | null;
  created_at: string;
  tool_calls: string | null;
}

// ============= 会话操作 =============

// 获取所有会话
export function getAllSessions(): DbSession[] {
  const stmt = db.prepare('SELECT * FROM sessions ORDER BY updated_at DESC');
  return stmt.all() as DbSession[];
}

// 获取单个会话
export function getSession(id: string): DbSession | undefined {
  const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
  return stmt.get(id) as DbSession | undefined;
}

// 创建会话
export function createSession(session: DbSession): DbSession {
  const stmt = db.prepare(`
    INSERT INTO sessions (id, title, model, sdk_session_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(session.id, session.title, session.model, session.sdk_session_id, session.created_at, session.updated_at);
  return session;
}

// 更新会话
export function updateSession(id: string, updates: Partial<Pick<DbSession, 'title' | 'model' | 'sdk_session_id'>>): boolean {
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.model !== undefined) {
    fields.push('model = ?');
    values.push(updates.model);
  }
  if (updates.sdk_session_id !== undefined) {
    fields.push('sdk_session_id = ?');
    values.push(updates.sdk_session_id);
  }
  
  if (fields.length === 0) return false;
  
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);
  
  const stmt = db.prepare(`UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`);
  const result = stmt.run(...values);
  return result.changes > 0;
}

// 删除会话
export function deleteSession(id: string): boolean {
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// ============= 消息操作 =============

// 获取会话的所有消息
export function getMessagesBySession(sessionId: string): DbMessage[] {
  const stmt = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC');
  return stmt.all(sessionId) as DbMessage[];
}

// 创建消息
export function createMessage(message: DbMessage): DbMessage {
  const stmt = db.prepare(`
    INSERT INTO messages (id, session_id, role, content, model, created_at, tool_calls)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    message.id,
    message.session_id,
    message.role,
    message.content,
    message.model,
    message.created_at,
    message.tool_calls
  );
  
  // 更新会话的 updated_at
  const updateStmt = db.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?');
  updateStmt.run(new Date().toISOString(), message.session_id);
  
  return message;
}

// 更新消息内容
export function updateMessage(id: string, updates: Partial<Pick<DbMessage, 'content' | 'tool_calls'>>): boolean {
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.content !== undefined) {
    fields.push('content = ?');
    values.push(updates.content);
  }
  if (updates.tool_calls !== undefined) {
    fields.push('tool_calls = ?');
    values.push(updates.tool_calls);
  }
  
  if (fields.length === 0) return false;
  
  values.push(id);
  
  const stmt = db.prepare(`UPDATE messages SET ${fields.join(', ')} WHERE id = ?`);
  const result = stmt.run(...values);
  return result.changes > 0;
}

// 删除消息
export function deleteMessage(id: string): boolean {
  const stmt = db.prepare('DELETE FROM messages WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// 批量创建消息（用于保存对话）
export function createMessages(messages: DbMessage[]): void {
  const stmt = db.prepare(`
    INSERT INTO messages (id, session_id, role, content, model, created_at, tool_calls)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertMany = db.transaction((msgs: DbMessage[]) => {
    for (const msg of msgs) {
      stmt.run(msg.id, msg.session_id, msg.role, msg.content, msg.model, msg.created_at, msg.tool_calls);
    }
  });
  
  insertMany(messages);
}

// 清空所有数据
export function clearAllData(): void {
  db.exec('DELETE FROM messages');
  db.exec('DELETE FROM sessions');
}

// ============= 培训进度操作 =============

export interface TrainingProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  score: number | null;
  passed: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  course_id: string;
  answers: string;
  score: number;
  passed: number;
  total_questions: number;
  correct_count: number;
  created_at: string;
}

// 获取用户所有课程进度
export function getAllProgress(userId: string = 'default'): TrainingProgress[] {
  const stmt = db.prepare('SELECT * FROM training_progress WHERE user_id = ? ORDER BY updated_at DESC');
  return stmt.all(userId) as TrainingProgress[];
}

// 获取单个课程进度
export function getCourseProgress(userId: string, courseId: string): TrainingProgress | undefined {
  const stmt = db.prepare('SELECT * FROM training_progress WHERE user_id = ? AND course_id = ?');
  return stmt.get(userId, courseId) as TrainingProgress | undefined;
}

// 更新或创建课程进度
export function upsertProgress(progress: Partial<TrainingProgress> & { user_id: string; course_id: string }): TrainingProgress {
  const existing = getCourseProgress(progress.user_id, progress.course_id);
  const now = new Date().toISOString();
  
  if (existing) {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (progress.status !== undefined) { fields.push('status = ?'); values.push(progress.status); }
    if (progress.progress !== undefined) { fields.push('progress = ?'); values.push(progress.progress); }
    if (progress.score !== undefined) { fields.push('score = ?'); values.push(progress.score); }
    if (progress.passed !== undefined) { fields.push('passed = ?'); values.push(progress.passed); }
    if (progress.lesson_id !== undefined) { fields.push('lesson_id = ?'); values.push(progress.lesson_id); }
    if (progress.started_at !== undefined) { fields.push('started_at = ?'); values.push(progress.started_at); }
    if (progress.completed_at !== undefined) { fields.push('completed_at = ?'); values.push(progress.completed_at); }
    
    fields.push('updated_at = ?');
    values.push(now);
    values.push(existing.id);
    
    const stmt = db.prepare(`UPDATE training_progress SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    return getCourseProgress(progress.user_id, progress.course_id)!;
  } else {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO training_progress (id, user_id, course_id, lesson_id, status, progress, score, passed, started_at, completed_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      progress.user_id,
      progress.course_id,
      progress.lesson_id || null,
      progress.status || 'not_started',
      progress.progress || 0,
      progress.score || null,
      progress.passed || 0,
      progress.started_at || null,
      progress.completed_at || null,
      now,
      now
    );
    
    return getCourseProgress(progress.user_id, progress.course_id)!;
  }
}

// 保存测验结果
export function saveQuizResult(result: Omit<QuizResult, 'id' | 'created_at'>): QuizResult {
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO quiz_results (id, user_id, course_id, answers, score, passed, total_questions, correct_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, result.user_id, result.course_id, result.answers, result.score, result.passed, result.total_questions, result.correct_count, now);
  
  return { ...result, id, created_at: now };
}

// 获取课程的历史测验记录
export function getQuizResults(userId: string, courseId: string): QuizResult[] {
  const stmt = db.prepare('SELECT * FROM quiz_results WHERE user_id = ? AND course_id = ? ORDER BY created_at DESC');
  return stmt.all(userId, courseId) as QuizResult[];
}

export default db;

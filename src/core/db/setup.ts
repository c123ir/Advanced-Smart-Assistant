/**
 * @file setup.ts
 * @description تنظیم اولیه پایگاه داده و ایجاد جداول مورد نیاز
 */

import * as fs from 'fs';
import * as path from 'path';
import DatabaseService from '../services/databaseService';

/**
 * اسکیما‌های مورد نیاز برای ایجاد جداول
 */
const SCHEMAS = {
  USERS: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT DEFAULT 'user',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,
  
  TASKS: `
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      priority INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_by TEXT NOT NULL,
      assigned_to TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id),
      FOREIGN KEY (assigned_to) REFERENCES users (id)
    )
  `,
  
  NOTIFICATIONS: `
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `,
  
  SETTINGS: `
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, key)
    )
  `
};

/**
 * راه‌اندازی پایگاه داده
 * @param dbPath مسیر فایل پایگاه داده
 */
export async function setupDb(dbPath: string): Promise<void> {
  try {
    // ایجاد پوشه پایگاه داده اگر وجود ندارد
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // اتصال به پایگاه داده
    DatabaseService.init(dbPath);
    const db = DatabaseService.getInstance();
    
    // ایجاد جداول
    await db.run(SCHEMAS.USERS);
    await db.run(SCHEMAS.TASKS);
    await db.run(SCHEMAS.NOTIFICATIONS);
    await db.run(SCHEMAS.SETTINGS);
    
    // ایجاد کاربر پیش‌فرض admin اگر وجود ندارد
    await createAdminUser(db);
    
    console.log('پایگاه داده با موفقیت تنظیم شد');
  } catch (error) {
    console.error('خطا در تنظیم پایگاه داده:', error);
    throw error;
  }
}

/**
 * ایجاد کاربر admin پیش‌فرض
 * @param db سرویس پایگاه داده
 */
async function createAdminUser(db: DatabaseService): Promise<void> {
  try {
    // بررسی وجود کاربر admin
    const existingAdmin = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (!existingAdmin) {
      // ایجاد کاربر admin
      const adminUser = {
        id: generateUuid(),
        username: 'admin',
        full_name: 'مدیر سیستم',
        email: 'admin@example.com',
        password: '$2b$10$dSK.xzRXWI.UW0zVY1nKxu42e0.J5XP1QOXSEpHHK1tZ9Qx3ZvTdq', // "admin123"
        role: 'admin',
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await db.run(
        `INSERT INTO users (id, username, full_name, email, password, role, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          adminUser.id,
          adminUser.username,
          adminUser.full_name,
          adminUser.email,
          adminUser.password,
          adminUser.role,
          adminUser.is_active,
          adminUser.created_at,
          adminUser.updated_at
        ]
      );
      
      console.log('کاربر admin با موفقیت ایجاد شد');
    }
  } catch (error) {
    console.error('خطا در ایجاد کاربر admin:', error);
    throw error;
  }
}

/**
 * تولید UUID ساده
 * @returns UUID
 */
function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 
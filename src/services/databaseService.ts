/**
 * سرویس پایگاه داده
 * 
 * این سرویس برای مدیریت ذخیره‌سازی داده‌ها با استفاده از electron-store استفاده می‌شود
 * به جای SQLite، از ذخیره‌سازی JSON استفاده می‌کنیم که برای برنامه‌های کوچک مناسب است
 */

import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import Store from 'electron-store';
import Logger from '../core/logger';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { SECURITY_CONFIG } from '../core/config';

// ایجاد لاگر
const logger = new Logger('DatabaseService');

// تعریف انواع داده‌ها
export interface User {
  id: string;
  username: string;
  password: string; // هش شده
  fullName: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: number;
  lastLogin?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'canceled';
  priority: 'low' | 'medium' | 'high';
  dueDate?: number;
  userId: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: number;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  details?: string;
  createdAt: number;
}

// تعریف ساختار داده‌های ذخیره شده
interface DatabaseSchema {
  users: Record<string, User>;
  tasks: Record<string, Task>;
  tags: Record<string, Tag>;
  comments: Record<string, Comment>;
  taskHistory: Record<string, TaskHistory>;
  settings: Record<string, any>;
}

/**
 * سرویس پایگاه داده
 * پیاده‌سازی الگوی Singleton برای دسترسی یکپارچه به پایگاه داده
 */
class DatabaseService {
  private static instance: DatabaseService;
  private store: Store<DatabaseSchema>;
  private dataPath: string;
  private initialized: boolean = false;

  /**
   * سازنده خصوصی برای جلوگیری از ایجاد نمونه مستقیم
   */
  private constructor() {
    // مسیر ذخیره‌سازی داده‌ها
    this.dataPath = path.join(app.getPath('userData'), 'data');
    
    // اطمینان از وجود پوشه داده‌ها
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
    
    // ایجاد فروشگاه داده
    this.store = new Store<DatabaseSchema>({
      name: 'database',
      defaults: {
        users: {},
        tasks: {},
        tags: {},
        comments: {},
        taskHistory: {},
        settings: {}
      }
    });
    
    logger.info('سرویس پایگاه داده ایجاد شد');
  }

  /**
   * دریافت نمونه سرویس - پیاده‌سازی الگوی Singleton
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * راه‌اندازی پایگاه داده و مقداردهی اولیه
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info('پایگاه داده قبلاً راه‌اندازی شده است');
      return;
    }

    try {
      await this.initializeDatabase();
      this.initialized = true;
      logger.info('پایگاه داده با موفقیت راه‌اندازی شد');
    } catch (error) {
      logger.error('خطا در راه‌اندازی پایگاه داده:', error);
      throw error;
    }
  }

  /**
   * مقداردهی اولیه پایگاه داده
   */
  private async initializeDatabase(): Promise<void> {
    try {
      // بررسی وجود کاربران
      const users = Object.keys(this.store.get('users', {}));
      
      // اگر کاربری وجود ندارد، کاربر ادمین را اضافه کنیم
      if (users.length === 0) {
        // هش کردن رمز عبور - استفاده از عدد ثابت به جای SECURITY_CONFIG
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        logger.info('رمز عبور هش شده ایجاد شد');
        
        const adminUser: User = {
          id: uuidv4(),
          username: 'admin',
          password: hashedPassword, // رمز عبور هش شده
          fullName: 'مدیر سیستم',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: Date.now()
        };
        
        const usersStore = this.store.get('users', {});
        usersStore[adminUser.id] = adminUser;
        this.store.set('users', usersStore);
        
        logger.info('کاربر ادمین پیش‌فرض با رمز عبور هش شده ایجاد شد');
      }
      
      // بررسی وجود تگ‌ها
      const tags = Object.keys(this.store.get('tags', {}));
      
      // اگر تگی وجود ندارد، تگ‌های پیش‌فرض را اضافه کنیم
      if (tags.length === 0) {
        const defaultTags = [
          { name: 'مهم', color: '#e74c3c' },
          { name: 'کار', color: '#3498db' },
          { name: 'شخصی', color: '#2ecc71' },
          { name: 'خانه', color: '#f39c12' },
          { name: 'مطالعه', color: '#9b59b6' }
        ];
        
        const tagsStore = this.store.get('tags', {});
        
        // اضافه کردن تگ‌های پیش‌فرض
        defaultTags.forEach(tag => {
          const tagId = uuidv4();
          tagsStore[tagId] = {
            id: tagId,
            name: tag.name,
            color: tag.color,
            createdAt: Date.now()
          };
        });
        
        this.store.set('tags', tagsStore);
        logger.info('تگ‌های پیش‌فرض ایجاد شدند');
      }
    } catch (error) {
      logger.error('خطا در مقداردهی اولیه پایگاه داده:', error);
      throw error;
    }
  }

  /**
   * بازیابی تمام رکوردها از یک جدول
   */
  public getAll<T>(table: keyof DatabaseSchema): T[] {
    try {
      const records = this.store.get(table, {}) as Record<string, T>;
      return Object.values(records);
    } catch (error) {
      logger.error(`خطا در بازیابی داده‌ها از ${table}:`, error);
      return [];
    }
  }

  /**
   * بازیابی یک رکورد با شناسه
   */
  public getById<T>(table: keyof DatabaseSchema, id: string): T | null {
    try {
      const records = this.store.get(table, {}) as Record<string, T>;
      return records[id] || null;
    } catch (error) {
      logger.error(`خطا در بازیابی رکورد ${id} از ${table}:`, error);
      return null;
    }
  }

  /**
   * جستجوی رکوردها بر اساس شرایط
   */
  public find<T>(table: keyof DatabaseSchema, predicate: (item: T) => boolean): T[] {
    try {
      const records = this.store.get(table, {}) as Record<string, T>;
      return Object.values(records).filter(predicate);
    } catch (error) {
      logger.error(`خطا در جستجوی داده‌ها در ${table}:`, error);
      return [];
    }
  }

  /**
   * افزودن یک رکورد جدید
   */
  public insert<T extends { id?: string }>(table: keyof DatabaseSchema, data: T): T {
    try {
      const id = data.id || uuidv4();
      const newData = { ...data, id } as T;
      
      const records = this.store.get(table, {}) as Record<string, T>;
      records[id] = newData;
      this.store.set(table, records);
      
      return newData;
    } catch (error) {
      logger.error(`خطا در افزودن رکورد به ${table}:`, error);
      throw error;
    }
  }

  /**
   * به‌روزرسانی یک رکورد
   */
  public update<T extends { id: string }>(table: keyof DatabaseSchema, id: string, data: Partial<T>): T {
    try {
      const records = this.store.get(table, {}) as Record<string, T>;
      if (!records[id]) {
        throw new Error(`رکورد با شناسه ${id} در جدول ${table} یافت نشد`);
      }
      
      records[id] = { ...records[id], ...data };
      this.store.set(table, records);
      
      return records[id];
    } catch (error) {
      logger.error(`خطا در به‌روزرسانی رکورد ${id} در ${table}:`, error);
      throw error;
    }
  }

  /**
   * حذف یک رکورد
   */
  public delete(table: keyof DatabaseSchema, id: string): boolean {
    try {
      const records = this.store.get(table, {}) as Record<string, any>;
      if (!records[id]) {
        return false;
      }
      
      delete records[id];
      this.store.set(table, records);
      
      return true;
    } catch (error) {
      logger.error(`خطا در حذف رکورد ${id} از ${table}:`, error);
      throw error;
    }
  }

  /**
   * پاک کردن تمام داده‌های یک جدول
   */
  public clear(table: keyof DatabaseSchema): void {
    try {
      this.store.set(table, {});
      logger.info(`تمام داده‌های جدول ${table} پاک شدند`);
    } catch (error) {
      logger.error(`خطا در پاک کردن داده‌های جدول ${table}:`, error);
      throw error;
    }
  }

  /**
   * پاک کردن تمام داده‌ها
   */
  public clearAll(): void {
    try {
      this.store.clear();
      this.initializeDatabase(); // بازسازی داده‌های اولیه
      logger.info('تمام داده‌ها پاک شدند و پایگاه داده مجدداً راه‌اندازی شد');
    } catch (error) {
      logger.error('خطا در پاک کردن داده‌ها:', error);
      throw error;
    }
  }

  /**
   * تهیه نسخه پشتیبان از داده‌ها
   */
  public backup(backupPath?: string): string {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const targetPath = backupPath || path.join(this.dataPath, `backup-${timestamp}.json`);
      
      const data = this.store.store;
      fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
      
      logger.info(`نسخه پشتیبان در ${targetPath} ذخیره شد`);
      return targetPath;
    } catch (error) {
      logger.error('خطا در تهیه نسخه پشتیبان:', error);
      throw error;
    }
  }

  /**
   * بازیابی داده‌ها از نسخه پشتیبان
   */
  public restore(backupPath: string): void {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error(`فایل پشتیبان در مسیر ${backupPath} یافت نشد`);
      }
      
      const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      this.store.store = data;
      
      logger.info(`داده‌ها از ${backupPath} بازیابی شدند`);
    } catch (error) {
      logger.error('خطا در بازیابی نسخه پشتیبان:', error);
      throw error;
    }
  }
}

// صادر کردن نمونه سرویس به جای کلاس
const databaseService = DatabaseService.getInstance();
export default databaseService; 
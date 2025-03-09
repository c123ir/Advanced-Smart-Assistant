/**
 * @file databaseService.ts
 * @description سرویس مدیریت پایگاه داده
 */

import * as sqlite3 from 'sqlite3';
import { open, Database, ISqlite, Statement } from 'sqlite';

/**
 * کلاس سرویس پایگاه داده
 * - ارائه دسترسی به پایگاه داده SQLite
 * - پیاده‌سازی الگوی Singleton
 */
export default class DatabaseService {
  private static instance: DatabaseService;
  private db!: Database<sqlite3.Database, sqlite3.Statement>;
  private isInitialized: boolean = false;

  /**
   * سازنده خصوصی - فقط از طریق getInstance قابل دسترسی است
   */
  private constructor() {}

  /**
   * راه‌اندازی اولیه پایگاه داده
   * @param dbPath مسیر فایل دیتابیس
   */
  public static async init(dbPath: string): Promise<void> {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }

    if (!DatabaseService.instance.isInitialized) {
      try {
        const db = await open({
          filename: dbPath,
          driver: sqlite3.Database
        });

        // فعال کردن Foreign Keys
        await db.exec('PRAGMA foreign_keys = ON');
        
        DatabaseService.instance.db = db;
        DatabaseService.instance.isInitialized = true;
        
        console.log('اتصال به پایگاه داده با موفقیت انجام شد');
      } catch (error) {
        console.error('خطا در اتصال به پایگاه داده:', error);
        throw error;
      }
    }
  }

  /**
   * دریافت نمونه سرویس پایگاه داده
   * @returns نمونه سرویس پایگاه داده
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance || !DatabaseService.instance.isInitialized) {
      throw new Error('پایگاه داده هنوز راه‌اندازی نشده است. لطفاً ابتدا متد init را فراخوانی کنید');
    }
    return DatabaseService.instance;
  }

  /**
   * اجرای یک query بدون نیاز به خروجی
   * @param sql دستور SQL
   * @param params پارامترهای دستور (اختیاری)
   * @returns خروجی دستور
   */
  public async run(sql: string, params: any[] = []): Promise<ISqlite.RunResult> {
    try {
      const result = await this.db.run(sql, params);
      return result;
    } catch (error) {
      console.error('خطا در اجرای دستور SQL (run):', error);
      throw error;
    }
  }

  /**
   * اجرای یک query و دریافت یک رکورد
   * @param sql دستور SQL
   * @param params پارامترهای دستور (اختیاری)
   * @returns اولین رکورد خروجی
   */
  public async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    try {
      const result = await this.db.get<T>(sql, params);
      return result;
    } catch (error) {
      console.error('خطا در اجرای دستور SQL (get):', error);
      throw error;
    }
  }

  /**
   * اجرای یک query و دریافت چندین رکورد
   * @param sql دستور SQL
   * @param params پارامترهای دستور (اختیاری)
   * @returns آرایه‌ای از رکوردهای خروجی
   */
  public async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const results = await this.db.all<T>(sql, params);
      return results as T[];
    } catch (error) {
      console.error('خطا در اجرای دستور SQL (all):', error);
      throw error;
    }
  }

  /**
   * اجرای دستور SQL و دریافت تعداد رکوردهای تحت تأثیر
   * @param sql دستور SQL
   * @returns تعداد رکوردهای تحت تأثیر
   */
  public async exec(sql: string): Promise<void> {
    try {
      const result = await this.db.exec(sql);
      return;
    } catch (error) {
      console.error('خطا در اجرای دستور SQL (exec):', error);
      throw error;
    }
  }

  /**
   * اجرای دستور ساده و دریافت نتیجه
   * (معادل با get ولی برای queries ساده‌تر)
   * @param sql دستور SQL
   * @param params پارامترهای دستور (اختیاری)
   * @returns نتیجه دستور
   */
  public async query<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return this.get<T>(sql, params);
  }

  /**
   * شروع یک تراکنش
   */
  public async beginTransaction(): Promise<void> {
    await this.run('BEGIN TRANSACTION');
  }

  /**
   * تأیید یک تراکنش
   */
  public async commit(): Promise<void> {
    await this.run('COMMIT');
  }

  /**
   * لغو یک تراکنش
   */
  public async rollback(): Promise<void> {
    await this.run('ROLLBACK');
  }

  /**
   * بستن اتصال به پایگاه داده
   */
  public async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      console.log('اتصال به پایگاه داده بسته شد');
    }
  }
}

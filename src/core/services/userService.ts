/**
 * @file userService.ts
 * @description سرویس مدیریت کاربران
 */

/* به نام خدای نزدیک */

import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import DatabaseService from './databaseService';
import { User } from '../../types/models';

/**
 * تایپ ورودی برای ایجاد کاربر
 */
export interface CreateUserInput {
  username: string;
  full_name: string;
  email: string;
  password: string;
  avatar_url?: string;
  role?: string;
}

/**
 * تایپ ورودی برای به‌روزرسانی کاربر
 */
export interface UpdateUserInput {
  full_name?: string;
  email?: string;
  password?: string;
  avatar_url?: string;
  role?: string;
  is_active?: boolean;
}

/**
 * کلاس سرویس مدیریت کاربران
 */
export default class UserService {
  private db: DatabaseService;
  private saltRounds = 10;
  private avatarDir: string;
  
  /**
   * سازنده کلاس UserService
   */
  constructor() {
    this.db = DatabaseService.getInstance();
    this.avatarDir = path.join(app.getPath('userData'), 'avatars');
    this.ensureAvatarDirExists();
  }
  
  /**
   * اطمینان از وجود دایرکتوری آواتارها
   */
  private ensureAvatarDirExists(): void {
    if (!fs.existsSync(this.avatarDir)) {
      fs.mkdirSync(this.avatarDir, { recursive: true });
    }
  }
  
  /**
   * ساخت UUID ساده
   * @returns UUID
   */
  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * هش کردن رمز عبور
   * @param password رمز عبور اصلی
   * @returns رمز عبور هش شده
   */
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }
  
  /**
   * مقایسه رمز عبور
   * @param plainPassword رمز عبور اصلی
   * @param hashedPassword رمز عبور هش شده
   * @returns نتیجه مقایسه
   */
  private async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  /**
   * دریافت همه کاربران
   * @returns لیست کاربران
   */
  async getAll(): Promise<User[]> {
    try {
      const users = await this.db.all<User>(`
        SELECT id, username, full_name, email, avatar_url, role, is_active, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `);
      return users;
    } catch (error) {
      console.error('خطا در دریافت کاربران:', error);
      throw error;
    }
  }
  
  /**
   * دریافت یک کاربر بر اساس ID
   * @param id شناسه کاربر
   * @returns اطلاعات کاربر
   */
  async get(id: string): Promise<User | undefined> {
    try {
      const user = await this.db.get<User>(`
        SELECT id, username, full_name, email, avatar_url, role, is_active, created_at, updated_at
        FROM users
        WHERE id = ?
      `, [id]);
      
      return user;
    } catch (error) {
      console.error(`خطا در دریافت کاربر با شناسه ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * دریافت کاربر براساس نام کاربری
   * @param username نام کاربری
   * @returns اطلاعات کاربر
   */
  async getByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await this.db.get<User>(`
        SELECT id, username, full_name, email, avatar_url, role, is_active, created_at, updated_at
        FROM users
        WHERE username = ?
      `, [username]);
      
      return user;
    } catch (error) {
      console.error(`خطا در دریافت کاربر با نام کاربری ${username}:`, error);
      throw error;
    }
  }
  
  /**
   * احراز هویت کاربر
   * @param username نام کاربری
   * @param password رمز عبور
   * @returns اطلاعات کاربر در صورت موفقیت
   */
  async authenticate(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.db.get<User & { password: string }>(`
        SELECT id, username, full_name, email, password, avatar_url, role, is_active, created_at, updated_at
        FROM users
        WHERE username = ? AND is_active = 1
      `, [username]);
      
      if (!user) {
        return null;
      }
      
      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return null;
      }
      
      // حذف رمز عبور از اطلاعات بازگشتی
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error(`خطا در احراز هویت کاربر ${username}:`, error);
      throw error;
    }
  }
  
  /**
   * ایجاد کاربر جدید
   * @param data اطلاعات کاربر جدید
   * @returns اطلاعات کاربر ایجاد شده
   */
  async create(data: CreateUserInput): Promise<User> {
    try {
      // بررسی تکراری نبودن نام کاربری و ایمیل
      const existingUser = await this.db.get<User>(`
        SELECT id FROM users WHERE username = ? OR email = ?
      `, [data.username, data.email]);
      
      if (existingUser) {
        throw new Error('نام کاربری یا ایمیل قبلا استفاده شده است');
      }
      
      // هش کردن رمز عبور
      const hashedPassword = await this.hashPassword(data.password);
      
      // ایجاد شناسه جدید
      const id = this.generateUuid();
      const now = new Date().toISOString();
      
      // درج کاربر جدید
      await this.db.run(`
        INSERT INTO users (id, username, full_name, email, password, avatar_url, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        data.username,
        data.full_name,
        data.email,
        hashedPassword,
        data.avatar_url || null,
        data.role || 'user',
        1,
        now,
        now
      ]);
      
      // بازگرداندن اطلاعات کاربر
      const newUser = await this.get(id);
      if (!newUser) {
        throw new Error('خطا در بازیابی اطلاعات کاربر ایجاد شده');
      }
      
      return newUser;
    } catch (error) {
      console.error('خطا در ایجاد کاربر:', error);
      throw error;
    }
  }
  
  /**
   * به‌روزرسانی کاربر
   * @param id شناسه کاربر
   * @param data اطلاعات به‌روزرسانی
   * @returns اطلاعات کاربر به‌روزرسانی شده
   */
  async update(id: string, data: UpdateUserInput): Promise<User | undefined> {
    try {
      // بررسی وجود کاربر
      const existingUser = await this.get(id);
      if (!existingUser) {
        throw new Error(`کاربر با شناسه ${id} یافت نشد`);
      }
      
      // ساخت بخش SET برای query
      const updates: string[] = [];
      const params: any[] = [];
      
      if (data.full_name !== undefined) {
        updates.push('full_name = ?');
        params.push(data.full_name);
      }
      
      if (data.email !== undefined) {
        // بررسی تکراری نبودن ایمیل
        const emailExists = await this.db.get<{ id: string }>(`
          SELECT id FROM users WHERE email = ? AND id != ?
        `, [data.email, id]);
        
        if (emailExists) {
          throw new Error('ایمیل قبلا استفاده شده است');
        }
        
        updates.push('email = ?');
        params.push(data.email);
      }
      
      if (data.password !== undefined) {
        const hashedPassword = await this.hashPassword(data.password);
        updates.push('password = ?');
        params.push(hashedPassword);
      }
      
      if (data.avatar_url !== undefined) {
        updates.push('avatar_url = ?');
        params.push(data.avatar_url);
      }
      
      if (data.role !== undefined) {
        updates.push('role = ?');
        params.push(data.role);
      }
      
      if (data.is_active !== undefined) {
        updates.push('is_active = ?');
        params.push(data.is_active ? 1 : 0);
      }
      
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      
      // افزودن شناسه کاربر به پارامترها
      params.push(id);
      
      // اجرای query به‌روزرسانی
      await this.db.run(`
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = ?
      `, params);
      
      // بازگرداندن اطلاعات به‌روزرسانی شده
      return await this.get(id);
    } catch (error) {
      console.error(`خطا در به‌روزرسانی کاربر با شناسه ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * آپلود آواتار کاربر
   * @param id شناسه کاربر
   * @param filePath مسیر فایل آواتار
   * @returns مسیر فایل آواتار آپلود شده
   */
  async uploadAvatar(id: string, filePath: string): Promise<string> {
    try {
      // بررسی وجود کاربر
      const user = await this.get(id);
      if (!user) {
        throw new Error(`کاربر با شناسه ${id} یافت نشد`);
      }
      
      // خواندن فایل ورودی
      const fileContent = await fs.promises.readFile(filePath);
      
      // ساخت نام فایل جدید
      const fileExt = path.extname(filePath);
      const fileName = `${id}-${Date.now()}${fileExt}`;
      const targetPath = path.join(this.avatarDir, fileName);
      
      // ذخیره فایل
      await fs.promises.writeFile(targetPath, fileContent);
      
      // به‌روزرسانی مسیر آواتار در دیتابیس
      const avatarUrl = `file://${targetPath}`;
      await this.update(id, { avatar_url: avatarUrl });
      
      return avatarUrl;
    } catch (error) {
      console.error(`خطا در آپلود آواتار برای کاربر با شناسه ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * حذف کاربر
   * @param id شناسه کاربر
   * @returns وضعیت حذف
   */
  async delete(id: string): Promise<boolean> {
    try {
      // بررسی وجود کاربر
      const user = await this.get(id);
      if (!user) {
        throw new Error(`کاربر با شناسه ${id} یافت نشد`);
      }
      
      // حذف کاربر
      await this.db.run('DELETE FROM users WHERE id = ?', [id]);
      
      return true;
    } catch (error) {
      console.error(`خطا در حذف کاربر با شناسه ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * جستجوی کاربران
   * @param query عبارت جستجو
   * @returns لیست کاربران منطبق با جستجو
   */
  async search(query: string): Promise<User[]> {
    try {
      const searchTerm = `%${query}%`;
      
      const users = await this.db.all<User>(`
        SELECT id, username, full_name, email, avatar_url, role, is_active, created_at, updated_at
        FROM users
        WHERE username LIKE ? OR full_name LIKE ? OR email LIKE ?
        ORDER BY full_name ASC
      `, [searchTerm, searchTerm, searchTerm]);
      
      return users;
    } catch (error) {
      console.error(`خطا در جستجوی کاربران با عبارت "${query}":`, error);
      throw error;
    }
  }
} 
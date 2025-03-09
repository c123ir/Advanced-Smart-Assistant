/**
 * @file taskService.ts
 * @description سرویس مدیریت تسک‌ها
 */

import DatabaseService from './databaseService';
import { Task } from '../../types/models';

/**
 * تایپ ورودی برای ایجاد تسک
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date?: string;
  priority?: number;
  status?: string;
  created_by: string;
  assigned_to?: string;
}

/**
 * تایپ ورودی برای به‌روزرسانی تسک
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: number;
  status?: string;
  assigned_to?: string;
}

/**
 * کلاس سرویس مدیریت تسک‌ها
 */
export default class TaskService {
  private db: DatabaseService;

  /**
   * سازنده کلاس
   */
  constructor() {
    this.db = DatabaseService.getInstance();
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
   * دریافت همه تسک‌ها
   * @returns لیست تسک‌ها
   */
  async getAll(): Promise<Task[]> {
    try {
      const tasks = await this.db.all<Task>(`
        SELECT t.*, 
               u1.username as created_by_username, 
               u1.full_name as created_by_full_name,
               u2.username as assigned_to_username, 
               u2.full_name as assigned_to_full_name
        FROM tasks t
        LEFT JOIN users u1 ON t.created_by = u1.id
        LEFT JOIN users u2 ON t.assigned_to = u2.id
        ORDER BY 
          CASE 
            WHEN t.status = 'pending' THEN 1
            WHEN t.status = 'in_progress' THEN 2
            WHEN t.status = 'completed' THEN 3
            ELSE 4
          END,
          t.priority DESC,
          t.due_date ASC
      `);
      
      return tasks;
    } catch (error) {
      console.error('خطا در دریافت تسک‌ها:', error);
      throw error;
    }
  }

  /**
   * دریافت یک تسک با شناسه
   * @param id شناسه تسک
   * @returns اطلاعات تسک
   */
  async get(id: string): Promise<Task | undefined> {
    try {
      const task = await this.db.get<Task>(`
        SELECT t.*, 
               u1.username as created_by_username, 
               u1.full_name as created_by_full_name,
               u2.username as assigned_to_username, 
               u2.full_name as assigned_to_full_name
        FROM tasks t
        LEFT JOIN users u1 ON t.created_by = u1.id
        LEFT JOIN users u2 ON t.assigned_to = u2.id
        WHERE t.id = ?
      `, [id]);
      
      return task;
    } catch (error) {
      console.error(`خطا در دریافت تسک با شناسه ${id}:`, error);
      throw error;
    }
  }

  /**
   * دریافت تسک‌های یک کاربر
   * @param userId شناسه کاربر
   * @returns لیست تسک‌های کاربر
   */
  async getByUser(userId: string): Promise<Task[]> {
    try {
      const tasks = await this.db.all<Task>(`
        SELECT t.*, 
               u1.username as created_by_username, 
               u1.full_name as created_by_full_name,
               u2.username as assigned_to_username, 
               u2.full_name as assigned_to_full_name
        FROM tasks t
        LEFT JOIN users u1 ON t.created_by = u1.id
        LEFT JOIN users u2 ON t.assigned_to = u2.id
        WHERE t.assigned_to = ? OR t.created_by = ?
        ORDER BY 
          CASE 
            WHEN t.status = 'pending' THEN 1
            WHEN t.status = 'in_progress' THEN 2
            WHEN t.status = 'completed' THEN 3
            ELSE 4
          END,
          t.priority DESC,
          t.due_date ASC
      `, [userId, userId]);
      
      return tasks;
    } catch (error) {
      console.error(`خطا در دریافت تسک‌های کاربر با شناسه ${userId}:`, error);
      throw error;
    }
  }

  /**
   * ایجاد تسک جدید
   * @param data اطلاعات تسک جدید
   * @returns اطلاعات تسک ایجاد شده
   */
  async create(data: CreateTaskInput): Promise<Task> {
    try {
      // ایجاد شناسه جدید
      const id = this.generateUuid();
      const now = new Date().toISOString();
      
      // مقادیر پیش‌فرض
      const priority = data.priority !== undefined ? data.priority : 0;
      const status = data.status || 'pending';
      
      // درج تسک جدید
      await this.db.run(`
        INSERT INTO tasks (
          id, title, description, due_date, priority, status, 
          created_by, assigned_to, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        data.title,
        data.description || null,
        data.due_date || null,
        priority,
        status,
        data.created_by,
        data.assigned_to || null,
        now,
        now
      ]);
      
      // بازگرداندن اطلاعات تسک
      const newTask = await this.get(id);
      if (!newTask) {
        throw new Error('خطا در بازیابی اطلاعات تسک ایجاد شده');
      }
      
      return newTask;
    } catch (error) {
      console.error('خطا در ایجاد تسک:', error);
      throw error;
    }
  }

  /**
   * به‌روزرسانی تسک
   * @param id شناسه تسک
   * @param data اطلاعات به‌روزرسانی
   * @returns اطلاعات تسک به‌روزرسانی شده
   */
  async update(id: string, data: UpdateTaskInput): Promise<Task | undefined> {
    try {
      // بررسی وجود تسک
      const existingTask = await this.get(id);
      if (!existingTask) {
        throw new Error(`تسک با شناسه ${id} یافت نشد`);
      }
      
      // ساخت بخش SET برای query
      const updates: string[] = [];
      const params: any[] = [];
      
      if (data.title !== undefined) {
        updates.push('title = ?');
        params.push(data.title);
      }
      
      if (data.description !== undefined) {
        updates.push('description = ?');
        params.push(data.description);
      }
      
      if (data.due_date !== undefined) {
        updates.push('due_date = ?');
        params.push(data.due_date);
      }
      
      if (data.priority !== undefined) {
        updates.push('priority = ?');
        params.push(data.priority);
      }
      
      if (data.status !== undefined) {
        updates.push('status = ?');
        params.push(data.status);
      }
      
      if (data.assigned_to !== undefined) {
        updates.push('assigned_to = ?');
        params.push(data.assigned_to);
      }
      
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      
      // افزودن شناسه تسک به پارامترها
      params.push(id);
      
      // اجرای query به‌روزرسانی
      await this.db.run(`
        UPDATE tasks 
        SET ${updates.join(', ')}
        WHERE id = ?
      `, params);
      
      // بازگرداندن اطلاعات به‌روزرسانی شده
      return await this.get(id);
    } catch (error) {
      console.error(`خطا در به‌روزرسانی تسک با شناسه ${id}:`, error);
      throw error;
    }
  }

  /**
   * حذف تسک
   * @param id شناسه تسک
   * @returns وضعیت حذف
   */
  async delete(id: string): Promise<boolean> {
    try {
      // بررسی وجود تسک
      const task = await this.get(id);
      if (!task) {
        throw new Error(`تسک با شناسه ${id} یافت نشد`);
      }
      
      // حذف تسک
      await this.db.run('DELETE FROM tasks WHERE id = ?', [id]);
      
      return true;
    } catch (error) {
      console.error(`خطا در حذف تسک با شناسه ${id}:`, error);
      throw error;
    }
  }

  /**
   * جستجوی تسک‌ها
   * @param query عبارت جستجو
   * @returns لیست تسک‌های منطبق با جستجو
   */
  async search(query: string): Promise<Task[]> {
    try {
      const searchTerm = `%${query}%`;
      
      const tasks = await this.db.all<Task>(`
        SELECT t.*, 
               u1.username as created_by_username, 
               u1.full_name as created_by_full_name,
               u2.username as assigned_to_username, 
               u2.full_name as assigned_to_full_name
        FROM tasks t
        LEFT JOIN users u1 ON t.created_by = u1.id
        LEFT JOIN users u2 ON t.assigned_to = u2.id
        WHERE t.title LIKE ? OR t.description LIKE ?
        ORDER BY 
          CASE 
            WHEN t.status = 'pending' THEN 1
            WHEN t.status = 'in_progress' THEN 2
            WHEN t.status = 'completed' THEN 3
            ELSE 4
          END,
          t.priority DESC,
          t.due_date ASC
      `, [searchTerm, searchTerm]);
      
      return tasks;
    } catch (error) {
      console.error(`خطا در جستجوی تسک‌ها با عبارت "${query}":`, error);
      throw error;
    }
  }

  /**
   * جستجوی تسک‌ها براساس وضعیت
   * @param status وضعیت تسک
   * @returns لیست تسک‌های با وضعیت مشخص شده
   */
  async searchByStatus(status: string): Promise<Task[]> {
    try {
      const tasks = await this.db.all<Task>(`
        SELECT t.*, 
               u1.username as created_by_username, 
               u1.full_name as created_by_full_name,
               u2.username as assigned_to_username, 
               u2.full_name as assigned_to_full_name
        FROM tasks t
        LEFT JOIN users u1 ON t.created_by = u1.id
        LEFT JOIN users u2 ON t.assigned_to = u2.id
        WHERE t.status = ?
        ORDER BY t.priority DESC, t.due_date ASC
      `, [status]);
      
      return tasks;
    } catch (error) {
      console.error(`خطا در جستجوی تسک‌ها با وضعیت "${status}":`, error);
      throw error;
    }
  }
} 
/**
 * سرویس مدیریت تگ‌ها
 * 
 * این ماژول برای مدیریت تگ‌های وظایف استفاده می‌شود
 */

import databaseService, { Tag, Task } from './databaseService';
import { logger } from '../core/logger';

/**
 * کلاس سرویس تگ‌ها
 */
export class TagService {
  /**
   * دریافت همه تگ‌ها
   * @returns لیست تگ‌ها
   */
  async getTags(): Promise<Tag[]> {
    try {
      const tags = databaseService.getAll<Tag>('tags');
      // مرتب‌سازی بر اساس نام
      return tags.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      logger.error('خطا در دریافت لیست تگ‌ها', error);
      throw error;
    }
  }

  /**
   * دریافت یک تگ با شناسه
   * @param id شناسه تگ
   * @returns اطلاعات تگ
   */
  async getTag(id: string): Promise<Tag | null> {
    try {
      return databaseService.getById<Tag>('tags', id);
    } catch (error) {
      logger.error(`خطا در دریافت تگ با شناسه ${id}`, error);
      throw error;
    }
  }

  /**
   * ایجاد تگ جدید
   * @param tag اطلاعات تگ
   * @returns تگ ایجاد شده
   */
  async createTag(tag: Omit<Tag, 'id' | 'createdAt'>): Promise<Tag> {
    try {
      // بررسی تکراری نبودن نام تگ
      const existingTags = databaseService.find<Tag>('tags', t => t.name === tag.name);
      
      if (existingTags.length > 0) {
        throw new Error(`تگ با نام "${tag.name}" قبلاً وجود دارد`);
      }
      
      // ایجاد تگ جدید
      const newTag: any = {
        name: tag.name,
        color: tag.color || '#3498db',
        createdAt: Date.now()
      };
      
      // درج در دیتابیس
      const createdTag = databaseService.insert('tags', newTag);
      
      logger.info(`تگ جدید با نام "${tag.name}" ایجاد شد`);
      
      return createdTag;
    } catch (error) {
      logger.error(`خطا در ایجاد تگ جدید با نام "${tag.name}"`, error);
      throw error;
    }
  }

  /**
   * به‌روزرسانی تگ
   * @param id شناسه تگ
   * @param tag اطلاعات جدید تگ
   * @returns تگ به‌روزرسانی شده
   */
  async updateTag(id: string, tag: Partial<Tag>): Promise<Tag | null> {
    try {
      // بررسی وجود تگ
      const existingTag = await this.getTag(id);
      
      if (!existingTag) {
        throw new Error(`تگ با شناسه ${id} یافت نشد`);
      }
      
      // بررسی تکراری نبودن نام تگ در صورت تغییر
      if (tag.name && tag.name !== existingTag.name) {
        const tagsWithSameName = databaseService.find<Tag>('tags', t => t.name === tag.name);
        
        if (tagsWithSameName.length > 0) {
          throw new Error(`تگ با نام "${tag.name}" قبلاً وجود دارد`);
        }
      }
      
      // ساخت داده‌های به‌روزرسانی
      const updateData: Partial<Tag> = { ...tag };
      
      // به‌روزرسانی در دیتابیس
      const updatedTag = databaseService.update<Tag>('tags', id, updateData);
      
      logger.info(`تگ با شناسه ${id} به‌روزرسانی شد`);
      
      return updatedTag;
    } catch (error) {
      logger.error(`خطا در به‌روزرسانی تگ با شناسه ${id}`, error);
      throw error;
    }
  }

  /**
   * حذف تگ
   * @param id شناسه تگ
   * @returns نتیجه حذف
   */
  async deleteTag(id: string): Promise<boolean> {
    try {
      // بررسی وجود تگ
      const existingTag = await this.getTag(id);
      
      if (!existingTag) {
        throw new Error(`تگ با شناسه ${id} یافت نشد`);
      }
      
      // حذف تگ از تمام وظایف
      const tasks = databaseService.getAll<Task>('tasks');
      
      for (const task of tasks) {
        if (task.tags.includes(id)) {
          // حذف تگ از آرایه تگ‌های وظیفه
          const updatedTags = task.tags.filter(tagId => tagId !== id);
          databaseService.update<Task>('tasks', task.id, { tags: updatedTags });
        }
      }
      
      // حذف تگ
      const result = databaseService.delete('tags', id);
      
      logger.info(`تگ با شناسه ${id} حذف شد`);
      
      return result;
    } catch (error) {
      logger.error(`خطا در حذف تگ با شناسه ${id}`, error);
      throw error;
    }
  }

  /**
   * دریافت تگ‌های یک وظیفه
   * @param taskId شناسه وظیفه
   * @returns لیست تگ‌های وظیفه
   */
  async getTaskTags(taskId: string): Promise<Tag[]> {
    try {
      // دریافت وظیفه
      const task = databaseService.getById<Task>('tasks', taskId);
      
      if (!task) {
        throw new Error(`وظیفه با شناسه ${taskId} یافت نشد`);
      }
      
      // دریافت تگ‌های وظیفه
      const tags: Tag[] = [];
      
      for (const tagId of task.tags) {
        const tag = databaseService.getById<Tag>('tags', tagId);
        if (tag) {
          tags.push(tag);
        }
      }
      
      // مرتب‌سازی بر اساس نام
      return tags.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      logger.error(`خطا در دریافت تگ‌های وظیفه با شناسه ${taskId}`, error);
      throw error;
    }
  }

  /**
   * تنظیم تگ‌های یک وظیفه
   * @param taskId شناسه وظیفه
   * @param tagIds شناسه‌های تگ‌ها
   * @returns نتیجه عملیات
   */
  async setTaskTags(taskId: string, tagIds: string[]): Promise<boolean> {
    try {
      // بررسی وجود وظیفه
      const task = databaseService.getById<Task>('tasks', taskId);
      
      if (!task) {
        throw new Error(`وظیفه با شناسه ${taskId} یافت نشد`);
      }
      
      // بررسی وجود همه تگ‌ها
      for (const tagId of tagIds) {
        const tag = databaseService.getById<Tag>('tags', tagId);
        
        if (!tag) {
          throw new Error(`تگ با شناسه ${tagId} یافت نشد`);
        }
      }
      
      // به‌روزرسانی تگ‌های وظیفه
      databaseService.update<Task>('tasks', taskId, { 
        tags: tagIds,
        updatedAt: Date.now()
      });
      
      logger.info(`تگ‌های وظیفه با شناسه ${taskId} به‌روزرسانی شدند`);
      
      return true;
    } catch (error) {
      logger.error(`خطا در تنظیم تگ‌های وظیفه با شناسه ${taskId}`, error);
      throw error;
    }
  }
}

// ایجاد نمونه از سرویس
const tagService = new TagService();
export default tagService; 
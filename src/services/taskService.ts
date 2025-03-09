/**
 * سرویس مدیریت وظایف
 * 
 * این ماژول برای مدیریت وظایف و کامنت‌های آن‌ها استفاده می‌شود
 */

import databaseService, { Task, Comment, TaskHistory } from './databaseService';
import { logger } from '../core/logger';

/**
 * کلاس سرویس وظایف
 */
export class TaskService {
  /**
   * دریافت همه وظایف با امکان فیلتر
   * @param options گزینه‌های فیلتر
   * @returns لیست وظایف
   */
  async getTasks(options: {
    userId?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<Task[]> {
    try {
      // دریافت همه وظایف
      let tasks = databaseService.getAll<Task>('tasks');

      // اعمال فیلترها
      if (options.userId) {
        tasks = tasks.filter(task => task.userId === options.userId);
      }

      if (options.status) {
        tasks = tasks.filter(task => task.status === options.status);
      }

      if (options.priority) {
        tasks = tasks.filter(task => task.priority === options.priority);
      }

      // فیلتر بر اساس تاریخ سررسید
      if (options.dueDate) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
        const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).getTime();

        switch (options.dueDate) {
          case 'today':
            tasks = tasks.filter(task => 
              task.dueDate !== undefined && 
              task.dueDate >= today && 
              task.dueDate < tomorrow
            );
            break;
          case 'week':
            tasks = tasks.filter(task => 
              task.dueDate !== undefined && 
              task.dueDate >= today && 
              task.dueDate < nextWeek
            );
            break;
          case 'overdue':
            tasks = tasks.filter(task => 
              task.dueDate !== undefined && 
              task.dueDate < today && 
              task.status !== 'completed'
            );
            break;
          case 'upcoming':
            tasks = tasks.filter(task => 
              task.dueDate !== undefined && 
              task.dueDate >= today && 
              task.status !== 'completed'
            );
            break;
          case 'no-date':
            tasks = tasks.filter(task => task.dueDate === undefined);
            break;
        }
      }

      // جستجو در عنوان و توضیحات
      if (options.search) {
        const searchTerm = options.search.toLowerCase();
        tasks = tasks.filter(task => 
          task.title.toLowerCase().includes(searchTerm) || 
          task.description.toLowerCase().includes(searchTerm)
        );
      }

      // مرتب‌سازی
      if (options.sortBy) {
        const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
        
        tasks.sort((a, b) => {
          switch (options.sortBy) {
            case 'title':
              return sortOrder * a.title.localeCompare(b.title);
            case 'dueDate':
              // در صورت نداشتن تاریخ سررسید، آن را به انتها منتقل می‌کنیم
              if (a.dueDate === undefined && b.dueDate === undefined) return 0;
              if (a.dueDate === undefined) return sortOrder;
              if (b.dueDate === undefined) return -sortOrder;
              return sortOrder * (a.dueDate - b.dueDate);
            case 'priority':
              const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
              return sortOrder * (priorityOrder[a.priority as keyof typeof priorityOrder] - 
                                  priorityOrder[b.priority as keyof typeof priorityOrder]);
            case 'status':
              return sortOrder * a.status.localeCompare(b.status);
            case 'createdAt':
              return sortOrder * (a.createdAt - b.createdAt);
            case 'updatedAt':
              return sortOrder * (a.updatedAt - b.updatedAt);
            default:
              return 0;
          }
        });
      } else {
        // مرتب‌سازی پیش‌فرض بر اساس تاریخ به‌روزرسانی (جدیدترین ابتدا)
        tasks.sort((a, b) => b.updatedAt - a.updatedAt);
      }

      return tasks;
    } catch (error) {
      logger.error('خطا در دریافت وظایف', error);
      throw error;
    }
  }

  /**
   * دریافت یک وظیفه با شناسه
   * @param id شناسه وظیفه
   * @returns اطلاعات وظیفه
   */
  async getTask(id: string): Promise<Task | null> {
    try {
      return databaseService.getById<Task>('tasks', id);
    } catch (error) {
      logger.error(`خطا در دریافت وظیفه با شناسه ${id}`, error);
      throw error;
    }
  }

  /**
   * ایجاد وظیفه جدید
   * @param task اطلاعات وظیفه
   * @returns وظیفه ایجاد شده
   */
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      // ایجاد وظیفه جدید
      const now = Date.now();
      const newTask: any = {
        ...task,
        status: task.status || 'pending',
        tags: task.tags || [],
        createdAt: now,
        updatedAt: now
      };
      
      // درج در دیتابیس
      const createdTask = databaseService.insert<Task>('tasks', newTask);
      
      // ثبت در تاریخچه
      this.addTaskHistory(createdTask.id, task.userId, 'create', '');
      
      logger.info(`وظیفه جدید با عنوان "${task.title}" ایجاد شد`);
      
      return createdTask;
    } catch (error) {
      logger.error(`خطا در ایجاد وظیفه جدید با عنوان "${task.title}"`, error);
      throw error;
    }
  }

  /**
   * به‌روزرسانی وظیفه
   * @param id شناسه وظیفه
   * @param task اطلاعات جدید وظیفه
   * @param userId شناسه کاربر ویرایش‌کننده
   * @returns وظیفه به‌روزرسانی شده
   */
  async updateTask(id: string, task: Partial<Task>, userId: string): Promise<Task> {
    try {
      // بررسی وجود وظیفه
      const existingTask = await this.getTask(id);
      
      if (!existingTask) {
        throw new Error(`وظیفه با شناسه ${id} یافت نشد`);
      }
      
      // ساخت داده‌های به‌روزرسانی
      const updateData: Partial<Task> = { 
        ...task,
        updatedAt: Date.now() 
      };
      
      // به‌روزرسانی در دیتابیس
      const updatedTask = databaseService.update<Task>('tasks', id, updateData);
      
      // ثبت تغییرات در تاریخچه
      let actionDetails = '';
      if (task.status && task.status !== existingTask.status) {
        actionDetails = `وضعیت از ${existingTask.status} به ${task.status} تغییر یافت`;
      } else if (task.priority && task.priority !== existingTask.priority) {
        actionDetails = `اولویت از ${existingTask.priority} به ${task.priority} تغییر یافت`;
      } else {
        actionDetails = 'ویرایش اطلاعات';
      }
      
      this.addTaskHistory(id, userId, 'update', actionDetails);
      
      logger.info(`وظیفه با شناسه ${id} به‌روزرسانی شد`);
      
      return updatedTask;
    } catch (error) {
      logger.error(`خطا در به‌روزرسانی وظیفه با شناسه ${id}`, error);
      throw error;
    }
  }

  /**
   * حذف وظیفه
   * @param id شناسه وظیفه
   * @param userId شناسه کاربر حذف‌کننده
   * @returns نتیجه حذف
   */
  async deleteTask(id: string, userId: string): Promise<boolean> {
    try {
      // بررسی وجود وظیفه
      const existingTask = await this.getTask(id);
      
      if (!existingTask) {
        throw new Error(`وظیفه با شناسه ${id} یافت نشد`);
      }
      
      // حذف کامنت‌های وظیفه
      const comments = await this.getTaskComments(id);
      for (const comment of comments) {
        databaseService.delete('comments', comment.id);
      }
      
      // حذف وظیفه
      const result = databaseService.delete('tasks', id);
      
      // ثبت در تاریخچه
      this.addTaskHistory(id, userId, 'delete', '');
      
      logger.info(`وظیفه با شناسه ${id} حذف شد`);
      
      return result;
    } catch (error) {
      logger.error(`خطا در حذف وظیفه با شناسه ${id}`, error);
      throw error;
    }
  }

  /**
   * دریافت کامنت‌های یک وظیفه
   * @param taskId شناسه وظیفه
   * @returns لیست کامنت‌ها
   */
  async getTaskComments(taskId: string): Promise<Comment[]> {
    try {
      const comments = databaseService.find<Comment>('comments', comment => comment.taskId === taskId);
      // مرتب‌سازی بر اساس زمان (قدیمی‌ترین ابتدا)
      return comments.sort((a, b) => a.createdAt - b.createdAt);
    } catch (error) {
      logger.error(`خطا در دریافت کامنت‌های وظیفه با شناسه ${taskId}`, error);
      throw error;
    }
  }

  /**
   * افزودن کامنت به وظیفه
   * @param comment اطلاعات کامنت
   * @returns کامنت اضافه شده
   */
  async addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    try {
      // بررسی وجود وظیفه
      const task = await this.getTask(comment.taskId);
      
      if (!task) {
        throw new Error(`وظیفه با شناسه ${comment.taskId} یافت نشد`);
      }
      
      // ایجاد کامنت جدید
      const newComment: any = {
        ...comment,
        createdAt: Date.now()
      };
      
      // درج در دیتابیس
      const createdComment = databaseService.insert<Comment>('comments', newComment);
      
      // به‌روزرسانی زمان ویرایش وظیفه
      databaseService.update<Task>('tasks', comment.taskId, {
        updatedAt: Date.now()
      });
      
      // ثبت در تاریخچه
      this.addTaskHistory(
        comment.taskId, 
        comment.userId, 
        'comment', 
        'کامنت جدید اضافه شد'
      );
      
      logger.info(`کامنت جدید برای وظیفه با شناسه ${comment.taskId} اضافه شد`);
      
      return createdComment;
    } catch (error) {
      logger.error(`خطا در افزودن کامنت به وظیفه با شناسه ${comment.taskId}`, error);
      throw error;
    }
  }

  /**
   * حذف کامنت
   * @param id شناسه کامنت
   * @param userId شناسه کاربر حذف‌کننده
   * @returns نتیجه حذف
   */
  async deleteComment(id: string, userId: string): Promise<boolean> {
    try {
      // بررسی وجود کامنت
      const comment = databaseService.getById<Comment>('comments', id);
      
      if (!comment) {
        throw new Error(`کامنت با شناسه ${id} یافت نشد`);
      }
      
      // حذف کامنت
      const result = databaseService.delete('comments', id);
      
      // ثبت در تاریخچه
      this.addTaskHistory(
        comment.taskId, 
        userId, 
        'delete_comment', 
        'کامنت حذف شد'
      );
      
      logger.info(`کامنت با شناسه ${id} حذف شد`);
      
      return result;
    } catch (error) {
      logger.error(`خطا در حذف کامنت با شناسه ${id}`, error);
      throw error;
    }
  }

  /**
   * دریافت تاریخچه وظیفه
   * @param taskId شناسه وظیفه
   * @returns لیست تاریخچه
   */
  async getTaskHistory(taskId: string): Promise<TaskHistory[]> {
    try {
      const history = databaseService.find<TaskHistory>('taskHistory', item => item.taskId === taskId);
      // مرتب‌سازی بر اساس زمان (جدیدترین ابتدا)
      return history.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      logger.error(`خطا در دریافت تاریخچه وظیفه با شناسه ${taskId}`, error);
      throw error;
    }
  }

  /**
   * افزودن مورد به تاریخچه وظیفه
   * @param taskId شناسه وظیفه
   * @param userId شناسه کاربر
   * @param action عملیات انجام شده
   * @param details جزئیات بیشتر
   */
  private async addTaskHistory(taskId: string, userId: string, action: string, details?: string): Promise<void> {
    try {
      const historyItem: any = {
        taskId,
        userId,
        action,
        details,
        createdAt: Date.now()
      };
      
      databaseService.insert<TaskHistory>('taskHistory', historyItem);
    } catch (error) {
      logger.error(`خطا در ثبت تاریخچه وظیفه: ${error}`);
    }
  }
}

// ایجاد نمونه از سرویس
const taskService = new TaskService();
export default taskService; 
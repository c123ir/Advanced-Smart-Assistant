/**
 * صادر کردن همه سرویس‌ها
 * 
 * این فایل برای دسترسی آسان به همه سرویس‌ها استفاده می‌شود
 */

// سرویس دیتابیس
import databaseService, { Task, Comment, TaskHistory, User, Tag } from './databaseService';
export { databaseService };
export type { Task, Comment, TaskHistory, User, Tag };

// سرویس کاربران
import userService, { LoginResult } from './userService';
export { userService };
export type { LoginResult };

// سرویس وظایف
import taskService from './taskService';
export { taskService };

// سرویس تگ‌ها
import tagService from './tagService';
export { tagService };

// سرویس آمار
import statsService, { DashboardStats, UserStats } from './statsService';
export { statsService };
export type { DashboardStats, UserStats };

// سرویس تنظیمات
import settingsService, { UserSettings } from './settingsService';
export { settingsService };
export type { UserSettings };

import { logger } from '../core/logger';

/**
 * راه‌اندازی همه سرویس‌ها
 * این تابع باید در ابتدای برنامه فراخوانی شود
 */
export async function initializeServices(): Promise<void> {
  logger.info('در حال راه‌اندازی سرویس‌ها...');
  
  // راه‌اندازی سرویس دیتابیس
  await databaseService.initialize();
  
  // لاگ برای اطمینان از وجود سرویس‌ها
  if (userService) {
    logger.info('userService در services/index.ts موجود است');
  } else {
    logger.error('userService در services/index.ts تعریف نشده است!');
  }
  
  if (taskService) {
    logger.info('taskService در services/index.ts موجود است');
  } else {
    logger.error('taskService در services/index.ts تعریف نشده است!');
  }
  
  // سایر سرویس‌ها در صورت نیاز به راه‌اندازی اولیه اینجا فراخوانی می‌شوند
  logger.info('راه‌اندازی سرویس‌ها کامل شد');
}

// صادر کردن نمونه برای ترفند رفع isolated module error
export default {
  databaseService,
  userService,
  taskService,
  tagService,
  statsService,
  settingsService,
  initializeServices
}; 
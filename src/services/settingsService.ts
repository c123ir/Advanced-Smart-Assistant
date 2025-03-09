/**
 * سرویس مدیریت تنظیمات برنامه
 * 
 * این ماژول برای مدیریت تنظیمات برنامه در دیتابیس استفاده می‌شود
 */

import databaseService from './databaseService';
import { logger } from '../core/logger';
import settingsManager from '../core/settings';
import { AppSettings } from '../core/config';

// نوع داده تنظیمات کاربر
export interface UserSettings {
  userId: string;
  theme?: 'light' | 'dark' | 'system';
  language?: 'fa' | 'en';
  notifications?: boolean;
  defaultView?: 'list' | 'board' | 'calendar';
  defaultFilter?: string;
  taskSortOrder?: string;
  showCompletedTasks?: boolean;
  [key: string]: any;
}

/**
 * کلاس سرویس تنظیمات
 */
export class SettingsService {
  /**
   * راه‌اندازی جدول تنظیمات
   */
  async setupSettingsTable(): Promise<void> {
    try {
      // در ساختار جدید نیازی به راه‌اندازی جدول نیست چون از electron-store استفاده می‌کنیم
      logger.info('جدول تنظیمات با موفقیت راه‌اندازی شد');
    } catch (error) {
      logger.error('خطا در راه‌اندازی جدول تنظیمات', error);
      throw error;
    }
  }

  /**
   * دریافت تنظیمات کاربر
   * @param userId شناسه کاربر
   * @returns تنظیمات کاربر
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      // دریافت تنظیمات کاربر از دیتابیس جدید
      const userSettings = databaseService.getById<UserSettings>('settings', userId);
      
      if (!userSettings) {
        // اگر تنظیمات وجود نداشت، تنظیمات پیش‌فرض را برمی‌گردانیم
        return {
          userId,
          theme: settingsManager.get('general.theme'),
          language: settingsManager.get('general.language'),
          notifications: settingsManager.get('notifications.enabled'),
          defaultView: 'list',
          defaultFilter: '',
          taskSortOrder: 'dueDate',
          showCompletedTasks: true
        };
      }
      
      return userSettings;
    } catch (error) {
      logger.error(`خطا در دریافت تنظیمات کاربر با شناسه ${userId}`, error);
      throw error;
    }
  }

  /**
   * ذخیره تنظیمات کاربر
   * @param userId شناسه کاربر
   * @param settings تنظیمات کاربر
   * @returns نتیجه عملیات
   */
  async saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<boolean> {
    try {
      // دریافت تنظیمات فعلی
      const currentSettings = await this.getUserSettings(userId);
      
      // ترکیب تنظیمات فعلی با تنظیمات جدید
      const newSettings = {
        ...currentSettings,
        ...settings,
        userId,
        id: userId // اضافه کردن id برای سازگاری با ساختار databaseService
      };
      
      // ذخیره تنظیمات در دیتابیس جدید
      databaseService.insert('settings', newSettings);
      
      logger.info(`تنظیمات کاربر با شناسه ${userId} ذخیره شد`);
      
      return true;
    } catch (error) {
      logger.error(`خطا در ذخیره تنظیمات کاربر با شناسه ${userId}`, error);
      throw error;
    }
  }

  /**
   * بازنشانی تنظیمات کاربر به حالت پیش‌فرض
   * @param userId شناسه کاربر
   * @returns نتیجه عملیات
   */
  async resetUserSettings(userId: string): Promise<boolean> {
    try {
      // حذف تنظیمات کاربر از دیتابیس جدید
      databaseService.delete('settings', userId);
      
      logger.info(`تنظیمات کاربر با شناسه ${userId} به حالت پیش‌فرض بازنشانی شد`);
      
      return true;
    } catch (error) {
      logger.error(`خطا در بازنشانی تنظیمات کاربر با شناسه ${userId}`, error);
      throw error;
    }
  }

  /**
   * دریافت تنظیمات عمومی برنامه
   * @returns تنظیمات عمومی برنامه
   */
  getAppSettings(): AppSettings {
    return settingsManager.getAll();
  }

  /**
   * ذخیره تنظیمات عمومی برنامه
   * @param settings تنظیمات عمومی برنامه
   * @returns نتیجه عملیات
   */
  saveAppSettings(settings: Partial<AppSettings>): boolean {
    try {
      settingsManager.setMultiple(settings);
      logger.info('تنظیمات عمومی برنامه ذخیره شد');
      return true;
    } catch (error) {
      logger.error('خطا در ذخیره تنظیمات عمومی برنامه', error);
      return false;
    }
  }

  /**
   * بازنشانی تنظیمات عمومی برنامه به حالت پیش‌فرض
   * @returns نتیجه عملیات
   */
  resetAppSettings(): boolean {
    try {
      settingsManager.reset();
      logger.info('تنظیمات عمومی برنامه به حالت پیش‌فرض بازنشانی شد');
      return true;
    } catch (error) {
      logger.error('خطا در بازنشانی تنظیمات عمومی برنامه', error);
      return false;
    }
  }
}

// ایجاد نمونه از سرویس تنظیمات
const settingsService = new SettingsService();
export default settingsService; 
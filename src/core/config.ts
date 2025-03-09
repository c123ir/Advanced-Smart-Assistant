/**
 * تنظیمات برنامه
 * 
 * این فایل شامل تنظیمات و پیکربندی‌های برنامه است
 */

import { app } from 'electron';
import * as path from 'path';
import Store from 'electron-store';

// تنظیمات امنیتی
export const SECURITY_CONFIG = {
  // تعداد دورهای هش کردن رمز عبور
  SALT_ROUNDS: 10,
  
  // طول توکن‌های امنیتی
  TOKEN_LENGTH: 64,
  
  // مدت زمان اعتبار توکن (به ثانیه) - 7 روز
  TOKEN_EXPIRY: 7 * 24 * 60 * 60,
  
  // حداقل طول رمز عبور
  MIN_PASSWORD_LENGTH: 8,
  
  // حداکثر تلاش‌های ناموفق ورود
  MAX_LOGIN_ATTEMPTS: 5,
  
  // مدت زمان قفل شدن حساب پس از تلاش‌های ناموفق (به دقیقه)
  ACCOUNT_LOCK_TIME: 30
};

// تنظیمات پیش‌فرض برنامه
export interface AppSettings {
  general: {
    language: string;
    theme: string;
    fontSize: string;
    startOnBoot: boolean;
    minimizeToTray: boolean;
    checkForUpdates: boolean;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    taskReminders: boolean;
    systemNotifications: boolean;
    reminderTime: number;
  };
  display: {
    taskListView: string;
    showCompletedTasks: boolean;
    defaultTaskSort: string;
    defaultTaskFilter: string;
  };
  storage: {
    autoBackup: boolean;
    backupInterval: number;
    maxBackupCount: number;
  };
  [key: string]: any;
}

export const DEFAULT_SETTINGS: AppSettings = {
  // تنظیمات عمومی
  general: {
    language: 'fa',
    theme: 'light',
    fontSize: 'medium',
    startOnBoot: false,
    minimizeToTray: true,
    checkForUpdates: true
  },
  
  // تنظیمات اعلان‌ها
  notifications: {
    enabled: true,
    sound: true,
    taskReminders: true,
    systemNotifications: true,
    reminderTime: 30 // دقیقه قبل از موعد
  },
  
  // تنظیمات نمایش
  display: {
    taskListView: 'list', // 'list' یا 'kanban'
    showCompletedTasks: true,
    defaultTaskSort: 'dueDate', // 'dueDate', 'priority', 'title', 'createdAt'
    defaultTaskFilter: 'all' // 'all', 'today', 'upcoming', 'overdue'
  },
  
  // تنظیمات ذخیره‌سازی
  storage: {
    autoBackup: true,
    backupInterval: 7, // روز
    maxBackupCount: 5
  }
};

// اطلاعات کاربر ادمین پیش‌فرض
export const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123',
  fullName: 'مدیر سیستم',
  email: 'admin@example.com',
  role: 'admin'
};

// کلاس مدیریت تنظیمات
class ConfigManager {
  private store: Store<{ settings: AppSettings }>;
  
  constructor() {
    this.store = new Store<{ settings: AppSettings }>({
      name: 'config',
      defaults: {
        settings: DEFAULT_SETTINGS
      }
    });
  }
  
  /**
   * دریافت تنظیمات
   * @param key کلید تنظیمات (اختیاری)
   * @returns مقدار تنظیمات
   */
  public getSettings<T>(key?: string): T {
    if (key) {
      return this.store.get(`settings.${key}`) as T;
    }
    return this.store.get('settings') as T;
  }
  
  /**
   * ذخیره تنظیمات
   * @param key کلید تنظیمات
   * @param value مقدار جدید
   */
  public setSetting<T>(key: string, value: T): void {
    this.store.set(`settings.${key}`, value);
  }
  
  /**
   * متد set برای سازگاری با موارد استفاده موجود
   * این متد مستقیماً مقدار را در ریشه ذخیره می‌کند
   * @param key کلید
   * @param value مقدار
   */
  public set<T>(key: string, value: T): void {
    this.store.set(key, value);
  }
  
  /**
   * بازنشانی تنظیمات به حالت پیش‌فرض
   * @param key کلید تنظیمات (اختیاری - در صورت عدم ارائه، تمام تنظیمات بازنشانی می‌شوند)
   */
  public resetSettings(key?: string): void {
    if (key) {
      const keyParts = key.split('.');
      let defaultValue: any = DEFAULT_SETTINGS;
      let pathExists = true;
      
      for (const part of keyParts) {
        if (defaultValue && typeof defaultValue === 'object' && part in defaultValue) {
          defaultValue = defaultValue[part];
        } else {
          pathExists = false;
          break;
        }
      }
      
      if (pathExists) {
        this.store.set(`settings.${key}`, defaultValue);
      }
    } else {
      this.store.set('settings', DEFAULT_SETTINGS);
    }
  }
  
  /**
   * دریافت مسیرهای برنامه
   * @returns مسیرهای برنامه
   */
  public getPaths() {
    const userDataPath = app.getPath('userData');
    
    return {
      // مسیر داده‌های کاربر
      USER_DATA: userDataPath,
      
      // مسیر دیتابیس
      DATABASE: path.join(userDataPath, 'data', 'database.db'),
      
      // مسیر لاگ‌ها
      LOGS: path.join(userDataPath, 'logs'),
      
      // مسیر فایل‌های موقت
      TEMP: path.join(userDataPath, 'temp'),
      
      // مسیر آپلودها
      UPLOADS: path.join(userDataPath, 'uploads'),
      
      // مسیر آواتارها
      AVATARS: path.join(userDataPath, 'uploads', 'avatars'),
      
      // مسیر نسخه‌های پشتیبان
      BACKUPS: path.join(userDataPath, 'backups')
    };
  }
}

// تعریف ثابت APP_PATHS برای سازگاری با کدهای قدیمی
export const APP_PATHS = new ConfigManager().getPaths();

export default new ConfigManager(); 
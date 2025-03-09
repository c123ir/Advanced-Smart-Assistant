/**
 * مدیریت تنظیمات برنامه
 * 
 * این ماژول برای ذخیره و بازیابی تنظیمات کاربر استفاده می‌شود
 */

import Store from 'electron-store';
import { DEFAULT_SETTINGS, AppSettings } from './config';
import { logger } from './logger';

// ایجاد نمونه از کلاس Store
const store = new Store<AppSettings>({
  name: 'settings',
  defaults: DEFAULT_SETTINGS
});

/**
 * کلاس مدیریت تنظیمات برنامه
 */
class SettingsManager {
  /**
   * دریافت تمام تنظیمات
   * @returns تنظیمات برنامه
   */
  getAll(): AppSettings {
    try {
      return store.store;
    } catch (error) {
      logger.error('خطا در دریافت تنظیمات', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * دریافت یک تنظیم خاص
   * @param key کلید تنظیم
   * @param defaultValue مقدار پیش‌فرض در صورت عدم وجود
   * @returns مقدار تنظیم
   */
  get<T>(key: string, defaultValue?: T): T {
    try {
      return store.get(key, defaultValue) as T;
    } catch (error) {
      logger.error(`خطا در دریافت تنظیم ${key}`, error);
      return defaultValue as T;
    }
  }

  /**
   * ذخیره یک تنظیم
   * @param key کلید تنظیم
   * @param value مقدار تنظیم
   */
  set<T>(key: string, value: T): void {
    try {
      store.set(key, value);
      logger.debug(`تنظیم ${key} با مقدار ${JSON.stringify(value)} ذخیره شد`);
    } catch (error) {
      logger.error(`خطا در ذخیره تنظیم ${key}`, error);
    }
  }

  /**
   * ذخیره چندین تنظیم همزمان
   * @param settings تنظیمات برای ذخیره
   */
  setMultiple(settings: Partial<AppSettings>): void {
    try {
      Object.entries(settings).forEach(([key, value]) => {
        store.set(key, value);
      });
      logger.debug(`تنظیمات چندگانه ذخیره شدند: ${JSON.stringify(settings)}`);
    } catch (error) {
      logger.error('خطا در ذخیره تنظیمات چندگانه', error);
    }
  }

  /**
   * حذف یک تنظیم
   * @param key کلید تنظیم
   */
  delete(key: string): void {
    try {
      store.delete(key);
      logger.debug(`تنظیم ${key} حذف شد`);
    } catch (error) {
      logger.error(`خطا در حذف تنظیم ${key}`, error);
    }
  }

  /**
   * بازنشانی تنظیمات به حالت پیش‌فرض
   */
  reset(): void {
    try {
      store.clear();
      store.store = DEFAULT_SETTINGS;
      logger.info('تنظیمات به حالت پیش‌فرض بازنشانی شدند');
    } catch (error) {
      logger.error('خطا در بازنشانی تنظیمات', error);
    }
  }
}

export default new SettingsManager(); 
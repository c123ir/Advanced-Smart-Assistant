/**
 * ماژول ثبت لاگ‌ها
 * 
 * این ماژول برای ثبت لاگ‌های برنامه استفاده می‌شود
 */

import * as path from 'path';
import { app } from 'electron';
import electronLog from 'electron-log';

// تنظیم مسیر فایل‌های لاگ
electronLog.transports.file.resolvePath = () => {
  return path.join(app.getPath('userData'), 'logs/main.log');
};

// تنظیم فرمت لاگ‌ها
electronLog.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] [{processType}] {text}';

// تنظیم سطح لاگ‌ها
electronLog.transports.file.level = process.env.NODE_ENV === 'development' ? 'debug' : 'info';
electronLog.transports.console.level = process.env.NODE_ENV === 'development' ? 'debug' : 'info';

// حداکثر اندازه فایل لاگ (10 مگابایت)
electronLog.transports.file.maxSize = 10 * 1024 * 1024;

class Logger {
  private context: string;

  /**
   * ایجاد یک نمونه جدید از لاگر
   * @param context نام بخش یا ماژول برای شناسایی منبع لاگ
   */
  constructor(context: string) {
    this.context = context;
  }

  /**
   * ثبت پیام در سطح اطلاعات
   * @param message پیام اصلی
   * @param args پارامترهای اضافی
   */
  public info(message: string, ...args: any[]): void {
    electronLog.info(`[${this.context}] ${message}`, ...args);
  }

  /**
   * ثبت پیام در سطح دیباگ
   * @param message پیام اصلی
   * @param args پارامترهای اضافی
   */
  public debug(message: string, ...args: any[]): void {
    electronLog.debug(`[${this.context}] ${message}`, ...args);
  }

  /**
   * ثبت پیام در سطح هشدار
   * @param message پیام اصلی
   * @param args پارامترهای اضافی
   */
  public warn(message: string, ...args: any[]): void {
    electronLog.warn(`[${this.context}] ${message}`, ...args);
  }

  /**
   * ثبت پیام در سطح خطا
   * @param message پیام اصلی
   * @param args پارامترهای اضافی
   */
  public error(message: string, ...args: any[]): void {
    electronLog.error(`[${this.context}] ${message}`, ...args);
  }

  /**
   * ثبت پیام در سطح بحرانی
   * @param message پیام اصلی
   * @param args پارامترهای اضافی
   */
  public critical(message: string, ...args: any[]): void {
    electronLog.error(`[CRITICAL] [${this.context}] ${message}`, ...args);
  }
}

// نمونه پیش‌فرض لاگر برای سازگاری با کدهای موجود
const defaultLogger = new Logger('App');

export { Logger as default, defaultLogger as logger }; 
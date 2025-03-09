/**
 * مدیریت فایل‌های برنامه
 * 
 * این ماژول برای مدیریت فایل‌ها و دایرکتوری‌های برنامه استفاده می‌شود
 */

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { logger } from './logger';
import { APP_PATHS } from './config';

/**
 * کلاس مدیریت فایل‌ها
 */
class FileManager {
  /**
   * اطمینان از وجود دایرکتوری
   * @param dirPath مسیر دایرکتوری
   * @returns true اگر دایرکتوری وجود داشته باشد یا با موفقیت ایجاد شود
   */
  ensureDirectory(dirPath: string): boolean {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        logger.debug(`دایرکتوری ایجاد شد: ${dirPath}`);
      }
      return true;
    } catch (error) {
      logger.error(`خطا در ایجاد دایرکتوری ${dirPath}`, error);
      return false;
    }
  }

  /**
   * خواندن محتوای یک فایل
   * @param filePath مسیر فایل
   * @returns محتوای فایل یا null در صورت خطا
   */
  readFile(filePath: string): string | null {
    try {
      if (!fs.existsSync(filePath)) {
        logger.warn(`فایل وجود ندارد: ${filePath}`);
        return null;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      return content;
    } catch (error) {
      logger.error(`خطا در خواندن فایل ${filePath}`, error);
      return null;
    }
  }

  /**
   * نوشتن محتوا در یک فایل
   * @param filePath مسیر فایل
   * @param content محتوای فایل
   * @returns true در صورت موفقیت
   */
  writeFile(filePath: string, content: string): boolean {
    try {
      // اطمینان از وجود دایرکتوری والد
      const dirPath = path.dirname(filePath);
      this.ensureDirectory(dirPath);
      
      fs.writeFileSync(filePath, content, 'utf-8');
      logger.debug(`فایل نوشته شد: ${filePath}`);
      return true;
    } catch (error) {
      logger.error(`خطا در نوشتن فایل ${filePath}`, error);
      return false;
    }
  }

  /**
   * حذف یک فایل
   * @param filePath مسیر فایل
   * @returns true در صورت موفقیت
   */
  deleteFile(filePath: string): boolean {
    try {
      if (!fs.existsSync(filePath)) {
        logger.warn(`فایل برای حذف وجود ندارد: ${filePath}`);
        return true;
      }
      
      fs.unlinkSync(filePath);
      logger.debug(`فایل حذف شد: ${filePath}`);
      return true;
    } catch (error) {
      logger.error(`خطا در حذف فایل ${filePath}`, error);
      return false;
    }
  }

  /**
   * کپی یک فایل
   * @param sourcePath مسیر فایل مبدا
   * @param destPath مسیر فایل مقصد
   * @returns true در صورت موفقیت
   */
  copyFile(sourcePath: string, destPath: string): boolean {
    try {
      if (!fs.existsSync(sourcePath)) {
        logger.warn(`فایل مبدا وجود ندارد: ${sourcePath}`);
        return false;
      }
      
      // اطمینان از وجود دایرکتوری مقصد
      const destDir = path.dirname(destPath);
      this.ensureDirectory(destDir);
      
      fs.copyFileSync(sourcePath, destPath);
      logger.debug(`فایل کپی شد از ${sourcePath} به ${destPath}`);
      return true;
    } catch (error) {
      logger.error(`خطا در کپی فایل از ${sourcePath} به ${destPath}`, error);
      return false;
    }
  }

  /**
   * بررسی وجود یک فایل
   * @param filePath مسیر فایل
   * @returns true اگر فایل وجود داشته باشد
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * دریافت اندازه یک فایل
   * @param filePath مسیر فایل
   * @returns اندازه فایل به بایت یا -1 در صورت خطا
   */
  getFileSize(filePath: string): number {
    try {
      if (!fs.existsSync(filePath)) {
        logger.warn(`فایل وجود ندارد: ${filePath}`);
        return -1;
      }
      
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      logger.error(`خطا در دریافت اندازه فایل ${filePath}`, error);
      return -1;
    }
  }

  /**
   * ذخیره یک تصویر آواتار
   * @param userId شناسه کاربر
   * @param imageData داده‌های تصویر (Base64)
   * @returns مسیر فایل ذخیره شده یا null در صورت خطا
   */
  saveAvatar(userId: number, imageData: string): string | null {
    try {
      // اطمینان از وجود دایرکتوری آواتارها
      this.ensureDirectory(APP_PATHS.AVATARS);
      
      // حذف پیشوند Base64 اگر وجود داشته باشد
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // ایجاد مسیر فایل
      const avatarPath = path.join(APP_PATHS.AVATARS, `user_${userId}.png`);
      
      // ذخیره فایل
      fs.writeFileSync(avatarPath, buffer);
      logger.debug(`آواتار کاربر ${userId} ذخیره شد`);
      
      return avatarPath;
    } catch (error) {
      logger.error(`خطا در ذخیره آواتار کاربر ${userId}`, error);
      return null;
    }
  }

  /**
   * دریافت مسیر آواتار کاربر
   * @param userId شناسه کاربر
   * @returns مسیر فایل آواتار یا مسیر آواتار پیش‌فرض
   */
  getAvatarPath(userId: number): string {
    const avatarPath = path.join(APP_PATHS.AVATARS, `user_${userId}.png`);
    
    if (fs.existsSync(avatarPath)) {
      return avatarPath;
    }
    
    // برگرداندن مسیر آواتار پیش‌فرض
    return path.join(__dirname, '../assets/images/default-avatar.png');
  }

  /**
   * راه‌اندازی اولیه مدیریت فایل‌ها
   */
  initialize(): void {
    try {
      // اطمینان از وجود دایرکتوری‌های اصلی
      this.ensureDirectory(APP_PATHS.LOGS);
      this.ensureDirectory(APP_PATHS.AVATARS);
      
      logger.info('مدیریت فایل‌ها راه‌اندازی شد');
    } catch (error) {
      logger.error('خطا در راه‌اندازی مدیریت فایل‌ها', error);
    }
  }
}

export default new FileManager(); 
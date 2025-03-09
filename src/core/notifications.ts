/**
 * مدیریت اعلان‌های برنامه
 * 
 * این ماژول برای نمایش اعلان‌های سیستمی استفاده می‌شود
 */

import { Notification } from 'electron';
import path from 'path';
import settingsManager from './settings';
import { logger } from './logger';
import { t } from './i18n';

// نوع داده اعلان
export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  sound?: boolean;
  clickCallback?: () => void;
}

/**
 * کلاس مدیریت اعلان‌ها
 */
class NotificationManager {
  private defaultIcon: string;

  constructor() {
    this.defaultIcon = path.join(__dirname, '../assets/icons/icon.png');
  }

  /**
   * بررسی فعال بودن اعلان‌ها
   * @returns وضعیت فعال بودن اعلان‌ها
   */
  isEnabled(): boolean {
    return settingsManager.get<boolean>('notifications', true);
  }

  /**
   * فعال یا غیرفعال کردن اعلان‌ها
   * @param enabled وضعیت جدید
   */
  setEnabled(enabled: boolean): void {
    settingsManager.set('notifications', enabled);
    logger.info(`اعلان‌ها ${enabled ? 'فعال' : 'غیرفعال'} شدند`);
  }

  /**
   * نمایش یک اعلان
   * @param options تنظیمات اعلان
   */
  show(options: NotificationOptions): void {
    try {
      // اگر اعلان‌ها غیرفعال باشند، نمایش داده نمی‌شوند
      if (!this.isEnabled()) {
        return;
      }

      const notification = new Notification({
        title: options.title,
        body: options.body,
        icon: options.icon || this.defaultIcon,
        silent: !options.sound
      });

      // اگر کالبک کلیک تعریف شده باشد
      if (options.clickCallback) {
        notification.on('click', options.clickCallback);
      }

      notification.show();
      logger.debug(`اعلان نمایش داده شد: ${options.title}`);
    } catch (error) {
      logger.error('خطا در نمایش اعلان', error);
    }
  }

  /**
   * نمایش اعلان اطلاعاتی
   * @param title عنوان اعلان
   * @param body متن اعلان
   * @param clickCallback کالبک کلیک (اختیاری)
   */
  info(title: string, body: string, clickCallback?: () => void): void {
    this.show({
      title,
      body,
      icon: path.join(__dirname, '../assets/icons/info.png'),
      sound: false,
      clickCallback
    });
  }

  /**
   * نمایش اعلان موفقیت
   * @param title عنوان اعلان
   * @param body متن اعلان
   * @param clickCallback کالبک کلیک (اختیاری)
   */
  success(title: string, body: string, clickCallback?: () => void): void {
    this.show({
      title,
      body,
      icon: path.join(__dirname, '../assets/icons/success.png'),
      sound: false,
      clickCallback
    });
  }

  /**
   * نمایش اعلان هشدار
   * @param title عنوان اعلان
   * @param body متن اعلان
   * @param clickCallback کالبک کلیک (اختیاری)
   */
  warning(title: string, body: string, clickCallback?: () => void): void {
    this.show({
      title,
      body,
      icon: path.join(__dirname, '../assets/icons/warning.png'),
      sound: true,
      clickCallback
    });
  }

  /**
   * نمایش اعلان خطا
   * @param title عنوان اعلان
   * @param body متن اعلان
   * @param clickCallback کالبک کلیک (اختیاری)
   */
  error(title: string, body: string, clickCallback?: () => void): void {
    this.show({
      title,
      body,
      icon: path.join(__dirname, '../assets/icons/error.png'),
      sound: true,
      clickCallback
    });
  }

  /**
   * نمایش اعلان یادآوری وظیفه
   * @param taskName نام وظیفه
   * @param dueDate تاریخ سررسید
   * @param clickCallback کالبک کلیک (اختیاری)
   */
  taskReminder(taskName: string, dueDate: string, clickCallback?: () => void): void {
    this.warning(
      t('tasks.reminder'),
      t('tasks.reminderMessage', { taskName, dueDate }),
      clickCallback
    );
  }
}

export default new NotificationManager(); 
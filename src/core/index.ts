/**
 * صادر کردن همه ماژول‌های core
 * 
 * این فایل برای دسترسی آسان به همه ماژول‌های core استفاده می‌شود
 */

// تنظیمات
export * from './config';

// لاگر
export { default as logger } from './logger';

// تنظیمات برنامه
export { default as settingsManager } from './settings';

// مدیریت تم
export { default as themeManager, type ThemeType } from './theme';

// مدیریت زبان
export { default as i18n, t, type LanguageType } from './i18n';

// مدیریت اعلان‌ها
export { default as notificationManager, type NotificationOptions } from './notifications';

// مدیریت منو
export { default as menuManager } from './menu';

// مدیریت سینی سیستم
export { default as trayManager } from './tray';

// مدیریت به‌روزرسانی
export { default as updaterManager } from './updater';

// مدیریت فایل‌ها
export { default as fileManager } from './fileManager';

// مدیریت رویدادها
export { default as eventManager } from './events'; 
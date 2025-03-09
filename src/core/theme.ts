/**
 * مدیریت تم برنامه
 * 
 * این ماژول برای مدیریت تم روشن و تاریک برنامه استفاده می‌شود
 */

import { nativeTheme } from 'electron';
import settingsManager from './settings';
import { logger } from './logger';

// نوع داده تم
export type ThemeType = 'light' | 'dark' | 'system';

/**
 * کلاس مدیریت تم
 */
class ThemeManager {
  /**
   * دریافت تم فعلی
   * @returns نوع تم فعلی
   */
  getCurrentTheme(): ThemeType {
    return settingsManager.get<ThemeType>('theme', 'light');
  }

  /**
   * بررسی اینکه آیا تم تاریک فعال است
   * @returns true اگر تم تاریک فعال باشد
   */
  isDarkMode(): boolean {
    const theme = this.getCurrentTheme();
    
    if (theme === 'system') {
      return nativeTheme.shouldUseDarkColors;
    }
    
    return theme === 'dark';
  }

  /**
   * تغییر تم برنامه
   * @param theme تم جدید
   */
  setTheme(theme: ThemeType): void {
    try {
      // ذخیره تنظیم تم
      settingsManager.set('theme', theme);
      
      // اعمال تم به سیستم
      if (theme === 'system') {
        nativeTheme.themeSource = 'system';
      } else {
        nativeTheme.themeSource = theme;
      }
      
      logger.info(`تم برنامه به ${theme} تغییر یافت`);
    } catch (error) {
      logger.error('خطا در تغییر تم برنامه', error);
    }
  }

  /**
   * تغییر به تم روشن
   */
  setLightTheme(): void {
    this.setTheme('light');
  }

  /**
   * تغییر به تم تاریک
   */
  setDarkTheme(): void {
    this.setTheme('dark');
  }

  /**
   * تغییر به تم سیستم
   */
  setSystemTheme(): void {
    this.setTheme('system');
  }

  /**
   * تغییر به تم مخالف فعلی (روشن به تاریک و برعکس)
   */
  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    
    if (currentTheme === 'light') {
      this.setDarkTheme();
    } else if (currentTheme === 'dark') {
      this.setLightTheme();
    } else {
      // اگر تم سیستم باشد، بر اساس حالت فعلی سیستم تغییر می‌کنیم
      if (nativeTheme.shouldUseDarkColors) {
        this.setLightTheme();
      } else {
        this.setDarkTheme();
      }
    }
  }

  /**
   * راه‌اندازی اولیه مدیریت تم
   */
  initialize(): void {
    try {
      const savedTheme = this.getCurrentTheme();
      this.setTheme(savedTheme);
      
      // گوش دادن به تغییرات تم سیستم
      nativeTheme.on('updated', () => {
        if (this.getCurrentTheme() === 'system') {
          logger.debug(`تم سیستم تغییر کرد: ${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}`);
        }
      });
      
      logger.info('مدیریت تم راه‌اندازی شد');
    } catch (error) {
      logger.error('خطا در راه‌اندازی مدیریت تم', error);
    }
  }
}

export default new ThemeManager(); 
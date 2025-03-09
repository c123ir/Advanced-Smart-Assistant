/**
 * ماژول مدیریت زبان و ترجمه
 * 
 * این ماژول برای مدیریت زبان و ترجمه متون برنامه استفاده می‌شود
 */

import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import { logger } from './logger';

// تعریف نوع زبان برای استفاده در برنامه
export type LanguageType = 'fa' | 'en';

// ساختار داده‌های ترجمه
interface TranslationData {
  [key: string]: {
    [key: string]: string;
  };
}

class I18nManager {
  private translations: TranslationData = {};
  private currentLanguage: LanguageType = 'fa';
  private availableLanguages: LanguageType[] = ['fa', 'en'];
  private readonly defaultLanguage: LanguageType = 'fa';

  constructor() {
    this.loadTranslations();
  }

  /**
   * بارگذاری فایل‌های ترجمه
   */
  private loadTranslations(): void {
    try {
      const translationsPath = process.env.NODE_ENV === 'development'
        ? path.join(__dirname, '../../assets/translations')
        : path.join(app.getAppPath(), 'assets/translations');

      this.availableLanguages.forEach(lang => {
        const filePath = path.join(translationsPath, `${lang}.json`);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          this.translations[lang] = JSON.parse(content);
        } else {
          logger.warn(`فایل ترجمه برای زبان ${lang} یافت نشد: ${filePath}`);
        }
      });

      logger.info('فایل‌های ترجمه با موفقیت بارگذاری شدند');
    } catch (error) {
      logger.error('خطا در بارگذاری فایل‌های ترجمه', error);
      // در صورت خطا، یک ترجمه خالی ایجاد می‌کنیم
      this.availableLanguages.forEach(lang => {
        this.translations[lang] = {};
      });
    }
  }

  /**
   * تغییر زبان برنامه
   * @param language زبان جدید
   */
  public setLanguage(language: LanguageType): void {
    if (this.availableLanguages.includes(language)) {
      this.currentLanguage = language;
      logger.info(`زبان برنامه به ${language} تغییر یافت`);
    } else {
      logger.warn(`زبان ${language} پشتیبانی نمی‌شود. از زبان پیش‌فرض استفاده می‌شود`);
      this.currentLanguage = this.defaultLanguage;
    }
  }

  /**
   * دریافت زبان فعلی برنامه
   */
  public getCurrentLanguage(): LanguageType {
    return this.currentLanguage;
  }

  /**
   * دریافت لیست زبان‌های قابل دسترس
   */
  public getAvailableLanguages(): LanguageType[] {
    return [...this.availableLanguages];
  }

  /**
   * ترجمه یک کلید به زبان فعلی
   * @param key کلید ترجمه
   * @param params پارامترهای جایگزین در متن
   */
  public translate(key: string, params: Record<string, string | number> = {}): string {
    try {
      const languageData = this.translations[this.currentLanguage] || {};
      let translation = languageData[key] || key;

      // جایگزینی پارامترها در متن
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`{${param}}`, 'g'), String(value));
      });

      return translation;
    } catch (error) {
      logger.error(`خطا در ترجمه کلید ${key}`, error);
      return key;
    }
  }
}

// ایجاد نمونه از مدیریت زبان
const i18nManager = new I18nManager();

// تابع کمکی برای ترجمه
export const t = (key: string, params: Record<string, string | number> = {}): string => {
  return i18nManager.translate(key, params);
};

export default i18nManager; 
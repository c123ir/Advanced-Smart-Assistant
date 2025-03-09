/**
 * ماژول مدیریت آیکون سینی سیستم (Tray)
 * 
 * این ماژول برای مدیریت آیکون برنامه در سینی سیستم عامل استفاده می‌شود
 */

import { app, Tray, Menu, BrowserWindow, nativeImage } from 'electron';
import * as path from 'path';
import { logger } from './logger';
import { t } from './i18n';
import appConfig from './config';

// برای سازگاری با کد موجود، isQuitting را به app اضافه می‌کنیم
declare global {
  namespace Electron {
    interface App {
      isQuitting?: boolean;
    }
  }
}

class TrayManager {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow | null = null;
  private minimizeToTrayEnabled: boolean = true;

  /**
   * ایجاد آیکون سینی سیستم
   * @param mainWindow پنجره اصلی برنامه
   */
  public createTray(mainWindow: BrowserWindow): Tray {
    try {
      this.mainWindow = mainWindow;

      // تنظیم مسیر آیکون 
      const iconPath = this.getIconPath();
      const icon = nativeImage.createFromPath(iconPath);
      
      // ایجاد آیکون در سینی سیستم
      this.tray = new Tray(icon);
      this.tray.setToolTip('دستیار هوشمند');
      
      // رویداد کلیک روی آیکون
      this.tray.on('click', () => {
        this.toggleMainWindow();
      });

      // به‌روزرسانی منوی آیکون
      this.updateContextMenu();
      
      logger.info('آیکون سینی سیستم ایجاد شد');
      return this.tray;
    } catch (error) {
      logger.error('خطا در ایجاد آیکون سینی سیستم', error);
      throw error;
    }
  }

  /**
   * دریافت مسیر آیکون مناسب بر اساس سیستم عامل
   */
  private getIconPath(): string {
    try {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const basePath = isDevelopment 
        ? path.join(__dirname, '../../assets/icons') 
        : path.join(app.getAppPath(), 'assets/icons');
        
      // انتخاب آیکون مناسب بر اساس سیستم عامل
      if (process.platform === 'win32') {
        return path.join(basePath, 'win/icon.ico');
      } else if (process.platform === 'darwin') {
        return path.join(basePath, 'mac/icon.png');
      } else {
        return path.join(basePath, 'png/64x64.png');
      }
    } catch (error) {
      logger.error('خطا در دریافت مسیر آیکون', error);
      
      // در صورت خطا، از آیکون پیش‌فرض استفاده می‌کنیم
      const defaultIconPath = path.join(__dirname, '../../assets/icons/png/64x64.png');
      return defaultIconPath;
    }
  }

  /**
   * به‌روزرسانی منوی راست کلیک آیکون
   */
  public updateContextMenu(): void {
    if (!this.tray) return;

    try {
      const contextMenu = Menu.buildFromTemplate([
        {
          label: t('tray.open'),
          click: () => {
            this.showMainWindow();
          }
        },
        {
          label: t('tray.toggle_minimize'),
          type: 'checkbox',
          checked: this.minimizeToTrayEnabled,
          click: (menuItem) => {
            this.setMinimizeToTray(menuItem.checked);
          }
        },
        { type: 'separator' },
        {
          label: t('tray.quit'),
          click: () => {
            app.isQuitting = true;
            app.quit();
          }
        }
      ]);

      this.tray.setContextMenu(contextMenu);
      logger.debug('منوی آیکون سینی سیستم به‌روزرسانی شد');
    } catch (error) {
      logger.error('خطا در به‌روزرسانی منوی آیکون سینی سیستم', error);
    }
  }

  /**
   * نمایش/مخفی کردن پنجره اصلی
   */
  private toggleMainWindow(): void {
    if (!this.mainWindow) return;

    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide();
    } else {
      this.showMainWindow();
    }
  }

  /**
   * نمایش پنجره اصلی برنامه
   */
  private showMainWindow(): void {
    if (!this.mainWindow) return;

    // نمایش پنجره و فعال کردن آن
    this.mainWindow.show();
    this.mainWindow.focus();
    
    // اگر پنجره حداقل شده است، آن را به حالت عادی بازگردانیم
    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore();
    }
  }

  /**
   * تنظیم قابلیت کوچک شدن به سینی سیستم
   * @param enabled فعال یا غیرفعال کردن
   */
  public setMinimizeToTray(enabled: boolean): void {
    this.minimizeToTrayEnabled = enabled;
    logger.info(`کوچک شدن به سینی سیستم ${enabled ? 'فعال' : 'غیرفعال'} شد`);
    
    // به‌روزرسانی منو
    this.updateContextMenu();
    
    // ذخیره تنظیمات
    appConfig.setSetting('general.minimizeToTray', enabled);
  }

  /**
   * تنظیم قابلیت کوچک شدن به سینی سیستم (نام جایگزین برای سازگاری)
   * @param enabled فعال یا غیرفعال کردن
   */
  public setMinimizeToTrayEnabled(enabled: boolean): void {
    this.setMinimizeToTray(enabled);
  }

  /**
   * آیا کوچک شدن به سینی سیستم فعال است؟
   */
  public isMinimizeToTrayEnabled(): boolean {
    return this.minimizeToTrayEnabled;
  }

  /**
   * از بین بردن آیکون سینی سیستم
   */
  public destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
      logger.info('آیکون سینی سیستم حذف شد');
    }
  }
}

const trayManager = new TrayManager();
export default trayManager; 
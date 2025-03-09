/**
 * @file main.ts
 * @description فایل اصلی برنامه الکترون
 */

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import Logger, { logger } from './core/logger';
import configManager from './core/config';
import eventManager from './core/events';
import menuManager from './core/menu';
import { initializeServices } from './services';
// وارد کردن سرویس‌ها به صورت مستقیم
import { userService, taskService } from './services';

// ایجاد لاگر برای ماژول اصلی
const mainLogger = new Logger('Main');

// نمونه پنجره اصلی
let mainWindow: BrowserWindow | null = null;

/**
 * ایجاد پنجره اصلی برنامه
 */
async function createWindow(): Promise<void> {
  mainLogger.info('در حال ایجاد پنجره اصلی برنامه...');
  
  // ایجاد پنجره اصلی
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'دستیار هوشمند پیشرفته',
    icon: path.join(__dirname, '../assets/icons/icon.png'),
    webPreferences: {
      nodeIntegration: true, // فعال کردن node integration برای محیط توسعه
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true
    },
    show: false, // پنجره را در ابتدا نمایش نمی‌دهیم تا زمانی که کاملاً بارگذاری شود
    backgroundColor: '#f5f5f5'
  });
  
  // تنظیم پنجره اصلی در مدیریت رویدادها
  eventManager.setMainWindow(mainWindow);
  
  // تنظیم منوی برنامه
  menuManager.createMenu(mainWindow);
  
  // لاگ برای عیب‌یابی
  mainLogger.info('نمایش پنجره اصلی...');
  
  // ابتدا پنجره را نمایش می‌دهیم تا از عدم نمایش آن جلوگیری شود
  mainWindow.show();
  
  // باز کردن DevTools در محیط توسعه
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  // بارگذاری فایل HTML اصلی
  if (process.env.NODE_ENV === 'development') {
    // در محیط توسعه از سرور وب‌پک استفاده می‌کنیم
    try {
      // اضافه کردن تأخیر برای اطمینان از آماده بودن webpack-dev-server
      mainLogger.info('در حال انتظار برای آماده شدن webpack-dev-server...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // کاهش تأخیر به 2 ثانیه
      
      const devServerUrl = 'http://localhost:3123';
      mainLogger.info(`در حال بارگذاری URL: ${devServerUrl}`);
      
      // تنظیم رویدادهای عیب‌یابی
      mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        mainLogger.error(`خطا در بارگذاری URL: ${errorCode} - ${errorDescription}`);
      });
      
      mainWindow.webContents.on('did-finish-load', () => {
        mainLogger.info('بارگذاری URL با موفقیت انجام شد');
      });
      
      mainWindow.webContents.on('did-start-loading', () => {
        mainLogger.info('شروع بارگذاری...');
      });
      
      // بارگذاری URL
      await mainWindow.loadURL(devServerUrl);
      mainLogger.info('لود شدن URL انجام شد');
    } catch (error) {
      mainLogger.error('خطا در بارگذاری URL وب‌پک:', error);
      
      // سعی کنید با فایل محلی بارگذاری کنید
      try {
        const localHtmlPath = path.join(__dirname, 'index.html');
        if (fs.existsSync(localHtmlPath)) {
          mainLogger.info(`در حال تلاش برای بارگذاری فایل محلی: ${localHtmlPath}`);
          await mainWindow.loadFile(localHtmlPath);
        } else {
          mainLogger.error(`فایل HTML محلی یافت نشد: ${localHtmlPath}`);
          // ایجاد یک HTML ساده برای نمایش خطا
          await mainWindow.loadURL(`data:text/html;charset=utf-8,
            <html>
              <head><title>خطا در بارگذاری</title></head>
              <body>
                <h1>خطا در اتصال به سرور توسعه</h1>
                <p>لطفاً مطمئن شوید که webpack-dev-server در حال اجرا است.</p>
                <pre>${error}</pre>
              </body>
            </html>
          `);
        }
      } catch (fallbackError) {
        mainLogger.error('خطا در بارگذاری فایل HTML جایگزین:', fallbackError);
      }
      
      dialog.showErrorBox(
        'خطا در بارگذاری برنامه',
        'خطا در اتصال به سرور توسعه. لطفاً مطمئن شوید که webpack-dev-server در حال اجرا است.'
      );
    }
  } else {
    // در محیط تولید از فایل HTML ساخته شده استفاده می‌کنیم
    try {
      await mainWindow.loadFile(path.join(__dirname, '../index.html'));
    } catch (error) {
      mainLogger.error('خطا در بارگذاری فایل HTML:', error);
      dialog.showErrorBox(
        'خطا در بارگذاری برنامه',
        'خطا در بارگذاری فایل HTML. لطفاً برنامه را مجدداً نصب کنید.'
      );
    }
  }
  
  // مدیریت بستن پنجره
  mainWindow.on('closed', () => {
    mainWindow = null;
    mainLogger.info('پنجره اصلی برنامه بسته شد');
  });
  
  // باز کردن لینک‌های خارجی در مرورگر پیش‌فرض
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

/**
 * راه‌اندازی اولیه برنامه
 */
async function initialize(): Promise<void> {
  try {
    mainLogger.info('در حال راه‌اندازی برنامه...');
    
    // ایجاد پوشه‌های مورد نیاز
    const paths = configManager.getPaths();
    Object.values(paths).forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        mainLogger.info(`پوشه ${dir} ایجاد شد`);
      }
    });
    
    // راه‌اندازی سرویس‌ها
    mainLogger.info('در حال راه‌اندازی سرویس‌ها...');
    await initializeServices();
    mainLogger.info('سرویس‌ها با موفقیت راه‌اندازی شدند');
    
    // انتقال سرویس‌ها به مدیریت‌کننده رویدادها
    eventManager.setServices(userService, taskService);
    mainLogger.info('سرویس‌ها به مدیریت‌کننده رویدادها منتقل شدند');
    
    // ثبت هندلرهای IPC
    eventManager.registerHandlers();
    
    mainLogger.info('راه‌اندازی برنامه با موفقیت انجام شد');
  } catch (error) {
    mainLogger.error('خطا در راه‌اندازی برنامه:', error);
    dialog.showErrorBox(
      'خطا در راه‌اندازی برنامه',
      'متأسفانه خطایی در راه‌اندازی برنامه رخ داده است. لطفاً مجدداً تلاش کنید.'
    );
    app.exit(1);
  }
}

// اجرای برنامه فقط در یک نمونه
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  mainLogger.info('یک نمونه از برنامه در حال اجراست. برنامه بسته می‌شود.');
  app.quit();
} else {
  // مدیریت اجرای نمونه دوم
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
      mainLogger.info('درخواست اجرای نمونه دوم دریافت شد. پنجره اصلی فعال شد.');
    }
  });
  
  // زمانی که الکترون آماده شد
  app.whenReady().then(async () => {
    // راه‌اندازی اولیه
    await initialize();
    
    // ایجاد پنجره اصلی
    await createWindow();
    
    // در macOS، پنجره را دوباره ایجاد می‌کنیم اگر روی آیکون داک کلیک شود
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

// بستن برنامه در همه پلتفرم‌ها به جز macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    mainLogger.info('تمام پنجره‌ها بسته شدند. برنامه خاتمه می‌یابد.');
    app.quit();
  }
});

// مدیریت خروج برنامه
app.on('will-quit', () => {
  mainLogger.info('برنامه در حال خروج است...');
});

// مدیریت خطاهای ناگهانی
process.on('uncaughtException', (error) => {
  mainLogger.critical('خطای مدیریت نشده:', error);
  
  dialog.showErrorBox(
    'خطای غیرمنتظره',
    'متأسفانه خطای غیرمنتظره‌ای رخ داده است. برنامه باید بسته شود.'
  );
  
  app.exit(1);
}); 
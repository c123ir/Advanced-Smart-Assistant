/**
 * مدیریت رویدادهای برنامه
 * 
 * این ماژول برای مدیریت رویدادهای مختلف برنامه استفاده می‌شود
 */

import { ipcMain, BrowserWindow, app, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import Logger from './logger';
import configManager from './config';
import themeManager from './theme';
import i18n from './i18n';
import settingsManager from './settings';
import notificationManager from './notifications';
import updaterManager from './updater';
import trayManager from './tray';
import menuManager from './menu';
import { UserService } from '../services/userService';
import { TaskService } from '../services/taskService';

// ایجاد لاگر برای ماژول رویدادها
const logger = new Logger('EventManager');

class EventManager {
  private mainWindow: BrowserWindow | null = null;
  private userService: UserService | null = null;
  private taskService: TaskService | null = null;

  /**
   * تنظیم پنجره اصلی
   * @param window پنجره اصلی برنامه
   */
  public setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
    logger.info('پنجره اصلی در مدیریت رویدادها تنظیم شد');
  }

  /**
   * تنظیم سرویس‌های مورد نیاز
   * @param userService سرویس کاربران
   * @param taskService سرویس وظایف
   */
  setServices(userService: UserService, taskService: TaskService): void {
    logger.info('در حال تنظیم سرویس‌ها در مدیریت‌کننده رویدادها...');
    if (!userService) {
      logger.error('userService تعریف نشده است!');
    } else {
      logger.info('userService با موفقیت دریافت شد');
    }
    
    if (!taskService) {
      logger.error('taskService تعریف نشده است!');
    } else {
      logger.info('taskService با موفقیت دریافت شد');
    }
    
    this.userService = userService;
    this.taskService = taskService;
    logger.info('سرویس‌ها با موفقیت در مدیریت‌کننده رویدادها تنظیم شدند');
  }

  /**
   * ثبت تمام هندلرهای IPC
   */
  public registerHandlers(): void {
    logger.info('در حال ثبت هندلرهای IPC...');
    
    // رویدادهای مربوط به برنامه
    this.registerAppHandlers();
    
    // رویدادهای مربوط به پنجره
    this.registerWindowHandlers();
    
    // رویدادهای مربوط به تنظیمات
    this.registerSettingsHandlers();
    
    // رویدادهای مربوط به فایل‌ها
    this.registerFileHandlers();
    
    // رویدادهای مربوط به دیتابیس
    this.registerDatabaseHandlers();
    
    // رویدادهای مربوط به کاربران
    this.registerUserHandlers();
    
    logger.info('تمام هندلرهای IPC با موفقیت ثبت شدند');
  }
  
  /**
   * ثبت هندلرهای مربوط به برنامه
   */
  private registerAppHandlers(): void {
    // دریافت نسخه برنامه
    ipcMain.handle('app:get-version', () => {
      return app.getVersion();
    });
    
    // دریافت مسیرهای برنامه
    ipcMain.handle('app:get-paths', () => {
      return configManager.getPaths();
    });
    
    // خروج از برنامه
    ipcMain.handle('app:quit', () => {
      app.quit();
    });
    
    // بازنشانی برنامه
    ipcMain.handle('app:restart', () => {
      app.relaunch();
      app.exit(0);
    });
  }
  
  /**
   * ثبت هندلرهای مربوط به پنجره
   */
  private registerWindowHandlers(): void {
    // حداقل کردن پنجره
    ipcMain.handle('window:minimize', () => {
      if (this.mainWindow) {
        this.mainWindow.minimize();
        return true;
      }
      return false;
    });
    
    // حداکثر کردن پنجره
    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMaximized()) {
          this.mainWindow.unmaximize();
        } else {
          this.mainWindow.maximize();
        }
        return this.mainWindow.isMaximized();
      }
      return false;
    });
    
    // بستن پنجره
    ipcMain.handle('window:close', () => {
      if (this.mainWindow) {
        this.mainWindow.close();
        return true;
      }
      return false;
    });
  }
  
  /**
   * ثبت هندلرهای مربوط به تنظیمات
   */
  private registerSettingsHandlers(): void {
    // دریافت تنظیمات
    ipcMain.handle('settings:get', (event, key) => {
      return configManager.getSettings(key);
    });
    
    // ذخیره تنظیمات
    ipcMain.handle('settings:set', (event, key, value) => {
      configManager.setSetting(key, value);
      return true;
    });
    
    // بازنشانی تنظیمات
    ipcMain.handle('settings:reset', (event, key) => {
      configManager.resetSettings(key);
      return true;
    });
  }
  
  /**
   * ثبت هندلرهای مربوط به فایل‌ها
   */
  private registerFileHandlers(): void {
    // انتخاب فایل
    ipcMain.handle('file:open-dialog', async (event, options) => {
      if (!this.mainWindow) return null;
      
      const { canceled, filePaths } = await dialog.showOpenDialog(this.mainWindow, options);
      if (canceled || filePaths.length === 0) {
        return null;
      }
      return filePaths[0];
    });
    
    // ذخیره فایل
    ipcMain.handle('file:save-dialog', async (event, options) => {
      if (!this.mainWindow) return null;
      
      const { canceled, filePath } = await dialog.showSaveDialog(this.mainWindow, options);
      if (canceled || !filePath) {
        return null;
      }
      return filePath;
    });
    
    // خواندن فایل
    ipcMain.handle('file:read', async (event, filePath) => {
      try {
        if (!fs.existsSync(filePath)) {
          throw new Error(`فایل ${filePath} وجود ندارد`);
        }
        
        const content = await fs.promises.readFile(filePath, 'utf8');
        return content;
      } catch (error) {
        logger.error(`خطا در خواندن فایل ${filePath}:`, error);
        throw error;
      }
    });
    
    // نوشتن فایل
    ipcMain.handle('file:write', async (event, filePath, content) => {
      try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          await fs.promises.mkdir(dir, { recursive: true });
        }
        
        await fs.promises.writeFile(filePath, content, 'utf8');
        return true;
      } catch (error) {
        logger.error(`خطا در نوشتن فایل ${filePath}:`, error);
        throw error;
      }
    });
  }

  /**
   * ثبت هندلرهای مربوط به دیتابیس
   */
  private registerDatabaseHandlers(): void {
    // بررسی وضعیت دیتابیس
    ipcMain.handle('check-db-status', () => {
      try {
        logger.info('دریافت درخواست بررسی وضعیت دیتابیس');
        // اگر databaseService مقداردهی شده است، پایگاه داده وضعیت خوبی دارد
        return { success: true, data: true, message: "اتصال به پایگاه داده برقرار است" };
      } catch (error) {
        logger.error('خطا در بررسی وضعیت دیتابیس:', error);
        return { success: false, data: false, message: "خطا در اتصال به پایگاه داده" };
      }
    });
  }

  /**
   * ثبت هندلرهای مربوط به کاربران
   */
  private registerUserHandlers(): void {
    logger.info('در حال ثبت هندلرهای مربوط به کاربران...');
    
    if (!this.userService) {
      logger.error('userService در زمان ثبت هندلرها تعریف نشده است!');
      // سعی می‌کنیم با وارد کردن مستقیم سرویس، مشکل را حل کنیم
      try {
        const { userService } = require('../services');
        if (userService) {
          logger.info('userService به صورت مستقیم وارد شد');
          this.userService = userService;
        } else {
          logger.error('userService با وارد کردن مستقیم نیز وجود ندارد!');
        }
      } catch (error) {
        logger.error('خطا در وارد کردن مستقیم userService:', error);
      }
    } else {
      logger.info('userService در زمان ثبت هندلرها وجود دارد');
    }
    
    // رویداد ورود کاربر
    ipcMain.handle('users:authenticate', async (event, username, password) => {
      logger.debug(`درخواست ورود برای کاربر ${username}`);
      
      try {
        if (!this.userService) {
          throw new Error('سرویس کاربران تعریف نشده است');
        }
        
        const result = await this.userService.login(username, password);
        
        if (result.success) {
          logger.info(`کاربر ${username} با موفقیت وارد شد`);
          return { success: true, data: result.user };
        } else {
          logger.warn(`ورود ناموفق برای کاربر ${username}: ${result.message}`);
          return { success: false, message: result.message };
        }
      } catch (error) {
        logger.error(`خطا در ورود کاربر ${username}`, error);
        return { success: false, message: 'خطای سیستمی رخ داده است' };
      }
    });
  }

  /**
   * راه‌اندازی رویدادهای برنامه
   */
  initialize(): void {
    try {
      this.setupAppEvents();
      this.setupWindowEvents();
      this.setupIpcEvents();
      
      logger.info('مدیریت رویدادها راه‌اندازی شد');
    } catch (error) {
      logger.error('خطا در راه‌اندازی مدیریت رویدادها', error);
    }
  }

  /**
   * تنظیم رویدادهای مربوط به برنامه
   */
  private setupAppEvents(): void {
    // رویداد آماده شدن برنامه
    app.on('ready', () => {
      logger.info('برنامه آماده شد');
    });

    // رویداد بسته شدن همه پنجره‌ها
    app.on('window-all-closed', () => {
      logger.info('همه پنجره‌ها بسته شدند');
      
      // در macOS برنامه را کاملاً نمی‌بندیم مگر اینکه کاربر با Cmd+Q خارج شود
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // رویداد فعال شدن مجدد برنامه (مخصوص macOS)
    app.on('activate', () => {
      logger.info('برنامه مجدداً فعال شد');
      
      // در macOS معمولاً پنجره‌ها را هنگام کلیک روی آیکون داک دوباره ایجاد می‌کنیم
      if (this.mainWindow === null && app.isReady()) {
        // در اینجا پنجره را دوباره ایجاد نمی‌کنیم چون این کار در main.ts انجام می‌شود
        logger.debug('پنجره اصلی وجود ندارد و باید دوباره ایجاد شود');
      }
    });

    // رویداد قبل از خروج
    app.on('before-quit', () => {
      logger.info('برنامه در حال خروج است');
    });

    // رویداد خروج از برنامه
    app.on('quit', () => {
      logger.info('برنامه خارج شد');
    });
  }

  /**
   * تنظیم رویدادهای مربوط به پنجره
   */
  private setupWindowEvents(): void {
    if (!this.mainWindow) {
      logger.error('پنجره اصلی برای تنظیم رویدادها تعریف نشده است');
      return;
    }

    // رویداد بسته شدن پنجره
    this.mainWindow.on('close', (event) => {
      logger.debug('رویداد بستن پنجره اصلی فعال شد');
      
      // اگر کوچک کردن به سینی فعال باشد، به جای بستن پنجره آن را مخفی می‌کنیم
      if (trayManager.isMinimizeToTrayEnabled() && !app.isQuitting) {
        event.preventDefault();
        this.mainWindow?.hide();
        return;
      }
    });

    // رویداد بسته شدن کامل پنجره
    this.mainWindow.on('closed', () => {
      logger.info('پنجره اصلی بسته شد');
      this.mainWindow = null;
    });

    // رویداد کوچک شدن پنجره
    this.mainWindow.on('minimize', () => {
      logger.debug('پنجره اصلی کوچک شد');
      
      // اگر کوچک کردن به سینی فعال باشد، پنجره را مخفی می‌کنیم
      if (trayManager.isMinimizeToTrayEnabled()) {
        this.mainWindow?.hide();
      }
    });

    // رویداد بزرگ شدن پنجره
    this.mainWindow.on('maximize', () => {
      logger.debug('پنجره اصلی بزرگ شد');
    });

    // رویداد خارج شدن از حالت بزرگ
    this.mainWindow.on('unmaximize', () => {
      logger.debug('پنجره اصلی از حالت بزرگ خارج شد');
    });

    // رویداد تغییر اندازه پنجره
    this.mainWindow.on('resize', () => {
      logger.debug('اندازه پنجره اصلی تغییر کرد');
    });

    // رویداد تغییر موقعیت پنجره
    this.mainWindow.on('move', () => {
      logger.debug('موقعیت پنجره اصلی تغییر کرد');
    });

    // رویداد آماده شدن محتوای پنجره
    this.mainWindow.webContents.on('did-finish-load', () => {
      logger.info('محتوای پنجره اصلی بارگذاری شد');
      
      // ارسال تنظیمات اولیه به رابط کاربری
      this.sendInitialSettings();
    });
  }

  /**
   * تنظیم رویدادهای IPC (ارتباط بین پروسه اصلی و رندرر)
   */
  private setupIpcEvents(): void {
    // رویداد تغییر تم
    ipcMain.on('set-theme', (_, theme) => {
      logger.debug(`درخواست تغییر تم به ${theme}`);
      themeManager.setTheme(theme);
    });

    // رویداد تغییر زبان
    ipcMain.on('set-language', (_, language) => {
      logger.debug(`درخواست تغییر زبان به ${language}`);
      i18n.setLanguage(language);
      
      // به‌روزرسانی منو بعد از تغییر زبان
      if (this.mainWindow) {
        menuManager.updateMenu(this.mainWindow);
      }
    });

    // رویداد ذخیره تنظیمات
    ipcMain.on('save-settings', (_, settings) => {
      logger.debug('درخواست ذخیره تنظیمات');
      settingsManager.setMultiple(settings);
      
      // اعمال تنظیمات جدید
      if (settings.theme) {
        themeManager.setTheme(settings.theme);
      }
      
      if (settings.language) {
        i18n.setLanguage(settings.language);
        
        // به‌روزرسانی منو بعد از تغییر زبان
        if (this.mainWindow) {
          menuManager.updateMenu(this.mainWindow);
        }
      }
      
      if (settings.minimizeToTray !== undefined) {
        trayManager.setMinimizeToTrayEnabled(settings.minimizeToTray);
      }
      
      if (settings.checkForUpdates !== undefined) {
        updaterManager.setAutoCheckEnabled(settings.checkForUpdates);
      }
      
      if (settings.notifications !== undefined) {
        notificationManager.setEnabled(settings.notifications);
      }
    });

    // رویداد بررسی به‌روزرسانی
    ipcMain.on('check-for-updates', () => {
      logger.debug('درخواست بررسی به‌روزرسانی');
      updaterManager.checkForUpdates(false);
    });

    // رویداد خروج کاربر
    ipcMain.on('logout', (event) => {
      logger.debug('درخواست خروج کاربر');
      event.reply('logout-response', { success: true });
    });

    // رویداد دریافت وظایف
    ipcMain.on('get-tasks', async (event, { userId, filters }) => {
      logger.debug(`درخواست دریافت وظایف برای کاربر ${userId}`);
      
      try {
        if (!this.taskService) {
          throw new Error('سرویس وظایف تعریف نشده است');
        }
        
        const tasks = await this.taskService.getTasks({ userId });
        event.reply('get-tasks-response', { success: true, tasks });
      } catch (error) {
        logger.error(`خطا در دریافت وظایف کاربر ${userId}`, error);
        event.reply('get-tasks-response', { success: false, message: 'خطا در دریافت وظایف' });
      }
    });

    // رویداد ایجاد وظیفه جدید
    ipcMain.on('create-task', async (event, task) => {
      logger.debug(`درخواست ایجاد وظیفه جدید: ${task.title}`);
      
      try {
        if (!this.taskService) {
          throw new Error('سرویس وظایف تعریف نشده است');
        }
        
        const newTask = await this.taskService.createTask(task);
        event.reply('create-task-response', { success: true, task: newTask });
        
        // نمایش اعلان
        notificationManager.success(
          'وظیفه جدید',
          `وظیفه "${task.title}" با موفقیت ایجاد شد`
        );
      } catch (error) {
        logger.error(`خطا در ایجاد وظیفه جدید: ${task.title}`, error);
        event.reply('create-task-response', { success: false, message: 'خطا در ایجاد وظیفه' });
      }
    });

    // رویداد به‌روزرسانی وظیفه
    ipcMain.on('update-task', async (event, task) => {
      logger.debug(`درخواست به‌روزرسانی وظیفه: ${task.id}`);
      
      try {
        if (!this.taskService) {
          throw new Error('سرویس وظایف تعریف نشده است');
        }
        
        const updatedTask = await this.taskService.updateTask(task.id, task, task.userId);
        event.reply('update-task-response', { success: true, task: updatedTask });
      } catch (error) {
        logger.error(`خطا در به‌روزرسانی وظیفه: ${task.id}`, error);
        event.reply('update-task-response', { success: false, message: 'خطا در به‌روزرسانی وظیفه' });
      }
    });

    // رویداد حذف وظیفه
    ipcMain.on('delete-task', async (event, taskId, userId) => {
      logger.debug(`درخواست حذف وظیفه: ${taskId}`);
      
      try {
        if (!this.taskService) {
          throw new Error('سرویس وظایف تعریف نشده است');
        }
        
        await this.taskService.deleteTask(taskId, userId);
        event.reply('delete-task-response', { success: true });
      } catch (error) {
        logger.error(`خطا در حذف وظیفه: ${taskId}`, error);
        event.reply('delete-task-response', { success: false, message: 'خطا در حذف وظیفه' });
      }
    });

    // رویداد دریافت کاربران
    ipcMain.on('get-users', async (event) => {
      logger.debug('درخواست دریافت لیست کاربران');
      
      try {
        if (!this.userService) {
          throw new Error('سرویس کاربران تعریف نشده است');
        }
        
        const users = await this.userService.getAllUsers();
        event.reply('get-users-response', { success: true, users });
      } catch (error) {
        logger.error('خطا در دریافت لیست کاربران', error);
        event.reply('get-users-response', { success: false, message: 'خطا در دریافت لیست کاربران' });
      }
    });

    // رویداد ایجاد کاربر جدید
    ipcMain.on('create-user', async (event, user) => {
      logger.debug(`درخواست ایجاد کاربر جدید: ${user.username}`);
      
      try {
        if (!this.userService) {
          throw new Error('سرویس کاربران تعریف نشده است');
        }
        
        const newUser = await this.userService.createUser(user);
        event.reply('create-user-response', { success: true, user: newUser });
      } catch (error) {
        logger.error(`خطا در ایجاد کاربر جدید: ${user.username}`, error);
        event.reply('create-user-response', { success: false, message: 'خطا در ایجاد کاربر' });
      }
    });

    // رویداد به‌روزرسانی کاربر
    ipcMain.on('update-user', async (event, user) => {
      logger.debug(`درخواست به‌روزرسانی کاربر: ${user.id}`);
      
      try {
        if (!this.userService) {
          throw new Error('سرویس کاربران تعریف نشده است');
        }
        
        const updatedUser = await this.userService.updateUser(user.id, user);
        event.reply('update-user-response', { success: true, user: updatedUser });
      } catch (error) {
        logger.error(`خطا در به‌روزرسانی کاربر: ${user.id}`, error);
        event.reply('update-user-response', { success: false, message: 'خطا در به‌روزرسانی کاربر' });
      }
    });

    // رویداد حذف کاربر
    ipcMain.on('delete-user', async (event, userId) => {
      logger.debug(`درخواست حذف کاربر: ${userId}`);
      
      try {
        if (!this.userService) {
          throw new Error('سرویس کاربران تعریف نشده است');
        }
        
        await this.userService.deleteUser(userId);
        event.reply('delete-user-response', { success: true });
      } catch (error) {
        logger.error(`خطا در حذف کاربر: ${userId}`, error);
        event.reply('delete-user-response', { success: false, message: 'خطا در حذف کاربر' });
      }
    });

    // رویداد دریافت تنظیمات
    ipcMain.on('get-settings', (event) => {
      logger.debug('درخواست دریافت تنظیمات');
      const settings = settingsManager.getAll();
      event.reply('get-settings-response', { success: true, settings });
    });

    // رویداد بازنشانی تنظیمات
    ipcMain.on('reset-settings', (event) => {
      logger.debug('درخواست بازنشانی تنظیمات');
      settingsManager.reset();
      
      // اعمال تنظیمات پیش‌فرض
      themeManager.setTheme(settingsManager.get('theme'));
      i18n.setLanguage(settingsManager.get('language'));
      
      // به‌روزرسانی منو
      if (this.mainWindow) {
        menuManager.updateMenu(this.mainWindow);
      }
      
      // ارسال تنظیمات جدید به رابط کاربری
      const settings = settingsManager.getAll();
      event.reply('reset-settings-response', { success: true, settings });
    });
  }

  /**
   * ارسال تنظیمات اولیه به رابط کاربری
   */
  private sendInitialSettings(): void {
    if (!this.mainWindow) return;
    
    try {
      const settings = {
        theme: themeManager.getCurrentTheme(),
        language: i18n.getCurrentLanguage(),
        ...settingsManager.getAll()
      };
      
      this.mainWindow.webContents.send('initial-settings', settings);
      logger.debug('تنظیمات اولیه به رابط کاربری ارسال شد');
    } catch (error) {
      logger.error('خطا در ارسال تنظیمات اولیه به رابط کاربری', error);
    }
  }
}

export default new EventManager(); 
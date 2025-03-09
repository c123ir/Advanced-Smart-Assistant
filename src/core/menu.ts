/**
 * ماژول مدیریت منوی برنامه
 * 
 * این ماژول برای ایجاد و مدیریت منوی برنامه استفاده می‌شود
 */

import { app, Menu, BrowserWindow, shell, dialog, MenuItem, clipboard } from 'electron';
import Logger from '../core/logger';
import i18n, { t } from './i18n';
import appConfig from './config';

const logger = new Logger('MenuManager');

class MenuManager {
  private mainWindow: BrowserWindow | null = null;

  /**
   * ایجاد منوی برنامه
   * @param mainWindow پنجره اصلی برنامه
   */
  public createMenu(mainWindow: BrowserWindow): Menu {
    try {
      this.mainWindow = mainWindow;
      const menu = Menu.buildFromTemplate(this.getMenuTemplate());
      Menu.setApplicationMenu(menu);
      logger.info('منوی برنامه ایجاد شد');
      return menu;
    } catch (error) {
      logger.error('خطا در ایجاد منوی برنامه', error);
      throw error;
    }
  }

  /**
   * به‌روزرسانی منوی برنامه (مثلاً بعد از تغییر زبان)
   * @param mainWindow اختیاری: پنجره اصلی برنامه - اگر ارسال نشود از پنجره داخلی استفاده می‌شود
   */
  public updateMenu(mainWindow?: BrowserWindow): void {
    try {
      // اگر پنجره اصلی ارسال شده باشد، آن را ذخیره می‌کنیم
      if (mainWindow) {
        this.mainWindow = mainWindow;
      }
      
      const menu = Menu.buildFromTemplate(this.getMenuTemplate());
      Menu.setApplicationMenu(menu);
      logger.debug('منوی برنامه به‌روزرسانی شد');
    } catch (error) {
      logger.error('خطا در به‌روزرسانی منوی برنامه', error);
    }
  }

  /**
   * دریافت الگوی منوی برنامه
   * @returns آرایه‌ای از آیتم‌های منو
   */
  private getMenuTemplate(): Electron.MenuItemConstructorOptions[] {
    const isMac = process.platform === 'darwin';
    
    // منوی فایل
    const fileMenu: Electron.MenuItemConstructorOptions = {
      label: t('menu.file'),
      submenu: [
        {
          label: t('menu.file.new_task'),
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            this.mainWindow?.webContents.send('menu:new-task');
          }
        },
        { type: 'separator' },
        {
          label: t('menu.file.settings'),
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            this.mainWindow?.webContents.send('menu:settings');
          }
        },
        { type: 'separator' },
        {
          label: isMac ? t('menu.file.close') : t('menu.file.quit'),
          click: () => {
            if (isMac) {
              this.mainWindow?.close();
            } else {
              app.quit();
            }
          }
        }
      ]
    };
    
    // منوی ویرایش
    const editMenu: Electron.MenuItemConstructorOptions = {
      label: t('menu.edit'),
      submenu: [
        {
          label: t('menu.edit.undo'),
          accelerator: 'CmdOrCtrl+Z',
          click: () => {
            this.mainWindow?.webContents.undo();
          }
        },
        {
          label: t('menu.edit.redo'),
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => {
            this.mainWindow?.webContents.redo();
          }
        },
        { type: 'separator' },
        {
          label: t('menu.edit.cut'),
          accelerator: 'CmdOrCtrl+X',
          click: () => {
            this.mainWindow?.webContents.cut();
          }
        },
        {
          label: t('menu.edit.copy'),
          accelerator: 'CmdOrCtrl+C',
          click: () => {
            this.mainWindow?.webContents.copy();
          }
        },
        {
          label: t('menu.edit.paste'),
          accelerator: 'CmdOrCtrl+V',
          click: () => {
            this.mainWindow?.webContents.paste();
          }
        },
        {
          label: t('menu.edit.delete'),
          click: () => {
            this.mainWindow?.webContents.delete();
          }
        },
        { type: 'separator' },
        {
          label: t('menu.edit.select_all'),
          accelerator: 'CmdOrCtrl+A',
          click: () => {
            this.mainWindow?.webContents.selectAll();
          }
        }
      ]
    };
    
    // منوی نما
    const viewMenu: Electron.MenuItemConstructorOptions = {
      label: t('menu.view'),
      submenu: [
        {
          label: t('menu.view.reload'),
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            this.mainWindow?.webContents.reload();
          }
        },
        {
          label: t('menu.view.force_reload'),
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            this.mainWindow?.webContents.reloadIgnoringCache();
          }
        },
        {
          label: t('menu.view.dev_tools'),
          accelerator: 'F12',
          click: () => {
            this.mainWindow?.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: t('menu.view.zoom_in'),
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            if (this.mainWindow) {
              const zoomFactor = this.mainWindow.webContents.getZoomFactor();
              this.mainWindow.webContents.setZoomFactor(zoomFactor + 0.1);
            }
          }
        },
        {
          label: t('menu.view.zoom_out'),
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (this.mainWindow) {
              const zoomFactor = this.mainWindow.webContents.getZoomFactor();
              this.mainWindow.webContents.setZoomFactor(Math.max(0.1, zoomFactor - 0.1));
            }
          }
        },
        {
          label: t('menu.view.reset_zoom'),
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            this.mainWindow?.webContents.setZoomFactor(1.0);
          }
        },
        { type: 'separator' },
        {
          label: t('menu.view.toggle_fullscreen'),
          accelerator: 'F11',
          click: () => {
            if (this.mainWindow) {
              this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
            }
          }
        }
      ]
    };
    
    // منوی زبان
    const languageMenu: Electron.MenuItemConstructorOptions = {
      label: t('menu.language'),
      submenu: [
        {
          label: 'فارسی',
          type: 'radio',
          checked: i18n.getCurrentLanguage() === 'fa',
          click: () => {
            i18n.setLanguage('fa');
            this.updateMenu();
          }
        },
        {
          label: 'English',
          type: 'radio',
          checked: i18n.getCurrentLanguage() === 'en',
          click: () => {
            i18n.setLanguage('en');
            this.updateMenu();
          }
        }
      ]
    };
    
    // منوی راهنما
    const helpMenu: Electron.MenuItemConstructorOptions = {
      label: t('menu.help'),
      submenu: [
        {
          label: t('menu.help.documentation'),
          click: async () => {
            this.mainWindow?.webContents.send('menu:documentation');
          }
        },
        {
          label: t('menu.help.about'),
          click: () => {
            this.showAboutDialog();
          }
        }
      ]
    };
    
    // ترکیب منوها
    const template: Electron.MenuItemConstructorOptions[] = [
      fileMenu,
      editMenu,
      viewMenu,
      languageMenu,
      helpMenu
    ];
    
    // در مک، منوی اپل اضافه می‌شود
    if (isMac) {
      template.unshift({
        label: app.name,
        submenu: [
          {
            label: t('menu.app.about'),
            click: () => {
              this.showAboutDialog();
            }
          },
          { type: 'separator' },
          {
            label: t('menu.app.services'),
            click: () => {}
          },
          { type: 'separator' },
          {
            label: t('menu.app.hide'),
            accelerator: 'Command+H',
            click: () => {
              app.hide();
            }
          },
          {
            label: t('menu.app.hide_others'),
            accelerator: 'Command+Alt+H',
            click: () => {
              Menu.sendActionToFirstResponder('hideOtherApplications:');
            }
          },
          {
            label: t('menu.app.show_all'),
            click: () => {
              Menu.sendActionToFirstResponder('unhideAllApplications:');
            }
          },
          { type: 'separator' },
          {
            label: t('menu.app.quit'),
            accelerator: 'Command+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      });
    }
    
    return template;
  }
  
  /**
   * نمایش دیالوگ درباره برنامه
   */
  private showAboutDialog(): void {
    if (!this.mainWindow) return;
    
    dialog.showMessageBox(this.mainWindow, {
      title: t('about.title'),
      message: `${app.name} ${app.getVersion()}`,
      detail: t('about.description'),
      buttons: [t('about.close')],
      icon: process.platform === 'win32' ? undefined : '/path/to/app/icon.png'
    });
  }
}

// ایجاد و صدور نمونه از مدیریت منو
const menuManager = new MenuManager();
export default menuManager; 
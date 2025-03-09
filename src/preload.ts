/**
 * @file preload.ts
 * @description فایل پیش‌بارگذاری الکترون برای ارتباط بین فرآیند اصلی و رندرر
 */

import { contextBridge, ipcRenderer } from 'electron';

// پلی‌فیل برای متغیرهای محیط Node.js در محیط renderer
// نکته: نمی‌توان اشیاء کامل Node.js را منتقل کرد، فقط می‌توان داده‌های ساده را منتقل کرد
contextBridge.exposeInMainWorld('global', {});
contextBridge.exposeInMainWorld('process', {
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
});

// نسخه ساده‌شده‌ای از require که فقط برخی ماژول‌های مجاز را برمی‌گرداند
contextBridge.exposeInMainWorld('nodeRequire', (moduleName: string) => {
  // محدود کردن دسترسی به ماژول‌های مجاز برای امنیت
  const allowedModules: Record<string, any> = {
    path: require('path'),
    fs: {
      // فقط توابع امن را ارائه می‌دهیم
      readFileSync: require('fs').readFileSync,
      existsSync: require('fs').existsSync
    },
    os: {
      platform: require('os').platform
    }
  };
  
  return allowedModules[moduleName] || null;
});

/**
 * تایپ‌های مورد نیاز برای API ها
 */
interface UserData {
  username: string;
  full_name: string;
  email: string;
  password?: string;
  avatar_url?: string;
  role?: string;
}

interface TaskData {
  title: string;
  description?: string;
  due_date?: string;
  priority?: number;
  status?: string;
  assigned_to?: string;
}

/**
 * API دسترسی به سرویس کاربران
 */
const userAPI = {
  getAll: async () => {
    return await ipcRenderer.invoke('get-users');
  },
  get: async (id: string) => {
    return await ipcRenderer.invoke('get-user', id);
  },
  create: async (userData: UserData) => {
    return await ipcRenderer.invoke('create-user', userData);
  },
  update: async (id: string, userData: Partial<UserData>) => {
    return await ipcRenderer.invoke('update-user', id, userData);
  },
  delete: async (id: string) => {
    return await ipcRenderer.invoke('delete-user', id);
  },
  uploadAvatar: async (id: string, filePath: string) => {
    return await ipcRenderer.invoke('upload-user-avatar', id, filePath);
  },
  search: async (query: string) => {
    return await ipcRenderer.invoke('search-users', query);
  },
  authenticate: async (username: string, password: string) => {
    return await ipcRenderer.invoke('users:authenticate', username, password);
  }
};

/**
 * API دسترسی به سرویس تسک‌ها
 */
const taskAPI = {
  getAll: async () => {
    return await ipcRenderer.invoke('get-tasks');
  },
  get: async (id: string) => {
    return await ipcRenderer.invoke('get-task', id);
  },
  create: async (taskData: TaskData) => {
    return await ipcRenderer.invoke('create-task', taskData);
  },
  update: async (id: string, taskData: Partial<TaskData>) => {
    return await ipcRenderer.invoke('update-task', id, taskData);
  },
  delete: async (id: string) => {
    return await ipcRenderer.invoke('delete-task', id);
  },
  getByUser: async (userId: string) => {
    return await ipcRenderer.invoke('get-tasks-by-user', userId);
  },
  searchByStatus: async (status: string) => {
    return await ipcRenderer.invoke('search-tasks-by-status', status);
  }
};

/**
 * API برای بررسی وضعیت سیستم
 */
const systemAPI = {
  checkDbStatus: async () => {
    return await ipcRenderer.invoke('check-db-status');
  },
  getAppVersion: () => {
    return process.env.APP_VERSION || '1.0.0';
  }
};

/**
 * تعریف API‌ها برای دسترسی از رندرر
 */
contextBridge.exposeInMainWorld('electron', {
  users: userAPI,
  tasks: taskAPI,
  system: systemAPI
});

/**
 * تعریف تایپ‌های API‌ها برای استفاده در رندرر
 */
declare global {
  interface Window {
    electron: {
      users: typeof userAPI;
      tasks: typeof taskAPI;
      system: typeof systemAPI;
    };
  }
}

// تعریف APIهای قابل دسترس در فرآیند رندرر
contextBridge.exposeInMainWorld('electronAPI', {
  // APIهای مربوط به برنامه
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    getPaths: () => ipcRenderer.invoke('app:get-paths'),
    quit: () => ipcRenderer.invoke('app:quit'),
    restart: () => ipcRenderer.invoke('app:restart')
  },
  
  // APIهای مربوط به پنجره
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close')
  },
  
  // APIهای مربوط به تنظیمات
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
    reset: (key?: string) => ipcRenderer.invoke('settings:reset', key)
  },
  
  // APIهای مربوط به فایل‌ها
  file: {
    openDialog: (options: any) => ipcRenderer.invoke('file:open-dialog', options),
    saveDialog: (options: any) => ipcRenderer.invoke('file:save-dialog', options),
    read: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
    write: (filePath: string, content: string) => ipcRenderer.invoke('file:write', filePath, content)
  },
  
  // APIهای مربوط به کاربران
  user: {
    login: (username: string, password: string) => ipcRenderer.invoke('user:login', username, password),
    logout: () => ipcRenderer.invoke('user:logout'),
    getCurrentUser: () => ipcRenderer.invoke('user:get-current'),
    getAll: () => ipcRenderer.invoke('user:get-all'),
    getById: (id: string) => ipcRenderer.invoke('user:get-by-id', id),
    create: (userData: any) => ipcRenderer.invoke('user:create', userData),
    update: (id: string, userData: any) => ipcRenderer.invoke('user:update', id, userData),
    delete: (id: string) => ipcRenderer.invoke('user:delete', id),
    changePassword: (id: string, oldPassword: string, newPassword: string) => 
      ipcRenderer.invoke('user:change-password', id, oldPassword, newPassword)
  },
  
  // APIهای مربوط به تسک‌ها
  task: {
    getAll: () => ipcRenderer.invoke('task:get-all'),
    getById: (id: string) => ipcRenderer.invoke('task:get-by-id', id),
    getByUser: (userId: string) => ipcRenderer.invoke('task:get-by-user', userId),
    create: (taskData: any) => ipcRenderer.invoke('task:create', taskData),
    update: (id: string, taskData: any) => ipcRenderer.invoke('task:update', id, taskData),
    delete: (id: string) => ipcRenderer.invoke('task:delete', id),
    changeStatus: (id: string, status: string) => ipcRenderer.invoke('task:change-status', id, status),
    assignToUser: (id: string, userId: string) => ipcRenderer.invoke('task:assign', id, userId)
  },
  
  // APIهای مربوط به تگ‌ها
  tag: {
    getAll: () => ipcRenderer.invoke('tag:get-all'),
    getById: (id: string) => ipcRenderer.invoke('tag:get-by-id', id),
    create: (tagData: any) => ipcRenderer.invoke('tag:create', tagData),
    update: (id: string, tagData: any) => ipcRenderer.invoke('tag:update', id, tagData),
    delete: (id: string) => ipcRenderer.invoke('tag:delete', id)
  }
});

// اطلاعات نسخه برنامه
contextBridge.exposeInMainWorld('appInfo', {
  platform: process.platform,
  version: process.versions.electron
}); 
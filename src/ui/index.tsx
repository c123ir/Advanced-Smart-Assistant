/**
 * @file index.tsx
 * @description نقطه ورود اصلی برنامه React
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// وارد کردن استایل‌های اصلی
import './styles/main.scss';

// ایجاد ریشه React
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('المان ریشه (root) در HTML یافت نشد');
}

// فقط در محیط توسعه لاگ می‌کنیم
if (process.env.NODE_ENV === 'development') {
  console.log('Starting application in development mode');
  // اطلاعات محیط را لاگ می‌کنیم
  console.log('Environment:', process.env.NODE_ENV);
  console.log('App Info:', (window as any).appInfo);
  console.log('Electron API available:', Boolean((window as any).electron));
}

const root = createRoot(rootElement);

// رندر کردن برنامه اصلی
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
); 
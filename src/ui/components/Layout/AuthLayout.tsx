/**
 * @file AuthLayout.tsx
 * @description لایوت صفحات احراز هویت
 */

import React from 'react';

/**
 * تایپ‌های لایوت احراز هویت
 */
interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * کامپوننت لایوت احراز هویت
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-logo">
          <h1 className="app-title">دستیار هوشمند پیشرفته</h1>
          <p className="app-subtitle">سیستم مدیریت کارها و وظایف</p>
        </div>
        <div className="auth-content">
          {children}
        </div>
        <div className="auth-footer">
          <p>© {new Date().getFullYear()} - تمامی حقوق محفوظ است</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 
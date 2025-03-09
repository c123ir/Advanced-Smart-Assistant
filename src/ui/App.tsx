/**
 * @file App.tsx
 * @description کامپوننت اصلی برنامه
 */

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// کامپوننت‌های لایوت
import MainLayout from './components/Layout/MainLayout';
import AuthLayout from './components/Layout/AuthLayout';

// صفحات
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// کامپوننت‌های کمکی
import LoadingScreen from './components/LoadingScreen';
import { ApiResponse, User } from '../types/models';

/**
 * کامپوننت اصلی برنامه
 */
const App: React.FC = () => {
  // استیت‌ها
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dbStatus, setDbStatus] = useState<boolean>(false);

  // بررسی اولیه وضعیت برنامه
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        // بررسی وضعیت دیتابیس
        const dbCheckResult = await window.electron.system.checkDbStatus();
        console.log('نتیجه بررسی وضعیت دیتابیس:', dbCheckResult);
        
        // پشتیبانی از هر دو فرمت پاسخ (قدیمی و جدید)
        setDbStatus(
          (dbCheckResult.success && dbCheckResult.data === true) || 
          (dbCheckResult.status === "success" && dbCheckResult.connected === true)
        );

        // در اینجا می‌توان کد بررسی وضعیت احراز هویت را اضافه کرد
        // برای مثال، بررسی وجود توکن در localStorage یا چیزی مشابه
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser) as User;
            setCurrentUser(parsedUser);
            setIsAuthenticated(true);
          } catch (e) {
            console.error('خطا در پارس اطلاعات کاربر ذخیره شده:', e);
            localStorage.removeItem('currentUser');
          }
        }
      } catch (error) {
        console.error('خطا در بررسی وضعیت اولیه برنامه:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialStatus();
  }, []);

  // تابع ورود به سیستم
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  // تابع خروج از سیستم
  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  // نمایش صفحه بارگذاری
  if (isLoading) {
    return <LoadingScreen />;
  }

  // بررسی وضعیت دیتابیس
  if (!dbStatus) {
    return (
      <div className="db-error">
        <h1>خطا در اتصال به پایگاه داده</h1>
        <p>لطفاً برنامه را مجدداً راه‌اندازی کنید یا با پشتیبانی تماس بگیرید.</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* مسیرهای عمومی (دسترسی بدون احراز هویت) */}
      <Route path="/login" element={
        isAuthenticated 
          ? <Navigate to="/dashboard" replace /> 
          : <AuthLayout><LoginPage onLogin={handleLogin} /></AuthLayout>
      } />

      {/* مسیرهای محافظت شده (نیاز به احراز هویت) */}
      <Route path="/" element={
        isAuthenticated 
          ? <MainLayout user={currentUser} onLogout={handleLogout} /> 
          : <Navigate to="/login" replace />
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage user={currentUser} />} />
      </Route>

      {/* مسیر 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App; 
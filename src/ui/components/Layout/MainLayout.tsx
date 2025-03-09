/**
 * @file MainLayout.tsx
 * @description لایوت اصلی برنامه که شامل هدر، سایدبار و محتوای اصلی است
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { User } from '../../../types/models';
import Header from './Header';
import Sidebar from './Sidebar';

// آیکون‌ها
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

const TasksIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C16.19 13.89 17 15.02 17 16.5V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);

// تایپ‌های لایوت
interface MainLayoutProps {
  user: User | null;
  onLogout: () => void;
}

/**
 * لایوت اصلی برنامه
 */
const MainLayout: React.FC<MainLayoutProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  // تغییر وضعیت سایدبار
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // تغییر وضعیت تم
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // ذخیره وضعیت تم در localStorage
    localStorage.setItem('darkMode', (!isDarkMode).toString());
    // اعمال کلاس تم به body
    document.body.classList.toggle('dark-theme', !isDarkMode);
  };

  // بررسی وضعیت تم ذخیره شده در localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    document.body.classList.toggle('dark-theme', savedDarkMode);
  }, []);

  // بررسی اندازه صفحه برای رسپانسیو بودن
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // اجرای اولیه
    handleResize();

    // اضافه کردن event listener
    window.addEventListener('resize', handleResize);

    // پاکسازی event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // استخراج عنوان صفحه فعلی
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.startsWith('/dashboard')) return 'داشبورد';
    if (path.startsWith('/tasks')) return 'مدیریت تسک‌ها';
    if (path.startsWith('/users')) return 'مدیریت کاربران';
    if (path.startsWith('/settings')) return 'تنظیمات';
    if (path.startsWith('/profile')) return 'پروفایل کاربری';
    if (path.startsWith('/reports')) return 'گزارش‌ها';
    if (path.startsWith('/calendar')) return 'تقویم';
    
    return 'صفحه';
  };

  return (
    <div className={`main-layout ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* هدر */}
      <Header 
        user={user} 
        toggleSidebar={toggleSidebar} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
      />

      <div className="app-container">
        {/* سایدبار */}
        <Sidebar isOpen={sidebarOpen} onLogout={onLogout} />

        {/* محتوای اصلی */}
        <main className={`app-content ${!sidebarOpen ? 'expanded' : ''}`}>
          <div className="content-header">
            <h2 className="page-title">{getPageTitle()}</h2>
            <div className="page-actions">
              {/* اینجا می‌توانید دکمه‌های اکشن مخصوص هر صفحه را قرار دهید */}
            </div>
          </div>
          <div className="content-body">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 
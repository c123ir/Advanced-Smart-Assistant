/**
 * @file Header.tsx
 * @description کامپوننت هدر اصلی برنامه با امکانات پیشرفته
 */

import React, { useState } from 'react';
import { User } from '../../../types/models';

// آیکون‌های هدر
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);

const NotificationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
  </svg>
);

interface HeaderProps {
  user: User | null;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * کامپوننت هدر اصلی برنامه
 */
const Header: React.FC<HeaderProps> = ({ user, toggleSidebar, isDarkMode, toggleDarkMode }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  
  // نمونه اعلان‌ها
  const notifications = [
    { id: 1, text: 'تسک جدید به شما اختصاص داده شد', time: '10 دقیقه پیش', read: false },
    { id: 2, text: 'جلسه هفتگی ساعت 14:00', time: '1 ساعت پیش', read: false },
    { id: 3, text: 'گزارش ماهانه آماده بررسی است', time: '3 ساعت پیش', read: true },
  ];

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleSearch = () => {
    setSearchActive(!searchActive);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-start">
          <button className="menu-toggle" onClick={toggleSidebar} aria-label="منوی اصلی">
            <MenuIcon />
          </button>
          <h1 className="app-title">دستیار هوشمند پیشرفته</h1>
          
          <div className={`search-container ${searchActive ? 'active' : ''}`}>
            <button className="search-toggle" onClick={toggleSearch} aria-label="جستجو">
              <SearchIcon />
            </button>
            <div className="search-input-container">
              <input 
                type="text" 
                className="search-input" 
                placeholder="جستجو..." 
                aria-label="جستجو در برنامه"
              />
            </div>
          </div>
        </div>
        
        <div className="header-end">
          <button 
            className="theme-toggle" 
            onClick={toggleDarkMode} 
            aria-label={isDarkMode ? 'فعال کردن حالت روز' : 'فعال کردن حالت شب'}
          >
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </button>
          
          <div className="notification-container">
            <button 
              className="notification-toggle" 
              onClick={toggleNotifications}
              aria-label="اعلان‌ها"
            >
              <NotificationIcon />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>اعلان‌ها</h3>
                  <button className="mark-all-read">علامت همه به عنوان خوانده شده</button>
                </div>
                <ul className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <li 
                        key={notification.id} 
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      >
                        <div className="notification-content">
                          <p className="notification-text">{notification.text}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="no-notifications">اعلان جدیدی ندارید</li>
                  )}
                </ul>
                <div className="notification-footer">
                  <button className="view-all">مشاهده همه اعلان‌ها</button>
                </div>
              </div>
            )}
          </div>
          
          {user && (
            <div className="user-profile">
              <button 
                className="user-profile-toggle" 
                onClick={toggleUserMenu}
                aria-label="منوی کاربر"
              >
                <div className="user-avatar">
                  {(user.avatar_url || (user as any).avatar) ? (
                    <img 
                      src={user.avatar_url || (user as any).avatar} 
                      alt={user.full_name || (user as any).fullName || user.username} 
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {(user.full_name || (user as any).fullName || user.username || "U").charAt(0)}
                    </div>
                  )}
                </div>
                <span className="user-name">
                  {user.full_name || (user as any).fullName || user.username}
                </span>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-avatar large">
                      {(user.avatar_url || (user as any).avatar) ? (
                        <img 
                          src={user.avatar_url || (user as any).avatar} 
                          alt={user.full_name || (user as any).fullName || user.username} 
                        />
                      ) : (
                        <div className="avatar-placeholder large">
                          {(user.full_name || (user as any).fullName || user.username || "U").charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="user-info">
                      <h4 className="user-fullname">
                        {user.full_name || (user as any).fullName || user.username}
                      </h4>
                      <p className="user-email">{user.email}</p>
                    </div>
                  </div>
                  <ul className="user-dropdown-menu">
                    <li><a href="/profile">پروفایل کاربری</a></li>
                    <li><a href="/settings">تنظیمات</a></li>
                    <li><a href="/logout">خروج</a></li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 
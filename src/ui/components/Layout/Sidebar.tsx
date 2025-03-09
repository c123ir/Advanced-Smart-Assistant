/**
 * @file Sidebar.tsx
 * @description کامپوننت سایدبار پیشرفته با قابلیت جمع شدن و منوهای گروه‌بندی شده
 */

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

// آیکون‌های منو
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

const ReportsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
  </svg>
);

interface SidebarProps {
  isOpen: boolean;
  onLogout: () => void;
}

/**
 * کامپوننت سایدبار پیشرفته
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onLogout }) => {
  // وضعیت باز/بسته بودن منوهای گروهی
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    tasks: false,
    reports: false
  });

  // تغییر وضعیت منوهای گروهی
  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // منوهای اصلی
  const mainMenuItems = [
    { 
      key: 'dashboard',
      to: '/dashboard', 
      text: 'داشبورد', 
      icon: <DashboardIcon />,
      type: 'link'
    },
    { 
      key: 'tasks',
      text: 'مدیریت تسک‌ها', 
      icon: <TasksIcon />,
      type: 'group',
      children: [
        { to: '/tasks', text: 'همه تسک‌ها' },
        { to: '/tasks/my-tasks', text: 'تسک‌های من' },
        { to: '/tasks/create', text: 'ایجاد تسک جدید' },
        { to: '/tasks/archived', text: 'تسک‌های آرشیو شده' }
      ]
    },
    { 
      key: 'users',
      to: '/users', 
      text: 'مدیریت کاربران', 
      icon: <UsersIcon />,
      type: 'link'
    },
    { 
      key: 'reports',
      text: 'گزارش‌ها', 
      icon: <ReportsIcon />,
      type: 'group',
      children: [
        { to: '/reports/daily', text: 'گزارش روزانه' },
        { to: '/reports/weekly', text: 'گزارش هفتگی' },
        { to: '/reports/monthly', text: 'گزارش ماهانه' },
        { to: '/reports/custom', text: 'گزارش سفارشی' }
      ]
    },
    { 
      key: 'calendar',
      to: '/calendar', 
      text: 'تقویم', 
      icon: <CalendarIcon />,
      type: 'link'
    },
    { 
      key: 'settings',
      to: '/settings', 
      text: 'تنظیمات', 
      icon: <SettingsIcon />,
      type: 'link'
    },
    { 
      key: 'profile',
      to: '/profile', 
      text: 'پروفایل کاربری', 
      icon: <ProfileIcon />,
      type: 'link'
    }
  ];

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="app-logo">
          <span className="logo-icon">DSH</span>
          {isOpen && <span className="logo-text">دستیار هوشمند</span>}
        </div>
      </div>
      
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {mainMenuItems.map((item) => (
              <li key={item.key} className={`nav-item ${item.type === 'group' ? 'has-submenu' : ''}`}>
                {item.type === 'link' ? (
                  <NavLink
                    to={item.to!}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {isOpen && <span className="nav-text">{item.text}</span>}
                  </NavLink>
                ) : (
                  <>
                    <button 
                      className={`nav-link submenu-toggle ${expandedMenus[item.key] ? 'expanded' : ''}`}
                      onClick={() => toggleMenu(item.key)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {isOpen && (
                        <>
                          <span className="nav-text">{item.text}</span>
                          <span className="submenu-icon">
                            {expandedMenus[item.key] ? <ChevronDownIcon /> : <ChevronRightIcon />}
                          </span>
                        </>
                      )}
                    </button>
                    
                    {isOpen && expandedMenus[item.key] && (
                      <ul className="submenu">
                        {item.children?.map((child, index) => (
                          <li key={index} className="submenu-item">
                            <NavLink
                              to={child.to}
                              className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}
                            >
                              {child.text}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="sidebar-footer">
        <button className="nav-link logout-button" onClick={onLogout}>
          <span className="nav-icon">
            <LogoutIcon />
          </span>
          {isOpen && <span className="nav-text">خروج</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 
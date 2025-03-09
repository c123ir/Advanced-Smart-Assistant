/**
 * @file Dashboard.tsx
 * @description صفحه داشبورد اصلی برنامه
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiResponse, Task, User } from '../../types/models';
import LoadingScreen from '../components/LoadingScreen';

/**
 * کامپوننت کارت آمار
 */
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-title">{title}</div>
    </div>
  </div>
);

/**
 * ایجاد آیکون‌های داشبورد
 */
const TaskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

/**
 * کامپوننت صفحه داشبورد
 */
const Dashboard: React.FC = () => {
  // استیت‌های صفحه
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [taskCount, setTaskCount] = useState<number>(0);
  const [pendingTaskCount, setPendingTaskCount] = useState<number>(0);

  // بارگذاری داده‌ها
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // دریافت تسک‌ها
        const tasksResponse = await window.electron.tasks.getAll() as ApiResponse<Task[]>;
        
        if (tasksResponse.success && tasksResponse.data) {
          const tasks = tasksResponse.data;
          setTaskCount(tasks.length);
          setPendingTaskCount(tasks.filter(task => task.status === 'pending').length);
          
          // مرتب‌سازی براساس زمان ایجاد (نزولی) و نمایش 5 تسک اخیر
          const sortedTasks = [...tasks].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ).slice(0, 5);
          
          setRecentTasks(sortedTasks);
        }
        
        // دریافت کاربران
        const usersResponse = await window.electron.users.getAll() as ApiResponse<User[]>;
        
        if (usersResponse.success && usersResponse.data) {
          setUserCount(usersResponse.data.length);
        }
      } catch (err) {
        console.error('خطا در بارگذاری داده‌های داشبورد:', err);
        setError('خطا در بارگذاری داده‌های داشبورد. لطفاً صفحه را مجدداً بارگذاری کنید');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  // نمایش صفحه بارگذاری
  if (loading) {
    return <LoadingScreen message="در حال بارگذاری داشبورد..." />;
  }
  
  return (
    <div className="dashboard-page">
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      {/* کارت‌های آمار */}
      <div className="stats-section">
        <div className="stats-grid">
          <StatCard 
            title="تعداد کاربران" 
            value={userCount} 
            icon={<UserIcon />}
            color="blue" 
          />
          <StatCard 
            title="کل تسک‌ها" 
            value={taskCount} 
            icon={<TaskIcon />}
            color="green" 
          />
          <StatCard 
            title="تسک‌های در انتظار" 
            value={pendingTaskCount} 
            icon={<AlertIcon />}
            color="orange" 
          />
        </div>
      </div>
      
      {/* تسک‌های اخیر */}
      <div className="recent-tasks-section">
        <div className="section-header">
          <h3 className="section-title">تسک‌های اخیر</h3>
          <Link to="/tasks" className="section-action">
            مشاهده همه تسک‌ها
          </Link>
        </div>
        
        <div className="tasks-list">
          {recentTasks.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>وضعیت</th>
                  <th>ایجاد کننده</th>
                  <th>تاریخ ایجاد</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>
                      <span className={`status-badge status-${task.status}`}>
                        {task.status === 'pending' ? 'در انتظار' : 
                          task.status === 'in_progress' ? 'در حال انجام' : 
                          task.status === 'completed' ? 'تکمیل شده' : task.status}
                      </span>
                    </td>
                    <td>{task.created_by_full_name || task.created_by_username || task.created_by}</td>
                    <td>{new Date(task.created_at).toLocaleDateString('fa-IR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>هیچ تسکی یافت نشد</p>
              <Link to="/tasks/new" className="btn btn-primary">
                ایجاد تسک جدید
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
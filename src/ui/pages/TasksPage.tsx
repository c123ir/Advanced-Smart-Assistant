import React, { useState, useEffect } from 'react';
// import * as FaIcons from 'react-icons/fa';
// import * as BsIcons from 'react-icons/bs';
import '../styles/pages/tasks.scss';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignee: {
    id: number;
    name: string;
    avatar?: string;
  };
  tags: string[];
}

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'طراحی رابط کاربری داشبورد',
    description: 'طراحی رابط کاربری داشبورد مدیریت با استفاده از فیگما و پیاده‌سازی آن در React',
    status: 'completed',
    priority: 'high',
    dueDate: '1402/12/15',
    assignee: {
      id: 1,
      name: 'علی محمدی',
    },
    tags: ['طراحی', 'UI/UX', 'React']
  },
  {
    id: 2,
    title: 'پیاده‌سازی سیستم احراز هویت',
    description: 'پیاده‌سازی سیستم احراز هویت با JWT و ذخیره‌سازی در LocalStorage',
    status: 'in-progress',
    priority: 'high',
    dueDate: '1402/12/20',
    assignee: {
      id: 2,
      name: 'سارا احمدی',
    },
    tags: ['امنیت', 'JWT', 'API']
  },
  {
    id: 3,
    title: 'بهینه‌سازی کوئری‌های دیتابیس',
    description: 'بهینه‌سازی کوئری‌های دیتابیس برای بهبود عملکرد و کاهش زمان پاسخ‌دهی',
    status: 'pending',
    priority: 'medium',
    dueDate: '1402/12/25',
    assignee: {
      id: 3,
      name: 'محمد رضایی',
    },
    tags: ['دیتابیس', 'بهینه‌سازی', 'SQLite']
  },
  {
    id: 4,
    title: 'اضافه کردن ویژگی اعلان‌ها',
    description: 'اضافه کردن سیستم اعلان‌ها برای اطلاع‌رسانی به کاربران درباره تغییرات و رویدادها',
    status: 'pending',
    priority: 'low',
    dueDate: '1403/01/10',
    assignee: {
      id: 4,
      name: 'زهرا کریمی',
    },
    tags: ['اعلان‌ها', 'Frontend', 'UX']
  },
  {
    id: 5,
    title: 'تست و رفع باگ‌های گزارش شده',
    description: 'تست سیستم و رفع باگ‌های گزارش شده توسط کاربران در آخرین نسخه',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '1402/12/18',
    assignee: {
      id: 1,
      name: 'علی محمدی',
    },
    tags: ['تست', 'باگ‌فیکس', 'QA']
  },
  {
    id: 6,
    title: 'مستندسازی API',
    description: 'ایجاد مستندات کامل برای API‌های برنامه با استفاده از Swagger',
    status: 'overdue',
    priority: 'low',
    dueDate: '1402/12/01',
    assignee: {
      id: 2,
      name: 'سارا احمدی',
    },
    tags: ['مستندات', 'API', 'Swagger']
  },
];

const TasksPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    let result = tasks;
    
    // جستجو
    if (searchTerm) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // فیلتر وضعیت
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    // فیلتر اولویت
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }
    
    setFilteredTasks(result);
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="tasks-page">
      {/* سربرگ */}
      <div className="tasks-header">
        <h1 className="tasks-title">مدیریت تسک‌ها</h1>
        <div className="tasks-actions">
          <button className="btn btn-outline-primary" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            <span className="mr-2">{viewMode === 'grid' ? 'نمایش لیستی' : 'نمایش کارتی'}</span>
          </button>
          <button className="btn btn-primary">
            <span className="mr-2">تسک جدید</span>
          </button>
        </div>
      </div>

      {/* فیلترها و جستجو */}
      <div className="tasks-filters">
        <div className="tasks-search">
          <input
            type="text"
            className="search-input"
            placeholder="جستجو در تسک‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <span className="filter-label">وضعیت:</span>
          <select 
            className="filter-select" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">همه</option>
            <option value="pending">در انتظار</option>
            <option value="in-progress">در حال انجام</option>
            <option value="completed">تکمیل شده</option>
            <option value="overdue">گذشته</option>
          </select>
        </div>
        
        <div className="filter-group">
          <span className="filter-label">اولویت:</span>
          <select 
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">همه</option>
            <option value="low">کم</option>
            <option value="medium">متوسط</option>
            <option value="high">زیاد</option>
          </select>
        </div>
      </div>

      {/* نمایش کارتی */}
      {viewMode === 'grid' && (
        <div className="tasks-grid">
          {filteredTasks.map(task => (
            <div key={task.id} className={`task-card ${task.status}`}>
              <div className={`task-priority ${task.priority}`}>
                {task.priority === 'high' ? 'اولویت بالا' : 
                 task.priority === 'medium' ? 'اولویت متوسط' : 'اولویت کم'}
              </div>
              
              <div className="task-header">
                <h3 className="task-title">
                  <a href={`/tasks/${task.id}`}>{task.title}</a>
                </h3>
                <span className={`task-status status-${task.status}`}>
                  {task.status === 'pending' ? 'در انتظار' : 
                   task.status === 'in-progress' ? 'در حال انجام' : 
                   task.status === 'completed' ? 'تکمیل شده' : 'گذشته'}
                </span>
              </div>
              
              <p className="task-description">{task.description}</p>
              
              <div className="task-meta">
                <div className="task-date">
                  {task.dueDate}
                </div>
                <div className="task-assignee">
                  <div className="assignee-avatar">
                    {task.assignee.avatar ? 
                      <img src={task.assignee.avatar} alt={task.assignee.name} /> : 
                      getInitials(task.assignee.name)
                    }
                  </div>
                  <span className="assignee-name">{task.assignee.name}</span>
                </div>
              </div>
              
              <div className="task-footer">
                <div className="task-tags">
                  {task.tags.map((tag, index) => (
                    <span key={index} className="task-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="task-actions">
                  <button className="btn btn-sm btn-light">ویرایش</button>
                  <button className="btn btn-sm btn-outline-danger">حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نمایش لیستی */}
      {viewMode === 'list' && (
        <div className="tasks-list">
          {filteredTasks.map(task => (
            <div key={task.id} className="task-list-item">
              <div className="task-list-checkbox">
                <input 
                  type="checkbox" 
                  checked={task.status === 'completed'} 
                  onChange={() => {}} 
                />
              </div>
              
              <div className="task-list-content">
                <h3 className="task-list-title">{task.title}</h3>
                <p className="task-list-desc">{task.description.substring(0, 100)}...</p>
              </div>
              
              <div className="task-list-meta">
                <span className={`task-status status-${task.status} mr-2`}>
                  {task.status === 'pending' ? 'در انتظار' : 
                   task.status === 'in-progress' ? 'در حال انجام' : 
                   task.status === 'completed' ? 'تکمیل شده' : 'گذشته'}
                </span>
                <span className="task-list-date">
                  {task.dueDate}
                </span>
              </div>
              
              <div className="task-list-actions">
                <button className="btn btn-sm btn-light">ویرایش</button>
                <button className="btn btn-sm btn-outline-danger">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage; 
import React, { useState, useEffect } from 'react';
// import * as FaIcons from 'react-icons/fa';
import '../styles/pages/users.scss';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: 'علی محمدی',
    username: 'alimohammadi',
    email: 'ali.mohammadi@example.com',
    role: 'admin',
    status: 'active',
    lastLogin: '1402/12/15 14:30',
  },
  {
    id: 2,
    name: 'سارا احمدی',
    username: 'saraahmadi',
    email: 'sara.ahmadi@example.com',
    role: 'manager',
    status: 'active',
    lastLogin: '1402/12/14 10:15',
  },
  {
    id: 3,
    name: 'محمد رضایی',
    username: 'mohammadreza',
    email: 'mohammad.rezaei@example.com',
    role: 'user',
    status: 'active',
    lastLogin: '1402/12/10 09:45',
  },
  {
    id: 4,
    name: 'زهرا کریمی',
    username: 'zahrakarimi',
    email: 'zahra.karimi@example.com',
    role: 'user',
    status: 'inactive',
    lastLogin: '1402/11/25 16:20',
  },
  {
    id: 5,
    name: 'امیر حسینی',
    username: 'amirhossein',
    email: 'amir.hosseini@example.com',
    role: 'manager',
    status: 'active',
    lastLogin: '1402/12/13 11:30',
  },
];

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let result = users;
    
    // جستجو
    if (searchTerm) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // فیلتر نقش
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // فیلتر وضعیت
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدیر سیستم';
      case 'manager':
        return 'مدیر';
      case 'user':
        return 'کاربر';
      default:
        return '';
    }
  };

  const getRoleClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'role-admin';
      case 'manager':
        return 'role-manager';
      case 'user':
        return 'role-user';
      default:
        return '';
    }
  };

  return (
    <div className="users-page">
      {/* سربرگ */}
      <div className="users-header">
        <h1 className="users-title">مدیریت کاربران</h1>
        <div className="users-actions">
          <button className="btn btn-primary">
            <span className="mr-2">کاربر جدید</span>
          </button>
        </div>
      </div>

      {/* فیلترها و جستجو */}
      <div className="users-filters">
        <div className="users-search">
          <input
            type="text"
            className="search-input"
            placeholder="جستجو در کاربران..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <span className="filter-label">نقش:</span>
          <select 
            className="filter-select" 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">همه</option>
            <option value="admin">مدیر سیستم</option>
            <option value="manager">مدیر</option>
            <option value="user">کاربر</option>
          </select>
        </div>
        
        <div className="filter-group">
          <span className="filter-label">وضعیت:</span>
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">همه</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
        </div>
      </div>

      {/* جدول کاربران */}
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>کاربر</th>
              <th>نام کاربری</th>
              <th>ایمیل</th>
              <th>نقش</th>
              <th>وضعیت</th>
              <th>آخرین ورود</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.avatar ? 
                        <img src={user.avatar} alt={user.name} /> : 
                        getInitials(user.name)
                      }
                    </div>
                    <div className="user-name">{user.name}</div>
                  </div>
                </td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`user-role ${getRoleClass(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td>
                  <span className={`user-status ${user.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                    {user.status === 'active' ? 'فعال' : 'غیرفعال'}
                  </span>
                </td>
                <td>{user.lastLogin}</td>
                <td>
                  <div className="user-actions">
                    <button className="btn-icon btn-sm btn-light" title="ویرایش">
                      ویرایش
                    </button>
                    <button className="btn-icon btn-sm btn-light" title="تغییر رمز عبور">
                      رمز
                    </button>
                    <button className="btn-icon btn-sm btn-outline-danger" title="حذف">
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* صفحه‌بندی */}
      <div className="users-pagination">
        <div className="pagination-info">
          نمایش {filteredUsers.length} از {users.length} کاربر
        </div>
        <div className="pagination-controls">
          <button className="btn btn-sm btn-light" disabled>&laquo;</button>
          <button className="btn btn-sm btn-primary">1</button>
          <button className="btn btn-sm btn-light">2</button>
          <button className="btn btn-sm btn-light">&raquo;</button>
        </div>
      </div>
    </div>
  );
};

export default UsersPage; 
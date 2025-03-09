/**
 * @file LoginPage.tsx
 * @description صفحه ورود به سیستم
 */

import React, { useState } from 'react';
import { User, ApiResponse } from '../../types/models';

/**
 * تایپ‌های صفحه ورود
 */
interface LoginPageProps {
  onLogin: (user: User) => void;
}

/**
 * کامپوننت صفحه ورود
 */
const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // استیت‌های فرم
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * پردازش فرم ورود
   * @param e رویداد فرم
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // بررسی پر بودن فیلدها
    if (!username || !password) {
      setError('لطفاً نام کاربری و رمز عبور را وارد کنید');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // ارسال درخواست احراز هویت
      const response = await window.electron.users.authenticate(username, password) as ApiResponse<User>;
      
      if (response.success && response.data) {
        // لاگین موفق
        onLogin(response.data);
      } else {
        // خطا در لاگین
        setError(response.message || 'خطا در احراز هویت. لطفاً مجدداً تلاش کنید');
        setPassword('');
      }
    } catch (err) {
      console.error('خطا در ورود به سیستم:', err);
      setError('خطای سیستمی. لطفاً مجدداً تلاش کنید');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">ورود به سیستم</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">نام کاربری:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="نام کاربری خود را وارد کنید"
              disabled={isLoading}
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">رمز عبور:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور خود را وارد کنید"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <button 
              type="submit" 
              className="login-button" 
              disabled={isLoading || !username || !password}
            >
              {isLoading ? 'در حال ورود...' : 'ورود'}
            </button>
          </div>
        </form>
        
        <div className="login-help">
          <p>راهنمای ورود:</p>
          <ul>
            <li>نام کاربری پیش‌فرض: <strong>admin</strong></li>
            <li>رمز عبور پیش‌فرض: <strong>admin123</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 
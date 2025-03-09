/**
 * @file NotFoundPage.tsx
 * @description صفحه 404 (صفحه یافت نشد)
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * کامپوننت صفحه 404
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">صفحه مورد نظر یافت نشد</h2>
        <p className="not-found-description">
          صفحه‌ای که به دنبال آن هستید موجود نیست یا حذف شده است.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 
/**
 * @file LoadingScreen.tsx
 * @description کامپوننت نمایش صفحه بارگذاری
 */

import React from 'react';

/**
 * تایپ‌های کامپوننت LoadingScreen
 */
interface LoadingScreenProps {
  message?: string;
}

/**
 * کامپوننت صفحه بارگذاری
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'در حال بارگذاری...' }) => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <div className="loading-message">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 
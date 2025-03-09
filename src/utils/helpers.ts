/**
 * توابع کمکی
 * 
 * این ماژول شامل توابع کمکی مختلف برای استفاده در برنامه است
 */

/**
 * تبدیل تاریخ به فرمت محلی
 * @param date تاریخ
 * @param options گزینه‌های فرمت
 * @returns تاریخ فرمت شده
 */
export function formatDate(date: Date | string | null | undefined, options: Intl.DateTimeFormatOptions = {}): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // بررسی معتبر بودن تاریخ
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return '';
  }
  
  // گزینه‌های پیش‌فرض
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  // ترکیب گزینه‌های پیش‌فرض با گزینه‌های ورودی
  const finalOptions = { ...defaultOptions, ...options };
  
  // فرمت تاریخ به صورت محلی
  return new Intl.DateTimeFormat('fa-IR', finalOptions).format(dateObj);
}

/**
 * تبدیل تاریخ به فرمت نسبی (مثلاً "۲ روز پیش")
 * @param date تاریخ
 * @returns تاریخ نسبی
 */
export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // بررسی معتبر بودن تاریخ
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return '';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);
  
  if (diffSec < 60) {
    return 'چند لحظه پیش';
  } else if (diffMin < 60) {
    return `${diffMin} دقیقه پیش`;
  } else if (diffHour < 24) {
    return `${diffHour} ساعت پیش`;
  } else if (diffDay < 30) {
    return `${diffDay} روز پیش`;
  } else if (diffMonth < 12) {
    return `${diffMonth} ماه پیش`;
  } else {
    return `${diffYear} سال پیش`;
  }
}

/**
 * تبدیل عدد به فرمت محلی
 * @param num عدد
 * @returns عدد فرمت شده
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '';
  
  return new Intl.NumberFormat('fa-IR').format(num);
}

/**
 * کوتاه کردن متن
 * @param text متن
 * @param maxLength حداکثر طول
 * @returns متن کوتاه شده
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
}

/**
 * تولید رنگ تصادفی
 * @returns رنگ هگز تصادفی
 */
export function generateRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  
  return color;
}

/**
 * تبدیل اولین حرف رشته به حرف بزرگ
 * @param str رشته
 * @returns رشته با حرف اول بزرگ
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * تبدیل کلمات کلیدی به تگ‌های HTML
 * @param text متن
 * @param keywords کلمات کلیدی
 * @returns متن با تگ‌های HTML
 */
export function highlightKeywords(text: string, keywords: string[]): string {
  if (!text || !keywords.length) return text;
  
  let result = text;
  
  keywords.forEach(keyword => {
    if (!keyword) return;
    
    const regex = new RegExp(keyword, 'gi');
    result = result.replace(regex, match => `<mark>${match}</mark>`);
  });
  
  return result;
}

/**
 * تبدیل آرایه به رشته با جداکننده
 * @param arr آرایه
 * @param separator جداکننده
 * @returns رشته
 */
export function arrayToString<T>(arr: T[], separator: string = ', '): string {
  if (!arr || !arr.length) return '';
  
  return arr.join(separator);
}

/**
 * تبدیل بایت به فرمت خوانا
 * @param bytes تعداد بایت
 * @param decimals تعداد اعشار
 * @returns اندازه فرمت شده
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 بایت';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت', 'ترابایت'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * تاخیر در اجرا
 * @param ms میلی‌ثانیه
 * @returns پرامیس
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * تولید شناسه یکتا
 * @returns شناسه یکتا
 */
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * تبدیل وضعیت وظیفه به متن فارسی
 * @param status وضعیت وظیفه
 * @returns متن فارسی
 */
export function translateTaskStatus(status: string): string {
  switch (status) {
    case 'todo':
      return 'در انتظار';
    case 'inProgress':
      return 'در حال انجام';
    case 'review':
      return 'در حال بررسی';
    case 'done':
      return 'تکمیل شده';
    default:
      return status;
  }
}

/**
 * تبدیل اولویت وظیفه به متن فارسی
 * @param priority اولویت وظیفه
 * @returns متن فارسی
 */
export function translateTaskPriority(priority: string): string {
  switch (priority) {
    case 'low':
      return 'کم';
    case 'medium':
      return 'متوسط';
    case 'high':
      return 'زیاد';
    case 'urgent':
      return 'فوری';
    default:
      return priority;
  }
}

/**
 * تبدیل نقش کاربر به متن فارسی
 * @param role نقش کاربر
 * @returns متن فارسی
 */
export function translateUserRole(role: string): string {
  switch (role) {
    case 'admin':
      return 'مدیر';
    case 'user':
      return 'کاربر';
    case 'guest':
      return 'مهمان';
    default:
      return role;
  }
} 
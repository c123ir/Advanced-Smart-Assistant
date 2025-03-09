/**
 * @file models.ts
 * @description تعریف تایپ‌های مدل‌های داده برنامه
 */

/**
 * تایپ کاربر
 */
export interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * تایپ تسک
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: number;
  status: string;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  
  // فیلدهای اضافی برای جوین‌ها
  created_by_username?: string;
  created_by_full_name?: string;
  assigned_to_username?: string;
  assigned_to_full_name?: string;
}

/**
 * تایپ اعلان
 */
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

/**
 * تایپ تنظیمات
 */
export interface Setting {
  id: string;
  user_id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

/**
 * تایپ پاسخ API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

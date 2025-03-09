/**
 * مدیریت خطاها
 * 
 * این ماژول برای مدیریت و پردازش خطاهای برنامه استفاده می‌شود
 */

import { logger } from '../core/logger';

// کلاس خطای سفارشی برنامه
export class AppError extends Error {
  code: string;
  statusCode: number;
  details?: any;

  constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// کلاس خطای اعتبارسنجی
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

// کلاس خطای احراز هویت
export class AuthenticationError extends AppError {
  constructor(message: string = 'احراز هویت ناموفق بود') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

// کلاس خطای دسترسی
export class AuthorizationError extends AppError {
  constructor(message: string = 'شما مجوز دسترسی به این بخش را ندارید') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

// کلاس خطای یافت نشدن
export class NotFoundError extends AppError {
  constructor(message: string = 'مورد درخواستی یافت نشد') {
    super(message, 'NOT_FOUND_ERROR', 404);
    this.name = 'NotFoundError';
  }
}

// کلاس خطای دیتابیس
export class DatabaseError extends AppError {
  constructor(message: string = 'خطا در عملیات دیتابیس', details?: any) {
    super(message, 'DATABASE_ERROR', 500, details);
    this.name = 'DatabaseError';
  }
}

/**
 * تابع مدیریت خطاها
 * @param error خطای رخ داده
 * @returns خطای پردازش شده
 */
export function handleError(error: any): AppError {
  // اگر خطا از نوع AppError باشد، آن را برمی‌گردانیم
  if (error instanceof AppError) {
    console.error(`${error.name}: ${error.message}`, error.details);
    return error;
  }

  // بررسی نوع خطا و تبدیل آن به خطای سفارشی
  if (error.code === 'SQLITE_CONSTRAINT') {
    return new ValidationError('خطای محدودیت در دیتابیس', error);
  }

  if (error.code === 'SQLITE_ERROR') {
    return new DatabaseError('خطای دیتابیس', error);
  }

  // خطاهای دیگر را به خطای عمومی تبدیل می‌کنیم
  console.error('خطای مدیریت نشده', error);
  return new AppError(error.message || 'خطای سیستمی رخ داده است');
}

/**
 * تابع اعتبارسنجی ورودی‌ها
 * @param data داده‌های ورودی
 * @param schema طرح اعتبارسنجی
 * @returns داده‌های اعتبارسنجی شده
 */
export function validateInput<T>(data: any, schema: { [key: string]: (value: any) => boolean | string }): T {
  const errors: { [key: string]: string } = {};

  // بررسی هر فیلد با قوانین اعتبارسنجی
  for (const [field, validator] of Object.entries(schema)) {
    const result = validator(data[field]);
    
    if (typeof result === 'string') {
      errors[field] = result;
    } else if (result === false) {
      errors[field] = `فیلد ${field} نامعتبر است`;
    }
  }

  // اگر خطایی وجود داشت، خطای اعتبارسنجی پرتاب می‌کنیم
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('خطای اعتبارسنجی داده‌ها', errors);
  }

  return data as T;
}

/**
 * تابع اعتبارسنجی شناسه
 * @param id شناسه
 * @returns true اگر شناسه معتبر باشد
 */
export function validateId(id: any): boolean | string {
  if (id === undefined || id === null) {
    return 'شناسه الزامی است';
  }
  
  const parsedId = parseInt(id);
  
  if (isNaN(parsedId) || parsedId <= 0) {
    return 'شناسه باید یک عدد مثبت باشد';
  }
  
  return true;
}

/**
 * تابع اعتبارسنجی رشته
 * @param value مقدار رشته
 * @param options گزینه‌های اعتبارسنجی
 * @returns true اگر رشته معتبر باشد
 */
export function validateString(value: any, options: { required?: boolean; minLength?: number; maxLength?: number; pattern?: RegExp } = {}): boolean | string {
  if (value === undefined || value === null || value === '') {
    return options.required ? 'این فیلد الزامی است' : true;
  }
  
  if (typeof value !== 'string') {
    return 'این فیلد باید رشته باشد';
  }
  
  if (options.minLength !== undefined && value.length < options.minLength) {
    return `این فیلد باید حداقل ${options.minLength} کاراکتر باشد`;
  }
  
  if (options.maxLength !== undefined && value.length > options.maxLength) {
    return `این فیلد باید حداکثر ${options.maxLength} کاراکتر باشد`;
  }
  
  if (options.pattern !== undefined && !options.pattern.test(value)) {
    return 'این فیلد با الگوی مورد نظر مطابقت ندارد';
  }
  
  return true;
}

/**
 * تابع اعتبارسنجی ایمیل
 * @param value مقدار ایمیل
 * @param required آیا فیلد الزامی است
 * @returns true اگر ایمیل معتبر باشد
 */
export function validateEmail(value: any, required: boolean = false): boolean | string {
  if (value === undefined || value === null || value === '') {
    return required ? 'ایمیل الزامی است' : true;
  }
  
  if (typeof value !== 'string') {
    return 'ایمیل باید رشته باشد';
  }
  
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailPattern.test(value)) {
    return 'ایمیل نامعتبر است';
  }
  
  return true;
}

/**
 * تابع اعتبارسنجی تاریخ
 * @param value مقدار تاریخ
 * @param required آیا فیلد الزامی است
 * @returns true اگر تاریخ معتبر باشد
 */
export function validateDate(value: any, required: boolean = false): boolean | string {
  if (value === undefined || value === null || value === '') {
    return required ? 'تاریخ الزامی است' : true;
  }
  
  const date = new Date(value);
  
  if (isNaN(date.getTime())) {
    return 'تاریخ نامعتبر است';
  }
  
  return true;
} 
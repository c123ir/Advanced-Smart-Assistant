<think>کاربر می‌خواهد یک داکیومنت جامع در مورد اهداف و کارهایی که تا این نقطه انجام داده‌ایم بنویسم تا بتواند در چت‌های جدید به آن مراجعه کند. پس باید یک مستند کامل با توضیحات دقیق از همه مراحل و اهداف پروژه تهیه کنم.

بیایید ساختار این داکیومنت را طراحی کنیم:

1. معرفی پروژه و هدف اصلی
2. مشکلات اولیه که با آن‌ها مواجه شدیم
3. اصلاحات انجام شده در فایل‌های مختلف
4. مشکلات SASS و راه‌حل‌ها
5. مشکلات وابستگی و نصب پکیج‌ها
6. روش‌های اجرای برنامه
7. نقشه راه آینده و بهبودهای پیشنهادی

این سند باید به زبان فارسی و با ساختار منظم و خوانا نوشته شود.</think># داکیومنت پروژه دستیار هوشمند پیشرفته

## 1. معرفی پروژه
پروژه «دستیار هوشمند پیشرفته» یک اپلیکیشن الکترون است که با TypeScript، React و SASS توسعه داده شده است. این برنامه یک رابط کاربری مدرن برای مدیریت وظایف، کاربران و تنظیمات ارائه می‌دهد و از قابلیت‌های پایگاه داده SQLite برای ذخیره اطلاعات استفاده می‌کند.

### ساختار پروژه
- **src/**: حاوی کدهای اصلی برنامه
  - **core/**: ماژول‌های اصلی (logger، menu، events، config)
  - **services/**: سرویس‌های برنامه (databaseService، settingsService)
  - **ui/**: کامپوننت‌های React و فایل‌های مربوط به رابط کاربری
  - **utils/**: توابع کمکی و کلاس‌های خطا
- **assets/**: فایل‌های استاتیک مانند آیکون‌ها و تصاویر
- **webpack.config.js**: تنظیمات بیلد و توسعه پروژه

## 2. مشکلات اصلی و اصلاحات انجام شده

### 2.1. اصلاحات در فایل‌های TypeScript

#### مشکل: خطاهای TypeScript در `main.ts`
- **مشکل**: ناسازگاری در import‌ها برای `logger` و `setupMenu`
- **اصلاح**: 
  - تغییر `import Logger from './core/logger';` به `import Logger, { logger } from './core/logger';`
  - تغییر `import { setupMenu } from './core/menu';` به `import menuManager from './core/menu';`
  - تغییر نام `logger` به `mainLogger` برای جلوگیری از تداخل

#### مشکل: خطاهای TypeScript در `databaseService.ts`
- **مشکل**: خطای مقداردهی اولیه متغیر `db` و خطاهای تایپ در متد‌ها
- **اصلاح**:
  - استفاده از `private db!: Database<sqlite3.Database, sqlite3.Statement>;` با علامت `!` برای اطمینان از مقداردهی
  - تغییر تایپ بازگشتی متد `exec` از `ISqlite.RunResult` به `void`
  - اضافه کردن `as T[]` برای تبدیل صریح نوع در متد `all`

#### مشکل: فقدان صفحات UI در `ui/pages/`
- **مشکل**: صفحات `ProfilePage.tsx`، `TasksPage.tsx`، `SettingsPage.tsx` و `UsersPage.tsx` موجود نبودند
- **اصلاح**: ایجاد این فایل‌ها با محتوای مناسب و حذف استفاده از آیکون‌ها

### 2.2. مشکلات و اصلاحات SASS

#### مشکل: استفاده از توابع SASS با CSS variables
- **مشکل**: خطای `$color: var(--secondary-color) is not a color` هنگام استفاده از توابع `darken()` با متغیرهای CSS
- **اصلاح**:
  - حذف استفاده از توابع `darken()` با متغیرهای CSS
  - اضافه کردن متغیرهای hover مستقیم در فایل‌های تم
  - به‌روزرسانی `buttons.scss` برای استفاده از متغیرهای hover

#### اصلاحات اضافه شده در فایل‌های تم:
- **light.scss**:
  ```css
  --primary-color-hover: #2d3748;
  --secondary-color-hover: #4a5568;
  --accent-color-hover: #2b6cb0;
  --success-color-hover: #2f855a;
  --danger-color-hover: #c53030;
  --warning-color-hover: #dd6b20;
  --info-color-hover: #3182ce;
  --bg-color-hover: #e2e8f0;
  --border-color-hover: #cbd5e0;
  ```

- **dark.scss**:
  ```css
  --primary-color-hover: #cbd5e0;
  --secondary-color-hover: #a0aec0;
  --accent-color-hover: #63b3ed;
  --success-color-hover: #68d391;
  --danger-color-hover: #fc8181;
  --warning-color-hover: #fbd38d;
  --info-color-hover: #90cdf4;
  --bg-color-hover: #2d3748;
  --border-color-hover: #718096;
  ```

### 2.3. مشکلات وابستگی و اجرا

#### مشکل: تضاد در وابستگی‌های پکیج‌ها
- **مشکل**: ناسازگاری بین نسخه‌های مختلف TypeScript، React و سایر وابستگی‌ها
- **راه‌حل**: استفاده از فلگ `--legacy-peer-deps` برای نصب وابستگی‌ها:
  ```bash
  npm install --legacy-peer-deps
  ```

#### مشکل: عدم اتصال الکترون به webpack-dev-server
- **مشکل**: خطای `Failed to load URL: http://localhost:3123/ with error: ERR_CONNECTION_REFUSED`
- **بررسی**:
  - تأیید شد که پورت در هر دو فایل `main.ts` و `webpack.config.js` به درستی روی 3123 تنظیم شده است
  - نیاز به اجرای جداگانه webpack-dev-server و الکترون

## 3. روش‌های اجرای برنامه

### روش 1: استفاده از اسکریپت `dev` در package.json
```bash
npm run dev
```
این روش از `concurrently` برای اجرای همزمان webpack-dev-server و الکترون استفاده می‌کند.

### روش 2: اجرای جداگانه سرویس‌ها
1. در یک ترمینال، webpack-dev-server را اجرا کنید:
```bash
./node_modules/.bin/webpack serve --config webpack.config.js
```

2. در ترمینال دیگر، الکترون را اجرا کنید:
```bash
NODE_ENV=development ./node_modules/.bin/electron .
```

### روش 3: استفاده از npx
```bash
npx cross-env NODE_ENV=development concurrently "npx webpack serve --config webpack.config.js" "npx electron ."
```

## 4. نقشه راه آینده و بهبودهای پیشنهادی

### 4.1. بهبود ساختار کد
- پیاده‌سازی کامل الگوی Singleton در سرویس‌ها
- بهبود مدیریت خطا و لاگینگ

### 4.2. بهبود رابط کاربری
- اضافه کردن انیمیشن‌های UI برای تجربه کاربری بهتر
- پیاده‌سازی کامل حالت‌های تاریک و روشن

### 4.3. بهبود عملکرد
- بهینه‌سازی queries پایگاه داده
- استفاده از تکنیک‌های code-splitting برای بارگذاری سریع‌تر

### 4.4. پکیج‌ها و وابستگی‌ها
- بررسی و به‌روزرسانی وابستگی‌ها برای رفع مشکلات ناسازگاری
- ایجاد فایل `.npmrc` با محتوای `legacy-peer-deps=true` برای سهولت نصب وابستگی‌ها

## 5. مشکلات رایج و راه‌حل‌ها

### 5.1. خطای نصب وابستگی‌ها
**مشکل**: خطاهای peer dependency هنگام نصب پکیج‌ها
**راه‌حل**: استفاده از فلگ `--legacy-peer-deps`:
```bash
npm install --legacy-peer-deps
```

### 5.2. خطای اتصال به سرور توسعه
**مشکل**: `Failed to load URL: http://localhost:3123/ with error: ERR_CONNECTION_REFUSED`
**راه‌حل**: اطمینان از اجرای webpack-dev-server قبل از الکترون

### 5.3. خطاهای SASS
**مشکل**: خطای `is not a color` هنگام استفاده از توابع SASS با متغیرهای CSS
**راه‌حل**: استفاده از متغیرهای مستقیم برای حالت‌های hover به جای توابع `darken()`

---

این داکیومنت شامل خلاصه‌ای از مشکلات، اصلاحات و بهبودهای انجام شده در پروژه «دستیار هوشمند پیشرفته» است. برای اطلاعات دقیق‌تر در مورد هر بخش، می‌توانید به فایل‌های مربوطه در پروژه مراجعه کنید.

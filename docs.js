/**
 * اسکریپت تولید مستندات API داخلی
 * 
 * این اسکریپت برای تولید مستندات API داخلی از کدهای TypeScript استفاده می‌شود
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// پوشه‌های حاوی کدهای TypeScript
const sourceDirectories = [
  'src/core',
  'src/services',
  'src/utils'
];

// تنظیمات TypeDoc
const typedocConfig = {
  entryPoints: sourceDirectories.map(dir => path.join(__dirname, dir)),
  out: path.join(__dirname, 'docs', 'api'),
  name: 'Advanced Smart Assistant API',
  theme: 'default',
  excludePrivate: true,
  excludeProtected: true,
  excludeExternals: true,
  hideGenerator: true,
  disableSources: false,
  readme: path.join(__dirname, 'README.md')
};

/**
 * بررسی وجود TypeDoc
 * @returns {boolean}
 */
function checkTypedoc() {
  try {
    execSync('npx typedoc --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.log('TypeDoc نصب نشده است.');
    return false;
  }
}

/**
 * نصب TypeDoc
 */
function installTypedoc() {
  try {
    console.log('در حال نصب TypeDoc...');
    execSync('npm install --no-save typedoc@0.22.15', { stdio: 'inherit' });
    console.log('TypeDoc با موفقیت نصب شد.');
    return true;
  } catch (error) {
    console.error('خطا در نصب TypeDoc:', error.message);
    return false;
  }
}

/**
 * ایجاد پوشه مستندات
 */
function createDocsDir() {
  const docsDir = path.join(__dirname, 'docs');
  const apiDir = path.join(docsDir, 'api');
  
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
    console.log('پوشه docs ایجاد شد.');
  }
  
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir);
    console.log('پوشه docs/api ایجاد شد.');
  }
}

/**
 * تولید مستندات
 */
function generateDocs() {
  try {
    const configPath = path.join(__dirname, 'typedoc.json');
    
    // ایجاد فایل تنظیمات موقت
    fs.writeFileSync(configPath, JSON.stringify(typedocConfig, null, 2));
    
    console.log('در حال تولید مستندات API...');
    execSync('npx typedoc --options typedoc.json', { stdio: 'inherit' });
    
    // حذف فایل تنظیمات موقت
    fs.unlinkSync(configPath);
    
    console.log('مستندات API با موفقیت تولید شد.');
    return true;
  } catch (error) {
    console.error('خطا در تولید مستندات:', error.message);
    return false;
  }
}

/**
 * ایجاد فایل index.html برای مستندات
 */
function createIndexHtml() {
  const indexPath = path.join(__dirname, 'docs', 'index.html');
  const content = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مستندات دستیار هوشمند پیشرفته</title>
  <style>
    body {
      font-family: 'Tahoma', 'Arial', sans-serif;
      margin: 0;
      padding: 20px;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1, h2, h3 {
      color: #2c3e50;
    }
    
    h1 {
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
    }
    
    a {
      color: #3498db;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    .container {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-top: 20px;
    }
    
    .card {
      flex: 1;
      min-width: 300px;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 20px;
      background-color: #f9f9f9;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .card h2 {
      margin-top: 0;
      color: #2980b9;
    }
    
    ul {
      padding-right: 20px;
    }
    
    li {
      margin-bottom: 8px;
    }
    
    code {
      background-color: #f1f1f1;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: Consolas, monospace;
    }
    
    .theme-toggle {
      position: absolute;
      top: 20px;
      left: 20px;
      cursor: pointer;
      background: #f1f1f1;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
    }
    
    /* تم تاریک */
    body.dark-theme {
      background-color: #232323;
      color: #f0f0f0;
    }
    
    body.dark-theme h1, 
    body.dark-theme h2, 
    body.dark-theme h3 {
      color: #e0e0e0;
    }
    
    body.dark-theme a {
      color: #5dade2;
    }
    
    body.dark-theme .card {
      background-color: #333;
      border-color: #444;
    }
    
    body.dark-theme code {
      background-color: #444;
    }
    
    body.dark-theme h1 {
      border-bottom-color: #444;
    }
    
    body.dark-theme .theme-toggle {
      background: #444;
      color: #f0f0f0;
    }
  </style>
</head>
<body>
  <button class="theme-toggle" onclick="toggleTheme()">تغییر تم</button>
  
  <h1>مستندات دستیار هوشمند پیشرفته</h1>
  
  <p>به مستندات پروژه دستیار هوشمند پیشرفته خوش آمدید. این مستندات شامل اطلاعات لازم برای استفاده و توسعه اپلیکیشن می‌باشد.</p>
  
  <div class="container">
    <div class="card">
      <h2>معرفی</h2>
      <p>دستیار هوشمند پیشرفته یک برنامه دسکتاپ برای مدیریت کارها و وظایف با امکانات پیشرفته است که با استفاده از Electron و React ساخته شده است.</p>
      <p>این برنامه برای سازمان‌ها و افرادی طراحی شده که به ابزاری قدرتمند برای مدیریت کارهای روزانه نیاز دارند.</p>
    </div>
    
    <div class="card">
      <h2>مستندات API</h2>
      <p>مستندات کامل APIهای داخلی برنامه در اینجا قابل دسترسی است:</p>
      <ul>
        <li><a href="api/index.html">مستندات API</a></li>
      </ul>
      <p>این مستندات شامل توضیحات کامل درباره کلاس‌ها، متدها و توابع پروژه می‌باشد.</p>
    </div>
  </div>
  
  <div class="container">
    <div class="card">
      <h2>راهنمای کاربر</h2>
      <p>آموزش استفاده از برنامه برای کاربران:</p>
      <ul>
        <li><a href="#">نصب و راه‌اندازی</a></li>
        <li><a href="#">مدیریت کاربران</a></li>
        <li><a href="#">مدیریت تسک‌ها</a></li>
        <li><a href="#">تنظیمات برنامه</a></li>
        <li><a href="#">سفارشی‌سازی رابط کاربری</a></li>
      </ul>
    </div>
    
    <div class="card">
      <h2>راهنمای توسعه‌دهندگان</h2>
      <p>اطلاعات مفید برای توسعه‌دهندگان:</p>
      <ul>
        <li><a href="#">ساختار پروژه</a></li>
        <li><a href="#">معماری برنامه</a></li>
        <li><a href="#">افزودن قابلیت‌های جدید</a></li>
        <li><a href="#">دیباگ و عیب‌یابی</a></li>
        <li><a href="#">انتشار نسخه جدید</a></li>
      </ul>
    </div>
  </div>
  
  <footer style="margin-top: 40px; text-align: center; font-size: 14px; color: #777;">
    <p>© 2023 Smart Team - تمامی حقوق محفوظ است.</p>
  </footer>
  
  <script>
    function toggleTheme() {
      document.body.classList.toggle('dark-theme');
      localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    }
    
    // بررسی تم ذخیره شده
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-theme');
    }
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync(indexPath, content);
  console.log('فایل index.html برای مستندات ایجاد شد.');
}

/**
 * اجرای اسکریپت
 */
async function run() {
  console.log('=== تولید مستندات API داخلی ===');
  
  // ایجاد پوشه‌های مستندات
  createDocsDir();
  
  // بررسی وجود TypeDoc
  if (!checkTypedoc()) {
    // نصب TypeDoc
    if (!installTypedoc()) {
      console.error('خطا در نصب TypeDoc. لطفاً به صورت دستی اقدام کنید:');
      console.error('npm install -g typedoc@0.22.15');
      process.exit(1);
    }
  }
  
  // تولید مستندات
  if (!generateDocs()) {
    console.error('خطا در تولید مستندات. لطفاً مطمئن شوید که کدها قابل کامپایل هستند.');
    process.exit(1);
  }
  
  // ایجاد صفحه اصلی مستندات
  createIndexHtml();
  
  console.log('تولید مستندات با موفقیت انجام شد.');
}

// اجرای اسکریپت
run().catch(err => {
  console.error('خطا در اجرای اسکریپت:', err);
  process.exit(1); 
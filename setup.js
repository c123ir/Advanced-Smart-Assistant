/**
 * اسکریپت راه‌اندازی اولیه پروژه
 * 
 * این اسکریپت برای ایجاد ساختار پوشه‌ها و راه‌اندازی اولیه پروژه استفاده می‌شود
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// مسیرهای مورد نیاز
const dirs = [
  'assets',
  'assets/icons',
  'assets/images',
  'dist',
  'src/core',
  'src/services',
  'src/ui',
  'src/ui/components',
  'src/ui/components/Layout',
  'src/ui/components/Dashboard',
  'src/ui/components/Tasks',
  'src/ui/components/Users',
  'src/ui/components/Settings',
  'src/ui/pages',
  'src/ui/styles',
  'src/ui/styles/base',
  'src/ui/styles/components',
  'src/ui/styles/pages',
  'src/ui/styles/themes',
  'src/utils'
];

// فایل‌های آیکون پیش‌فرض
const defaultIcons = {
  'assets/icons/icon.png': 'https://raw.githubusercontent.com/electron/electron/main/default_app/icon.png',
  'assets/icons/tray.png': 'https://raw.githubusercontent.com/electron/electron/main/default_app/icon.png',
  'assets/icons/info.png': 'https://raw.githubusercontent.com/electron/electron/main/default_app/icon.png',
  'assets/icons/success.png': 'https://raw.githubusercontent.com/electron/electron/main/default_app/icon.png',
  'assets/icons/warning.png': 'https://raw.githubusercontent.com/electron/electron/main/default_app/icon.png',
  'assets/icons/error.png': 'https://raw.githubusercontent.com/electron/electron/main/default_app/icon.png',
  'assets/images/favicon.png': 'https://raw.githubusercontent.com/electron/electron/main/default_app/icon.png',
  'assets/images/default-avatar.png': 'https://raw.githubusercontent.com/electron/electron/main/default_app/icon.png'
};

/**
 * ایجاد پوشه‌های مورد نیاز
 */
function createDirectories() {
  console.log('در حال ایجاد پوشه‌های مورد نیاز...');
  
  for (const dir of dirs) {
    const dirPath = path.join(__dirname, dir);
    
    if (!fs.existsSync(dirPath)) {
      console.log(`- ایجاد پوشه: ${dir}`);
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
  
  console.log('پوشه‌های مورد نیاز با موفقیت ایجاد شدند.');
}

/**
 * دانلود آیکون‌های پیش‌فرض
 */
async function downloadDefaultIcons() {
  console.log('در حال دانلود آیکون‌های پیش‌فرض...');
  
  // استفاده از curl یا wget برای دانلود فایل‌ها
  for (const [destPath, url] of Object.entries(defaultIcons)) {
    const fullPath = path.join(__dirname, destPath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`- دانلود آیکون: ${destPath}`);
      
      try {
        // دانلود فایل با curl
        execSync(`curl -s -o "${fullPath}" "${url}"`, { stdio: 'inherit' });
      } catch (error) {
        console.error(`خطا در دانلود آیکون ${destPath}:`, error.message);
      }
    }
  }
  
  console.log('آیکون‌های پیش‌فرض با موفقیت دانلود شدند.');
}

/**
 * نصب وابستگی‌ها
 */
function installDependencies() {
  console.log('در حال بررسی و نصب وابستگی‌ها...');
  
  // بررسی وجود node_modules
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('در حال نصب وابستگی‌ها (این فرآیند ممکن است چند دقیقه طول بکشد)...');
    
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('وابستگی‌ها با موفقیت نصب شدند.');
    } catch (error) {
      console.error('خطا در نصب وابستگی‌ها:', error.message);
      console.log('لطفاً به صورت دستی دستور `npm install` را اجرا کنید.');
    }
  } else {
    console.log('وابستگی‌ها قبلاً نصب شده‌اند.');
  }
}

/**
 * بیلد اولیه پروژه
 */
function initialBuild() {
  console.log('در حال بیلد اولیه پروژه...');
  
  try {
    execSync('npm run compile', { stdio: 'inherit' });
    console.log('بیلد TypeScript با موفقیت انجام شد.');
  } catch (error) {
    console.error('خطا در بیلد پروژه:', error.message);
    console.log('لطفاً به صورت دستی دستور `npm run compile` را اجرا کنید.');
  }
}

/**
 * اجرای اسکریپت راه‌اندازی
 */
async function run() {
  console.log('=== راه‌اندازی دستیار هوشمند پیشرفته ===');
  
  try {
    // ایجاد پوشه‌ها
    createDirectories();
    
    // دانلود آیکون‌های پیش‌فرض
    await downloadDefaultIcons();
    
    // نصب وابستگی‌ها
    installDependencies();
    
    // بیلد اولیه
    initialBuild();
    
    console.log('\n=== راه‌اندازی با موفقیت انجام شد ===');
    console.log('برای اجرای برنامه در محیط توسعه، دستور `npm run dev` را اجرا کنید.');
  } catch (error) {
    console.error('خطا در راه‌اندازی پروژه:', error);
  }
}

// اجرای اسکریپت
run(); 
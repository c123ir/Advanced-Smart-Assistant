/**
 * اجرای تست‌های برنامه
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// مسیر فایل تست
const testFile = path.join(__dirname, 'dist', 'test.js');

// بررسی وجود فایل تست
if (!fs.existsSync(testFile)) {
  console.error('فایل تست یافت نشد. لطفاً ابتدا پروژه را بیلد کنید.');
  process.exit(1);
}

console.log('در حال اجرای تست‌ها...');

// اجرای فایل تست با الکترون
const electron = spawn('npx', ['electron', testFile], {
  stdio: 'inherit',
  shell: true
});

// رویداد خروج
electron.on('close', (code) => {
  console.log(`تست‌ها با کد ${code} به پایان رسیدند`);
  process.exit(code);
});

// رویداد خطا
electron.on('error', (err) => {
  console.error('خطا در اجرای تست‌ها:', err);
  process.exit(1);
}); 
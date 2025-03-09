/*********************************************************
  نام فایل: 01-Coding-Standards.md
  مسیر: docs/smart-docs/03-Development-Guide/01-Coding-Standards.md
*********************************************************/
/* به نام خدای نزدیک */

# استانداردهای کدنویسی (Coding Standards)

این مستند استانداردهای کدنویسی در پروژه دستیار هوشمند توسعه را توضیح می‌دهد.

## 1. استانداردهای عمومی

### 1.1. فرمت‌بندی کد
- تورفتگی با 2 فاصله
- حداکثر طول هر خط 100 کاراکتر
- آکولاد باز در همان خط دستور
- فاصله بین عملگرها
- یک خط خالی بین بلوک‌های کد مرتبط

### 1.2. نام‌گذاری
- **کلاس‌ها و اینترفیس‌ها**: PascalCase (مثال: `UserService`)
- **متدها و متغیرها**: camelCase (مثال: `getUserById`)
- **ثابت‌ها**: UPPER_SNAKE_CASE (مثال: `MAX_RETRY_COUNT`)
- **فایل‌ها**: 
  - کامپوننت‌های React: PascalCase (مثال: `UserCard.tsx`)
  - سایر فایل‌های TypeScript: camelCase (مثال: `userService.ts`)
- **نام‌ها باید توصیفی و معنادار باشند**

### 1.3. کامنت‌گذاری و مستندسازی
- کامنت‌های توصیفی برای بلوک‌های پیچیده کد
- استفاده از JSDoc/TSDoc برای توابع و کلاس‌ها:

```typescript
/**
 * توضیحات تابع یا کلاس
 * @param paramName توضیح پارامتر
 * @returns توضیح مقدار بازگشتی
 */
```

- درج کامنت TODO برای کارهای ناتمام با فرمت: `// TODO: توضیحات`

## 2. استانداردهای TypeScript

### 2.1. تایپ‌ها
- استفاده از strict mode
- تعریف واضح تایپ پارامترها و مقادیر بازگشتی
- استفاده از اینترفیس‌ها برای تعریف ساختار داده‌ها

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
```

### 2.2. استفاده از async/await
- به جای Promise chain از async/await استفاده کنید
- خطاها را با try/catch مدیریت کنید

```typescript
async function getUser(id: string): Promise<User> {
  try {
    const result = await database.query('SELECT * FROM users WHERE id = ?', id);
    return result;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('User could not be retrieved');
  }
}
```

## 3. استانداردهای React

### 3.1. کامپوننت‌ها
- ترجیحاً از کامپوننت‌های تابعی (Functional Components) استفاده کنید
- استفاده از React Hooks برای مدیریت state و side effects
- تفکیک منطق برنامه از UI

```tsx
// بد
function UserList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);
  
  return (
    <div>
      {users.map(user => <div key={user.id}>{user.name}</div>)}
    </div>
  );
}

// خوب
function UserList() {
  const users = useUsers(); // هوک سفارشی برای دریافت کاربران
  
  return <UserListView users={users} />;
}

function UserListView({ users }) {
  return (
    <div>
      {users.map(user => <UserItem key={user.id} user={user} />)}
    </div>
  );
}
```

### 3.2. مدیریت state
- state های محلی با useState
- state های پیچیده با useReducer
- state های سراسری با Context API

## 4. مدیریت خطا

### 4.1. استراتژی مدیریت خطا
- استفاده از try/catch برای مدیریت خطاها
- لاگ کردن خطاها با جزئیات کافی
- بازگرداندن پیام‌های خطای مناسب به کاربر

```typescript
try {
  await userService.delete(userId);
} catch (error) {
  console.error('Error deleting user:', error);
  
  if (error.code === 'FOREIGN_KEY_CONSTRAINT') {
    showError('این کاربر به دلیل وجود وابستگی قابل حذف نیست.');
  } else {
    showError('خطایی در حذف کاربر رخ داد.');
  }
}
```

### 4.2. خطایاب‌ها (Linters)
- پروژه از ESLint برای بررسی کیفیت کد استفاده می‌کند
- قبل از commit، مطمئن شوید که کد از تمام قوانین ESLint پیروی می‌کند
- استفاده از Prettier برای فرمت‌بندی خودکار کد

## 5. اعتبارسنجی ورودی‌ها

- اعتبارسنجی تمام ورودی‌های کاربر در سمت کلاینت و سرور
- استفاده از الگوهای مناسب برای اعتبارسنجی (ایمیل، تلفن و غیره)
- مدیریت مناسب خطاهای اعتبارسنجی و نمایش آن‌ها به کاربر

---

## نکات اضافی
- **رویکرد ماژولار**: کد را در ماژول‌های کوچک و قابل استفاده مجدد تقسیم کنید
- **اصول SOLID**: رعایت اصول SOLID در طراحی کلاس‌ها و ماژول‌ها
- **برنامه‌نویسی دفاعی**: همیشه بدترین حالت‌ها را در نظر بگیرید و کد را برای مدیریت آن‌ها آماده کنید
- **تست‌پذیری**: کد را به گونه‌ای بنویسید که به راحتی قابل تست باشد

---

## منابع و مراجع
- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript) 
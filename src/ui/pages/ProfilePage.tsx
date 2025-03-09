import React, { useState } from 'react';
// import * as FaIcons from 'react-icons/fa';
import '../styles/pages/profile.scss';
import { User } from '../../types/models';

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  phone: string;
  avatar?: string;
  bio: string;
  lastLogin: string;
  joinDate: string;
}

interface ProfilePageProps {
  user: User | null;
}

const initialProfile: UserProfile = {
  id: 1,
  name: 'علی محمدی',
  username: 'alimohammadi',
  email: 'ali.mohammadi@example.com',
  role: 'مدیر سیستم',
  phone: '09123456789',
  bio: 'توسعه‌دهنده و مدیر سیستم با بیش از 5 سال تجربه در زمینه طراحی و پیاده‌سازی نرم‌افزارهای دسکتاپ و وب.',
  lastLogin: '1402/12/15 14:30',
  joinDate: '1399/06/24',
};

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  // در اینجا می‌توانیم از اطلاعات کاربر دریافتی استفاده کنیم
  // برای مثال: if (user) { initialProfile = { ...initialProfile, ...user } }
  
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    
    setSaveSuccess(false);
  };

  const handleSave = () => {
    // شبیه‌سازی ذخیره‌سازی با یک تاخیر
    setTimeout(() => {
      setIsEditing(false);
      setSaveSuccess(true);
      
      // پاک کردن پیام موفقیت‌آمیز پس از چند ثانیه
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };

  const handleChangePassword = () => {
    // بررسی خالی نبودن فیلدها
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('لطفاً تمامی فیلدها را پر کنید');
      return;
    }
    
    // بررسی یکسان بودن رمز عبور جدید و تکرار آن
    if (newPassword !== confirmPassword) {
      setPasswordError('رمز عبور جدید و تکرار آن یکسان نیستند');
      return;
    }
    
    // بررسی حداقل طول رمز عبور
    if (newPassword.length < 8) {
      setPasswordError('رمز عبور باید حداقل 8 کاراکتر باشد');
      return;
    }
    
    // شبیه‌سازی تغییر رمز عبور با یک تاخیر
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setSaveSuccess(true);
      
      // پاک کردن پیام موفقیت‌آمیز پس از چند ثانیه
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="profile-title">پروفایل کاربری</h1>
        <div className="profile-actions">
          {!isEditing ? (
            <button 
              className="btn btn-primary" 
              onClick={() => setIsEditing(true)}
            >
              <span className="mr-2">ویرایش پروفایل</span>
            </button>
          ) : (
            <button 
              className="btn btn-success" 
              onClick={handleSave}
            >
              <span className="mr-2">ذخیره تغییرات</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="alert alert-success">
          اطلاعات با موفقیت ذخیره شد.
        </div>
      )}

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {profile.avatar ? 
                <img src={profile.avatar} alt={profile.name} /> : 
                getInitials(profile.name)
              }
            </div>
            {isEditing && (
              <button className="avatar-edit-btn">
                <span className="sr-only">تغییر تصویر</span>
              </button>
            )}
          </div>
          <h2 className="profile-name">{profile.name}</h2>
          <p className="profile-role">{profile.role}</p>
          
          <div className="profile-meta">
            <div className="meta-item">
              <span className="meta-label">تاریخ عضویت:</span>
              <span className="meta-value">{profile.joinDate}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">آخرین ورود:</span>
              <span className="meta-value">{profile.lastLogin}</span>
            </div>
          </div>
          
          {!isChangingPassword ? (
            <button 
              className="btn btn-outline-primary change-password-btn" 
              onClick={() => setIsChangingPassword(true)}
            >
              <span className="mr-2">تغییر رمز عبور</span>
            </button>
          ) : (
            <button 
              className="btn btn-outline-danger change-password-btn" 
              onClick={() => setIsChangingPassword(false)}
            >
              <span>انصراف</span>
            </button>
          )}
        </div>

        <div className="profile-main">
          {!isChangingPassword ? (
            <div className="profile-details">
              <h3 className="section-title">اطلاعات کاربری</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    نام کامل:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      className="form-control" 
                      value={profile.name}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="field-value">{profile.name}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="username">
                    نام کاربری:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      id="username" 
                      name="username" 
                      className="form-control" 
                      value={profile.username}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="field-value">{profile.username}</div>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">
                    ایمیل:
                  </label>
                  {isEditing ? (
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      className="form-control" 
                      value={profile.email}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="field-value">{profile.email}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">
                    شماره تماس:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      id="phone" 
                      name="phone" 
                      className="form-control" 
                      value={profile.phone}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="field-value">{profile.phone}</div>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="bio">
                    درباره من:
                  </label>
                  {isEditing ? (
                    <textarea 
                      id="bio" 
                      name="bio" 
                      className="form-control" 
                      value={profile.bio}
                      onChange={handleProfileChange}
                      rows={4}
                    />
                  ) : (
                    <div className="field-value field-value-multiline">{profile.bio}</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="change-password-container">
              <h3 className="section-title">تغییر رمز عبور</h3>
              
              {passwordError && (
                <div className="alert alert-danger">
                  {passwordError}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="currentPassword">
                  رمز عبور فعلی:
                </label>
                <input 
                  type="password" 
                  id="currentPassword" 
                  className="form-control" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">
                  رمز عبور جدید:
                </label>
                <input 
                  type="password" 
                  id="newPassword" 
                  className="form-control" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  تکرار رمز عبور جدید:
                </label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  className="form-control" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <button 
                className="btn btn-primary mt-3" 
                onClick={handleChangePassword}
              >
                <span className="mr-2">ذخیره رمز عبور جدید</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 
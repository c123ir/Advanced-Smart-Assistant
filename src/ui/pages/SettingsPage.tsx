import React, { useState } from 'react';
// import * as FaIcons from 'react-icons/fa';
import '../styles/pages/settings.scss';

interface Settings {
  general: {
    language: string;
    theme: string;
    autoUpdate: boolean;
    startAtLogin: boolean;
  };
  notifications: {
    enableNotifications: boolean;
    soundAlerts: boolean;
    taskReminders: boolean;
    systemUpdates: boolean;
  };
  appearance: {
    fontSize: string;
    density: string;
    menuPosition: string;
    showAnimations: boolean;
  };
  security: {
    requirePasswordOnStart: boolean;
    lockAfterMinutes: number;
    enableTwoFactor: boolean;
    rememberSessions: boolean;
  };
  advanced: {
    enableLogging: boolean;
    logLevel: string;
    dataExportFormat: string;
    clearCacheOnExit: boolean;
  };
}

const initialSettings: Settings = {
  general: {
    language: 'fa',
    theme: 'light',
    autoUpdate: true,
    startAtLogin: false,
  },
  notifications: {
    enableNotifications: true,
    soundAlerts: true,
    taskReminders: true,
    systemUpdates: true,
  },
  appearance: {
    fontSize: 'medium',
    density: 'comfortable',
    menuPosition: 'right',
    showAnimations: true,
  },
  security: {
    requirePasswordOnStart: false,
    lockAfterMinutes: 10,
    enableTwoFactor: false,
    rememberSessions: true,
  },
  advanced: {
    enableLogging: true,
    logLevel: 'info',
    dataExportFormat: 'json',
    clearCacheOnExit: false,
  },
};

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
    
    setIsDirty(true);
    setSaveSuccess(false);
  };

  const handleNotificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked
      }
    }));
    
    setIsDirty(true);
    setSaveSuccess(false);
  };

  const handleAppearanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
    
    setIsDirty(true);
    setSaveSuccess(false);
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [name]: type === 'checkbox' ? checked : value === '' ? 0 : type === 'number' ? parseInt(value) : value
      }
    }));
    
    setIsDirty(true);
    setSaveSuccess(false);
  };

  const handleAdvancedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setSettings(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
    
    setIsDirty(true);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // شبیه‌سازی ذخیره‌سازی با یک تاخیر
    setTimeout(() => {
      setIsSaving(false);
      setIsDirty(false);
      setSaveSuccess(true);
      
      // پاک کردن پیام موفقیت‌آمیز پس از چند ثانیه
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setIsDirty(true);
    setSaveSuccess(false);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">تنظیمات</h1>
        <div className="settings-actions">
          <button 
            className="btn btn-outline-primary" 
            onClick={handleReset}
            disabled={isSaving}
          >
            <span className="mr-2">بازنشانی</span>
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'در حال ذخیره...' : (
              <>
                <span className="mr-2">ذخیره تغییرات</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="alert alert-success">
          تنظیمات با موفقیت ذخیره شد.
        </div>
      )}

      <div className="settings-container">
        <div className="settings-sidebar">
          <ul className="settings-tabs">
            <li 
              className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <span className="settings-tab-text">عمومی</span>
            </li>
            <li 
              className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <span className="settings-tab-text">اعلان‌ها</span>
            </li>
            <li 
              className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <span className="settings-tab-text">ظاهر</span>
            </li>
            <li 
              className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="settings-tab-text">امنیت</span>
            </li>
            <li 
              className={`settings-tab ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              <span className="settings-tab-text">پیشرفته</span>
            </li>
          </ul>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-panel">
              <h2 className="settings-panel-title">تنظیمات عمومی</h2>
              
              <div className="form-group">
                <label htmlFor="language">زبان:</label>
                <select 
                  id="language" 
                  name="language" 
                  className="form-control" 
                  value={settings.general.language}
                  onChange={handleGeneralChange}
                >
                  <option value="fa">فارسی</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="theme">تم:</label>
                <select 
                  id="theme" 
                  name="theme" 
                  className="form-control" 
                  value={settings.general.theme}
                  onChange={handleGeneralChange}
                >
                  <option value="light">روشن</option>
                  <option value="dark">تیره</option>
                  <option value="system">سیستم</option>
                </select>
              </div>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input 
                    type="checkbox" 
                    id="autoUpdate" 
                    name="autoUpdate" 
                    checked={settings.general.autoUpdate}
                    onChange={handleGeneralChange}
                  />
                  <label htmlFor="autoUpdate">به‌روزرسانی خودکار نرم‌افزار</label>
                </div>
              </div>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input 
                    type="checkbox" 
                    id="startAtLogin" 
                    name="startAtLogin" 
                    checked={settings.general.startAtLogin}
                    onChange={handleGeneralChange}
                  />
                  <label htmlFor="startAtLogin">اجرا هنگام ورود به سیستم</label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <h2 className="settings-panel-title">تنظیمات اعلان‌ها</h2>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input 
                    type="checkbox" 
                    id="enableNotifications" 
                    name="enableNotifications" 
                    checked={settings.notifications.enableNotifications}
                    onChange={handleNotificationsChange}
                  />
                  <label htmlFor="enableNotifications">فعال‌سازی اعلان‌ها</label>
                </div>
              </div>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input 
                    type="checkbox" 
                    id="soundAlerts" 
                    name="soundAlerts" 
                    checked={settings.notifications.soundAlerts}
                    onChange={handleNotificationsChange}
                    disabled={!settings.notifications.enableNotifications}
                  />
                  <label htmlFor="soundAlerts">صدای اعلان‌ها</label>
                </div>
              </div>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input 
                    type="checkbox" 
                    id="taskReminders" 
                    name="taskReminders" 
                    checked={settings.notifications.taskReminders}
                    onChange={handleNotificationsChange}
                    disabled={!settings.notifications.enableNotifications}
                  />
                  <label htmlFor="taskReminders">یادآوری تسک‌ها</label>
                </div>
              </div>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input 
                    type="checkbox" 
                    id="systemUpdates" 
                    name="systemUpdates" 
                    checked={settings.notifications.systemUpdates}
                    onChange={handleNotificationsChange}
                    disabled={!settings.notifications.enableNotifications}
                  />
                  <label htmlFor="systemUpdates">اعلان به‌روزرسانی سیستم</label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-panel">
              <h2 className="settings-panel-title">تنظیمات ظاهر</h2>
              
              <div className="form-group">
                <label htmlFor="fontSize">اندازه فونت:</label>
                <select 
                  id="fontSize" 
                  name="fontSize" 
                  className="form-control" 
                  value={settings.appearance.fontSize}
                  onChange={handleAppearanceChange}
                >
                  <option value="small">کوچک</option>
                  <option value="medium">متوسط</option>
                  <option value="large">بزرگ</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="density">فشردگی عناصر:</label>
                <select 
                  id="density" 
                  name="density" 
                  className="form-control" 
                  value={settings.appearance.density}
                  onChange={handleAppearanceChange}
                >
                  <option value="compact">فشرده</option>
                  <option value="comfortable">راحت</option>
                  <option value="spacious">جادار</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="menuPosition">موقعیت منو:</label>
                <select 
                  id="menuPosition" 
                  name="menuPosition" 
                  className="form-control" 
                  value={settings.appearance.menuPosition}
                  onChange={handleAppearanceChange}
                >
                  <option value="right">راست</option>
                  <option value="left">چپ</option>
                </select>
              </div>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input 
                    type="checkbox" 
                    id="showAnimations" 
                    name="showAnimations" 
                    checked={settings.appearance.showAnimations}
                    onChange={handleAppearanceChange}
                  />
                  <label htmlFor="showAnimations">نمایش انیمیشن‌ها</label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-panel">
              <h2 className="settings-panel-title">تنظیمات امنیت</h2>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input 
                    type="checkbox" 
                    id="requirePasswordOnStart" 
                    name="requirePasswordOnStart" 
                    checked={settings.security.requirePasswordOnStart}
                    onChange={handleSecurityChange}
                  />
                  <label htmlFor="requirePasswordOnStart">درخواست رمز عبور هنگام اجرا</label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="lockAfterMinutes">قفل خودکار پس از (دقیقه):</label>
                <input 
                  type="number" 
                  id="lockAfterMinutes" 
                  name="lockAfterMinutes" 
                  className="form-control" 
                  value={settings.security.lockAfterMinutes}
                  onChange={handleSecurityChange}
                  min="0"
                  max="60"
                />
              </div>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input 
                    type="checkbox" 
                    id="enableTwoFactor" 
                    name="enableTwoFactor" 
                    checked={settings.security.enableTwoFactor}
                    onChange={handleSecurityChange}
                  />
                  <label htmlFor="enableTwoFactor">فعال‌سازی احراز هویت دو مرحله‌ای</label>
                </div>
              </div>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input 
                    type="checkbox" 
                    id="rememberSessions" 
                    name="rememberSessions" 
                    checked={settings.security.rememberSessions}
                    onChange={handleSecurityChange}
                  />
                  <label htmlFor="rememberSessions">به یاد آوردن نشست‌ها</label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="settings-panel">
              <h2 className="settings-panel-title">تنظیمات پیشرفته</h2>
              
              <div className="alert alert-warning">
                تغییر این تنظیمات ممکن است بر عملکرد برنامه تأثیر بگذارد. فقط در صورت آگاهی از عواقب آن، تغییرات را اعمال کنید.
              </div>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input 
                    type="checkbox" 
                    id="enableLogging" 
                    name="enableLogging" 
                    checked={settings.advanced.enableLogging}
                    onChange={handleAdvancedChange}
                  />
                  <label htmlFor="enableLogging">فعال‌سازی گزارش‌گیری</label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="logLevel">سطح گزارش‌گیری:</label>
                <select 
                  id="logLevel" 
                  name="logLevel" 
                  className="form-control" 
                  value={settings.advanced.logLevel}
                  onChange={handleAdvancedChange}
                  disabled={!settings.advanced.enableLogging}
                >
                  <option value="error">خطا</option>
                  <option value="warn">هشدار</option>
                  <option value="info">اطلاعات</option>
                  <option value="debug">دیباگ</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="dataExportFormat">فرمت خروجی داده:</label>
                <select 
                  id="dataExportFormat" 
                  name="dataExportFormat" 
                  className="form-control" 
                  value={settings.advanced.dataExportFormat}
                  onChange={handleAdvancedChange}
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="xml">XML</option>
                </select>
              </div>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input 
                    type="checkbox" 
                    id="clearCacheOnExit" 
                    name="clearCacheOnExit" 
                    checked={settings.advanced.clearCacheOnExit}
                    onChange={handleAdvancedChange}
                  />
                  <label htmlFor="clearCacheOnExit">پاک کردن کش هنگام خروج</label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 
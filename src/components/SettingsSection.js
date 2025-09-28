import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Lock,
  Camera,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  Calendar,
  CreditCard,
  Stethoscope,
  FileText,
  Trash2,
  Download,
  Upload,
  Key,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_PET_PORTAL_URL,
  process.env.NEXT_PUBLIC_PET_PORTAL_ANON
);

const SettingsSection = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Profile Settings
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    date_of_birth: '',
    avatar_url: ''
  });

  // Notification Preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    appointment_reminder: { email: true, push: true, in_app: true },
    vaccination_due: { email: true, push: true, in_app: true },
    payment_overdue: { email: true, push: false, in_app: true },
    system_alert: { email: false, push: false, in_app: true },
    audit_alert: { email: false, push: false, in_app: true },
    welcome: { email: true, push: false, in_app: true },
    invoice_generated: { email: true, push: false, in_app: true },
    payment_received: { email: false, push: false, in_app: true }
  });

  // System Preferences
  const [systemPrefs, setSystemPrefs] = useState({
    theme: 'light', // light, dark, auto
    language: 'en',
    timezone: 'UTC',
    currency: 'PHP',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    auto_save: true,
    sound_enabled: true,
    desktop_notifications: true,
    email_frequency: 'immediate' // immediate, daily, weekly
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    login_notifications: true,
    session_timeout: 30, // minutes
    password_expiry: 90 // days
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (user?.id) {
      loadUserSettings();
    }
  }, [user?.id]);

  const loadUserSettings = async () => {
    setLoading(true);
    try {
      // Load profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setProfileData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          emergency_contact_name: profile.emergency_contact_name || '',
          emergency_contact_phone: profile.emergency_contact_phone || '',
          date_of_birth: profile.date_of_birth || '',
          avatar_url: profile.avatar_url || ''
        });
      }

      // Load notification preferences
      const { data: notifPrefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (notifPrefs && notifPrefs.length > 0) {
        const prefsObj = {};
        notifPrefs.forEach(pref => {
          prefsObj[pref.type] = {
            email: pref.email_enabled,
            push: pref.push_enabled,
            in_app: pref.in_app_enabled
          };
        });
        setNotificationPrefs({ ...notificationPrefs, ...prefsObj });
      }

    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveProfileSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile settings');
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationPreferences = async () => {
    setLoading(true);
    setError('');
    try {
      // Delete existing preferences
      await supabase
        .from('notification_preferences')
        .delete()
        .eq('user_id', user.id);

      // Insert new preferences
      const prefsToInsert = Object.entries(notificationPrefs).map(([type, prefs]) => ({
        user_id: user.id,
        type: type,
        email_enabled: prefs.email,
        push_enabled: prefs.push,
        in_app_enabled: prefs.in_app
      }));

      const { error } = await supabase
        .from('notification_preferences')
        .insert(prefsToInsert);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setError('Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      });

      if (error) throw error;

      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      // Export user data
      const userData = {
        profile: profileData,
        preferences: {
          notifications: notificationPrefs,
          system: systemPrefs
        },
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pet-portal-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
    }
  };

  const deleteAccount = async () => {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') return;

    setLoading(true);
    try {
      // This would typically require server-side implementation
      toast.info('Account deletion requested. Please contact support to complete this process.');
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to process account deletion');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'data', label: 'Data & Privacy', icon: FileText }
  ];

  const notificationTypes = [
    { key: 'appointment_reminder', label: 'Appointment Reminders', description: 'Get notified about upcoming appointments', icon: Calendar },
    { key: 'vaccination_due', label: 'Vaccination Alerts', description: 'Reminders when vaccinations are due', icon: Stethoscope },
    { key: 'payment_overdue', label: 'Payment Reminders', description: 'Notifications about overdue payments', icon: CreditCard },
    { key: 'invoice_generated', label: 'New Invoices', description: 'When new invoices are created', icon: FileText },
    { key: 'payment_received', label: 'Payment Confirmations', description: 'Confirmation of received payments', icon: CheckCircle },
    { key: 'system_alert', label: 'System Alerts', description: 'Important system notifications', icon: AlertCircle },
    { key: 'welcome', label: 'Welcome Messages', description: 'Welcome and onboarding messages', icon: Mail }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        {saved && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <CheckCircle size={16} />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={profileData.emergency_contact_name}
                    onChange={(e) => setProfileData({ ...profileData, emergency_contact_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={profileData.emergency_contact_phone}
                    onChange={(e) => setProfileData({ ...profileData, emergency_contact_phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveProfileSettings}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{loading ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                <p className="text-gray-600 mt-1">Choose how you want to be notified about different events</p>
              </div>

              <div className="space-y-4">
                {notificationTypes.map(type => {
                  const IconComponent = type.icon;
                  const prefs = notificationPrefs[type.key] || { email: false, push: false, in_app: false };
                  
                  return (
                    <div key={type.key} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <IconComponent size={20} className="text-orange-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{type.label}</h4>
                          <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                          
                          <div className="flex items-center space-x-6 mt-3">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={prefs.email}
                                onChange={(e) => setNotificationPrefs({
                                  ...notificationPrefs,
                                  [type.key]: { ...prefs, email: e.target.checked }
                                })}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              />
                              <span className="text-sm text-gray-700">Email</span>
                            </label>
                            
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={prefs.push}
                                onChange={(e) => setNotificationPrefs({
                                  ...notificationPrefs,
                                  [type.key]: { ...prefs, push: e.target.checked }
                                })}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              />
                              <span className="text-sm text-gray-700">Push</span>
                            </label>
                            
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={prefs.in_app}
                                onChange={(e) => setNotificationPrefs({
                                  ...notificationPrefs,
                                  [type.key]: { ...prefs, in_app: e.target.checked }
                                })}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              />
                              <span className="text-sm text-gray-700">In-App</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveNotificationPreferences}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>

              {/* Change Password */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={changePassword}
                    disabled={loading || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? <RefreshCw size={16} className="animate-spin" /> : <Key size={16} />}
                    <span>{loading ? 'Changing...' : 'Change Password'}</span>
                  </button>
                </div>
              </div>

              {/* Security Options */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h4 className="font-medium text-gray-900 mb-4">Security Options</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Login Notifications</p>
                      <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.login_notifications}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, login_notifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">System Preferences</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={systemPrefs.theme}
                    onChange={(e) => setSystemPrefs({ ...systemPrefs, theme: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={systemPrefs.language}
                    onChange={(e) => setSystemPrefs({ ...systemPrefs, language: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="en">English</option>
                    <option value="fil">Filipino</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={systemPrefs.currency}
                    onChange={(e) => setSystemPrefs({ ...systemPrefs, currency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="PHP">Philippine Peso (₱)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select
                    value={systemPrefs.date_format}
                    onChange={(e) => setSystemPrefs({ ...systemPrefs, date_format: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Auto-save</p>
                    <p className="text-sm text-gray-600">Automatically save changes as you type</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemPrefs.auto_save}
                      onChange={(e) => setSystemPrefs({ ...systemPrefs, auto_save: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Sound Effects</p>
                    <p className="text-sm text-gray-600">Play sounds for notifications and actions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemPrefs.sound_enabled}
                      onChange={(e) => setSystemPrefs({ ...systemPrefs, sound_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Data & Privacy</h3>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-xl p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Export Your Data</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Download a copy of all your data including profile information, pets, appointments, and billing records.
                  </p>
                  <button
                    onClick={exportData}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={16} />
                    <span>Export Data</span>
                  </button>
                </div>

                <div className="border border-red-200 rounded-xl p-6 bg-red-50">
                  <h4 className="font-medium text-red-900 mb-4">Danger Zone</h4>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={deleteAccount}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
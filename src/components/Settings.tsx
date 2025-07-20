import React from 'react';
import { ArrowLeft, Monitor, Moon, Sun, Type, Palette, Code2, Bell, Shield, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { settings, updateSettings } = useTheme();

  const fontSizes = [
    { label: 'Small', value: 12 },
    { label: 'Medium', value: 14 },
    { label: 'Large', value: 16 },
    { label: 'Extra Large', value: 18 }
  ];

  const themes = [
    { id: 'light', name: 'Light', icon: <Sun className="w-4 h-4" /> },
    { id: 'dark', name: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { id: 'system', name: 'System', icon: <Monitor className="w-4 h-4" /> }
  ];

  const codeThemes = [
    { id: 'vs-light', name: 'Visual Studio Light' },
    { id: 'vs-dark', name: 'Visual Studio Dark' },
    { id: 'github-light', name: 'GitHub Light' },
    { id: 'github-dark', name: 'GitHub Dark' },
    { id: 'monokai', name: 'Monokai' },
    { id: 'dracula', name: 'Dracula' }
  ];

  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
    { id: 'typescript', name: 'TypeScript' }
  ];

  const SettingSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-6">
        {icon}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Appearance Settings */}
          <SettingSection title="Appearance" icon={<Palette className="w-6 h-6 text-purple-500" />}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => updateSettings({ theme: theme.id as any })}
                      className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                        settings.theme === theme.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {theme.icon}
                      <span className="font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Font Size
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => updateSettings({ fontSize: size.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.fontSize === size.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium">{size.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{size.value}px</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SettingSection>

          {/* Code Editor Settings */}
          <SettingSection title="Code Editor" icon={<Code2 className="w-6 h-6 text-blue-500" />}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Editor Theme
                </label>
                <select
                  value={settings.codeTheme}
                  onChange={(e) => updateSettings({ codeTheme: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {codeThemes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Default Language
                </label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) => updateSettings({ defaultLanguage: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Auto-save</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Automatically save your code as you type</div>
                  </div>
                  <button
                    onClick={() => updateSettings({ autoSave: !settings.autoSave })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoSave ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Line Numbers</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Show line numbers in the code editor</div>
                  </div>
                  <button
                    onClick={() => updateSettings({ showLineNumbers: !settings.showLineNumbers })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.showLineNumbers ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.showLineNumbers ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Word Wrap</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Wrap long lines in the editor</div>
                  </div>
                  <button
                    onClick={() => updateSettings({ wordWrap: !settings.wordWrap })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.wordWrap ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.wordWrap ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </SettingSection>

          {/* Notifications */}
          <SettingSection title="Notifications" icon={<Bell className="w-6 h-6 text-yellow-500" />}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Daily Reminders</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Get reminded to practice coding daily</div>
                </div>
                <button
                  onClick={() => updateSettings({ dailyReminders: !settings.dailyReminders })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.dailyReminders ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.dailyReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Achievement Notifications</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Get notified when you earn achievements</div>
                </div>
                <button
                  onClick={() => updateSettings({ achievementNotifications: !settings.achievementNotifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.achievementNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.achievementNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Weekly Progress</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Receive weekly progress summaries</div>
                </div>
                <button
                  onClick={() => updateSettings({ weeklyProgress: !settings.weeklyProgress })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.weeklyProgress ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.weeklyProgress ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </SettingSection>

          {/* Privacy & Security */}
          <SettingSection title="Privacy & Security" icon={<Shield className="w-6 h-6 text-green-500" />}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Public Profile</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Make your profile visible to other users</div>
                </div>
                <button
                  onClick={() => updateSettings({ publicProfile: !settings.publicProfile })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.publicProfile ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.publicProfile ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Show Statistics</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Display your solving statistics publicly</div>
                </div>
                <button
                  onClick={() => updateSettings({ showStatistics: !settings.showStatistics })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showStatistics ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showStatistics ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                  Delete Account
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </div>
          </SettingSection>
        </div>
      </main>
    </div>
  );
};
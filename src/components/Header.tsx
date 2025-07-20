import React from 'react';
import { Play, Send, Settings, User, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  onViewChange: (view: 'welcome' | 'topics' | 'editor' | 'profile' | 'settings') => void;
  currentView: string;
}

const languages = [
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'cpp', name: 'C++', icon: '⚡' },
  { id: 'typescript', name: 'TypeScript', icon: '🔷' },
];

export const Header: React.FC<HeaderProps> = ({
  selectedLanguage,
  onLanguageChange,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  onViewChange,
  currentView
}) => {
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = React.useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);
  const currentLanguage = languages.find(lang => lang.id === selectedLanguage);
  const { user, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between transition-colors">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CE</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">CodeMaster</h1>
        </div>
        
        {currentView === 'editor' && (
          <div className="relative">
            <button
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <span className="text-lg">{currentLanguage?.icon}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{currentLanguage?.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            
            {isLanguageDropdownOpen && (
              <div className="absolute top-12 left-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      onLanguageChange(lang.id);
                      setIsLanguageDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                  >
                    <span className="text-lg">{lang.icon}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {currentView === 'editor' && (
          <>
            <button
              onClick={onRun}
              disabled={isRunning}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <span className="font-medium text-gray-700 dark:text-gray-300">{isRunning ? 'Running...' : 'Run'}</span>
            </button>
            
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              <span className="font-medium">{isSubmitting ? 'Submitting...' : 'Submit'}</span>
            </button>
          </>
        )}
        
        <button 
          onClick={() => onViewChange('settings')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-6 h-6 rounded-full"
            />
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          
          {isUserDropdownOpen && (
            <div className="absolute top-12 right-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
              <button
                onClick={() => {
                  onViewChange('profile');
                  setIsUserDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
              >
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Profile</span>
              </button>
              <button
                onClick={() => {
                  onViewChange('settings');
                  setIsUserDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Settings</span>
              </button>
              <hr className="my-2 border-gray-200 dark:border-gray-700" />
              <button
                onClick={() => {
                  logout();
                  setIsUserDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-red-600 dark:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
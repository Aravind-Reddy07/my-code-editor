import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  codeTheme: string;
  defaultLanguage: string;
  autoSave: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
  dailyReminders: boolean;
  achievementNotifications: boolean;
  weeklyProgress: boolean;
  publicProfile: boolean;
  showStatistics: boolean;
}

interface ThemeContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

const defaultSettings: Settings = {
  theme: 'light',
  fontSize: 14,
  codeTheme: 'vs-light',
  defaultLanguage: 'javascript',
  autoSave: true,
  showLineNumbers: true,
  wordWrap: false,
  dailyReminders: true,
  achievementNotifications: true,
  weeklyProgress: true,
  publicProfile: true,
  showStatistics: true
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  const value = {
    settings,
    updateSettings
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
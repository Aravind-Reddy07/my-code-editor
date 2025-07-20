import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserStats {
  problemsSolved: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  totalSubmissions: number;
  acceptanceRate: number;
}

interface UserContextType {
  userStats: UserStats;
  updateStats: (stats: Partial<UserStats>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userStats, setUserStats] = useState<UserStats>({
    problemsSolved: 127,
    currentStreak: 15,
    longestStreak: 42,
    rank: 1247,
    totalSubmissions: 247,
    acceptanceRate: 78.5
  });

  const updateStats = (stats: Partial<UserStats>) => {
    setUserStats(prev => ({ ...prev, ...stats }));
  };

  const value = {
    userStats,
    updateStats
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
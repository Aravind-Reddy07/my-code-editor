import React from 'react';
import { ArrowLeft, Trophy, Calendar, Target, TrendingUp, Code2, Clock, Star, Award, Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

interface UserProfileProps {
  onBack: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { userStats } = useUser();

  const achievements = [
    { id: 1, name: "First Problem Solved", icon: "🎯", earned: true, date: "2024-01-15" },
    { id: 2, name: "7-Day Streak", icon: "🔥", earned: true, date: "2024-01-22" },
    { id: 3, name: "Array Master", icon: "📊", earned: true, date: "2024-02-01" },
    { id: 4, name: "Speed Demon", icon: "⚡", earned: false, date: null },
    { id: 5, name: "Problem Solver", icon: "🧩", earned: true, date: "2024-02-10" },
    { id: 6, name: "Consistency King", icon: "👑", earned: false, date: null }
  ];

  const recentActivity = [
    { date: "2024-02-15", problem: "Two Sum", status: "Accepted", difficulty: "Easy" },
    { date: "2024-02-14", problem: "Valid Parentheses", status: "Accepted", difficulty: "Easy" },
    { date: "2024-02-14", problem: "Merge Two Sorted Lists", status: "Wrong Answer", difficulty: "Easy" },
    { date: "2024-02-13", problem: "Best Time to Buy Stock", status: "Accepted", difficulty: "Easy" },
    { date: "2024-02-12", problem: "Maximum Subarray", status: "Accepted", difficulty: "Medium" }
  ];

  const topicProgress = [
    { name: "Arrays", solved: 45, total: 150, percentage: 30 },
    { name: "Strings", solved: 28, total: 120, percentage: 23 },
    { name: "Linked Lists", solved: 15, total: 80, percentage: 19 },
    { name: "Trees", solved: 12, total: 200, percentage: 6 },
    { name: "Dynamic Programming", solved: 5, total: 160, percentage: 3 }
  ];

  const getStreakDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const hasActivity = Math.random() > 0.3; // Simulate activity
      days.push({
        date: date.getDate(),
        hasActivity,
        isToday: i === 0
      });
    }
    
    return days;
  };

  const streakDays = getStreakDays();

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-start space-x-6">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-24 h-24 rounded-full border-4 border-blue-500"
            />
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user?.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{user?.email}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.problemsSolved}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Problems Solved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.currentStreak}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.longestStreak}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Longest Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{userStats.rank}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Global Rank</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Streak Calendar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-6">
                <Flame className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Coding Streak</h3>
              </div>
              
              <div className="grid grid-cols-10 gap-1 mb-4">
                {streakDays.map((day, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 rounded text-xs flex items-center justify-center font-medium ${
                      day.hasActivity
                        ? day.isToday
                          ? 'bg-blue-500 text-white'
                          : 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    {day.date}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Last 30 days</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <span>No activity</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-6">
                <Target className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Topic Progress</h3>
              </div>
              
              <div className="space-y-4">
                {topicProgress.map((topic, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{topic.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {topic.solved}/{topic.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${topic.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
              
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.status === 'Accepted' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{activity.problem}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{activity.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        activity.status === 'Accepted' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {activity.status}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{activity.difficulty}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-6">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      achievement.earned
                        ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50 opacity-60'
                    }`}
                  >
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {achievement.name}
                    </div>
                    {achievement.earned && achievement.date && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(achievement.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-6 h-6 text-purple-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Statistics</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Acceptance Rate</span>
                  <span className="font-bold text-green-600 dark:text-green-400">78.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Average Runtime</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">142ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Languages Used</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Submissions</span>
                  <span className="font-bold text-gray-900 dark:text-white">247</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
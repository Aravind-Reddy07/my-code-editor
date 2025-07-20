import React from 'react';
import { ArrowRight, Code2, Trophy, Target, Zap, Star, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface WelcomePageProps {
  onContinue: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onContinue }) => {
  const { user } = useAuth();

  const stats = [
    { icon: <Code2 className="w-6 h-6" />, label: "Problems", value: "1,500+" },
    { icon: <Users className="w-6 h-6" />, label: "Active Users", value: "50K+" },
    { icon: <Trophy className="w-6 h-6" />, label: "Success Rate", value: "94%" },
    { icon: <TrendingUp className="w-6 h-6" />, label: "Companies", value: "200+" }
  ];

  const features = [
    {
      icon: <Target className="w-8 h-8 text-blue-500" />,
      title: "Structured Learning Path",
      description: "Follow our carefully designed curriculum covering all essential DSA topics from basics to advanced concepts."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Real-time Code Execution",
      description: "Test your solutions instantly with our powerful online judge system supporting multiple programming languages."
    },
    {
      icon: <Trophy className="w-8 h-8 text-green-500" />,
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed analytics, streak counters, and personalized performance insights."
    },
    {
      icon: <Star className="w-8 h-8 text-purple-500" />,
      title: "Interview Preparation",
      description: "Practice with problems from top tech companies and get ready for your dream job interviews."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CodeMaster</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-gray-700 font-medium">Welcome, {user?.name}!</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            <span>Welcome to your coding journey!</span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Master Data Structures &<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Algorithms
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers who have improved their coding skills and landed their dream jobs. 
            Start with our comprehensive curriculum designed by industry experts.
          </p>
          
          <button
            onClick={onContinue}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-3 text-blue-600">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CodeMaster?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our platform is designed to provide the most effective learning experience for mastering coding interviews.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:transform hover:scale-[1.02]">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Choose your learning path and begin solving problems tailored to your skill level and career goals.
          </p>
          <button
            onClick={onContinue}
            className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <span>Choose Topics</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
};
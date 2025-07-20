import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Clock, Star, TrendingUp, Code2 } from 'lucide-react';

interface TopicSelectionProps {
  onTopicSelect: () => void;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  problems: number;
  estimatedTime: string;
  icon: string;
  color: string;
  prerequisites?: string[];
}

const topics: Topic[] = [
  {
    id: 'arrays',
    name: 'Arrays',
    description: 'Master array manipulation, searching, and sorting algorithms',
    difficulty: 'Beginner',
    problems: 150,
    estimatedTime: '2-3 weeks',
    icon: '📊',
    color: 'from-blue-500 to-blue-600',
    prerequisites: []
  },
  {
    id: 'strings',
    name: 'Strings',
    description: 'String processing, pattern matching, and text algorithms',
    difficulty: 'Beginner',
    problems: 120,
    estimatedTime: '2-3 weeks',
    icon: '📝',
    color: 'from-green-500 to-green-600',
    prerequisites: []
  },
  {
    id: 'linked-lists',
    name: 'Linked Lists',
    description: 'Singly, doubly linked lists and their operations',
    difficulty: 'Beginner',
    problems: 80,
    estimatedTime: '1-2 weeks',
    icon: '🔗',
    color: 'from-purple-500 to-purple-600',
    prerequisites: []
  },
  {
    id: 'stacks-queues',
    name: 'Stacks & Queues',
    description: 'LIFO and FIFO data structures and their applications',
    difficulty: 'Beginner',
    problems: 90,
    estimatedTime: '1-2 weeks',
    icon: '📚',
    color: 'from-yellow-500 to-yellow-600',
    prerequisites: []
  },
  {
    id: 'trees',
    name: 'Trees',
    description: 'Binary trees, BST, AVL trees, and tree traversals',
    difficulty: 'Intermediate',
    problems: 200,
    estimatedTime: '3-4 weeks',
    icon: '🌳',
    color: 'from-emerald-500 to-emerald-600',
    prerequisites: ['linked-lists']
  },
  {
    id: 'graphs',
    name: 'Graphs',
    description: 'Graph representation, BFS, DFS, and shortest path algorithms',
    difficulty: 'Intermediate',
    problems: 180,
    estimatedTime: '3-4 weeks',
    icon: '🕸️',
    color: 'from-indigo-500 to-indigo-600',
    prerequisites: ['trees', 'stacks-queues']
  },
  {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    description: 'Optimization problems using memoization and tabulation',
    difficulty: 'Advanced',
    problems: 160,
    estimatedTime: '4-5 weeks',
    icon: '🧮',
    color: 'from-red-500 to-red-600',
    prerequisites: ['arrays', 'strings']
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    description: 'Efficient algorithms for subarray and substring problems',
    difficulty: 'Intermediate',
    problems: 70,
    estimatedTime: '1-2 weeks',
    icon: '🪟',
    color: 'from-cyan-500 to-cyan-600',
    prerequisites: ['arrays', 'strings']
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    description: 'Efficient techniques for array and string problems',
    difficulty: 'Intermediate',
    problems: 85,
    estimatedTime: '1-2 weeks',
    icon: '👆',
    color: 'from-pink-500 to-pink-600',
    prerequisites: ['arrays', 'strings']
  }
];

export const TopicSelection: React.FC<TopicSelectionProps> = ({ onTopicSelect }) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredTopics = topics.filter(topic => {
    if (filter === 'all') return true;
    return topic.difficulty.toLowerCase() === filter;
  });

  const totalProblems = selectedTopics.reduce((sum, topicId) => {
    const topic = topics.find(t => t.id === topicId);
    return sum + (topic?.problems || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Choose Your Learning Path</h1>
          </div>
          
          {selectedTopics.length > 0 && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {selectedTopics.length} topics • {totalProblems} problems
              </div>
              <button
                onClick={onTopicSelect}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Select Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Learning Topics</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose the data structures and algorithms topics you want to master. You can always add more topics later as you progress.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  filter === level
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {level === 'all' ? 'All Topics' : level}
              </button>
            ))}
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredTopics.map((topic) => {
            const isSelected = selectedTopics.includes(topic.id);
            const hasPrerequisites = topic.prerequisites && topic.prerequisites.length > 0;
            const prerequisitesMet = !hasPrerequisites || topic.prerequisites!.every(prereq => 
              selectedTopics.includes(prereq)
            );

            return (
              <div
                key={topic.id}
                className={`relative bg-white rounded-xl p-6 border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                  isSelected
                    ? 'border-blue-500 shadow-md transform scale-[1.02]'
                    : prerequisitesMet
                    ? 'border-gray-200 hover:border-gray-300'
                    : 'border-gray-100 opacity-60 cursor-not-allowed'
                }`}
                onClick={() => prerequisitesMet && handleTopicToggle(topic.id)}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{topic.icon}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(topic.difficulty)}`}>
                    {topic.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.name}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{topic.description}</p>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Code2 className="w-4 h-4" />
                    <span>{topic.problems} problems</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{topic.estimatedTime}</span>
                  </div>
                </div>

                {hasPrerequisites && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Prerequisites:</div>
                    <div className="flex flex-wrap gap-1">
                      {topic.prerequisites!.map((prereq) => {
                        const prereqTopic = topics.find(t => t.id === prereq);
                        const isPrereqMet = selectedTopics.includes(prereq);
                        return (
                          <span
                            key={prereq}
                            className={`px-2 py-1 rounded text-xs ${
                              isPrereqMet
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {prereqTopic?.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!prerequisitesMet && (
                  <div className="absolute inset-0 bg-white bg-opacity-50 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-gray-400 text-sm font-medium">Complete prerequisites first</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Topics Summary */}
        {selectedTopics.length > 0 && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Learning Path</h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{selectedTopics.length}</div>
                <div className="text-gray-600">Topics Selected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{totalProblems}</div>
                <div className="text-gray-600">Total Problems</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">8-12</div>
                <div className="text-gray-600">Weeks Estimated</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {selectedTopics.map((topicId) => {
                const topic = topics.find(t => t.id === topicId);
                if (!topic) return null;
                
                return (
                  <span
                    key={topicId}
                    className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${topic.color}`}
                  >
                    {topic.icon} {topic.name}
                  </span>
                );
              })}
            </div>

            <div className="text-center">
              <button
                onClick={onTopicSelect}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {selectedTopics.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">Select topics to create your personalized learning path</div>
            <div className="text-gray-500">Choose at least one topic to get started</div>
          </div>
        )}
      </main>
    </div>
  );
};
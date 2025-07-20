import React from 'react';
import { Clock, Users, TrendingUp, CheckCircle } from 'lucide-react';

interface ProblemDescriptionProps {
  problem: {
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    constraints: string[];
    tags: string[];
    acceptance: string;
    submissions: string;
  };
}

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ problem }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'Hard': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  return (
    <div className="h-full overflow-auto bg-white dark:bg-gray-900 transition-colors">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{problem.title}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
        </div>
        
        <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>Acceptance: {problem.acceptance}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>Submissions: {problem.submissions}</span>
          </div>
        </div>
        
        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{problem.description}</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Examples</h3>
          {problem.examples.map((example, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="font-medium text-gray-900 dark:text-white mb-2">Example {index + 1}:</div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Input:</span>
                  <code className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200">{example.input}</code>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Output:</span>
                  <code className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200">{example.output}</code>
                </div>
                {example.explanation && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Explanation:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{example.explanation}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Constraints</h3>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {problem.constraints.map((constraint, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-gray-400 dark:text-gray-500 mt-1">•</span>
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-800 dark:text-gray-200">{constraint}</code>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
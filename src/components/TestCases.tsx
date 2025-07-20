import React from 'react';
import { CheckCircle, XCircle, Clock, Play } from 'lucide-react';

interface TestCase {
  id: string;
  input: string;
  expected: string;
  output?: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  runtime?: string;
  memory?: string;
}

interface TestCasesProps {
  testCases: TestCase[];
  onRunTests: () => void;
  isRunning: boolean;
}

export const TestCases: React.FC<TestCasesProps> = ({ testCases, onRunTests, isRunning }) => {
  const [selectedCase, setSelectedCase] = React.useState<string>(testCases[0]?.id || '');

  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestCase['status']) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'running':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const selectedTestCase = testCases.find(tc => tc.id === selectedCase);
  const passedTests = testCases.filter(tc => tc.status === 'passed').length;
  const totalTests = testCases.length;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Test Cases</h3>
          {testCases.some(tc => tc.status !== 'pending') && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {passedTests}/{totalTests} passed
            </span>
          )}
        </div>
        
        <button
          onClick={onRunTests}
          disabled={isRunning}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Play className="w-4 h-4" />
          <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Test Cases List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 transition-colors">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Cases</span>
          </div>
          <div className="overflow-auto">
            {testCases.map((testCase) => (
              <button
                key={testCase.id}
                onClick={() => setSelectedCase(testCase.id)}
                className={`w-full text-left p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedCase === testCase.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Test Case {testCase.id}
                  </span>
                  {getStatusIcon(testCase.status)}
                </div>
                {testCase.runtime && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {testCase.runtime} • {testCase.memory}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Test Case Details */}
        <div className="flex-1 p-4 overflow-auto">
          {selectedTestCase ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Test Case {selectedTestCase.id}
                </h4>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedTestCase.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTestCase.status)}`}>
                    {selectedTestCase.status.charAt(0).toUpperCase() + selectedTestCase.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Input</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                    <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">{selectedTestCase.input}</code>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expected Output</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                    <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">{selectedTestCase.expected}</code>
                  </div>
                </div>
                
                {selectedTestCase.output && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Output</label>
                    <div className={`p-3 rounded-lg border ${
                      selectedTestCase.status === 'passed' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                      <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">{selectedTestCase.output}</code>
                    </div>
                  </div>
                )}
                
                {selectedTestCase.runtime && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span><strong>Runtime:</strong> {selectedTestCase.runtime}</span>
                    <span><strong>Memory:</strong> {selectedTestCase.memory}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <p>Select a test case to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
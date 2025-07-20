import React, { useState, useCallback, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { WelcomePage } from './components/WelcomePage';
import { TopicSelection } from './components/TopicSelection';
import { Header } from './components/Header';
import { ProblemDescription } from './components/ProblemDescription';
import { CodeEditor } from './components/CodeEditor';
import { TestCases } from './components/TestCases';
import { Submissions } from './components/Submissions';
import { UserProfile } from './components/UserProfile';
import { Settings } from './components/Settings';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider, useUser } from './contexts/UserContext';

// Sample problem data
const sampleProblem = {
  title: "Two Sum",
  difficulty: "Easy" as const,
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]"
    },
    {
      input: "nums = [3,3], target = 6",
      output: "[0,1]"
    }
  ],
  constraints: [
    "2 <= nums.length <= 10⁴",
    "-10⁹ <= nums[i] <= 10⁹",
    "-10⁹ <= target <= 10⁹",
    "Only one valid answer exists."
  ],
  tags: ["Array", "Hash Table"],
  acceptance: "51.3%",
  submissions: "3.2M"
};

// Sample test cases
const initialTestCases = [
  {
    id: "1",
    input: "nums = [2,7,11,15], target = 9",
    expected: "[0,1]",
    status: "pending" as const
  },
  {
    id: "2",
    input: "nums = [3,2,4], target = 6",
    expected: "[1,2]",
    status: "pending" as const
  },
  {
    id: "3",
    input: "nums = [3,3], target = 6",
    expected: "[0,1]",
    status: "pending" as const
  }
];

// Sample submissions data
const sampleSubmissions = [
  {
    id: "1",
    status: "Accepted",
    language: "JavaScript",
    runtime: "68 ms",
    memory: "42.1 MB",
    timestamp: "2 minutes ago",
    code: `var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
};`
  },
  {
    id: "2",
    status: "Wrong Answer",
    language: "Python",
    runtime: "N/A",
    memory: "N/A",
    timestamp: "5 minutes ago",
    code: `def twoSum(self, nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`
  },
  {
    id: "3",
    status: "Accepted",
    language: "TypeScript",
    runtime: "72 ms",
    memory: "44.2 MB",
    timestamp: "10 minutes ago",
    code: `function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}`
  }
];

type AppView = 'welcome' | 'topics' | 'editor' | 'profile' | 'settings';

function AppContent() {
  const { user } = useAuth();
  const { userStats } = useUser();
  const { settings } = useTheme();
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [testCases, setTestCases] = useState(initialTestCases);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'testcases' | 'submissions'>('testcases');
  const [leftPanelWidth, setLeftPanelWidth] = useState(45);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(35);

  const handleLanguageChange = useCallback((language: string) => {
    setSelectedLanguage(language);
    setCode('');
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleRun = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setActiveBottomTab('testcases');
    
    const updatedTestCases = [...testCases];
    
    for (let i = 0; i < updatedTestCases.length; i++) {
      updatedTestCases[i].status = 'running';
      setTestCases([...updatedTestCases]);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const passed = Math.random() > 0.3;
      updatedTestCases[i].status = passed ? 'passed' : 'failed';
      updatedTestCases[i].output = passed ? updatedTestCases[i].expected : '[1,0]';
      updatedTestCases[i].runtime = `${Math.floor(Math.random() * 100) + 50} ms`;
      updatedTestCases[i].memory = `${(Math.random() * 10 + 40).toFixed(1)} MB`;
      
      setTestCases([...updatedTestCases]);
    }
    
    setIsRunning(false);
  }, [isRunning, testCases]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setActiveBottomTab('submissions');
  }, [isSubmitting]);

  const handleRunTests = useCallback(() => {
    handleRun();
  }, [handleRun]);

  if (!user) {
    return <AuthPage />;
  }

  if (currentView === 'welcome') {
    return <WelcomePage onContinue={() => setCurrentView('topics')} />;
  }

  if (currentView === 'topics') {
    return <TopicSelection onTopicSelect={() => setCurrentView('editor')} />;
  }

  if (currentView === 'profile') {
    return <UserProfile onBack={() => setCurrentView('editor')} />;
  }

  if (currentView === 'settings') {
    return <Settings onBack={() => setCurrentView('editor')} />;
  }

  return (
    <div className={`h-screen flex flex-col ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 transition-colors">
        <Header
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
          onRun={handleRun}
          onSubmit={handleSubmit}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
          onViewChange={setCurrentView}
          currentView={currentView}
        />
      </div>
      
      <div className="flex-1 flex overflow-hidden bg-gray-100 dark:bg-gray-800 transition-colors">
        <div 
          className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden transition-colors"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <ProblemDescription problem={sampleProblem} />
        </div>
        
        <div 
          className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-col-resize transition-colors"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = leftPanelWidth;
            
            const handleMouseMove = (e: MouseEvent) => {
              const deltaX = e.clientX - startX;
              const containerWidth = window.innerWidth;
              const newWidth = startWidth + (deltaX / containerWidth) * 100;
              setLeftPanelWidth(Math.max(25, Math.min(65, newWidth)));
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
        
        <div className="flex-1 flex flex-col">
          <div 
            className="bg-white dark:bg-gray-900 overflow-hidden transition-colors"
            style={{ height: `${100 - bottomPanelHeight}%` }}
          >
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              language={selectedLanguage}
            />
          </div>
          
          <div 
            className="h-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-row-resize transition-colors"
            onMouseDown={(e) => {
              const startY = e.clientY;
              const startHeight = bottomPanelHeight;
              
              const handleMouseMove = (e: MouseEvent) => {
                const deltaY = startY - e.clientY;
                const containerHeight = window.innerHeight - 80;
                const newHeight = startHeight + (deltaY / containerHeight) * 100;
                setBottomPanelHeight(Math.max(20, Math.min(60, newHeight)));
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
          
          <div 
            className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 overflow-hidden transition-colors"
            style={{ height: `${bottomPanelHeight}%` }}
          >
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors">
              <button
                onClick={() => setActiveBottomTab('testcases')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeBottomTab === 'testcases'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Test Cases
              </button>
              <button
                onClick={() => setActiveBottomTab('submissions')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeBottomTab === 'submissions'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Submissions
              </button>
            </div>
            
            <div className="h-full overflow-hidden">
              {activeBottomTab === 'testcases' && (
                <TestCases
                  testCases={testCases}
                  onRunTests={handleRunTests}
                  isRunning={isRunning}
                />
              )}
              {activeBottomTab === 'submissions' && (
                <Submissions submissions={sampleSubmissions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
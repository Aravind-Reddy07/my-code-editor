import React from 'react';
import { Copy, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [displayCode, setDisplayCode] = React.useState(code);
  
  // Initialize with default code when language changes or code is empty
  React.useEffect(() => {
    if (!code) {
      const defaultCode = getDefaultCode(language);
      setDisplayCode(defaultCode);
      onChange(defaultCode);
    } else {
      setDisplayCode(code);
    }
  }, [language, code, onChange]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
  };

  const handleReset = () => {
    const defaultCode = getDefaultCode(language);
    setDisplayCode(defaultCode);
    onChange(defaultCode);
  };

  const getDefaultCode = (lang: string) => {
    switch (lang) {
      case 'javascript':
        return `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your solution here
    
};`;
      case 'python':
        return `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your solution here
        pass`;
      case 'java':
        return `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        
    }
}`;
      case 'cpp':
        return `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your solution here
        
    }
};`;
      case 'typescript':
        return `function twoSum(nums: number[], target: number): number[] {
    // Your solution here
    
}`;
      default:
        return '// Your solution here';
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setDisplayCode(newCode);
    onChange(newCode);
  };

  const lineNumbers = displayCode.split('\n').map((_, index) => index + 1);

  return (
    <div className={`bg-white dark:bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} flex flex-col transition-colors`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">Code Editor</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">({language})</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Copy code"
          >
            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Reset to default"
          >
            <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative bg-gray-50 dark:bg-gray-800 transition-colors">
        {/* Line numbers */}
        <div className="absolute left-0 top-0 w-12 bg-gray-100 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 h-full overflow-hidden transition-colors">
          <div className="p-4 text-right text-sm font-mono text-gray-400 dark:text-gray-500 leading-relaxed">
            {lineNumbers.map((num) => (
              <div key={num} className="h-6">
                {num}
              </div>
            ))}
          </div>
        </div>
        
        {/* Code textarea */}
        <textarea
          value={displayCode}
          onChange={handleCodeChange}
          className="w-full h-full pl-16 pr-4 py-4 font-mono text-sm leading-relaxed resize-none outline-none bg-transparent text-gray-800 dark:text-gray-200"
          placeholder="Write your solution here..."
          spellCheck={false}
          style={{ minHeight: isFullscreen ? 'calc(100vh - 80px)' : '100%' }}
        />
        
        {/* Syntax highlighting overlay could go here */}
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Copy } from 'lucide-react';

interface Submission {
  id: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error' | 'Compile Error';
  language: string;
  runtime: string;
  memory: string;
  timestamp: string;
  code: string;
}

interface SubmissionsProps {
  submissions: Submission[];
}

export const Submissions: React.FC<SubmissionsProps> = ({ submissions }) => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'text-green-600 bg-green-50';
      case 'Wrong Answer':
        return 'text-red-600 bg-red-50';
      case 'Time Limit Exceeded':
        return 'text-orange-600 bg-orange-50';
      case 'Memory Limit Exceeded':
        return 'text-purple-600 bg-purple-50';
      case 'Runtime Error':
        return 'text-red-600 bg-red-50';
      case 'Compile Error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Wrong Answer':
      case 'Runtime Error':
      case 'Compile Error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-orange-500" />;
    }
  };

  const handleViewCode = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleCloseModal = () => {
    setSelectedSubmission(null);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <div className="flex-1 overflow-auto">
        {submissions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-lg font-medium">No submissions yet</p>
              <p className="text-sm">Submit your solution to see it here</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {submissions.map((submission) => (
              <div key={submission.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(submission.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{submission.language}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>{submission.timestamp}</span>
                        {submission.runtime !== 'N/A' && (
                          <>
                            <span>Runtime: {submission.runtime}</span>
                            <span>Memory: {submission.memory}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewCode(submission)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Code</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Code Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col transition-colors">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {getStatusIcon(selectedSubmission.status)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                      {selectedSubmission.status}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{selectedSubmission.language}</span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>{selectedSubmission.timestamp}</span>
                    {selectedSubmission.runtime !== 'N/A' && (
                      <>
                        <span>Runtime: {selectedSubmission.runtime}</span>
                        <span>Memory: {selectedSubmission.memory}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyCode(selectedSubmission.code)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copy code"
                >
                  <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto transition-colors">
                <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                  {selectedSubmission.code}
                </code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
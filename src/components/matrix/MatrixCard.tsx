import React from 'react';
import { MatrixSummary } from '../../types';

interface MatrixCardProps {
  matrix: MatrixSummary;
  onOpen: () => void;
}

export const MatrixCard: React.FC<MatrixCardProps> = ({ matrix, onOpen }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  return (
    <div 
      onClick={onOpen}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6 min-h-[200px] flex flex-col"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{matrix.name}</h3>
        <p className="text-sm text-gray-500">
          Last modified {getRelativeTime(matrix.lastModified)}
        </p>
      </div>
      
      {/* Mini preview of quadrants */}
      <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
        <div className="text-xs">
          <div className="font-medium text-red-600 mb-1">DO FIRST</div>
          <div className="text-gray-600">
            {matrix.taskCounts.doFirst} {matrix.taskCounts.doFirst === 1 ? 'task' : 'tasks'}
          </div>
        </div>
        <div className="text-xs">
          <div className="font-medium text-blue-600 mb-1">SCHEDULE</div>
          <div className="text-gray-600">
            {matrix.taskCounts.schedule} {matrix.taskCounts.schedule === 1 ? 'task' : 'tasks'}
          </div>
        </div>
        <div className="text-xs">
          <div className="font-medium text-yellow-600 mb-1">DELEGATE</div>
          <div className="text-gray-600">
            {matrix.taskCounts.delegate} {matrix.taskCounts.delegate === 1 ? 'task' : 'tasks'}
          </div>
        </div>
        <div className="text-xs">
          <div className="font-medium text-gray-600 mb-1">ELIMINATE</div>
          <div className="text-gray-600">
            {matrix.taskCounts.eliminate} {matrix.taskCounts.eliminate === 1 ? 'task' : 'tasks'}
          </div>
        </div>
      </div>
      
      {/* Task distribution bar */}
      <div className="mb-4">
        {matrix.totalTasks > 0 ? (
          <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
            {matrix.taskCounts.doFirst > 0 && (
              <div 
                className="bg-red-500" 
                style={{ width: `${(matrix.taskCounts.doFirst / matrix.totalTasks) * 100}%` }}
              />
            )}
            {matrix.taskCounts.schedule > 0 && (
              <div 
                className="bg-blue-500" 
                style={{ width: `${(matrix.taskCounts.schedule / matrix.totalTasks) * 100}%` }}
              />
            )}
            {matrix.taskCounts.delegate > 0 && (
              <div 
                className="bg-yellow-500" 
                style={{ width: `${(matrix.taskCounts.delegate / matrix.totalTasks) * 100}%` }}
              />
            )}
            {matrix.taskCounts.eliminate > 0 && (
              <div 
                className="bg-gray-500" 
                style={{ width: `${(matrix.taskCounts.eliminate / matrix.totalTasks) * 100}%` }}
              />
            )}
          </div>
        ) : (
          <div className="h-2 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-400">Empty matrix</span>
          </div>
        )}
      </div>
      
      {/* Footer with total and action */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          {matrix.totalTasks} total {matrix.totalTasks === 1 ? 'task' : 'tasks'}
        </span>
        <span className="text-blue-600 hover:text-blue-800 font-medium text-sm">
          Open →
        </span>
      </div>
    </div>
  );
}; 
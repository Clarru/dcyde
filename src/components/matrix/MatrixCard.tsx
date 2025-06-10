import React from 'react';
import { Trash2, Calendar, BarChart3 } from 'lucide-react';
import { MatrixSummary } from '../../types';

interface MatrixCardProps {
  matrix: MatrixSummary;
  onOpen: () => void;
  onDelete: () => void;
}

export const MatrixCard: React.FC<MatrixCardProps> = ({ matrix, onOpen, onDelete }) => {
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onDelete();
  };

  const getTaskDistribution = () => {
    const total = matrix.totalTasks;
    if (total === 0) return [];
    
    return [
      { color: 'bg-red-500', width: (matrix.taskCounts.doFirst / total) * 100, count: matrix.taskCounts.doFirst, label: 'Do First' },
      { color: 'bg-blue-500', width: (matrix.taskCounts.schedule / total) * 100, count: matrix.taskCounts.schedule, label: 'Schedule' },
      { color: 'bg-yellow-500', width: (matrix.taskCounts.delegate / total) * 100, count: matrix.taskCounts.delegate, label: 'Delegate' },
      { color: 'bg-gray-500', width: (matrix.taskCounts.eliminate / total) * 100, count: matrix.taskCounts.eliminate, label: 'Eliminate' }
    ].filter(item => item.count > 0);
  };

  const distribution = getTaskDistribution();

  return (
    <div 
      onClick={onOpen}
      className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer p-6 min-h-[240px] flex flex-col relative border border-gray-200/60 hover:border-blue-200 hover:scale-[1.01] active:scale-[0.99]"
    >
      {/* Delete button */}
      <button
        onClick={handleDeleteClick}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:scale-110 active:scale-95 z-10"
        title="Delete matrix"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="mb-6 pr-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2 transition-colors duration-200 group-hover:text-blue-600 line-clamp-2">
          {matrix.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Modified {getRelativeTime(matrix.lastModified)}</span>
        </div>
      </div>
      
      {/* Task Statistics */}
      <div className="mb-6 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Task Distribution</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-red-50/50 rounded-xl border border-red-100/60 transition-colors duration-200 hover:bg-red-50">
            <div className="text-lg font-bold text-red-600">{matrix.taskCounts.doFirst}</div>
            <div className="text-xs text-red-500 font-medium">DO FIRST</div>
          </div>
          <div className="text-center p-3 bg-blue-50/50 rounded-xl border border-blue-100/60 transition-colors duration-200 hover:bg-blue-50">
            <div className="text-lg font-bold text-blue-600">{matrix.taskCounts.schedule}</div>
            <div className="text-xs text-blue-500 font-medium">SCHEDULE</div>
          </div>
          <div className="text-center p-3 bg-yellow-50/50 rounded-xl border border-yellow-100/60 transition-colors duration-200 hover:bg-yellow-50">
            <div className="text-lg font-bold text-yellow-600">{matrix.taskCounts.delegate}</div>
            <div className="text-xs text-yellow-600 font-medium">DELEGATE</div>
          </div>
          <div className="text-center p-3 bg-gray-50/50 rounded-xl border border-gray-100/60 transition-colors duration-200 hover:bg-gray-100">
            <div className="text-lg font-bold text-gray-600">{matrix.taskCounts.eliminate}</div>
            <div className="text-xs text-gray-500 font-medium">ELIMINATE</div>
          </div>
        </div>
      </div>
      
      {/* Task distribution bar */}
      <div className="mb-4">
        {matrix.totalTasks > 0 ? (
          <div className="relative">
            <div className="flex h-2 bg-gray-100 rounded-full overflow-hidden transition-all duration-300 group-hover:h-3">
              {distribution.map((item, index) => (
                <div 
                  key={index}
                  className={`${item.color} transition-all duration-500 hover:opacity-80`} 
                  style={{ width: `${item.width}%` }}
                  title={`${item.label}: ${item.count} tasks`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="h-2 bg-gray-100 rounded-full flex items-center justify-center transition-all duration-300 group-hover:h-3">
            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Empty matrix
            </span>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600 font-medium">
            {matrix.totalTasks} {matrix.totalTasks === 1 ? 'task' : 'tasks'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200">
          <span>Open</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { QUADRANT_CONFIG } from '../../utils/constants';
import { QuadrantKey } from '../../types';

export const TaskList: React.FC = () => {
  const tasks = useTaskStore();
  const [copied, setCopied] = useState(false);

  const quadrantOrder: QuadrantKey[] = ['doFirst', 'schedule', 'delegate', 'eliminate'];

  const getQuadrantDisplayName = (key: QuadrantKey): string => {
    return QUADRANT_CONFIG[key].title;
  };

  const generatePlainText = (): string => {
    let text = '';
    
    quadrantOrder.forEach((quadrantKey) => {
      const quadrantTasks = tasks[quadrantKey];
      
      if (quadrantTasks.length > 0) {
        // Add quadrant header with single asterisk for bold formatting
        text += `*${getQuadrantDisplayName(quadrantKey)}:*\n`;
        
        // Add numbered tasks
        quadrantTasks.forEach((task, index) => {
          const taskText = task.completed ? `~${task.title}~` : task.title;
          text += `${index + 1}. ${taskText}\n`;
        });
        
        // Add spacing between sections
        text += '\n';
      }
    });

    // If no tasks, return a friendly message
    if (text.trim() === '') {
      text = '*Task Matrix*\n\nNo tasks assigned to quadrants yet.\n';
    }

    return text.trim();
  };

  const handleCopyToClipboard = async () => {
    try {
      const plainText = generatePlainText();
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatePlainText();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasAnyTasks = quadrantOrder.some(key => tasks[key].length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Task Overview</h3>
        
        {hasAnyTasks && (
          <button
            onClick={handleCopyToClipboard}
            className={`
              flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200
              ${copied 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 border border-transparent'
              }
            `}
            title={copied ? "Copied!" : "Copy formatted text"}
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
      
      <div className="space-y-3 text-xs">
        {quadrantOrder.map((quadrantKey) => {
          const quadrantTasks = tasks[quadrantKey];
          
          if (quadrantTasks.length === 0) return null;
          
          return (
            <div key={quadrantKey} className="space-y-1">
              <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wide">
                {getQuadrantDisplayName(quadrantKey)}:
              </h4>
              <ol className="space-y-1 pl-0">
                {quadrantTasks.map((task, index) => (
                  <li key={task.id} className="flex items-start gap-2">
                    <span className="text-gray-500 font-medium min-w-[15px]">
                      {index + 1}.
                    </span>
                    <span 
                      className={`text-gray-700 leading-tight ${task.completed ? 'line-through opacity-60' : ''}`}
                      title={task.title}
                    >
                      {task.title}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
        
        {!hasAnyTasks && (
          <div className="text-center py-4 text-gray-400">
            <p className="text-xs">No tasks in matrix yet</p>
            <p className="text-xs mt-1">Drag tasks from unassigned to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
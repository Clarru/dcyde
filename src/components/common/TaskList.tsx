import React from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { QUADRANT_CONFIG } from '../../utils/constants';
import { QuadrantKey } from '../../types';

export const TaskList: React.FC = () => {
  const tasks = useTaskStore();

  const quadrantOrder: QuadrantKey[] = ['doFirst', 'schedule', 'delegate', 'eliminate'];

  const getQuadrantDisplayName = (key: QuadrantKey): string => {
    return QUADRANT_CONFIG[key].title;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Task Overview</h3>
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
        
        {quadrantOrder.every(key => tasks[key].length === 0) && (
          <div className="text-center py-4 text-gray-400">
            <p className="text-xs">No tasks in matrix yet</p>
            <p className="text-xs mt-1">Drag tasks from unassigned to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}; 
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTaskStore } from '../../store/useTaskStore';
import { TaskCard } from '../task/TaskCard';
import { TaskState } from '../../types';

interface UnassignedDropZoneProps {
  dragOverTarget: string | null;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, targetQuadrant: string) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetQuadrant: keyof TaskState) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: number, sourceQuadrant: keyof TaskState) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const UnassignedDropZone: React.FC<UnassignedDropZoneProps> = ({
  dragOverTarget,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd
}) => {
  const unassignedTasks = useTaskStore(state => state.unassigned);

  return (
    <div 
      className={`
        p-4 border-2 border-dashed rounded-xl
        ${dragOverTarget === 'unassigned' ? 'border-gray-400 bg-gray-50' : 'border-gray-300'}
        transition-all duration-200
      `}
      onDragEnter={(e) => onDragEnter(e, 'unassigned')}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, 'unassigned')}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-700">Unassigned Tasks</h3>
        <span className="text-sm font-medium text-gray-500">
          {unassignedTasks.length}
        </span>
      </div>

      {unassignedTasks.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          New tasks appear here. Drag them to a quadrant to prioritize.
        </p>
      ) : (
        <AnimatePresence>
          <div className="space-y-1.5">
            {unassignedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                quadrant="unassigned"
                isUnassigned
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}; 
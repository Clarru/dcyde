import React from 'react';
import { TaskInput } from '../task/TaskInput';
import { UnassignedDropZone } from '../matrix/UnassignedDropZone';
import { TaskList } from './TaskList';
import { Logo } from './Logo';
import { TaskState } from '../../types';

interface SidebarProps {
  dragOverTarget: string | null;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, targetQuadrant: string) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetQuadrant: keyof TaskState) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: number, sourceQuadrant: keyof TaskState) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  dragOverTarget,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd
}) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo Header */}
      <div className="px-6 py-4 border-b border-t border-gray-200">
        <div className="flex justify-start">
          <Logo className="h-8 w-auto text-gray-900" />
        </div>
      </div>

      {/* Task Input */}
      <div className="p-6 border-b border-gray-200">
        <TaskInput />
      </div>

      {/* Unassigned Tasks */}
      <div className="p-6 border-b border-gray-200">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Unassigned Tasks</h3>
          <p className="text-xs text-gray-500">Drag tasks to the matrix to prioritize them</p>
        </div>
        
        <div className="max-h-48 overflow-y-auto">
          <UnassignedDropZone
            dragOverTarget={dragOverTarget}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        </div>
      </div>

      {/* Task Overview List */}
      <div className="flex-1 p-6 overflow-y-auto">
        <TaskList />
      </div>
    </div>
  );
}; 
import React from 'react';
import { TaskInput } from '../task/TaskInput';
import { UnassignedDropZone } from '../matrix/UnassignedDropZone';
import { TaskList } from './TaskList';
import { Logo } from './Logo';
import { DraggableDivider } from './DraggableDivider';
import { TaskState, Task } from '../../types';
import { useDraggableResize } from '../../hooks/useDraggableResize';

interface SidebarProps {
  dragOverTarget: string | null;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, targetQuadrant: string) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetQuadrant: keyof TaskState) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: number, sourceQuadrant: keyof TaskState) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onOpenStatusPanel?: (task: Task) => void;
  onTaskMoved?: (taskTitle: string, targetMatrixName: string) => void;
  onCreateNewMatrix?: (quadrant: 'unassigned') => void;
  onBulkTasksMoved?: (count: number, targetMatrixName: string) => void;
  onNavigateToAll?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  dragOverTarget,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  onOpenStatusPanel,
  onTaskMoved,
  onCreateNewMatrix,
  onBulkTasksMoved,
  onNavigateToAll
}) => {
  const {
    topHeight,
    bottomHeight,
    isDragging,
    dividerProps,
    topSectionProps,
    bottomSectionProps
  } = useDraggableResize({
    initialTopHeight: 240,
    minTopHeight: 120,
    minBottomHeight: 120,
    storageKey: 'sidebar-sections-resize'
  });

  return (
    <div className="w-80 flex flex-col h-screen sidebar-container">
      {/* Logo Header - Clickable */}
      <div className="px-6 py-5 border-b border-gray-200/60 flex-shrink-0 bg-white/90 backdrop-blur-sm">
        <div className="flex justify-start">
          {onNavigateToAll ? (
            <button
              onClick={onNavigateToAll}
              className="transition-opacity duration-200 hover:opacity-75"
              title="Go to all matrices"
            >
              <Logo className="h-8 w-auto text-gray-900" />
            </button>
          ) : (
            <Logo className="h-8 w-auto text-gray-900" />
          )}
        </div>
      </div>

      {/* Task Input */}
      <div className="p-6 border-b border-gray-200/60 flex-shrink-0 bg-white/50 backdrop-blur-sm">
        <TaskInput />
      </div>

      {/* Unassigned Tasks - Resizable Top Section */}
      <div 
        className="border-b border-gray-200/60 flex flex-col overflow-hidden bg-white/30 backdrop-blur-sm"
        style={topSectionProps.style}
      >
        <div className="p-6 pb-2 flex-shrink-0">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Unassigned Tasks</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Drag tasks to the matrix to prioritize them</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <UnassignedDropZone
            dragOverTarget={dragOverTarget}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onOpenStatusPanel={onOpenStatusPanel}
            onTaskMoved={onTaskMoved}
            onCreateNewMatrix={onCreateNewMatrix}
            onBulkTasksMoved={onBulkTasksMoved}
          />
        </div>
      </div>

      {/* Draggable Divider */}
      <DraggableDivider
        onMouseDown={dividerProps.onMouseDown}
        isDragging={isDragging}
        className={dividerProps.className}
      />

      {/* Task Overview List - Resizable Bottom Section */}
      <div 
        className="flex flex-col overflow-hidden bg-white/20 backdrop-blur-sm"
        style={bottomSectionProps.style}
      >
        <div className="flex-1 p-6 overflow-y-auto">
          <TaskList />
        </div>
      </div>
    </div>
  );
};
import React, { useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { QuadrantKey, QuadrantConfig, TaskState } from '../../types';
import { useTaskStore } from '../../store/useTaskStore';
import { useMatrixStore } from '../../store/useMatrixStore';
import { TaskCard } from '../task/TaskCard';
import { QuadrantMenu } from './QuadrantMenu';

interface QuadrantProps {
  quadrantKey: QuadrantKey;
  config: QuadrantConfig;
  dragOverTarget: string | null;
  insertionPreview: {
    quadrant: string;
    index: number;
    position: { x: number; y: number };
  } | null;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, targetQuadrant: string) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetQuadrant: QuadrantKey) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: number, sourceQuadrant: keyof TaskState) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onSetInsertionPreview: (preview: {
    quadrant: string;
    index: number;
    position: { x: number; y: number };
  } | null) => void;
  onTaskMoved?: (taskTitle: string, targetMatrixName: string) => void;
  onCreateNewMatrix?: (quadrant: QuadrantKey) => void;
  onBulkTasksMoved?: (count: number, targetMatrixName: string) => void;
}

export const Quadrant: React.FC<QuadrantProps> = ({
  quadrantKey,
  config,
  dragOverTarget,
  insertionPreview,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  onSetInsertionPreview,
  onTaskMoved,
  onCreateNewMatrix,
  onBulkTasksMoved
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tasks = useTaskStore(state => state[quadrantKey]);
  const clearCompleted = useTaskStore(state => state.clearCompleted);
  const moveTask = useTaskStore(state => state.moveTask);
  const { getCurrentMatrix, moveAllTasksToMatrix, getMatrixSummaries, createMatrix } = useMatrixStore();

  const completedCount = tasks.filter(t => t.completed).length;

  const handleMoveAllToMatrix = (targetMatrixId: string, targetQuadrant: QuadrantKey) => {
    const currentMatrix = getCurrentMatrix();
    if (!currentMatrix) return;

    const movedCount = moveAllTasksToMatrix(currentMatrix.id, quadrantKey, targetMatrixId, targetQuadrant);
    
    if (movedCount > 0 && onBulkTasksMoved) {
      const matrices = getMatrixSummaries();
      const targetMatrix = matrices.find(m => m.id === targetMatrixId);
      if (targetMatrix) {
        onBulkTasksMoved(movedCount, targetMatrix.name);
      }
    }
  };

  const handleCreateNewMatrix = (quadrant: QuadrantKey) => {
    if (onCreateNewMatrix) {
      onCreateNewMatrix(quadrant);
    }
  };

  const handleClearCompleted = () => {
    clearCompleted(quadrantKey);
  };

  const handleEnhancedDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    onDragOver(e);
    
    if (containerRef.current && dragOverTarget === quadrantKey) {
      const taskElements = Array.from(containerRef.current.querySelectorAll('[data-task-id]'));
      const insertIndex = calculateInsertIndex(e.clientX, e.clientY, taskElements);
      
             // Calculate position for visual indicator using 2D-aware positioning
       let indicatorY = 0;
       let indicatorX = 0;
       
       const containerRect = containerRef.current.getBoundingClientRect();
       
       if (taskElements.length === 0) {
         // Empty quadrant - show at top of content area
         const contentArea = containerRef.current.querySelector('.flex.flex-wrap');
         if (contentArea) {
           const contentRect = contentArea.getBoundingClientRect();
           indicatorY = contentRect.top - containerRect.top;
           indicatorX = contentRect.left - containerRect.left;
         }
       } else {
         // Use the smart 2D positioning
         const mouseX = e.clientX;
         const mouseY = e.clientY;
         
         // Group tasks by rows for positioning
         const rows: { elements: Element[], top: number }[] = [];
         
         taskElements.forEach((element) => {
           const rect = element.getBoundingClientRect();
           let targetRow = rows.find(row => Math.abs(row.top - rect.top) < 10);
           
           if (!targetRow) {
             targetRow = { elements: [], top: rect.top };
             rows.push(targetRow);
           }
           targetRow.elements.push(element);
         });
         
         rows.sort((a, b) => a.top - b.top);
         
         // Find target row
         let targetRowIndex = 0;
         for (let i = 0; i < rows.length; i++) {
           const rowBottom = rows[i].top + 32; // Approximate task height
           if (mouseY <= rowBottom) {
             targetRowIndex = i;
             break;
           }
           targetRowIndex = i + 1;
         }
         
         if (targetRowIndex < rows.length) {
           // Within a row - find horizontal position
           const targetRow = rows[targetRowIndex];
           targetRow.elements.sort((a, b) => {
             const aRect = a.getBoundingClientRect();
             const bRect = b.getBoundingClientRect();
             return aRect.left - bRect.left;
           });
           
           // Find insertion point in row
           let insertInRow = 0;
           for (let i = 0; i < targetRow.elements.length; i++) {
             const elementRect = targetRow.elements[i].getBoundingClientRect();
             if (mouseX < elementRect.left + elementRect.width / 2) {
               insertInRow = i;
               break;
             }
             insertInRow = i + 1;
           }
           
           if (insertInRow === 0) {
             // Before first in row
             const firstRect = targetRow.elements[0].getBoundingClientRect();
             indicatorX = firstRect.left - containerRect.left;
             indicatorY = firstRect.top - containerRect.top;
           } else if (insertInRow >= targetRow.elements.length) {
             // After last in row
             const lastRect = targetRow.elements[targetRow.elements.length - 1].getBoundingClientRect();
             indicatorX = lastRect.right - containerRect.left;
             indicatorY = lastRect.top - containerRect.top;
           } else {
             // Between elements in row
             const targetRect = targetRow.elements[insertInRow].getBoundingClientRect();
             indicatorX = targetRect.left - containerRect.left;
             indicatorY = targetRect.top - containerRect.top;
           }
         } else {
           // After all rows
           const lastRow = rows[rows.length - 1];
           const lastElement = lastRow.elements[lastRow.elements.length - 1];
           const lastRect = lastElement.getBoundingClientRect();
           indicatorX = lastRect.left - containerRect.left;
           indicatorY = lastRect.bottom - containerRect.top + 8; // Small gap
         }
       }
      
      onSetInsertionPreview({
        quadrant: quadrantKey,
        index: insertIndex,
        position: { x: indicatorX, y: indicatorY }
      });
    }
  };

  const calculateInsertIndex = (mouseX: number, mouseY: number, taskElements: Element[]): number => {
    if (taskElements.length === 0) return 0;
    
    // Group tasks by rows based on their Y position
    const rows: { elements: Element[], top: number, bottom: number }[] = [];
    
    taskElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      
      // Find existing row or create new one
      let targetRow = rows.find(row => 
        Math.abs(row.top - elementTop) < 10 // Same row if within 10px vertically
      );
      
      if (!targetRow) {
        targetRow = {
          elements: [],
          top: elementTop,
          bottom: elementBottom
        };
        rows.push(targetRow);
      }
      
      targetRow.elements.push(element);
    });
    
    // Sort rows by vertical position
    rows.sort((a, b) => a.top - b.top);
    
    // Find which row the mouse is over
    let targetRowIndex = 0;
    for (let i = 0; i < rows.length; i++) {
      if (mouseY <= rows[i].bottom) {
        targetRowIndex = i;
        break;
      }
      targetRowIndex = i + 1; // After last row
    }
    
    // If mouse is before first row, insert at beginning
    if (targetRowIndex === 0 && mouseY < rows[0].top) {
      return 0;
    }
    
    // If mouse is after last row, insert at end
    if (targetRowIndex >= rows.length) {
      return taskElements.length;
    }
    
    // Within the target row, find horizontal position
    const targetRow = rows[targetRowIndex];
    targetRow.elements.sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      return aRect.left - bRect.left;
    });
    
    // Calculate insertion index within this row
    let insertIndexInRow = 0;
    for (let i = 0; i < targetRow.elements.length; i++) {
      const elementRect = targetRow.elements[i].getBoundingClientRect();
      const elementCenterX = elementRect.left + elementRect.width / 2;
      
      if (mouseX < elementCenterX) {
        insertIndexInRow = i;
        break;
      }
      insertIndexInRow = i + 1;
    }
    
    // Convert row-relative index to absolute index
    let absoluteIndex = 0;
    
    // Add all elements from previous rows
    for (let i = 0; i < targetRowIndex; i++) {
      absoluteIndex += rows[i].elements.length;
    }
    
    // Add elements before insertion point in current row
    for (let i = 0; i < insertIndexInRow; i++) {
      const element = targetRow.elements[i];
      const elementIndex = Array.from(taskElements).indexOf(element);
      if (elementIndex >= 0) {
        absoluteIndex++;
      }
    }
    
    return Math.min(absoluteIndex, taskElements.length);
  };

  const handleEnhancedDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log('🎯 Enhanced Drop on:', quadrantKey);
    
    try {
      // Get the drag data
      const dragData = e.dataTransfer.getData('text/plain');
      const { taskId, sourceQuadrant } = JSON.parse(dragData);
      
             // Calculate insertion index if we have container and task elements
       let insertIndex: number | undefined = undefined;
       if (containerRef.current) {
         const taskElements = Array.from(containerRef.current.querySelectorAll('[data-task-id]'));
         if (taskElements.length > 0) {
           insertIndex = calculateInsertIndex(e.clientX, e.clientY, taskElements);
           console.log('📍 Calculated insert index:', insertIndex);
         }
       }
      
      console.log('Moving task:', taskId, 'from:', sourceQuadrant, 'to:', quadrantKey, 'at index:', insertIndex);
      
      // Move the task with insertion index 
      moveTask(taskId, sourceQuadrant, quadrantKey, insertIndex);
      
    } catch (error) {
      console.error('Error handling enhanced drop:', error);
    }
  };

  return (
    <div 
      className={`
        p-4 border-2 rounded-xl h-full flex flex-col relative
        ${config.bgColor} ${config.borderColor}
        ${dragOverTarget === quadrantKey ? config.dragOverBg : ''}
        transition-all duration-200
      `}
      onDragEnter={(e) => onDragEnter(e, quadrantKey)}
      onDragLeave={onDragLeave}
      onDragOver={handleEnhancedDragOver}
      onDrop={handleEnhancedDrop}
      ref={containerRef}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">{config.title}</h3>
          <p className="text-sm text-gray-600">{config.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">
            {tasks.length}
          </span>
          <QuadrantMenu
            quadrantKey={quadrantKey}
            onMoveAllToMatrix={handleMoveAllToMatrix}
            onClearCompleted={handleClearCompleted}
            onCreateNewMatrix={handleCreateNewMatrix}
          />
        </div>
      </div>

      <div className="flex-1 overflow-visible">
        {tasks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-3xl mb-2">{config.emptyIcon}</span>
            <p className="text-sm text-center">{config.emptyText}</p>
          </div>
        )}

        <AnimatePresence>
          <div className="flex flex-wrap gap-2" data-quadrant={quadrantKey}>
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                quadrant={quadrantKey}
                taskIndex={index}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onTaskMoved={onTaskMoved}
              />
            ))}
            
            {/* Insertion Preview Line */}
            {insertionPreview && insertionPreview.quadrant === quadrantKey && (
              <div
                className="absolute bg-red-500 z-50 pointer-events-none"
                style={{
                  left: `${insertionPreview.position.x}px`,
                  top: `${insertionPreview.position.y}px`,
                  width: '2px',
                  height: '32px',
                  transform: 'translateX(-1px)',
                  boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)'
                }}
              />
            )}
          </div>
        </AnimatePresence>
      </div>

      {completedCount > 0 && (
        <button
          onClick={() => clearCompleted(quadrantKey)}
          className={`
            mt-3 flex items-center justify-center gap-2 w-full py-2 px-3
            text-sm rounded-lg ${config.hoverBg} transition-colors
            text-gray-600 hover:text-gray-800
          `}
        >
          <Trash2 className="w-4 h-4" />
          Clear {completedCount} completed
        </button>
      )}
    </div>
  );
}; 
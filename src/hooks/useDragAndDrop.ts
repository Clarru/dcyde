import { useState, useCallback } from 'react';
import { TaskState, DraggedItem, DropTarget } from '../types';
import { useTaskStore } from '../store/useTaskStore';

export const useDragAndDrop = () => {
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [insertionPreview, setInsertionPreview] = useState<{
    quadrant: string;
    index: number;
    position: { x: number; y: number };
  } | null>(null);
  const moveTask = useTaskStore(state => state.moveTask);

  const handleDragStart = useCallback((
    e: React.DragEvent<HTMLDivElement>, 
    taskId: number, 
    sourceQuadrant: keyof TaskState
  ) => {
    console.log('🚀 Drag Start:', taskId, 'from', sourceQuadrant);
    
    // Set the drag data
    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId, sourceQuadrant }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Update state
    setDraggedItem({ taskId, sourceQuadrant });
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    console.log('🏁 Drag End');
    setDraggedItem(null);
    setDragOverTarget(null);
    setInsertionPreview(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // This is crucial!
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((
    e: React.DragEvent<HTMLDivElement>, 
    targetQuadrant: string
  ) => {
    e.preventDefault();
    console.log('📥 Drag Enter:', targetQuadrant);
    setDragOverTarget(targetQuadrant);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    // Only clear if we're actually leaving the container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      console.log('📤 Drag Leave');
      setDragOverTarget(null);
      setInsertionPreview(null);
    }
  }, []);

  const handleDrop = useCallback((
    e: React.DragEvent<HTMLDivElement>, 
    targetQuadrant: keyof TaskState
  ) => {
    e.preventDefault();
    console.log('🎯 Drop on:', targetQuadrant);
    
    try {
      // Get the drag data
      const dragData = e.dataTransfer.getData('text/plain');
      const { taskId, sourceQuadrant } = JSON.parse(dragData);
      
      console.log('Moving task:', taskId, 'from:', sourceQuadrant, 'to:', targetQuadrant);
      
      // Move the task with insertion index
      moveTask(taskId, sourceQuadrant, targetQuadrant, insertIndex || undefined);
      
      // Clear ALL drag state
      setDraggedItem(null);
      setDragOverTarget(null);
      setInsertIndex(null);
      setInsertionPreview(null);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [moveTask, insertIndex]);

  const handleDropWithIndex = useCallback((
    e: React.DragEvent<HTMLDivElement>, 
    targetQuadrant: keyof TaskState, 
    targetInsertIndex?: number
  ) => {
    e.preventDefault();
    console.log('🎯 Drop on:', targetQuadrant, 'at index:', targetInsertIndex);
    
    try {
      // Get the drag data
      const dragData = e.dataTransfer.getData('text/plain');
      const { taskId, sourceQuadrant } = JSON.parse(dragData);
      
      console.log('Moving task:', taskId, 'from:', sourceQuadrant, 'to:', targetQuadrant, 'index:', targetInsertIndex);
      
      // Move the task with specific insertion index
      moveTask(taskId, sourceQuadrant, targetQuadrant, targetInsertIndex);
      
      // Clear ALL drag state
      setDraggedItem(null);
      setDragOverTarget(null);
      setInsertIndex(null);
      setInsertionPreview(null);
    } catch (error) {
      console.error('Error handling drop with index:', error);
    }
  }, [moveTask]);

  const calculateInsertIndex = useCallback((
    mouseY: number, 
    containerRect: DOMRect, 
    taskElements: Element[]
  ): number => {
    let insertIndex = 0;
    
    for (let i = 0; i < taskElements.length; i++) {
      const taskRect = taskElements[i].getBoundingClientRect();
      const taskCenterY = taskRect.top + taskRect.height / 2;
      
      if (mouseY < taskCenterY) {
        insertIndex = i;
        break;
      }
      insertIndex = i + 1;
    }
    
    return insertIndex;
  }, []);

  return {
    draggedItem,
    dragOverTarget,
    insertIndex,
    insertionPreview,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDropWithIndex,
    calculateInsertIndex,
    setInsertIndex,
    setInsertionPreview
  };
}; 
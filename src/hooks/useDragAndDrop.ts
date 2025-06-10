import { useState, useCallback } from 'react';
import { TaskState } from '../types';
import { useTaskStore } from '../store/useTaskStore';

export const useDragAndDrop = () => {
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
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
    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId, sourceQuadrant }));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragOverTarget(null);
    setInsertionPreview(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((
    e: React.DragEvent<HTMLDivElement>, 
    targetQuadrant: string
  ) => {
    e.preventDefault();
    setDragOverTarget(targetQuadrant);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverTarget(null);
      setInsertionPreview(null);
    }
  }, []);

  const handleDrop = useCallback((
    e: React.DragEvent<HTMLDivElement>, 
    targetQuadrant: keyof TaskState
  ) => {
    e.preventDefault();
    
    try {
      const { taskId, sourceQuadrant } = JSON.parse(e.dataTransfer.getData('text/plain'));
      moveTask(taskId, sourceQuadrant, targetQuadrant, insertionPreview?.index);
    } catch (error) {
      console.error('Drop failed:', error);
    } finally {
      setDragOverTarget(null);
      setInsertionPreview(null);
    }
  }, [moveTask, insertionPreview]);

  return {
    dragOverTarget,
    insertionPreview,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    setInsertionPreview
  };
};
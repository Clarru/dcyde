import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Check, Edit2, Trash2, ArrowRight, Copy, Plus } from 'lucide-react';
import { Task, TaskState } from '../../types';
import { useTaskStore } from '../../store/useTaskStore';
import { useMatrixStore } from '../../store/useMatrixStore';
import { EnhancedContextMenu } from '../common/EnhancedContextMenu';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface TaskCardProps {
  task: Task;
  quadrant: keyof TaskState;
  isUnassigned?: boolean;
  taskIndex?: number;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: number, sourceQuadrant: keyof TaskState) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onTaskMoved?: (taskTitle: string, targetMatrixName: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  quadrant, 
  isUnassigned = false,
  taskIndex,
  onDragStart,
  onDragEnd,
  onTaskMoved
}) => {
  const { deleteTask, updateTask, toggleComplete, moveTask } = useTaskStore();
  const taskStore = useTaskStore();
  const { getMatrixSummaries, getCurrentMatrix, moveTaskToMatrix, createMatrix } = useMatrixStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleEditSave = () => {
    if (editText.trim() && editText.trim() !== task.title) {
      updateTask(task.id, quadrant, { title: editText.trim() });
    }
    setIsEditing(false);
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      setEditText(task.title);
      setIsEditing(false);
    }
  };

  const getQuadrantDisplayName = (key: keyof TaskState): string => {
    const names = {
      unassigned: 'Unassigned',
      doFirst: 'Do First',
      schedule: 'Schedule', 
      delegate: 'Delegate',
      eliminate: 'Eliminate'
    };
    return names[key];
  };

  const matrices = getMatrixSummaries();
  const currentMatrix = getCurrentMatrix();
  const otherMatrices = matrices.filter(m => m.id !== currentMatrix?.id);

  const handleMoveToMatrix = (targetMatrixId: string, targetQuadrant?: keyof TaskState) => {
    if (currentMatrix) {
      const success = moveTaskToMatrix(task.id, currentMatrix.id, quadrant, targetMatrixId, targetQuadrant);
      
      if (success) {
        // Immediately update the task store to remove the task from current view
        // This prevents the sync hook from overwriting our changes
        const currentTasks = taskStore[quadrant];
        const updatedTasks = currentTasks.filter(t => t.id !== task.id);
        
        // Use setState to update the specific quadrant
        useTaskStore.setState((state) => ({
          ...state,
          [quadrant]: updatedTasks
        }));
        
        if (onTaskMoved) {
          const targetMatrix = matrices.find(m => m.id === targetMatrixId);
          if (targetMatrix) {
            onTaskMoved(task.title, targetMatrix.name);
          }
        }
      }
    }
  };

  const handleCreateNewMatrixAndMove = async () => {
    const matrixName = prompt('Enter name for new matrix:');
    if (matrixName && currentMatrix) {
      const newMatrixId = createMatrix(matrixName);
      const success = moveTaskToMatrix(task.id, currentMatrix.id, quadrant, newMatrixId, quadrant);
      if (success && onTaskMoved) {
        onTaskMoved(task.title, matrixName);
      }
    }
  };

  const contextMenuOptions = [
    {
      label: task.completed ? 'Mark as Incomplete' : 'Mark as Complete',
      icon: <Check className="w-4 h-4" />,
      onClick: () => toggleComplete(task.id, quadrant)
    },
    {
      label: 'Edit Task',
      icon: <Edit2 className="w-4 h-4" />,
      onClick: () => setIsEditing(true)
    },
    {
      label: 'Duplicate Task',
      icon: <Copy className="w-4 h-4" />,
      onClick: () => {
        // TODO: Implement task duplication
        console.log('Duplicate task:', task.title);
      }
    },
    { separator: true, label: '' },
    {
      label: 'Move to Matrix →',
      icon: <ArrowRight className="w-4 h-4" />,
      submenu: [
        ...otherMatrices.map(matrix => ({
          label: matrix.name,
          icon: <ArrowRight className="w-4 h-4" />,
          onClick: () => handleMoveToMatrix(matrix.id, quadrant)
        })),
        ...(otherMatrices.length > 0 ? [{ separator: true, label: '' }] : []),
        {
          label: 'New Matrix',
          icon: <Plus className="w-4 h-4" />,
          onClick: handleCreateNewMatrixAndMove
        }
      ]
    },
    { separator: true, label: '' },
    {
      label: 'Move to Do First',
      icon: <ArrowRight className="w-4 h-4" />,
      onClick: () => moveTask(task.id, quadrant, 'doFirst'),
      disabled: quadrant === 'doFirst'
    },
    {
      label: 'Move to Schedule',
      icon: <ArrowRight className="w-4 h-4" />,
      onClick: () => moveTask(task.id, quadrant, 'schedule'),
      disabled: quadrant === 'schedule'
    },
    {
      label: 'Move to Delegate',
      icon: <ArrowRight className="w-4 h-4" />,
      onClick: () => moveTask(task.id, quadrant, 'delegate'),
      disabled: quadrant === 'delegate'
    },
    {
      label: 'Move to Eliminate',
      icon: <ArrowRight className="w-4 h-4" />,
      onClick: () => moveTask(task.id, quadrant, 'eliminate'),
      disabled: quadrant === 'eliminate'
    },
    {
      label: 'Move to Unassigned',
      icon: <ArrowRight className="w-4 h-4" />,
      onClick: () => moveTask(task.id, quadrant, 'unassigned'),
      disabled: quadrant === 'unassigned'
    },
    { separator: true, label: '' },
    {
      label: 'Delete Task',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => setShowDeleteConfirm(true),
      danger: true
    }
  ];

  return (
    <>
      <div
        className={`
          ${isUnassigned ? 'flex' : 'inline-flex'} items-center gap-1.5 p-2 bg-white rounded-md border shadow-sm cursor-move
          ${task.completed ? 'opacity-60' : ''}
          ${isUnassigned ? 'border-gray-300' : 'border-gray-200'}
          hover:shadow-md transition-all hover:scale-[1.02] ${isUnassigned ? 'w-full' : 'max-w-full'}
          overflow-hidden
        `}
        draggable={!isEditing}
        data-task-id={task.id}
        data-task-index={taskIndex}
        onDragStart={(e) => onDragStart(e, task.id, quadrant)}
        onDragEnd={onDragEnd}
        onContextMenu={handleRightClick}
      >
        <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
        
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEditSave}
            onKeyDown={handleEditKeyPress}
            className="text-xs font-medium bg-transparent border-none outline-none flex-1"
            autoFocus
          />
        ) : (
          <span 
            className={`text-xs font-medium ${task.completed ? 'line-through' : ''} ${isUnassigned ? 'flex-1' : 'whitespace-nowrap'}`}
            title={task.title}
          >
            {task.title}
          </span>
                )}
      </div>

    {/* Context Menu */}
    {contextMenu && (
      <EnhancedContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu(null)}
        options={contextMenuOptions}
      />
    )}

    {/* Delete Confirmation Dialog */}
    <ConfirmDialog
      isOpen={showDeleteConfirm}
      title="Delete Task"
      message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={() => {
        deleteTask(task.id, quadrant);
        setShowDeleteConfirm(false);
      }}
      onCancel={() => setShowDeleteConfirm(false)}
      danger
    />
  </>
  );
}; 
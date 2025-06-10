import React, { useState, memo, useCallback } from 'react';
import { GripVertical, Check, Edit2, Trash2, ArrowRight, Plus, FileText, ChevronRight } from 'lucide-react';
import { Task, TaskState } from '../../types';
import { useTaskStore } from '../../store/useTaskStore';
import { useMatrixStore } from '../../store/useMatrixStore';
import { Portal } from '../common/Portal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TaskStatusCircle } from './TaskStatusCircle';

interface TaskCardProps {
  task: Task;
  quadrant: keyof TaskState;
  isUnassigned?: boolean;
  taskIndex?: number;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: number, sourceQuadrant: keyof TaskState) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onTaskMoved?: (taskTitle: string, targetMatrixName: string) => void;
  onOpenStatusPanel?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = memo(({ 
  task, 
  quadrant, 
  isUnassigned = false,
  taskIndex,
  onDragStart,
  onDragEnd,
  onTaskMoved,
  onOpenStatusPanel
}) => {
  const { deleteTask, updateTask, toggleComplete, moveTask } = useTaskStore();
  const { getMatrixSummaries, getCurrentMatrix, moveTaskToMatrix, createMatrix } = useMatrixStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const handleEditSave = useCallback(() => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== task.title) {
      updateTask(task.id, quadrant, { title: trimmed });
    }
    setIsEditing(false);
  }, [editText, task.title, task.id, quadrant, updateTask]);

  const handleEditKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      setEditText(task.title);
      setIsEditing(false);
    }
  }, [handleEditSave, task.title]);

  const handleOpenStatusPanel = useCallback(() => {
    if (onOpenStatusPanel) {
      onOpenStatusPanel(task);
    }
    closeContextMenu();
  }, [onOpenStatusPanel, task, closeContextMenu]);

  const handleMoveToMatrix = useCallback((targetMatrixId: string, targetQuadrant?: keyof TaskState) => {
    const currentMatrix = getCurrentMatrix();
    if (!currentMatrix) return;

    const success = moveTaskToMatrix(task.id, currentMatrix.id, quadrant, targetMatrixId, targetQuadrant);
    
    if (success) {
      // Immediately update the task store to remove the task from current view
      const taskStore = useTaskStore.getState();
      const currentTasks = taskStore[quadrant];
      const updatedTasks = currentTasks.filter(t => t.id !== task.id);
      
      // Use setState to update the specific quadrant
      useTaskStore.setState((state) => ({
        ...state,
        [quadrant]: updatedTasks
      }));
      
      if (onTaskMoved) {
        const matrices = getMatrixSummaries();
        const targetMatrix = matrices.find(m => m.id === targetMatrixId);
        if (targetMatrix) {
          onTaskMoved(task.title, targetMatrix.name);
        }
      }
    }
    closeContextMenu();
  }, [task.id, quadrant, getCurrentMatrix, moveTaskToMatrix, onTaskMoved, getMatrixSummaries, closeContextMenu]);

  const handleCreateNewMatrixAndMove = useCallback(() => {
    const matrixName = prompt('Enter name for new matrix:');
    if (matrixName) {
      const newMatrixId = createMatrix(matrixName);
      handleMoveToMatrix(newMatrixId, quadrant);
    }
  }, [createMatrix, handleMoveToMatrix, quadrant]);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    onDragStart(e, task.id, quadrant);
  }, [onDragStart, task.id, quadrant]);

  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    onDragEnd(e);
  }, [onDragEnd]);

  const matrices = getMatrixSummaries();
  const currentMatrix = getCurrentMatrix();
  const otherMatrices = matrices.filter(m => m.id !== currentMatrix?.id);

  const contextMenuOptions = [
    {
      label: task.completed ? 'Mark as Incomplete' : 'Mark as Complete',
      icon: <Check className="w-4 h-4" />,
      onClick: () => {
        toggleComplete(task.id, quadrant);
        closeContextMenu();
      }
    },
    {
      label: 'Task Details',
      icon: <FileText className="w-4 h-4" />,
      onClick: handleOpenStatusPanel
    },
    {
      label: 'Edit Task',
      icon: <Edit2 className="w-4 h-4" />,
      onClick: () => {
        setIsEditing(true);
        closeContextMenu();
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
      onClick: () => {
        moveTask(task.id, quadrant, 'doFirst');
        closeContextMenu();
      },
      disabled: quadrant === 'doFirst'
    },
    {
      label: 'Move to Schedule',
      onClick: () => {
        moveTask(task.id, quadrant, 'schedule');
        closeContextMenu();
      },
      disabled: quadrant === 'schedule'
    },
    {
      label: 'Move to Delegate',
      onClick: () => {
        moveTask(task.id, quadrant, 'delegate');
        closeContextMenu();
      },
      disabled: quadrant === 'delegate'
    },
    {
      label: 'Move to Eliminate',
      onClick: () => {
        moveTask(task.id, quadrant, 'eliminate');
        closeContextMenu();
      },
      disabled: quadrant === 'eliminate'
    },
    {
      label: 'Move to Unassigned',
      onClick: () => {
        moveTask(task.id, quadrant, 'unassigned');
        closeContextMenu();
      },
      disabled: quadrant === 'unassigned'
    },
    { separator: true, label: '' },
    {
      label: 'Delete Task',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => {
        setShowDeleteConfirm(true);
        closeContextMenu();
      },
      danger: true
    }
  ];

  return (
    <>
      <div
        className={`
          ${isUnassigned ? 'flex' : 'inline-flex'} items-center gap-1.5 p-2 bg-white rounded-md border cursor-move
          ${task.completed ? 'opacity-60' : ''}
          ${isUnassigned ? 'border-gray-300 w-full' : 'border-gray-200'}
          overflow-hidden transition-all duration-200 ease-out
          ${!isDragging ? 'hover:shadow-md hover:scale-[1.02]' : 'shadow-lg scale-105 z-50'}
        `}
        draggable={!isEditing}
        data-task-id={task.id}
        data-task-index={taskIndex}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onContextMenu={handleRightClick}
        style={{
          ...(isDragging && {
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.25), 0 6px 12px rgba(0, 0, 0, 0.15)',
            transform: 'scale(1.03) rotate(0.5deg)',
            zIndex: 1000
          })
        }}
      >
        <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={handleEditKeyPress}
              className="text-xs font-medium bg-transparent border-none outline-none w-full"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <TaskStatusCircle status={task.status} size={8} />
              <span 
                className={`text-xs font-medium ${task.completed ? 'line-through' : ''} ${isUnassigned ? 'flex-1' : 'whitespace-nowrap'}`}
                title={task.title}
              >
                {task.title}
              </span>
              {task.notes && task.notes.trim() && (
                <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" title="Has notes" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Portal-rendered Context Menu */}
      {contextMenu && (
        <Portal>
          <EnhancedContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            options={contextMenuOptions}
            onClose={closeContextMenu}
          />
        </Portal>
      )}

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
});

// Enhanced Context Menu Component with proper submenu support
interface MenuOption {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  submenu?: MenuOption[];
  separator?: boolean;
}

interface EnhancedContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  options: MenuOption[];
}

const EnhancedContextMenu: React.FC<EnhancedContextMenuProps> = ({ 
  x, 
  y, 
  onClose, 
  options 
}) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is inside main menu
      const isInsideMainMenu = menuRef.current && menuRef.current.contains(target);
      
      // Check if click is inside any submenu (search for submenu containers)
      const submenuElements = document.querySelectorAll('[data-submenu]');
      const isInsideSubmenu = Array.from(submenuElements).some(submenu => submenu.contains(target));
      
      if (!isInsideMainMenu && !isInsideSubmenu) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (activeSubmenu !== null) {
          setActiveSubmenu(null);
          setSubmenuPosition(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, activeSubmenu]);

  // Adjust position if menu would go off-screen
  const adjustedX = Math.min(x, window.innerWidth - 250);
  const adjustedY = Math.min(y, window.innerHeight - (options.length * 40 + 16));

  const handleOptionClick = (option: MenuOption, index: number) => {
    if (option.disabled) return;
    
    if (option.submenu) {
      // Calculate submenu position
      const menuItem = menuRef.current?.children[index] as HTMLElement;
      if (menuItem) {
        const rect = menuItem.getBoundingClientRect();
        const submenuX = rect.right + 8;
        const submenuY = rect.top;
        
        setActiveSubmenu(index);
        setSubmenuPosition({ x: submenuX, y: submenuY });
      }
    } else if (option.onClick) {
      option.onClick();
      onClose();
    }
  };

  const handleSubmenuClick = (submenuOption: MenuOption) => {
    if (submenuOption.disabled) {
      return;
    }
    
    if (submenuOption.onClick) {
      submenuOption.onClick();
      // Small delay to ensure the onClick executes before menu closes
      setTimeout(() => onClose(), 50);
    }
  };

  return (
    <>
      {/* Main Menu */}
      <div
        ref={menuRef}
        className="fixed z-[10000] bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[230px]"
        style={{
          left: `${adjustedX}px`,
          top: `${adjustedY}px`,
        }}
      >
        {options.map((option, index) => (
          <React.Fragment key={index}>
            {option.separator ? (
              <div className="border-t border-gray-200 my-1" />
            ) : (
              <button
                onClick={() => handleOptionClick(option, index)}
                disabled={option.disabled}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors
                  ${option.disabled 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : option.danger 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                  ${activeSubmenu === index ? 'bg-blue-50 text-blue-700' : ''}
                `}
              >
                {option.icon && (
                  <span className="w-4 h-4 flex-shrink-0">
                    {option.icon}
                  </span>
                )}
                <span className="flex-1">{option.label || ''}</span>
                {option.submenu && (
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Submenu */}
      {activeSubmenu !== null && submenuPosition && options[activeSubmenu]?.submenu && (
        <div
          data-submenu="true"
          className="fixed z-[10001] bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[210px] pointer-events-auto"
          style={{
            left: `${Math.min(submenuPosition.x, window.innerWidth - 230)}px`,
            top: `${Math.min(submenuPosition.y, window.innerHeight - (options[activeSubmenu]!.submenu!.length * 40 + 16))}px`,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          {options[activeSubmenu]!.submenu!.map((submenuOption, submenuIndex) => (
            <React.Fragment key={submenuIndex}>
              {submenuOption.separator ? (
                <div className="border-t border-gray-200 my-1" />
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmenuClick(submenuOption);
                  }}
                  disabled={submenuOption.disabled}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors
                    ${submenuOption.disabled 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : submenuOption.danger 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {submenuOption.icon && (
                    <span className="w-4 h-4 flex-shrink-0">
                      {submenuOption.icon}
                    </span>
                  )}
                  <span className="flex-1">{submenuOption.label || ''}</span>
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  );
};

TaskCard.displayName = 'TaskCard';
export { TaskCard };
import React, { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MoreHorizontal, ArrowRight, Trash2, Plus, Move, Undo } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useMatrixStore } from '../../store/useMatrixStore';
import { TaskCard } from '../task/TaskCard';
import { Portal } from '../common/Portal';
import { TaskState, Task, QuadrantKey } from '../../types';
import { QUADRANT_CONFIG } from '../../utils/constants';

interface UnassignedDropZoneProps {
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
}

export const UnassignedDropZone: React.FC<UnassignedDropZoneProps> = ({
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
  onBulkTasksMoved
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);
  const [showMoveQuadrantSubmenu, setShowMoveQuadrantSubmenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [submenuPosition, setSubmenuPosition] = useState<'right' | 'left'>('right');
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const quadrantSubmenuRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  const unassignedTasks = useTaskStore(state => state.unassigned);
  const { clearCompleted, moveAllTasksBetweenQuadrants, undoLastMoveAll } = useTaskStore();
  const { getMatrixSummaries, getCurrentMatrix, moveAllTasksToMatrix } = useMatrixStore();

  const matrices = getMatrixSummaries();
  const currentMatrix = getCurrentMatrix();
  const otherMatrices = matrices.filter(m => m.id !== currentMatrix?.id);
  const completedCount = unassignedTasks.filter(t => t.completed).length;

  // Get other quadrants for internal moves
  const otherQuadrants = (['doFirst', 'schedule', 'delegate', 'eliminate'] as const);

  const getQuadrantDisplayName = (key: QuadrantKey): string => {
    return QUADRANT_CONFIG[key].title;
  };

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const scheduleHide = () => {
    clearHideTimeout();
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowMoveSubmenu(false);
      setShowMoveQuadrantSubmenu(false);
      hideTimeoutRef.current = null;
    }, 300);
  };

  const closeAllMenus = () => {
    clearHideTimeout();
    setIsMenuOpen(false);
    setShowMoveSubmenu(false);
    setShowMoveQuadrantSubmenu(false);
  };

  const calculateMenuPosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 230;
    const menuHeight = 300; // Approximate height
    
    let x = buttonRect.right - menuWidth;
    let y = buttonRect.bottom + 8;

    // Adjust if menu would go off-screen
    if (x < 10) {
      x = buttonRect.left;
    }
    if (x + menuWidth > window.innerWidth - 10) {
      x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight - 10) {
      y = buttonRect.top - menuHeight - 8;
    }

    setMenuPosition({ x, y });
  };

  const handleMenuToggle = () => {
    if (!isMenuOpen) {
      calculateMenuPosition();
      setIsMenuOpen(true);
    } else {
      closeAllMenus();
    }
  };

  const handleMoveAllToMatrix = (targetMatrixId: string, targetQuadrant: QuadrantKey = 'doFirst') => {
    if (currentMatrix) {
      const movedCount = moveAllTasksToMatrix(currentMatrix.id, 'unassigned', targetMatrixId, targetQuadrant);
      
      if (movedCount > 0 && onBulkTasksMoved) {
        const targetMatrix = matrices.find(m => m.id === targetMatrixId);
        if (targetMatrix) {
          onBulkTasksMoved(movedCount, targetMatrix.name);
        }
      }
    }
    closeAllMenus();
  };

  const handleMoveAllToQuadrant = (targetQuadrant: QuadrantKey) => {
    const result = moveAllTasksBetweenQuadrants('unassigned', targetQuadrant);
    
    if (result.success) {
      console.log(`Successfully moved ${result.movedCount} tasks from unassigned to ${targetQuadrant}`);
    } else {
      console.error(`Failed to move tasks: ${result.error}`);
      alert(`Failed to move tasks: ${result.error}`);
    }
    
    closeAllMenus();
  };

  const handleUndoLastMove = () => {
    const success = undoLastMoveAll();
    
    if (success) {
      console.log('Successfully undid last move operation');
    } else {
      console.log('No move operation to undo or undo failed');
      alert('No recent move operation to undo');
    }
    
    closeAllMenus();
  };

  const handleClearCompleted = () => {
    clearCompleted('unassigned');
    closeAllMenus();
  };

  const handleCreateNewMatrix = () => {
    if (onCreateNewMatrix) {
      onCreateNewMatrix('unassigned');
    }
    closeAllMenus();
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is inside main menu
      const isInsideMainMenu = menuRef.current && menuRef.current.contains(target);
      
      // Check if click is inside button
      const isInsideButton = buttonRef.current && buttonRef.current.contains(target);
      
      // Check if click is inside any submenu
      const isInsideSubmenu = (submenuRef.current && submenuRef.current.contains(target)) ||
                             (quadrantSubmenuRef.current && quadrantSubmenuRef.current.contains(target));
      
      if (!isInsideMainMenu && !isInsideButton && !isInsideSubmenu) {
        clearHideTimeout();
        closeAllMenus();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearHideTimeout();
        closeAllMenus();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Calculate submenu position
  React.useEffect(() => {
    if ((showMoveSubmenu || showMoveQuadrantSubmenu) && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const submenuWidth = 250;
      
      if (menuRect.right + submenuWidth > screenWidth - 20) {
        setSubmenuPosition('left');
      } else {
        setSubmenuPosition('right');
      }
    }
  }, [showMoveSubmenu, showMoveQuadrantSubmenu]);

  // Update menu position on scroll/resize
  React.useEffect(() => {
    const handlePositionUpdate = () => {
      if (isMenuOpen) {
        calculateMenuPosition();
      }
    };

    if (isMenuOpen) {
      window.addEventListener('scroll', handlePositionUpdate, true);
      window.addEventListener('resize', handlePositionUpdate);
    }

    return () => {
      window.removeEventListener('scroll', handlePositionUpdate, true);
      window.removeEventListener('resize', handlePositionUpdate);
    };
  }, [isMenuOpen]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      className={`
        p-4 border-2 border-dashed rounded-xl relative
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
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">
            {unassignedTasks.length}
          </span>
          
          {/* Context Menu Button */}
          <button
            ref={buttonRef}
            onClick={handleMenuToggle}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="More actions"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {unassignedTasks.length === 0 ? (
        <p className="text-gray-400 text-center py-4 text-xs leading-relaxed">
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
                onTaskMoved={onTaskMoved}
                onOpenStatusPanel={onOpenStatusPanel}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Clear Completed Button */}
      {completedCount > 0 && (
        <button
          onClick={handleClearCompleted}
          className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-3 text-sm rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Trash2 className="w-4 h-4" />
          Clear {completedCount} completed
        </button>
      )}

      {/* Portal-rendered Context Menu */}
      {isMenuOpen && (
        <Portal>
          <div
            ref={menuRef}
            className="fixed z-[10000] bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[230px]"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            {/* Move All Tasks to Matrix */}
            <div 
              className="relative"
              onMouseEnter={() => {
                clearHideTimeout();
                if (!showMoveSubmenu) {
                  setShowMoveSubmenu(true);
                  setShowMoveQuadrantSubmenu(false);
                }
              }}
              onMouseLeave={scheduleHide}
            >
              <button
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMoveSubmenu(!showMoveSubmenu)}
              >
                <ArrowRight className="w-4 h-4" />
                <span className="flex-1">Move all to matrix →</span>
              </button>

              {/* Move to Matrix Submenu */}
              {showMoveSubmenu && (
                <Portal>
                  <div
                    ref={submenuRef}
                    className={`fixed z-[10001] bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[250px]`}
                    style={{
                      left: submenuPosition === 'right' 
                        ? `${menuPosition.x + 230 + 4}px`
                        : `${menuPosition.x - 250 - 4}px`,
                      top: `${menuPosition.y}px`,
                    }}
                    onMouseEnter={clearHideTimeout}
                    onMouseLeave={scheduleHide}
                  >
                    {otherMatrices.length > 0 ? (
                      <>
                        {otherMatrices.map((matrix) => (
                          <button
                            key={matrix.id}
                            onClick={() => handleMoveAllToMatrix(matrix.id, 'doFirst')}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <ArrowRight className="w-4 h-4" />
                            <div className="flex-1">
                              <div className="font-medium">{matrix.name}</div>
                              <div className="text-xs text-gray-500">
                                as Do First
                              </div>
                            </div>
                          </button>
                        ))}
                        
                        <div className="border-t border-gray-200 my-1" />
                      </>
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No other matrices available
                      </div>
                    )}

                    {/* Create New Matrix Option */}
                    <button
                      onClick={handleCreateNewMatrix}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="flex-1">New Matrix</span>
                    </button>
                  </div>
                </Portal>
              )}
            </div>

            {/* Move All Tasks to Quadrant */}
            <div 
              className="relative"
              onMouseEnter={() => {
                clearHideTimeout();
                if (!showMoveQuadrantSubmenu) {
                  setShowMoveQuadrantSubmenu(true);
                  setShowMoveSubmenu(false);
                }
              }}
              onMouseLeave={scheduleHide}
            >
              <button
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMoveQuadrantSubmenu(!showMoveQuadrantSubmenu)}
              >
                <Move className="w-4 h-4" />
                <span className="flex-1">Move all to quadrant →</span>
              </button>

              {/* Move to Quadrant Submenu */}
              {showMoveQuadrantSubmenu && (
                <Portal>
                  <div
                    ref={quadrantSubmenuRef}
                    className={`fixed z-[10001] bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[250px]`}
                    style={{
                      left: submenuPosition === 'right' 
                        ? `${menuPosition.x + 230 + 4}px`
                        : `${menuPosition.x - 250 - 4}px`,
                      top: `${menuPosition.y + 40}px`, // Offset for second menu item
                    }}
                    onMouseEnter={clearHideTimeout}
                    onMouseLeave={scheduleHide}
                  >
                    {otherQuadrants.map((targetQuadrant) => (
                      <button
                        key={targetQuadrant}
                        onClick={() => handleMoveAllToQuadrant(targetQuadrant)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{getQuadrantDisplayName(targetQuadrant)}</div>
                          <div className="text-xs text-gray-500">
                            Move all tasks to this quadrant
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </Portal>
              )}
            </div>

            <div className="border-t border-gray-200 my-1" />

            {/* Undo Last Move */}
            <button
              onClick={handleUndoLastMove}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <Undo className="w-4 h-4" />
              <span className="flex-1">Undo last move</span>
            </button>

            <div className="border-t border-gray-200 my-1" />

            {/* Clear Completed */}
            <button
              onClick={handleClearCompleted}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <Trash2 className="w-4 h-4" />
              <span className="flex-1">Clear completed tasks</span>
            </button>
          </div>
        </Portal>
      )}
    </div>
  );
};
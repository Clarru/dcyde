import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, ArrowRight, Trash2, Plus } from 'lucide-react';
import { QuadrantKey } from '../../types';
import { useMatrixStore } from '../../store/useMatrixStore';
import { QUADRANT_CONFIG } from '../../utils/constants';

interface QuadrantMenuProps {
  quadrantKey: QuadrantKey;
  onMoveAllToMatrix: (targetMatrixId: string, targetQuadrant: QuadrantKey) => void;
  onClearCompleted: () => void;
  onCreateNewMatrix: (quadrant: QuadrantKey) => void;
}

export const QuadrantMenu: React.FC<QuadrantMenuProps> = ({
  quadrantKey,
  onMoveAllToMatrix,
  onClearCompleted,
  onCreateNewMatrix
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState<'right' | 'left'>('right');
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  
  const { getMatrixSummaries, getCurrentMatrix } = useMatrixStore();
  
  const matrices = getMatrixSummaries();
  const currentMatrix = getCurrentMatrix();
  
  // Filter out current matrix from move options
  const otherMatrices = matrices.filter(m => m.id !== currentMatrix?.id);

  // Calculate submenu position to keep it on screen
  useEffect(() => {
    if (showMoveSubmenu && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const submenuWidth = 220; // min-w-[220px]
      
      // Check if submenu would go off the right edge
      if (menuRect.right + submenuWidth > screenWidth - 20) {
        setSubmenuPosition('left');
      } else {
        setSubmenuPosition('right');
      }
    }
  }, [showMoveSubmenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
          (!submenuRef.current || !submenuRef.current.contains(event.target as Node))) {
        
        // Clear any pending timeout when clicking outside
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        
        setIsOpen(false);
        setShowMoveSubmenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Clear timeout on escape
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        
        setIsOpen(false);
        setShowMoveSubmenu(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Clear timeout on cleanup and when main menu closes
  useEffect(() => {
    if (!isOpen && hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
      setShowMoveSubmenu(false);
    }
  }, [isOpen]);

  // Clear timeout on cleanup
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, []);

  const getQuadrantDisplayName = (key: QuadrantKey): string => {
    return QUADRANT_CONFIG[key].title;
  };

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleMoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearHideTimeout();
    setShowMoveSubmenu(!showMoveSubmenu);
  };

  const handleMoveHover = () => {
    clearHideTimeout();
    
    // Show submenu on hover only if not already shown
    if (!showMoveSubmenu) {
      setShowMoveSubmenu(true);
    }
  };

  const scheduleHide = () => {
    clearHideTimeout();
    
    // Schedule hiding with a delay
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowMoveSubmenu(false);
      hideTimeoutRef.current = null;
    }, 300); // 300ms delay
  };

  const handleMoveLeave = () => {
    scheduleHide();
  };

  const handleSubmenuEnter = () => {
    clearHideTimeout();
  };

  const handleSubmenuLeave = () => {
    scheduleHide();
  };

  const closeAllMenus = () => {
    clearHideTimeout();
    setIsOpen(false);
    setShowMoveSubmenu(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        title="More actions"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-8 right-0 z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px]"
        >
          {/* Move All Tasks */}
          <div 
            className="relative"
            onMouseEnter={handleMoveHover}
            onMouseLeave={handleMoveLeave}
          >
            <button
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              onClick={handleMoveClick}
            >
              <ArrowRight className="w-4 h-4" />
              <span className="flex-1">Move all to matrix →</span>
            </button>

            {/* Move Submenu */}
            {showMoveSubmenu && (
              <div
                ref={submenuRef}
                className={`absolute top-0 z-[10000] bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[220px] ${
                  submenuPosition === 'right' 
                    ? 'left-full ml-1' 
                    : 'right-full mr-1'
                }`}
                onMouseEnter={handleSubmenuEnter}
                onMouseLeave={handleSubmenuLeave}
              >
                {otherMatrices.length > 0 ? (
                  <>
                    {otherMatrices.map((matrix) => (
                      <button
                        key={matrix.id}
                        onClick={() => {
                          onMoveAllToMatrix(matrix.id, quadrantKey);
                          closeAllMenus();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium">{matrix.name}</div>
                          <div className="text-xs text-gray-500">
                            as {getQuadrantDisplayName(quadrantKey)}
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
                  onClick={() => {
                    onCreateNewMatrix(quadrantKey);
                    closeAllMenus();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                  <span className="flex-1">New Matrix</span>
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 my-1" />

          {/* Clear Completed */}
          <button
            onClick={() => {
              onClearCompleted();
              closeAllMenus();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <Trash2 className="w-4 h-4" />
            <span className="flex-1">Clear completed tasks</span>
          </button>
        </div>
      )}
    </div>
  );
}; 
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
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { getMatrixSummaries, getCurrentMatrix } = useMatrixStore();
  
  const matrices = getMatrixSummaries();
  const currentMatrix = getCurrentMatrix();
  
  // Filter out current matrix from move options
  const otherMatrices = matrices.filter(m => m.id !== currentMatrix?.id);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowMoveSubmenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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

  const getQuadrantDisplayName = (key: QuadrantKey): string => {
    return QUADRANT_CONFIG[key].title;
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
            onMouseEnter={() => setShowMoveSubmenu(true)}
            onMouseLeave={() => setShowMoveSubmenu(false)}
          >
            <button
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="flex-1">Move all to matrix →</span>
            </button>

            {/* Move Submenu */}
            {showMoveSubmenu && (
              <div
                className="absolute left-full top-0 ml-2 z-[10000] bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[220px]"
              >
                {otherMatrices.length > 0 ? (
                  <>
                    {otherMatrices.map((matrix) => (
                      <button
                        key={matrix.id}
                        onClick={() => {
                          onMoveAllToMatrix(matrix.id, quadrantKey);
                          setIsOpen(false);
                          setShowMoveSubmenu(false);
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
                    setIsOpen(false);
                    setShowMoveSubmenu(false);
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
              setIsOpen(false);
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
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GripHorizontal } from 'lucide-react';

interface DraggableDividerProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
  className?: string;
}

export const DraggableDivider: React.FC<DraggableDividerProps> = ({
  onMouseDown,
  isDragging,
  className = ''
}) => {
  const [isNearby, setIsNearby] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);
  const proximityThreshold = 40; // pixels
  const checkIntervalRef = useRef<number | null>(null);
  const lastMousePositionRef = useRef({ x: 0, y: 0 });

  // Debounced proximity check function
  const checkProximity = useCallback((mouseX: number, mouseY: number) => {
    if (!dividerRef.current) return false;

    const rect = dividerRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const distance = Math.abs(mouseY - centerY);
    
    // Check if mouse is within proximity threshold and within horizontal bounds
    return distance <= proximityThreshold && 
           mouseX >= rect.left && 
           mouseX <= rect.right;
  }, [proximityThreshold]);

  // Optimized mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
    
    // Only check proximity if not already dragging
    if (!isDragging) {
      const isWithinProximity = checkProximity(e.clientX, e.clientY);
      
      // Only update state if it actually changed to prevent unnecessary re-renders
      setIsNearby(current => {
        if (current !== isWithinProximity) {
          return isWithinProximity;
        }
        return current;
      });
    }
  }, [isDragging, checkProximity]);

  // Handle mouse leave events to ensure clean state
  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setIsNearby(false);
    }
  }, [isDragging]);

  // Set up mouse tracking
  useEffect(() => {
    if (!isDragging) {
      // Use throttled mouse tracking for better performance
      let animationFrameId: number;
      
      const throttledMouseMove = (e: MouseEvent) => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        
        animationFrameId = requestAnimationFrame(() => {
          handleMouseMove(e);
        });
      };

      document.addEventListener('mousemove', throttledMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

      return () => {
        document.removeEventListener('mousemove', throttledMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    } else {
      // Keep visible while dragging
      setIsNearby(true);
    }
  }, [isDragging, handleMouseMove, handleMouseLeave]);

  // Clean up when dragging ends
  useEffect(() => {
    if (!isDragging) {
      // Small delay to allow for smooth transition out
      const timer = setTimeout(() => {
        const { x, y } = lastMousePositionRef.current;
        const isWithinProximity = checkProximity(x, y);
        setIsNearby(isWithinProximity);
      }, 150); // Slightly longer delay for smoother transition
      
      return () => clearTimeout(timer);
    }
  }, [isDragging, checkProximity]);

  // Determine visual state
  const isVisible = isNearby || isDragging;
  const isActive = isDragging;

  return (
    <div
      ref={dividerRef}
      className={`
        relative flex items-center justify-center
        transition-all duration-200 ease-out
        select-none overflow-hidden
        ${isVisible 
          ? 'h-3 bg-gray-200 cursor-row-resize border-t border-b border-gray-300' 
          : 'h-px bg-gray-300 cursor-default border-0'
        }
        ${isActive ? 'bg-blue-300 shadow-md' : isVisible ? 'hover:bg-gray-300' : ''}
        ${className}
      `}
      onMouseDown={isVisible ? onMouseDown : undefined}
      title={isVisible ? "Drag to resize sections" : undefined}
    >
      {/* Visual Handle */}
      <div 
        className={`
          flex items-center justify-center w-8 rounded-sm
          transition-all duration-200 ease-out
          ${isVisible 
            ? 'h-full opacity-100 scale-100' 
            : 'h-0 opacity-0 scale-75'
          }
          ${isActive 
            ? 'bg-blue-400 text-white shadow-sm' 
            : 'bg-gray-400 text-gray-600'
          }
        `}
      >
        <GripHorizontal 
          className={`
            transition-all duration-200 ease-out
            ${isVisible ? 'w-3 h-3 opacity-100' : 'w-0 h-0 opacity-0'}
          `} 
        />
      </div>

      {/* Active Drag Indicator */}
      {isActive && (
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div className="h-0.5 bg-blue-500 mx-4 rounded-full shadow-sm">
            <div className="h-full bg-blue-400 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Tooltip */}
      {isVisible && (
        <div className={`
          absolute left-full ml-3 top-1/2 transform -translate-y-1/2
          px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg
          whitespace-nowrap pointer-events-none z-20
          transition-all duration-200 ease-out
          ${isActive 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
          }
        `}>
          {isActive ? 'Release to set size' : 'Drag to resize'}
          
          {/* Tooltip arrow */}
          <div className="absolute right-full top-1/2 transform -translate-y-1/2">
            <div className="border-4 border-transparent border-r-gray-900" />
          </div>
        </div>
      )}

      {/* Extended hit area for better UX */}
      <div 
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: `-${proximityThreshold / 2}px`,
          bottom: `-${proximityThreshold / 2}px`,
        }}
      />
    </div>
  );
};
import { useState, useCallback, useEffect, useRef } from 'react';

interface UseDraggableResizeOptions {
  initialTopHeight?: number;
  minTopHeight?: number;
  minBottomHeight?: number;
  storageKey?: string;
}

interface UseDraggableResizeReturn {
  topHeight: number;
  bottomHeight: number;
  isDragging: boolean;
  dividerProps: {
    onMouseDown: (e: React.MouseEvent) => void;
    className: string;
  };
  topSectionProps: {
    style: { height: string };
  };
  bottomSectionProps: {
    style: { height: string };
  };
}

export const useDraggableResize = ({
  initialTopHeight = 200,
  minTopHeight = 120,
  minBottomHeight = 120,
  storageKey = 'sidebar-resize'
}: UseDraggableResizeOptions = {}): UseDraggableResizeReturn => {
  const containerRef = useRef<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [topHeight, setTopHeight] = useState(() => {
    // Load from localStorage if available
    if (storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= minTopHeight) {
          return parsed;
        }
      }
    }
    return initialTopHeight;
  });

  // Calculate bottom height based on container and top height
  const [containerHeight, setContainerHeight] = useState(600); // Default fallback
  const bottomHeight = Math.max(containerHeight - topHeight - 8, minBottomHeight); // 8px for divider

  // Update container height on resize
  useEffect(() => {
    const updateContainerHeight = () => {
      // Find the sidebar container
      const sidebar = document.querySelector('.sidebar-container');
      if (sidebar) {
        const rect = sidebar.getBoundingClientRect();
        const availableHeight = rect.height - 120; // Account for header and input sections
        setContainerHeight(availableHeight);
        containerRef.current = sidebar as HTMLElement;
      }
    };

    updateContainerHeight();
    window.addEventListener('resize', updateContainerHeight);
    
    // Use ResizeObserver for more accurate container size tracking
    const resizeObserver = new ResizeObserver(updateContainerHeight);
    const sidebar = document.querySelector('.sidebar-container');
    if (sidebar) {
      resizeObserver.observe(sidebar);
    }

    return () => {
      window.removeEventListener('resize', updateContainerHeight);
      resizeObserver.disconnect();
    };
  }, []);

  // Save to localStorage when topHeight changes
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, topHeight.toString());
    }
  }, [topHeight, storageKey]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startY = e.clientY;
    const startTopHeight = topHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newTopHeight = startTopHeight + deltaY;
      
      // Apply constraints
      const constrainedTopHeight = Math.max(
        minTopHeight,
        Math.min(newTopHeight, containerHeight - minBottomHeight - 8)
      );
      
      setTopHeight(constrainedTopHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [topHeight, containerHeight, minTopHeight, minBottomHeight]);

  return {
    topHeight,
    bottomHeight,
    isDragging,
    dividerProps: {
      onMouseDown: handleMouseDown,
      className: `
        h-2 bg-gray-200 hover:bg-gray-300 cursor-row-resize transition-colors duration-150
        border-t border-b border-gray-300 relative group
        ${isDragging ? 'bg-blue-300' : ''}
      `
    },
    topSectionProps: {
      style: { height: `${topHeight}px` }
    },
    bottomSectionProps: {
      style: { height: `${bottomHeight}px` }
    }
  };
};
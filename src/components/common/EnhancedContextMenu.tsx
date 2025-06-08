import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Edit2, Trash2, Copy, ExternalLink, ChevronRight, Plus } from 'lucide-react';

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

export const EnhancedContextMenu: React.FC<EnhancedContextMenuProps> = ({ 
  x, 
  y, 
  onClose, 
  options 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<{ x: number; y: number } | null>(null);



  useEffect(() => {
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
  const adjustedX = Math.min(x, window.innerWidth - 220);
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
        className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px]"
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
          className="fixed z-[10001] bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[180px] pointer-events-auto"
          style={{
            left: `${Math.min(submenuPosition.x, window.innerWidth - 200)}px`,
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
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className={`
                flex items-center gap-1 hover:text-blue-600 transition-colors
                ${item.isActive 
                  ? 'text-gray-900 font-medium' 
                  : 'text-gray-600 hover:underline'
                }
              `}
            >
              {index === 0 && <Home className="w-4 h-4" />}
              <span>{item.label}</span>
            </button>
          ) : (
            <span className={`
              flex items-center gap-1
              ${item.isActive 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-600'
              }
            `}>
              {index === 0 && <Home className="w-4 h-4" />}
              <span>{item.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}; 
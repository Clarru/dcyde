import React, { useState } from 'react';
import { Download, HelpCircle, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { DateSelector } from './DateSelector';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

interface HeaderProps {
  showHelp: boolean;
  onToggleHelp: () => void;
  onExport: () => void;
  currentPeriod: string;
  onPeriodChange: (period: string, value: string) => void;
  matrixTitle: string;
  onMatrixTitleChange: (title: string) => void;
  onNavigateToAll?: () => void;
  onCreateMatrix?: () => void;
  onDeleteMatrix?: () => void;
  breadcrumbs?: BreadcrumbItem[];
  showDateSelector?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  showHelp, 
  onToggleHelp, 
  onExport, 
  onPeriodChange,
  matrixTitle,
  onMatrixTitleChange,
  onNavigateToAll,
  onCreateMatrix,
  onDeleteMatrix,
  breadcrumbs,
  showDateSelector = true
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(matrixTitle);

  const handleTitleSave = () => {
    onMatrixTitleChange(tempTitle.trim() || 'Priority Matrix');
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTempTitle(matrixTitle);
      setIsEditingTitle(false);
    }
  };

  return (
    <header className="space-y-4">
      {/* Breadcrumb Navigation */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="pt-2">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="flex items-start justify-between">
        {/* Left: Back Button (legacy support) */}
        <div className="flex items-center gap-4">
          {/* Legacy back button for when breadcrumbs aren't used */}
          {onNavigateToAll && !breadcrumbs && (
            <button 
              onClick={onNavigateToAll}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              title="Go back to all matrices"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="text-sm font-medium">All Matrices</span>
            </button>
          )}
        </div>

        {/* Center: Date Selector + Matrix Title Group */}
        <div className="flex flex-col items-center gap-3">
          {showDateSelector && (
            <DateSelector onPeriodChange={onPeriodChange} />
          )}
          
          {/* Editable Matrix Title */}
          {isEditingTitle ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyPress}
              className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none text-center min-w-[200px] transition-all duration-200"
              autoFocus
            />
          ) : (
            <div 
              className="flex items-center gap-2 group cursor-pointer transition-all duration-200 hover:scale-[1.02]" 
              onClick={() => {
                setTempTitle(matrixTitle);
                setIsEditingTitle(true);
              }}
            >
              <h1 className="text-2xl font-bold text-gray-900 transition-colors duration-200 group-hover:text-blue-600">
                {matrixTitle}
              </h1>
            </div>
          )}
        </div>

        {/* Right: New Matrix + Action Buttons */}
        <div className="flex items-center gap-2">
          {onCreateMatrix && (
            <button 
              onClick={onCreateMatrix}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
              title="Create new matrix"
            >
              <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
              <span className="text-sm font-medium">New</span>
            </button>
          )}
          
          {onDeleteMatrix && (
            <button
              onClick={onDeleteMatrix}
              className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-[1.05] active:scale-[0.95]"
              title="Delete matrix"
            >
              <Trash2 className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
            </button>
          )}
          
          <button
            onClick={onExport}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-[1.05] active:scale-[0.95]"
            title="Export tasks"
          >
            <Download className="w-5 h-5 transition-transform duration-200 hover:-translate-y-0.5" />
          </button>
          
          <button
            onClick={onToggleHelp}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] ${
              showHelp 
                ? 'bg-blue-100 text-blue-600 shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Show help (press ?)"
          >
            <HelpCircle className={`w-5 h-5 transition-transform duration-200 ${showHelp ? 'rotate-180' : 'hover:rotate-12'}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
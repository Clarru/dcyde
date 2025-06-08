import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

type DatePeriodType = 'quarter' | 'nextQuarter' | 'month' | 'date' | 'custom';

interface DateSelectorProps {
  onPeriodChange: (period: DatePeriodType, value: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ onPeriodChange }) => {
  const [periodType, setPeriodType] = useState<DatePeriodType>('month');
  const [isOpen, setIsOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
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

  const getCurrentQuarter = () => {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const quarter = Math.floor(month / 3) + 1;
    return `Q${quarter} ${year}`;
  };

  const getNextQuarter = () => {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const currentQuarter = Math.floor(month / 3) + 1;
    const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
    const nextYear = currentQuarter === 4 ? year + 1 : year;
    return `Q${nextQuarter} ${nextYear}`;
  };

  const getCurrentMonth = () => {
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDisplayValue = () => {
    switch (periodType) {
      case 'quarter':
        return getCurrentQuarter();
      case 'nextQuarter':
        return getNextQuarter();
      case 'month':
        return getCurrentMonth();
      case 'date':
        return getCurrentDate();
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const end = new Date(customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return `${start} - ${end}`;
        }
        return 'Custom Range';
      default:
        return getCurrentMonth();
    }
  };

  const handlePeriodTypeChange = (newType: DatePeriodType) => {
    setPeriodType(newType);
    setIsOpen(false);
    
    let value = '';
    switch (newType) {
      case 'quarter':
        value = getCurrentQuarter();
        break;
      case 'nextQuarter':
        value = getNextQuarter();
        break;
      case 'month':
        value = getCurrentMonth();
        break;
      case 'date':
        value = getCurrentDate();
        break;
      case 'custom':
        value = 'Custom Range';
        break;
    }
    
    onPeriodChange(newType, value);
  };

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = new Date(customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      onPeriodChange('custom', `${start} - ${end}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="font-medium text-gray-900">{getDisplayValue()}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <button
              onClick={() => handlePeriodTypeChange('quarter')}
              className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 ${
                periodType === 'quarter' ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              Current Quarter ({getCurrentQuarter()})
            </button>
            <button
              onClick={() => handlePeriodTypeChange('nextQuarter')}
              className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 ${
                periodType === 'nextQuarter' ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              Next Quarter ({getNextQuarter()})
            </button>
            <button
              onClick={() => handlePeriodTypeChange('month')}
              className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 ${
                periodType === 'month' ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              Current Month ({getCurrentMonth()})
            </button>
            <button
              onClick={() => handlePeriodTypeChange('date')}
              className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 ${
                periodType === 'date' ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              Today ({getCurrentDate()})
            </button>
            <button
              onClick={() => handlePeriodTypeChange('custom')}
              className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 ${
                periodType === 'custom' ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              Custom Range
            </button>
            
            {periodType === 'custom' && (
              <div className="mt-2 p-3 border-t border-gray-200">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  <button
                    onClick={handleCustomDateChange}
                    disabled={!customStartDate || !customEndDate}
                    className="w-full mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 
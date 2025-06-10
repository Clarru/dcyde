import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, X, Check } from 'lucide-react';

type DatePeriodType = 'quarter' | 'nextQuarter' | 'month' | 'date' | 'custom';

interface DateSelectorProps {
  onPeriodChange: (period: DatePeriodType, value: string) => void;
}

interface QuickOption {
  type: DatePeriodType;
  label: string;
  value: string;
  description?: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ onPeriodChange }) => {
  const [selectedType, setSelectedType] = useState<DatePeriodType>('month');
  const [isOpen, setIsOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomForm(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowCustomForm(false);
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

  // Generate quick options
  const getQuickOptions = (): QuickOption[] => {
    const now = new Date();
    const currentMonth = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    const currentQuarter = `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
    const nextQuarter = (() => {
      const currentQ = Math.floor(now.getMonth() / 3) + 1;
      const nextQ = currentQ === 4 ? 1 : currentQ + 1;
      const nextYear = currentQ === 4 ? now.getFullYear() + 1 : now.getFullYear();
      return `Q${nextQ} ${nextYear}`;
    })();
    const today = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return [
      {
        type: 'month',
        label: 'This Month',
        value: currentMonth,
        description: currentMonth
      },
      {
        type: 'quarter',
        label: 'Current Quarter',
        value: currentQuarter,
        description: currentQuarter
      },
      {
        type: 'nextQuarter',
        label: 'Next Quarter',
        value: nextQuarter,
        description: nextQuarter
      },
      {
        type: 'date',
        label: 'Today',
        value: today,
        description: today
      }
    ];
  };

  const quickOptions = getQuickOptions();
  const selectedOption = quickOptions.find(opt => opt.type === selectedType);

  const getDisplayValue = () => {
    if (selectedType === 'custom') {
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const end = new Date(customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${start} - ${end}`;
      }
      return 'Custom Range';
    }
    return selectedOption?.value || 'Select Period';
  };

  const handleQuickSelect = (option: QuickOption) => {
    setSelectedType(option.type);
    setIsOpen(false);
    setShowCustomForm(false);
    onPeriodChange(option.type, option.value);
  };

  const handleCustomSelect = () => {
    setShowCustomForm(true);
    // Don't close dropdown, show custom form instead
  };

  const handleCustomSubmit = () => {
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = new Date(customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const value = `${start} - ${end}`;
      
      setSelectedType('custom');
      setIsOpen(false);
      setShowCustomForm(false);
      onPeriodChange('custom', value);
    }
  };

  const handleCustomCancel = () => {
    setShowCustomForm(false);
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const isCustomFormValid = customStartDate && customEndDate && new Date(customStartDate) <= new Date(customEndDate);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 px-4 py-2.5 bg-white border rounded-lg transition-all duration-200
          ${isOpen 
            ? 'border-blue-500 ring-2 ring-blue-100 shadow-md' 
            : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
          }
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
        `}
      >
        <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className="font-medium text-gray-900 min-w-0 truncate">
          {getDisplayValue()}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[10000] overflow-hidden">
          {!showCustomForm ? (
            <>
              {/* Quick Options */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Select</h3>
                <div className="space-y-1">
                  {quickOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => handleQuickSelect(option)}
                      className={`
                        w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-150
                        ${selectedType === option.type 
                          ? 'bg-blue-50 border border-blue-200 text-blue-900' 
                          : 'hover:bg-gray-50 border border-transparent'
                        }
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                      </div>
                      {selectedType === option.type && (
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Custom Range Option */}
              <div className="p-3">
                <button
                  onClick={handleCustomSelect}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-150
                    ${selectedType === 'custom' 
                      ? 'bg-blue-50 border border-blue-200 text-blue-900' 
                      : 'hover:bg-gray-50 border border-transparent'
                    }
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">Custom Range</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {selectedType === 'custom' && customStartDate && customEndDate
                        ? `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`
                        : 'Choose your own date range'
                      }
                    </div>
                  </div>
                  {selectedType === 'custom' && (
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Custom Date Form */
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Custom Date Range</h3>
                <button
                  onClick={handleCustomCancel}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={customStartDate}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCustomCancel}
                    className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomSubmit}
                    disabled={!isCustomFormValid}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
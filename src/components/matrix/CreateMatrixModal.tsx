import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CreateMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMatrix: (name: string) => void;
}

export const CreateMatrixModal: React.FC<CreateMatrixModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreateMatrix 
}) => {
  const [matrixName, setMatrixName] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMatrixName('');
      setIsFocused(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matrixName.trim()) {
      onCreateMatrix(matrixName.trim());
      setMatrixName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001] transition-opacity duration-300">
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-100 animate-in fade-in slide-in-from-bottom-4" 
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Matrix</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <X className="w-5 h-5 text-gray-500 transition-transform duration-200 hover:rotate-90" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="matrix-name" className="block text-sm font-medium text-gray-700 mb-2">
              Matrix Name
            </label>
            <div className="relative">
              <input
                id="matrix-name"
                type="text"
                value={matrixName}
                onChange={(e) => setMatrixName(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="e.g., July 2025, Q3 Planning, Work Sprint"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  isFocused 
                    ? 'border-blue-500 shadow-md scale-[1.01]' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                autoFocus
              />
              {isFocused && (
                <div className="absolute inset-0 rounded-lg bg-blue-50 opacity-20 pointer-events-none transition-opacity duration-200" />
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!matrixName.trim()}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              Create Matrix
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
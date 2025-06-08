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

  useEffect(() => {
    if (isOpen) {
      setMatrixName('');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" onKeyDown={handleKeyDown}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Matrix</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="matrix-name" className="block text-sm font-medium text-gray-700 mb-2">
              Matrix Name
            </label>
            <input
              id="matrix-name"
              type="text"
              value={matrixName}
              onChange={(e) => setMatrixName(e.target.value)}
              placeholder="e.g., July 2025, Q3 Planning, Work Sprint"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!matrixName.trim()}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Create Matrix
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
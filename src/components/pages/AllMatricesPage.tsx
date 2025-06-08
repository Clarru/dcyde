import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useMatrixStore } from '../../store/useMatrixStore';
import { MatrixCard } from '../matrix/MatrixCard';
import { CreateMatrixModal } from '../matrix/CreateMatrixModal';
import { Header } from '../common/Header';
import { Logo } from '../common/Logo';

interface AllMatricesPageProps {
  onNavigateToMatrix: (matrixId: string) => void;
}

export const AllMatricesPage: React.FC<AllMatricesPageProps> = ({ onNavigateToMatrix }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { getMatrixSummaries, createMatrix } = useMatrixStore();
  
  const matrices = getMatrixSummaries();

  const handleCreateMatrix = (name: string) => {
    const matrixId = createMatrix(name);
    setShowCreateModal(false);
    onNavigateToMatrix(matrixId);
  };

  const handleOpenMatrix = (matrixId: string) => {
    onNavigateToMatrix(matrixId);
  };

  // Empty state when no matrices exist
  if (matrices.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Logo />
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">New Matrix</span>
              </button>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-900">No matrices yet</h2>
              <p className="text-gray-600 mb-6">Create your first matrix to start organizing</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Matrix
              </button>
            </div>
          </div>

          <CreateMatrixModal 
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreateMatrix={handleCreateMatrix}
          />
        </div>
      </div>
    );
  }

  // Main grid view with matrices
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-white border-b border-gray-200">
                      <div className="flex items-center justify-between">
              <Logo />
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">New Matrix</span>
              </button>
            </div>
        </div>

        {/* Matrix Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Matrices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matrices.map((matrix) => (
                <MatrixCard
                  key={matrix.id}
                  matrix={matrix}
                  onOpen={() => handleOpenMatrix(matrix.id)}
                />
              ))}
              
              {/* Add New Matrix Card */}
              <div 
                onClick={() => setShowCreateModal(true)}
                className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer p-6 flex flex-col items-center justify-center min-h-[200px] hover:bg-gray-100"
              >
                <div className="text-4xl mb-2 text-gray-400">+</div>
                <div className="text-gray-600 font-medium">Create New Matrix</div>
              </div>
            </div>
          </div>
        </div>

        <CreateMatrixModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateMatrix={handleCreateMatrix}
        />
      </div>
    </div>
  );
}; 
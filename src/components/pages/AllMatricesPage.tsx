import React, { useState } from 'react';
import { Plus, Grid3X3, ArrowRight } from 'lucide-react';
import { useMatrixStore } from '../../store/useMatrixStore';
import { MatrixCard } from '../matrix/MatrixCard';
import { CreateMatrixModal } from '../matrix/CreateMatrixModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Logo } from '../common/Logo';

interface AllMatricesPageProps {
  onNavigateToMatrix: (matrixId: string) => void;
}

export const AllMatricesPage: React.FC<AllMatricesPageProps> = ({ onNavigateToMatrix }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; matrixId: string; matrixName: string }>({
    isOpen: false,
    matrixId: '',
    matrixName: ''
  });
  const { getMatrixSummaries, createMatrix, deleteMatrix } = useMatrixStore();
  
  const matrices = getMatrixSummaries();

  const handleCreateMatrix = (name: string) => {
    const matrixId = createMatrix(name);
    setShowCreateModal(false);
    onNavigateToMatrix(matrixId);
  };

  const handleOpenMatrix = (matrixId: string) => {
    onNavigateToMatrix(matrixId);
  };

  const handleDeleteMatrix = (matrixId: string, matrixName: string) => {
    setDeleteConfirm({
      isOpen: true,
      matrixId,
      matrixName
    });
  };

  const confirmDelete = () => {
    deleteMatrix(deleteConfirm.matrixId);
    setDeleteConfirm({ isOpen: false, matrixId: '', matrixName: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, matrixId: '', matrixName: '' });
  };

  // Empty state when no matrices exist
  if (matrices.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Logo className="h-8 w-auto" />
                  <div className="h-6 w-px bg-gray-300"></div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Priority Matrices</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Organize tasks with the Eisenhower method</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg shadow-md font-medium"
                >
                  <Plus className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
                  <span>New Matrix</span>
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md mx-auto">
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 transform transition-all duration-500 hover:scale-105 hover:rotate-3">
                  <Grid3X3 className="w-12 h-12 text-blue-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              
              <h2 className="text-3xl font-bold mb-4 text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                Welcome to dcyde
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Create your first priority matrix to start organizing tasks using the proven Eisenhower methodology
              </p>
              
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl shadow-lg"
              >
                <Plus className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
                Create Your First Matrix
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              
              <div className="mt-12 grid grid-cols-2 gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>Urgent & Important</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Important, Not Urgent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Urgent, Not Important</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Neither Urgent nor Important</span>
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
  }

  // Main grid view with matrices
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div className="flex flex-col min-h-screen">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Logo className="h-8 w-auto" />
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Priority Matrices</h1>
                  <p className="text-xs text-gray-500 mt-0.5">Organize tasks with the Eisenhower method</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg shadow-md font-medium"
              >
                <Plus className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
                <span>New Matrix</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* All Matrices Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <Grid3X3 className="w-4 h-4 text-gray-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">All Matrices</h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {matrices.length}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {matrices.map((matrix, index) => (
                  <div
                    key={matrix.id}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <MatrixCard
                      matrix={matrix}
                      onOpen={() => handleOpenMatrix(matrix.id)}
                      onDelete={() => handleDeleteMatrix(matrix.id, matrix.name)}
                    />
                  </div>
                ))}
                
                {/* Add New Matrix Card */}
                <div 
                  onClick={() => setShowCreateModal(true)}
                  className="group bg-white/40 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300/60 hover:border-blue-400/60 transition-all duration-300 cursor-pointer p-8 flex flex-col items-center justify-center min-h-[240px] hover:bg-white/60 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Plus className="w-8 h-8 text-blue-600 transition-transform duration-300 group-hover:rotate-90" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                    Create New Matrix
                  </h3>
                  <p className="text-sm text-gray-500 text-center leading-relaxed">
                    Start organizing tasks with a new priority matrix
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CreateMatrixModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateMatrix={handleCreateMatrix}
        />

        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          title="Delete Matrix"
          message={`Are you sure you want to delete "${deleteConfirm.matrixName}"? This will permanently delete all tasks in this matrix. This action cannot be undone.`}
          confirmText="Delete Matrix"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          danger
        />
      </div>
    </div>
  );
};
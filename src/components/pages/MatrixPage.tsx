import React, { useState, useEffect } from 'react';
import { Header } from '../common/Header';
import { HelpModal } from '../common/HelpModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Sidebar } from '../common/Sidebar';
import { Quadrant } from '../matrix/Quadrant';
import { CreateMatrixModal } from '../matrix/CreateMatrixModal';
import { useToast } from '../common/Toast';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useMatrixStore } from '../../store/useMatrixStore';
import { useMatrixTaskSync } from '../../hooks/useMatrixTaskSync';
import { useTaskStore } from '../../store/useTaskStore';
import { QUADRANT_CONFIG } from '../../utils/constants';
import { exportTasks } from '../../utils/export';
import { QuadrantKey } from '../../types';

interface MatrixPageProps {
  matrixId: string;
  onNavigateToAll: () => void;
  onNavigateToMatrix: (matrixId: string) => void;
}

export const MatrixPage: React.FC<MatrixPageProps> = ({ matrixId, onNavigateToAll, onNavigateToMatrix }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState('December 2024');
  
  const { getCurrentMatrix, updateMatrix, setCurrentMatrix, createMatrix, deleteMatrix } = useMatrixStore();
  const tasks = useTaskStore();
  const { success, error, ToastContainer } = useToast();
  
  // Set current matrix and sync tasks
  useEffect(() => {
    setCurrentMatrix(matrixId);
  }, [matrixId, setCurrentMatrix]);
  
  // Use the sync hook to keep global task store in sync with current matrix
  useMatrixTaskSync(matrixId);
  
  const currentMatrix = getCurrentMatrix();
  
  // Redirect to all matrices if matrix not found
  useEffect(() => {
    if (!currentMatrix) {
      onNavigateToAll();
    }
  }, [currentMatrix, onNavigateToAll]);

  const {
    dragOverTarget,
    insertionPreview,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    setInsertionPreview
  } = useDragAndDrop();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        setShowHelp(!showHelp);
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        setShowHelp(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showHelp]);

  if (!currentMatrix) {
    return <div>Loading...</div>;
  }

  const handleExport = () => {
    exportTasks({
      unassigned: tasks.unassigned,
      doFirst: tasks.doFirst,
      schedule: tasks.schedule,
      delegate: tasks.delegate,
      eliminate: tasks.eliminate
    });
  };

  const handlePeriodChange = (period: string, value: string) => {
    setCurrentPeriod(value);
  };

  const handleMatrixTitleChange = (title: string) => {
    updateMatrix(matrixId, { name: title });
  };

  const handleCreateMatrix = (name: string) => {
    const newMatrixId = createMatrix(name);
    setShowCreateModal(false);
    onNavigateToMatrix(newMatrixId);
  };

  const handleDeleteMatrix = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMatrix = () => {
    deleteMatrix(matrixId);
    setShowDeleteConfirm(false);
    onNavigateToAll(); // Navigate back to all matrices after deletion
  };

  const cancelDeleteMatrix = () => {
    setShowDeleteConfirm(false);
  };

  const handleTaskMoved = (taskTitle: string, targetMatrixName: string) => {
    success(`Task moved to ${targetMatrixName}`, `"${taskTitle}" has been moved successfully.`);
  };

  const handleBulkTasksMoved = (count: number, targetMatrixName: string) => {
    success(`${count} tasks moved to ${targetMatrixName}`, `All tasks have been moved successfully.`);
  };

  const handleCreateNewMatrix = (quadrant: QuadrantKey) => {
    setShowCreateModal(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        dragOverTarget={dragOverTarget}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <Header 
            showHelp={showHelp}
            onToggleHelp={() => setShowHelp(!showHelp)}
            onExport={handleExport}
            currentPeriod={currentPeriod}
            onPeriodChange={handlePeriodChange}
            matrixTitle={currentMatrix.name}
            onMatrixTitleChange={handleMatrixTitleChange}
            onNavigateToAll={onNavigateToAll}
            onCreateMatrix={() => setShowCreateModal(true)}
            onDeleteMatrix={handleDeleteMatrix}
          />
        </div>

        {/* Matrix */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
              {(Object.keys(QUADRANT_CONFIG) as QuadrantKey[]).map((quadrantKey) => (
                <Quadrant
                  key={quadrantKey}
                  quadrantKey={quadrantKey}
                  config={QUADRANT_CONFIG[quadrantKey]}
                  dragOverTarget={dragOverTarget}
                  insertionPreview={insertionPreview}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onSetInsertionPreview={setInsertionPreview}
                  onTaskMoved={handleTaskMoved}
                  onCreateNewMatrix={handleCreateNewMatrix}
                  onBulkTasksMoved={handleBulkTasksMoved}
                />
              ))}
            </div>
          </div>
        </div>

        <HelpModal 
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />

        <CreateMatrixModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateMatrix={handleCreateMatrix}
        />

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Matrix"
          message={`Are you sure you want to delete "${currentMatrix.name}"? This will permanently delete all tasks in this matrix. This action cannot be undone.`}
          confirmText="Delete Matrix"
          cancelText="Cancel"
          onConfirm={confirmDeleteMatrix}
          onCancel={cancelDeleteMatrix}
          danger
        />

        <ToastContainer />
      </div>
    </div>
  );
}; 
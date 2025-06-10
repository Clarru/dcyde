import React, { useState, useEffect } from 'react';
import { Header } from '../common/Header';
import { HelpModal } from '../common/HelpModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Sidebar } from '../common/Sidebar';
import { Quadrant } from '../matrix/Quadrant';
import { CreateMatrixModal } from '../matrix/CreateMatrixModal';
import { TaskStatusPanel } from '../task/TaskStatusPanel';
import { useToast } from '../common/Toast';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useMatrixStore } from '../../store/useMatrixStore';
import { useMatrixTaskSync } from '../../hooks/useMatrixTaskSync';
import { useTaskStore } from '../../store/useTaskStore';
import { QUADRANT_CONFIG } from '../../utils/constants';
import { exportTasks } from '../../utils/export';
import { QuadrantKey, Task, TaskStatus } from '../../types';

interface MatrixPageProps {
  matrixId: string;
  onNavigateToAll: () => void;
  onNavigateToMatrix: (matrixId: string) => void;
}

export const MatrixPage: React.FC<MatrixPageProps> = ({ matrixId, onNavigateToAll, onNavigateToMatrix }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState('December 2024');
  
  const { getCurrentMatrix, updateMatrix, setCurrentMatrix, createMatrix, deleteMatrix } = useMatrixStore();
  const { updateTask } = useTaskStore();
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
        setShowStatusPanel(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showHelp]);

  if (!currentMatrix) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading matrix...</p>
        </div>
      </div>
    );
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

  const handleCreateNewMatrix = (quadrant: QuadrantKey | 'unassigned') => {
    setShowCreateModal(true);
  };

  const handleOpenStatusPanel = (task: Task) => {
    setSelectedTask(task);
    setShowStatusPanel(true);
  };

  const handleStatusSave = (status: TaskStatus, notes: string, title?: string) => {
    if (selectedTask) {
      // Find which quadrant the task is in
      let taskQuadrant: keyof typeof tasks | null = null;
      
      for (const [quadrant, quadrantTasks] of Object.entries(tasks)) {
        if (quadrantTasks.some((t: Task) => t.id === selectedTask.id)) {
          taskQuadrant = quadrant as keyof typeof tasks;
          break;
        }
      }
      
      if (taskQuadrant) {
        const updates: Partial<Task> = { 
          status, 
          notes, 
          notesLastModified: new Date() 
        };
        
        // Include title update if provided
        if (title !== undefined && title !== selectedTask.title) {
          updates.title = title;
        }
        
        updateTask(selectedTask.id, taskQuadrant, updates);
        
        // Update the selected task for the panel
        setSelectedTask({
          ...selectedTask,
          ...updates
        });
      }
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Enhanced Sidebar */}
      <div className="bg-white/80 backdrop-blur-sm border-r border-gray-200/60 shadow-sm">
        <Sidebar
          dragOverTarget={dragOverTarget}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onOpenStatusPanel={handleOpenStatusPanel}
          onTaskMoved={handleTaskMoved}
          onCreateNewMatrix={handleCreateNewMatrix}
          onBulkTasksMoved={handleBulkTasksMoved}
          onNavigateToAll={onNavigateToAll}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header with Proper Z-Index */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 shadow-sm relative z-10">
          <div className="px-6 py-4">
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
        </div>

        {/* Enhanced Matrix Grid - Full Width */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="w-full h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[600px]">
              {(Object.keys(QUADRANT_CONFIG) as QuadrantKey[]).map((quadrantKey, index) => (
                <div
                  key={quadrantKey}
                  className="animate-in fade-in slide-in-from-bottom-4 w-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Quadrant
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
                    onOpenStatusPanel={handleOpenStatusPanel}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modals with Proper Z-Index */}
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

        <TaskStatusPanel
          isOpen={showStatusPanel}
          task={selectedTask}
          onClose={() => setShowStatusPanel(false)}
          onSave={handleStatusSave}
        />

        <ToastContainer />
      </div>
    </div>
  );
};
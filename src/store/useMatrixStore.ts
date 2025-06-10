import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Matrix, MatrixSummary, TaskState } from '../types';
import { useTaskStore } from './useTaskStore';

interface MatrixStore {
  matrices: Matrix[];
  currentMatrixId: string | null;
  
  migrateFromTaskStore: (taskData: TaskState) => string;
  createMatrix: (name: string) => string;
  deleteMatrix: (matrixId: string) => void;
  updateMatrix: (matrixId: string, updates: Partial<Matrix>) => void;
  setCurrentMatrix: (matrixId: string | null) => void;
  getCurrentMatrix: () => Matrix | null;
  getMatrixSummaries: () => MatrixSummary[];
  updateMatrixTasks: (matrixId: string, tasks: TaskState) => void;
  moveTaskToMatrix: (taskId: number, fromMatrixId: string, fromQuadrant: keyof TaskState, toMatrixId: string, toQuadrant?: keyof TaskState) => boolean;
  moveAllTasksToMatrix: (fromMatrixId: string, fromQuadrant: keyof TaskState, toMatrixId: string, toQuadrant?: keyof TaskState) => number;
  clearAllTasks: () => void;
}

export const useMatrixStore = create<MatrixStore>()(
  persist(
    (set, get) => ({
      matrices: [],
      currentMatrixId: null,

      migrateFromTaskStore: (taskData: TaskState) => {
        // Only migrate if there are actually tasks to migrate
        const totalTasks = Object.values(taskData).reduce((sum, tasks) => sum + tasks.length, 0);
        if (totalTasks === 0) {
          console.log('No tasks to migrate, skipping migration');
          return '';
        }

        const now = new Date().toISOString();
        const matrix: Matrix = {
          id: `matrix_${Date.now()}`,
          name: 'Migrated Matrix',
          created: now,
          lastModified: now,
          tasks: taskData
        };

        set((state) => ({
          matrices: [matrix, ...state.matrices],
          currentMatrixId: matrix.id
        }));

        console.log(`Migrated ${totalTasks} tasks to new matrix`);
        return matrix.id;
      },

      createMatrix: (name: string) => {
        const now = new Date().toISOString();
        const matrix: Matrix = {
          id: `matrix_${Date.now()}`,
          name: name.trim() || 'Untitled Matrix',
          created: now,
          lastModified: now,
          tasks: {
            unassigned: [],
            doFirst: [],
            schedule: [],
            delegate: [],
            eliminate: []
          }
        };

        set((state) => ({
          matrices: [...state.matrices, matrix],
          currentMatrixId: matrix.id
        }));

        return matrix.id;
      },

      deleteMatrix: (matrixId: string) => {
        const state = get();
        const matrixToDelete = state.matrices.find(m => m.id === matrixId);
        
        if (!matrixToDelete) return;

        // If this is the current matrix being deleted, clear the global task store
        if (state.currentMatrixId === matrixId) {
          // Clear all tasks from the global task store to prevent re-migration
          const { clearAllTasks } = get();
          clearAllTasks();
        }

        set((state) => ({
          matrices: state.matrices.filter(m => m.id !== matrixId),
          currentMatrixId: state.currentMatrixId === matrixId ? null : state.currentMatrixId
        }));

        console.log(`Deleted matrix: ${matrixToDelete.name}`);
      },

      updateMatrix: (matrixId: string, updates: Partial<Matrix>) => {
        set((state) => ({
          matrices: state.matrices.map(matrix =>
            matrix.id === matrixId
              ? { ...matrix, ...updates, lastModified: new Date().toISOString() }
              : matrix
          )
        }));
      },

      setCurrentMatrix: (matrixId: string | null) => {
        set({ currentMatrixId: matrixId });
      },

      getCurrentMatrix: () => {
        const state = get();
        return state.matrices.find(m => m.id === state.currentMatrixId) || null;
      },

      getMatrixSummaries: () => {
        return get().matrices.map(matrix => {
          const taskCounts = {
            doFirst: matrix.tasks.doFirst.length,
            schedule: matrix.tasks.schedule.length,
            delegate: matrix.tasks.delegate.length,
            eliminate: matrix.tasks.eliminate.length
          };
          
          return {
            id: matrix.id,
            name: matrix.name,
            created: matrix.created,
            lastModified: matrix.lastModified,
            taskCounts,
            totalTasks: Object.values(taskCounts).reduce((sum, count) => sum + count, 0)
          };
        });
      },

      updateMatrixTasks: (matrixId: string, tasks: TaskState) => {
        set((state) => ({
          matrices: state.matrices.map(matrix =>
            matrix.id === matrixId
              ? { ...matrix, tasks, lastModified: new Date().toISOString() }
              : matrix
          )
        }));
      },

      moveTaskToMatrix: (taskId: number, fromMatrixId: string, fromQuadrant: keyof TaskState, toMatrixId: string, toQuadrant?: keyof TaskState) => {
        const state = get();
        const fromMatrix = state.matrices.find(m => m.id === fromMatrixId);
        const toMatrix = state.matrices.find(m => m.id === toMatrixId);
        
        if (!fromMatrix || !toMatrix) return false;
        
        const task = fromMatrix.tasks[fromQuadrant].find(t => t.id === taskId);
        if (!task) return false;
        
        const targetQuadrant = toQuadrant || fromQuadrant;
        const now = new Date().toISOString();
        
        set((state) => ({
          matrices: state.matrices.map(matrix => {
            if (matrix.id === fromMatrixId) {
              return {
                ...matrix,
                tasks: {
                  ...matrix.tasks,
                  [fromQuadrant]: matrix.tasks[fromQuadrant].filter(t => t.id !== taskId)
                },
                lastModified: now
              };
            }
            if (matrix.id === toMatrixId) {
              return {
                ...matrix,
                tasks: {
                  ...matrix.tasks,
                  [targetQuadrant]: [...matrix.tasks[targetQuadrant], task]
                },
                lastModified: now
              };
            }
            return matrix;
          })
        }));
        
        return true;
      },

      moveAllTasksToMatrix: (fromMatrixId: string, fromQuadrant: keyof TaskState, toMatrixId: string, toQuadrant?: keyof TaskState) => {
        const state = get();
        const fromMatrix = state.matrices.find(m => m.id === fromMatrixId);
        const toMatrix = state.matrices.find(m => m.id === toMatrixId);
        
        if (!fromMatrix || !toMatrix) return 0;
        
        const tasksToMove = fromMatrix.tasks[fromQuadrant];
        if (tasksToMove.length === 0) return 0;
        
        const targetQuadrant = toQuadrant || fromQuadrant;
        const now = new Date().toISOString();
        
        set((state) => ({
          matrices: state.matrices.map(matrix => {
            if (matrix.id === fromMatrixId) {
              return {
                ...matrix,
                tasks: { ...matrix.tasks, [fromQuadrant]: [] },
                lastModified: now
              };
            }
            if (matrix.id === toMatrixId) {
              return {
                ...matrix,
                tasks: {
                  ...matrix.tasks,
                  [targetQuadrant]: [...matrix.tasks[targetQuadrant], ...tasksToMove]
                },
                lastModified: now
              };
            }
            return matrix;
          })
        }));
        
        return tasksToMove.length;
      },

      // Clear all tasks from global task store
      clearAllTasks: () => {
        useTaskStore.setState({
          unassigned: [],
          doFirst: [],
          schedule: [],
          delegate: [],
          eliminate: []
        });
      }
    }),
    {
      name: 'dcyde-matrices',
      partialize: (state) => ({
        matrices: state.matrices,
        currentMatrixId: state.currentMatrixId
      })
    }
  )
);
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Matrix, MatrixSummary, TaskState } from '../types';

interface MatrixStore {
  matrices: Matrix[];
  currentMatrixId: string | null;
  
  // Actions
  migrateFromTaskStore: (taskData: any) => string;
  createMatrix: (name: string) => string;
  deleteMatrix: (matrixId: string) => void;
  updateMatrix: (matrixId: string, updates: Partial<Matrix>) => void;
  setCurrentMatrix: (matrixId: string | null) => void;
  getCurrentMatrix: () => Matrix | null;
  getMatrixSummaries: () => MatrixSummary[];
  updateMatrixTasks: (matrixId: string, tasks: TaskState) => void;
  moveTaskToMatrix: (taskId: number, fromMatrixId: string, fromQuadrant: keyof TaskState, toMatrixId: string, toQuadrant?: keyof TaskState) => boolean;
  moveAllTasksToMatrix: (fromMatrixId: string, fromQuadrant: keyof TaskState, toMatrixId: string, toQuadrant?: keyof TaskState) => number;
}

export const useMatrixStore = create<MatrixStore>()(
  persist(
    (set, get) => ({
      matrices: [],
      currentMatrixId: null,

      // Migration helper - create matrix from existing task store data
      migrateFromTaskStore: (taskData: any) => {
        const now = new Date().toISOString();
        const migratedMatrix: Matrix = {
          id: `matrix_${Date.now()}`,
          name: 'Migrated Matrix',
          created: now,
          lastModified: now,
          tasks: {
            unassigned: taskData.unassigned || [],
            doFirst: taskData.doFirst || [],
            schedule: taskData.schedule || [],
            delegate: taskData.delegate || [],
            eliminate: taskData.eliminate || []
          }
        };

        set((state) => ({
          matrices: [migratedMatrix, ...state.matrices],
          currentMatrixId: migratedMatrix.id
        }));

        return migratedMatrix.id;
      },

      createMatrix: (name: string) => {
        const now = new Date().toISOString();
        const newMatrix: Matrix = {
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
          matrices: [...state.matrices, newMatrix],
          currentMatrixId: newMatrix.id
        }));

        return newMatrix.id;
      },

      deleteMatrix: (matrixId: string) => {
        set((state) => ({
          matrices: state.matrices.filter(m => m.id !== matrixId),
          currentMatrixId: state.currentMatrixId === matrixId ? null : state.currentMatrixId
        }));
      },

      updateMatrix: (matrixId: string, updates: Partial<Matrix>) => {
        set((state) => ({
          matrices: state.matrices.map(matrix =>
            matrix.id === matrixId
              ? { 
                  ...matrix, 
                  ...updates, 
                  lastModified: new Date().toISOString() 
                }
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
        const state = get();
        return state.matrices.map(matrix => {
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
              ? { 
                  ...matrix, 
                  tasks,
                  lastModified: new Date().toISOString() 
                }
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
        
        // Remove from source matrix
        const updatedFromTasks = {
          ...fromMatrix.tasks,
          [fromQuadrant]: fromMatrix.tasks[fromQuadrant].filter(t => t.id !== taskId)
        };
        
        // Add to target matrix
        const updatedToTasks = {
          ...toMatrix.tasks,
          [targetQuadrant]: [...toMatrix.tasks[targetQuadrant], task]
        };
        
        // Update both matrices
        set((state) => ({
          matrices: state.matrices.map(matrix => {
            if (matrix.id === fromMatrixId) {
              return { ...matrix, tasks: updatedFromTasks, lastModified: new Date().toISOString() };
            }
            if (matrix.id === toMatrixId) {
              return { ...matrix, tasks: updatedToTasks, lastModified: new Date().toISOString() };
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
        
        // Remove all tasks from source matrix
        const updatedFromTasks = {
          ...fromMatrix.tasks,
          [fromQuadrant]: []
        };
        
        // Add all tasks to target matrix
        const updatedToTasks = {
          ...toMatrix.tasks,
          [targetQuadrant]: [...toMatrix.tasks[targetQuadrant], ...tasksToMove]
        };
        
        // Update both matrices
        set((state) => ({
          matrices: state.matrices.map(matrix => {
            if (matrix.id === fromMatrixId) {
              return { ...matrix, tasks: updatedFromTasks, lastModified: new Date().toISOString() };
            }
            if (matrix.id === toMatrixId) {
              return { ...matrix, tasks: updatedToTasks, lastModified: new Date().toISOString() };
            }
            return matrix;
          })
        }));
        
        return tasksToMove.length;
      }
    }),
    {
      name: 'dcyde-matrices',
      partialize: (state) => ({
        matrices: state.matrices.map(matrix => ({
          ...matrix,
          tasks: {
            unassigned: matrix.tasks.unassigned.map(task => ({
              ...task,
              createdAt: task.createdAt.toISOString()
            })),
            doFirst: matrix.tasks.doFirst.map(task => ({
              ...task,
              createdAt: task.createdAt.toISOString()
            })),
            schedule: matrix.tasks.schedule.map(task => ({
              ...task,
              createdAt: task.createdAt.toISOString()
            })),
            delegate: matrix.tasks.delegate.map(task => ({
              ...task,
              createdAt: task.createdAt.toISOString()
            })),
            eliminate: matrix.tasks.eliminate.map(task => ({
              ...task,
              createdAt: task.createdAt.toISOString()
            }))
          }
        })),
        currentMatrixId: state.currentMatrixId
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        matrices: persistedState?.matrices?.map((matrix: any) => ({
          ...matrix,
          tasks: {
            unassigned: matrix.tasks?.unassigned?.map((task: any) => ({
              ...task,
              createdAt: new Date(task.createdAt)
            })) || [],
            doFirst: matrix.tasks?.doFirst?.map((task: any) => ({
              ...task,
              createdAt: new Date(task.createdAt)
            })) || [],
            schedule: matrix.tasks?.schedule?.map((task: any) => ({
              ...task,
              createdAt: new Date(task.createdAt)
            })) || [],
            delegate: matrix.tasks?.delegate?.map((task: any) => ({
              ...task,
              createdAt: new Date(task.createdAt)
            })) || [],
            eliminate: matrix.tasks?.eliminate?.map((task: any) => ({
              ...task,
              createdAt: new Date(task.createdAt)
            })) || []
          }
        })) || [],
        currentMatrixId: persistedState?.currentMatrixId || null
      })
    }
  )
); 
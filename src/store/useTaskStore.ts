import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskState, TaskStatus } from '../types';

interface TaskStore extends TaskState {
  addTask: (title: string) => void;
  updateTask: (taskId: number, quadrant: keyof TaskState, updates: Partial<Task>) => void;
  deleteTask: (taskId: number, quadrant: keyof TaskState) => void;
  toggleComplete: (taskId: number, quadrant: keyof TaskState) => void;
  moveTask: (taskId: number, fromQuadrant: keyof TaskState, toQuadrant: keyof TaskState, insertIndex?: number) => void;
  clearCompleted: (quadrant: keyof TaskState) => void;
  moveAllTasksBetweenQuadrants: (fromQuadrant: keyof TaskState, toQuadrant: keyof TaskState) => MoveAllResult;
  undoLastMoveAll: () => boolean;
}

interface MoveAllResult {
  success: boolean;
  movedCount: number;
  error?: string;
}

// Optimized: Single global undo state instead of complex tracking
let lastMoveAllOperation: {
  fromQuadrant: keyof TaskState;
  toQuadrant: keyof TaskState;
  movedTasks: Task[];
} | null = null;

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      unassigned: [],
      doFirst: [],
      schedule: [],
      delegate: [],
      eliminate: [],

      addTask: (title: string) => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;

        const newTask: Task = {
          id: Date.now(),
          title: trimmedTitle,
          completed: false,
          createdAt: new Date(),
          status: 'todo'
        };

        set((state) => ({
          unassigned: [...state.unassigned, newTask]
        }));
      },

      updateTask: (taskId: number, quadrant: keyof TaskState, updates: Partial<Task>) => {
        set((state) => ({
          [quadrant]: state[quadrant].map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        }));
      },

      deleteTask: (taskId: number, quadrant: keyof TaskState) => {
        set((state) => ({
          [quadrant]: state[quadrant].filter(task => task.id !== taskId)
        }));
      },

      toggleComplete: (taskId: number, quadrant: keyof TaskState) => {
        set((state) => ({
          [quadrant]: state[quadrant].map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        }));
      },

      moveTask: (taskId: number, fromQuadrant: keyof TaskState, toQuadrant: keyof TaskState, insertIndex?: number) => {
        const state = get();
        const task = state[fromQuadrant].find(t => t.id === taskId);
        if (!task) return;

        if (fromQuadrant === toQuadrant) {
          // Optimized: Early return for same quadrant without index change
          const currentIndex = state[fromQuadrant].findIndex(t => t.id === taskId);
          if (insertIndex === undefined || currentIndex === insertIndex) return;

          const newTasks = [...state[fromQuadrant]];
          newTasks.splice(currentIndex, 1);
          newTasks.splice(insertIndex, 0, task);
          
          set({ [fromQuadrant]: newTasks });
        } else {
          const newToTasks = [...state[toQuadrant]];
          if (insertIndex !== undefined) {
            newToTasks.splice(insertIndex, 0, task);
          } else {
            newToTasks.push(task);
          }

          set({
            [fromQuadrant]: state[fromQuadrant].filter(t => t.id !== taskId),
            [toQuadrant]: newToTasks
          });
        }
      },

      clearCompleted: (quadrant: keyof TaskState) => {
        set((state) => ({
          [quadrant]: state[quadrant].filter(task => !task.completed)
        }));
      },

      moveAllTasksBetweenQuadrants: (fromQuadrant: keyof TaskState, toQuadrant: keyof TaskState): MoveAllResult => {
        if (fromQuadrant === toQuadrant) {
          return { success: false, movedCount: 0, error: 'Same quadrant' };
        }

        const state = get();
        const tasksToMove = state[fromQuadrant];

        if (tasksToMove.length === 0) {
          return { success: false, movedCount: 0, error: 'No tasks to move' };
        }

        // Store for undo
        lastMoveAllOperation = {
          fromQuadrant: toQuadrant,
          toQuadrant: fromQuadrant,
          movedTasks: [...tasksToMove]
        };

        set({
          [fromQuadrant]: [],
          [toQuadrant]: [...state[toQuadrant], ...tasksToMove]
        });

        return { success: true, movedCount: tasksToMove.length };
      },

      undoLastMoveAll: (): boolean => {
        if (!lastMoveAllOperation) return false;

        const { fromQuadrant, toQuadrant, movedTasks } = lastMoveAllOperation;
        const state = get();

        set({
          [fromQuadrant]: state[fromQuadrant].filter(task => 
            !movedTasks.some(movedTask => movedTask.id === task.id)
          ),
          [toQuadrant]: [...state[toQuadrant], ...movedTasks]
        });

        lastMoveAllOperation = null;
        return true;
      }
    }),
    {
      name: 'dcyde-tasks',
      // Optimized: Simplified serialization
      partialize: (state) => ({
        unassigned: state.unassigned,
        doFirst: state.doFirst,
        schedule: state.schedule,
        delegate: state.delegate,
        eliminate: state.eliminate
      })
    }
  )
);
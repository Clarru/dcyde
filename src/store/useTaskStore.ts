import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskState } from '../types';
import { STORAGE_KEY } from '../utils/constants';

interface TaskStore extends TaskState {
  // Actions
  addTask: (title: string) => void;
  updateTask: (taskId: number, quadrant: keyof TaskState, updates: Partial<Task>) => void;
  deleteTask: (taskId: number, quadrant: keyof TaskState) => void;
  toggleComplete: (taskId: number, quadrant: keyof TaskState) => void;
  moveTask: (taskId: number, fromQuadrant: keyof TaskState, toQuadrant: keyof TaskState, insertIndex?: number) => void;
  reorderTask: (taskId: number, quadrant: keyof TaskState, newIndex: number) => void;
  clearCompleted: (quadrant: keyof TaskState) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // Initial state
      unassigned: [],
      doFirst: [],
      schedule: [],
      delegate: [],
      eliminate: [],

      // Actions
      addTask: (title: string) => {
        const newTask: Task = {
          id: Date.now(),
          title: title.trim(),
          completed: false,
          createdAt: new Date()
        };

        set((state) => ({
          ...state,
          unassigned: [...state.unassigned, newTask]
        }));
      },

      updateTask: (taskId: number, quadrant: keyof TaskState, updates: Partial<Task>) => {
        set((state) => ({
          ...state,
          [quadrant]: state[quadrant].map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        }));
      },

      deleteTask: (taskId: number, quadrant: keyof TaskState) => {
        set((state) => ({
          ...state,
          [quadrant]: state[quadrant].filter(task => task.id !== taskId)
        }));
      },

      toggleComplete: (taskId: number, quadrant: keyof TaskState) => {
        set((state) => ({
          ...state,
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
          // Reordering within the same quadrant
          const currentIndex = state[fromQuadrant].findIndex(t => t.id === taskId);
          if (insertIndex !== undefined && currentIndex !== insertIndex) {
            const newTasks = [...state[fromQuadrant]];
            newTasks.splice(currentIndex, 1);
            newTasks.splice(insertIndex, 0, task);
            
            set({
              ...state,
              [fromQuadrant]: newTasks
            });
          }
        } else {
          // Moving between different quadrants
          const newToTasks = [...state[toQuadrant]];
          if (insertIndex !== undefined) {
            newToTasks.splice(insertIndex, 0, task);
          } else {
            newToTasks.push(task);
          }

          set({
            ...state,
            [fromQuadrant]: state[fromQuadrant].filter(t => t.id !== taskId),
            [toQuadrant]: newToTasks
          });
        }
      },

      reorderTask: (taskId: number, quadrant: keyof TaskState, newIndex: number) => {
        const state = get();
        const currentIndex = state[quadrant].findIndex(t => t.id === taskId);
        
        if (currentIndex === -1 || currentIndex === newIndex) return;

        const newTasks = [...state[quadrant]];
        const [movedTask] = newTasks.splice(currentIndex, 1);
        newTasks.splice(newIndex, 0, movedTask);

        set({
          ...state,
          [quadrant]: newTasks
        });
      },

      clearCompleted: (quadrant: keyof TaskState) => {
        set((state) => ({
          ...state,
          [quadrant]: state[quadrant].filter(task => !task.completed)
        }));
      }
    }),
    {
      name: STORAGE_KEY,
      // Use simple persistence without custom storage functions
      partialize: (state) => ({
        unassigned: state.unassigned.map(task => ({
          ...task,
          createdAt: task.createdAt.toISOString()
        })),
        doFirst: state.doFirst.map(task => ({
          ...task,
          createdAt: task.createdAt.toISOString()
        })),
        schedule: state.schedule.map(task => ({
          ...task,
          createdAt: task.createdAt.toISOString()
        })),
        delegate: state.delegate.map(task => ({
          ...task,
          createdAt: task.createdAt.toISOString()
        })),
        eliminate: state.eliminate.map(task => ({
          ...task,
          createdAt: task.createdAt.toISOString()
        }))
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        unassigned: persistedState?.unassigned?.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        })) || [],
        doFirst: persistedState?.doFirst?.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        })) || [],
        schedule: persistedState?.schedule?.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        })) || [],
        delegate: persistedState?.delegate?.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        })) || [],
        eliminate: persistedState?.eliminate?.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        })) || []
      })
    }
  )
); 
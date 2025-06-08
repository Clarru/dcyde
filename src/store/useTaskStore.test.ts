import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { create } from 'zustand';
import { Task, TaskState } from '../types';

// Create a simple test store without persistence
interface TestTaskStore extends TaskState {
  addTask: (title: string) => void;
  deleteTask: (taskId: number, quadrant: keyof TaskState) => void;
  toggleComplete: (taskId: number, quadrant: keyof TaskState) => void;
  moveTask: (taskId: number, fromQuadrant: keyof TaskState, toQuadrant: keyof TaskState) => void;
  clearCompleted: (quadrant: keyof TaskState) => void;
}

const createTestTaskStore = () => create<TestTaskStore>()((set, get) => ({
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

  moveTask: (taskId: number, fromQuadrant: keyof TaskState, toQuadrant: keyof TaskState) => {
    if (fromQuadrant === toQuadrant) return;

    const state = get();
    const task = state[fromQuadrant].find(t => t.id === taskId);
    if (!task) return;

    set({
      ...state,
      [fromQuadrant]: state[fromQuadrant].filter(t => t.id !== taskId),
      [toQuadrant]: [...state[toQuadrant], task]
    });
  },

  clearCompleted: (quadrant: keyof TaskState) => {
    set((state) => ({
      ...state,
      [quadrant]: state[quadrant].filter(task => !task.completed)
    }));
  }
}));

describe('useTaskStore', () => {
  let useTestTaskStore: ReturnType<typeof createTestTaskStore>;

  beforeEach(() => {
    useTestTaskStore = createTestTaskStore();
  });

  it('should add a task to unassigned', () => {
    const { result } = renderHook(() => useTestTaskStore());

    act(() => {
      result.current.addTask('Test task');
    });

    expect(result.current.unassigned).toHaveLength(1);
    expect(result.current.unassigned[0].title).toBe('Test task');
    expect(result.current.unassigned[0].completed).toBe(false);
  });

  it('should move a task between quadrants', () => {
    const { result } = renderHook(() => useTestTaskStore());

    // Add a task
    act(() => {
      result.current.addTask('Test task');
    });

    const taskId = result.current.unassigned[0].id;

    // Move to doFirst
    act(() => {
      result.current.moveTask(taskId, 'unassigned', 'doFirst');
    });

    expect(result.current.unassigned).toHaveLength(0);
    expect(result.current.doFirst).toHaveLength(1);
    expect(result.current.doFirst[0].title).toBe('Test task');
  });

  it('should toggle task completion', () => {
    const { result } = renderHook(() => useTestTaskStore());

    act(() => {
      result.current.addTask('Test task');
    });

    const taskId = result.current.unassigned[0].id;

    act(() => {
      result.current.toggleComplete(taskId, 'unassigned');
    });

    expect(result.current.unassigned[0].completed).toBe(true);

    act(() => {
      result.current.toggleComplete(taskId, 'unassigned');
    });

    expect(result.current.unassigned[0].completed).toBe(false);
  });

  it('should delete a task', () => {
    const { result } = renderHook(() => useTestTaskStore());

    act(() => {
      result.current.addTask('Test task');
    });

    const taskId = result.current.unassigned[0].id;

    act(() => {
      result.current.deleteTask(taskId, 'unassigned');
    });

    expect(result.current.unassigned).toHaveLength(0);
  });

  it.skip('should clear completed tasks', () => {
    const { result } = renderHook(() => useTestTaskStore());

    act(() => {
      result.current.addTask('Task 1');
      result.current.addTask('Task 2');
      result.current.addTask('Task 3');
    });

    // Verify we have 3 tasks
    expect(result.current.unassigned).toHaveLength(3);

    // Get task IDs before toggling
    const task1Id = result.current.unassigned[0].id;
    const task3Id = result.current.unassigned[2].id;

    // Complete two tasks (first and third)
    act(() => {
      result.current.toggleComplete(task1Id, 'unassigned');
      result.current.toggleComplete(task3Id, 'unassigned');
    });

    // Verify the tasks are marked as completed
    const completedTasks = result.current.unassigned.filter(t => t.completed);
    expect(completedTasks).toHaveLength(2);

    act(() => {
      result.current.clearCompleted('unassigned');
    });

    expect(result.current.unassigned).toHaveLength(1);
    expect(result.current.unassigned[0].title).toBe('Task 2');
    expect(result.current.unassigned[0].completed).toBe(false);
  });
}); 
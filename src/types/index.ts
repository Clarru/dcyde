export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
  status?: TaskStatus;
  notes?: string;
  notesLastModified?: Date;
}

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done' | 'blocked' | 'canceled';

export interface TaskState {
  unassigned: Task[];
  doFirst: Task[];
  schedule: Task[];
  delegate: Task[];
  eliminate: Task[];
}

export type QuadrantKey = keyof Omit<TaskState, 'unassigned'>;

export interface QuadrantConfig {
  title: string;
  subtitle: string;
  bgColor: string;
  borderColor: string;
  hoverBg: string;
  dragOverBg: string;
  emptyIcon: string;
  emptyText: string;
}

export type QuadrantConfigs = Record<QuadrantKey, QuadrantConfig>;

export interface DraggedItem {
  taskId: number;
  sourceQuadrant: keyof TaskState;
}

export interface DropTarget {
  quadrant: keyof TaskState;
  insertIndex?: number;
}

// New types for multiple matrices
export interface Matrix {
  id: string;
  name: string;
  created: string;
  lastModified: string;
  tasks: TaskState;
}

export interface MatrixSummary {
  id: string;
  name: string;
  created: string;
  lastModified: string;
  taskCounts: {
    doFirst: number;
    schedule: number;
    delegate: number;
    eliminate: number;
  };
  totalTasks: number;
}
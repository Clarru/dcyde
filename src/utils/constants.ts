import { QuadrantConfigs } from '../types';

export const QUADRANT_CONFIG: QuadrantConfigs = {
  doFirst: {
    title: 'DO FIRST',
    subtitle: 'Urgent & Important',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    hoverBg: 'hover:bg-red-100',
    dragOverBg: 'bg-red-100',
    emptyIcon: '💪',
    emptyText: 'Drop urgent & important tasks here'
  },
  schedule: {
    title: 'SCHEDULE',
    subtitle: 'Not Urgent & Important',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    hoverBg: 'hover:bg-blue-100',
    dragOverBg: 'bg-blue-100',
    emptyIcon: '📅',
    emptyText: 'Drop important but not urgent tasks here'
  },
  delegate: {
    title: 'DELEGATE',
    subtitle: 'Urgent & Not Important',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    hoverBg: 'hover:bg-yellow-100',
    dragOverBg: 'bg-yellow-100',
    emptyIcon: '🤝',
    emptyText: 'Drop tasks others could handle'
  },
  eliminate: {
    title: 'ELIMINATE',
    subtitle: 'Not Urgent & Not Important',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    hoverBg: 'hover:bg-gray-100',
    dragOverBg: 'bg-gray-100',
    emptyIcon: '🚫',
    emptyText: 'Drop tasks to reconsider'
  }
};

export const STORAGE_KEY = 'focusmatrix_tasks'; 
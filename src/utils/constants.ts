import { QuadrantConfigs } from '../types';

export const QUADRANT_CONFIG: QuadrantConfigs = {
  doFirst: {
    title: 'DO FIRST',
    subtitle: 'Urgent & Important',
    bgColor: 'bg-gradient-to-b from-red-50/80 to-white',
    borderColor: 'border-red-100',
    hoverBg: 'hover:bg-red-50',
    dragOverBg: 'bg-red-50',
    emptyIcon: '💪',
    emptyText: 'Drop urgent & important tasks here'
  },
  schedule: {
    title: 'SCHEDULE',
    subtitle: 'Not Urgent & Important',
    bgColor: 'bg-gradient-to-b from-blue-50/80 to-white',
    borderColor: 'border-blue-100',
    hoverBg: 'hover:bg-blue-50',
    dragOverBg: 'bg-blue-50',
    emptyIcon: '📅',
    emptyText: 'Drop important but not urgent tasks here'
  },
  delegate: {
    title: 'DELEGATE',
    subtitle: 'Urgent & Not Important',
    bgColor: 'bg-gradient-to-b from-yellow-50/80 to-white',
    borderColor: 'border-yellow-100',
    hoverBg: 'hover:bg-yellow-50',
    dragOverBg: 'bg-yellow-50',
    emptyIcon: '🤝',
    emptyText: 'Drop tasks others could handle'
  },
  eliminate: {
    title: 'ELIMINATE',
    subtitle: 'Not Urgent & Not Important',
    bgColor: 'bg-gradient-to-b from-gray-50/80 to-white',
    borderColor: 'border-gray-100',
    hoverBg: 'hover:bg-gray-50',
    dragOverBg: 'bg-gray-50',
    emptyIcon: '🚫',
    emptyText: 'Drop tasks to reconsider'
  }
};
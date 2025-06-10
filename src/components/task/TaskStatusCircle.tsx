import React from 'react';
import { TaskStatus } from '../../types';

interface TaskStatusCircleProps {
  status?: TaskStatus;
  size?: number;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  'backlog': 'bg-gray-500',
  'todo': 'bg-blue-500',
  'in-progress': 'bg-yellow-500',
  'in-review': 'bg-purple-500',
  'done': 'bg-green-500',
  'blocked': 'bg-red-500',
  'canceled': 'bg-gray-400'
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  'backlog': 'Backlog',
  'todo': 'Todo',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  'done': 'Done',
  'blocked': 'Blocked',
  'canceled': 'Canceled'
};

export const TaskStatusCircle: React.FC<TaskStatusCircleProps> = ({ 
  status, 
  size = 8 
}) => {
  if (!status) {
    // Default to todo status if none provided
    status = 'todo';
  }

  const colorClass = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <div
      className={`rounded-full flex-shrink-0 ${colorClass}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      title={`Status: ${label}`}
    />
  );
};
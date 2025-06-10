import React, { useState, useEffect, useRef } from 'react';
import { X, Save, FileText, Edit2 } from 'lucide-react';
import { Task, TaskStatus } from '../../types';

interface TaskStatusPanelProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (status: TaskStatus, notes: string, title?: string) => void;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'backlog', label: 'Backlog', color: 'bg-gray-500' },
  { value: 'todo', label: 'Todo', color: 'bg-blue-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-500' },
  { value: 'in-review', label: 'In Review', color: 'bg-purple-500' },
  { value: 'done', label: 'Done', color: 'bg-green-500' },
  { value: 'blocked', label: 'Blocked', color: 'bg-red-500' },
  { value: 'canceled', label: 'Canceled', color: 'bg-gray-400' }
];

export const TaskStatusPanel: React.FC<TaskStatusPanelProps> = ({
  isOpen,
  task,
  onClose,
  onSave
}) => {
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const MAX_CHARACTERS = 1000;

  useEffect(() => {
    if (isOpen && task) {
      setStatus(task.status || 'todo');
      setNotes(task.notes || '');
      setTitle(task.title);
      setIsEditingTitle(false);
      
      // Trigger slide-in animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      // Trigger slide-out animation
      setIsVisible(false);
    }
  }, [isOpen, task]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [notes]);

  useEffect(() => {
    // Focus title input when editing starts
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    if (newNotes.length <= MAX_CHARACTERS) {
      setNotes(newNotes);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as TaskStatus);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleSave = () => {
    if (title.trim()) {
      setIsEditingTitle(false);
    } else {
      // Revert to original title if empty
      setTitle(task?.title || '');
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitle(task?.title || '');
      setIsEditingTitle(false);
    }
  };

  const handleSave = () => {
    if (task) {
      onSave(status, notes, title);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isEditingTitle) {
      onClose();
    } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const getStatusOption = (statusValue: TaskStatus) => {
    return STATUS_OPTIONS.find(option => option.value === statusValue);
  };

  if (!isOpen || !task) return null;

  return (
    <>
      {/* Backdrop with fade-in animation */}
      <div 
        className={`
          fixed inset-0 bg-black z-[10002] transition-opacity duration-300 ease-in-out
          ${isVisible ? 'bg-opacity-25' : 'bg-opacity-0'}
        `}
        onClick={onClose}
      />
      
      {/* Side Panel with slide-in animation */}
      <div 
        className={`
          fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-[10003] flex flex-col
          transform transition-all duration-300 ease-out
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
        onKeyDown={handleKeyDown}
      >
        {/* Header - Task Details and Close Button */}
        <div className="flex justify-between items-center p-6 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-all duration-200 flex-shrink-0 hover:scale-110 active:scale-95"
          >
            <X className="w-5 h-5 text-gray-500 transition-transform duration-200 hover:rotate-90" />
          </button>
        </div>

        {/* Editable Task Title - Full Width */}
        <div className="px-6 pb-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 w-full">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyPress}
                className="w-full text-sm font-medium bg-transparent border-b border-blue-500 focus:outline-none text-gray-900 pb-1 transition-all duration-200"
                placeholder="Enter task title..."
              />
            ) : (
              <>
                <p 
                  className="text-sm text-gray-600 break-words flex-1 cursor-pointer hover:text-gray-800 transition-colors duration-200" 
                  title={`Click to edit: ${title}`}
                  onClick={() => setIsEditingTitle(true)}
                >
                  {title}
                </p>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1 hover:bg-gray-100 rounded transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
                  title="Edit task title"
                >
                  <Edit2 className="w-3 h-3 text-gray-400 transition-colors duration-200 hover:text-gray-600" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Selection */}
          <div>
            <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 mb-3">
              Status
            </label>
            <div className="relative">
              <select
                id="task-status"
                value={status}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all duration-200 hover:border-gray-400"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              {/* Status indicator */}
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 flex items-center">
                <div className={`w-3 h-3 rounded-full ${getStatusOption(status)?.color} transition-all duration-200`} />
              </div>
              
              {/* Dropdown arrow */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-3">
              <label htmlFor="task-notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <span className={`text-xs transition-colors duration-200 ${notes.length > MAX_CHARACTERS * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
                {notes.length}/{MAX_CHARACTERS}
              </span>
            </div>
            
            <textarea
              ref={textareaRef}
              id="task-notes"
              value={notes}
              onChange={handleNotesChange}
              placeholder="Add detailed notes about this task..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[200px] max-h-[400px] transition-all duration-200 hover:border-gray-400"
              style={{ overflow: 'hidden' }}
            />
          </div>
        </div>

        {/* Footer - Sticky at bottom */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
            >
              <Save className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
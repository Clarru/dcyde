import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';

export const TaskInput: React.FC = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useTaskStore(state => state.addTask);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle);
      setNewTaskTitle('');
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="What needs to be done?"
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
            isFocused 
              ? 'border-blue-500 shadow-md scale-[1.01]' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        />
        {isFocused && (
          <div className="absolute inset-0 rounded-lg bg-blue-50 opacity-20 pointer-events-none transition-opacity duration-200" />
        )}
      </div>
      
      <button
        type="submit"
        disabled={!newTaskTitle.trim()}
        className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md disabled:hover:scale-100 disabled:hover:shadow-none"
      >
        <Plus className={`w-4 h-4 transition-transform duration-200 ${newTaskTitle.trim() ? 'rotate-0' : 'rotate-45'}`} />
        Add Task
      </button>
    </form>
  );
};
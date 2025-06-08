import React from 'react';
import { X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">How to Use FocusMatrix Pro</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <section>
            <h3 className="font-semibold mb-2">The Eisenhower Matrix</h3>
            <p className="text-sm text-gray-600">
              Organize tasks by urgency and importance to focus on what truly matters.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Quadrants</h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-medium text-red-600">Do First:</span>
                <span className="text-gray-600">Urgent & Important - Crisis, deadlines</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-blue-600">Schedule:</span>
                <span className="text-gray-600">Not Urgent & Important - Planning, growth</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-yellow-600">Delegate:</span>
                <span className="text-gray-600">Urgent & Not Important - Interruptions</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-600">Eliminate:</span>
                <span className="text-gray-600">Not Urgent & Not Important - Time wasters</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-semibold mb-2">How to Use</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Add new tasks using the input field</li>
              <li>Drag tasks from "Unassigned" to appropriate quadrants</li>
              <li>Click the check icon to mark tasks as complete</li>
              <li>Click the X icon to delete tasks</li>
              <li>Use "Clear completed" to remove finished tasks</li>
            </ol>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Toggle help</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">?</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Close dialogs</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}; 
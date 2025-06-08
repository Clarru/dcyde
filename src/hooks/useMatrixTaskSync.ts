import { useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useMatrixStore } from '../store/useMatrixStore';

export const useMatrixTaskSync = (matrixId: string | null) => {
  const taskStore = useTaskStore();
  const { getCurrentMatrix, updateMatrixTasks } = useMatrixStore();

  // Sync matrix tasks to global task store when matrix changes
  useEffect(() => {
    if (!matrixId) return;
    
    const matrix = getCurrentMatrix();
    if (!matrix) return;

    // Update global task store with current matrix tasks
    const state = useTaskStore.getState();
    const newState = {
      ...state,
      unassigned: matrix.tasks.unassigned,
      doFirst: matrix.tasks.doFirst,
      schedule: matrix.tasks.schedule,
      delegate: matrix.tasks.delegate,
      eliminate: matrix.tasks.eliminate
    };

    // Only update if different to avoid infinite loops
    const hasChanged = 
      JSON.stringify(state.unassigned) !== JSON.stringify(matrix.tasks.unassigned) ||
      JSON.stringify(state.doFirst) !== JSON.stringify(matrix.tasks.doFirst) ||
      JSON.stringify(state.schedule) !== JSON.stringify(matrix.tasks.schedule) ||
      JSON.stringify(state.delegate) !== JSON.stringify(matrix.tasks.delegate) ||
      JSON.stringify(state.eliminate) !== JSON.stringify(matrix.tasks.eliminate);

    if (hasChanged) {
      useTaskStore.setState(newState);
    }
  }, [matrixId, getCurrentMatrix]);

  // Sync global task store changes back to matrix
  useEffect(() => {
    if (!matrixId) return;

    const unsubscribe = useTaskStore.subscribe((state) => {
      const matrix = getCurrentMatrix();
      if (!matrix) return;

      const newTasks = {
        unassigned: state.unassigned,
        doFirst: state.doFirst,
        schedule: state.schedule,
        delegate: state.delegate,
        eliminate: state.eliminate
      };

      // Only update if different to avoid infinite loops
      const hasChanged = 
        JSON.stringify(matrix.tasks.unassigned) !== JSON.stringify(newTasks.unassigned) ||
        JSON.stringify(matrix.tasks.doFirst) !== JSON.stringify(newTasks.doFirst) ||
        JSON.stringify(matrix.tasks.schedule) !== JSON.stringify(newTasks.schedule) ||
        JSON.stringify(matrix.tasks.delegate) !== JSON.stringify(newTasks.delegate) ||
        JSON.stringify(matrix.tasks.eliminate) !== JSON.stringify(newTasks.eliminate);

      if (hasChanged) {
        updateMatrixTasks(matrixId, newTasks);
      }
    });

    return unsubscribe;
  }, [matrixId, getCurrentMatrix, updateMatrixTasks]);
}; 
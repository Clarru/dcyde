import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { AllMatricesPage } from './components/pages/AllMatricesPage';
import { MatrixPage } from './components/pages/MatrixPage';
import { useMatrixStore } from './store/useMatrixStore';
import { useTaskStore } from './store/useTaskStore';
import { generateSlug, findMatrixBySlug } from './utils/urlUtils';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:matrixSlug" element={<MatrixPageWrapper />} />
      </Routes>
    </Router>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const { matrices, migrateFromTaskStore } = useMatrixStore();
  const taskStore = useTaskStore();

  const handleNavigateToMatrix = (matrixId: string) => {
    const matrix = matrices.find(m => m.id === matrixId);
    if (matrix) {
      const slug = generateSlug(matrix.name);
      navigate(`/${slug}`);
    }
  };

  // Migration: Only migrate if no matrices exist AND there are tasks AND this is the initial load
  useEffect(() => {
    // Only run migration on initial load when there are no matrices but tasks exist
    if (matrices.length === 0) {
      const hasExistingTasks = 
        taskStore.unassigned.length > 0 ||
        taskStore.doFirst.length > 0 ||
        taskStore.schedule.length > 0 ||
        taskStore.delegate.length > 0 ||
        taskStore.eliminate.length > 0;

      // Only migrate if there are actually tasks to migrate
      // This prevents creating empty "Migrated Matrix" when user deletes all matrices
      if (hasExistingTasks) {
        console.log('Migrating existing tasks to new matrix...');
        const migratedMatrixId = migrateFromTaskStore({
          unassigned: taskStore.unassigned,
          doFirst: taskStore.doFirst,
          schedule: taskStore.schedule,
          delegate: taskStore.delegate,
          eliminate: taskStore.eliminate
        });
        
        // Navigate to the migrated matrix
        handleNavigateToMatrix(migratedMatrixId);
      }
    }
  }, []); // Empty dependency array - only run on mount

  return (
    <AllMatricesPage 
      onNavigateToMatrix={handleNavigateToMatrix}
    />
  );
}

function MatrixPageWrapper() {
  const { matrixSlug } = useParams<{ matrixSlug: string }>();
  const navigate = useNavigate();
  const { matrices, setCurrentMatrix } = useMatrixStore();
  
  // Find matrix by slug
  const matrix = findMatrixBySlug(matrices, matrixSlug || '');

  // Move useEffect to top level and add conditional logic inside
  useEffect(() => {
    if (!matrix) {
      navigate('/');
    }
  }, [matrix, navigate]);

  const handleNavigateToAll = () => {
    navigate('/');
  };

  const handleNavigateToMatrix = (matrixId: string) => {
    const targetMatrix = matrices.find(m => m.id === matrixId);
    if (targetMatrix) {
      const slug = generateSlug(targetMatrix.name);
      navigate(`/${slug}`);
    }
  };

  if (!matrix) {
    // Matrix not found, redirect to home
    return <div>Matrix not found...</div>;
  }

  return (
    <MatrixPage 
      matrixId={matrix.id}
      onNavigateToAll={handleNavigateToAll}
      onNavigateToMatrix={handleNavigateToMatrix}
    />
  );
}

export default App;
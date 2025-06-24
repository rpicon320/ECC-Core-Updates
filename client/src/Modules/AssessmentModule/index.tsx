import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AssessmentProvider } from './context/AssessmentContext';
import Assessments from './components/Assessments';
import AssessmentForm from './components/assessment/AssessmentForm';

const AssessmentModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Assessments />} />
      <Route path="new" element={<AssessmentForm />} />
      <Route path=":id" element={<AssessmentForm />} />
    </Routes>
  );
};

export default AssessmentModule;

// Export components for direct use
export { AssessmentProvider } from './context/AssessmentContext';
export { default as Assessments } from './components/Assessments';
export { default as AssessmentForm } from './components/assessment/AssessmentForm';
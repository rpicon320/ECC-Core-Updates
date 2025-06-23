import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import EmailVerification from './components/EmailVerification';
import ClientPortal from './components/ClientPortal';
import Clients from './components/Clients';
import Assessments from './components/Assessments';
import AssessmentForm from './components/assessment/AssessmentForm';
import Profile from './components/Profile';
import Admin from './components/Admin';

// ✅ Import ONLY HomePage from ECCResource
import { HomePage } from './modules/ECCResource';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<EmailVerification />} />

      {/* Client Portal */}
      <Route
        path="/client-portal"
        element={
          <ProtectedRoute requireClient>
            <ClientPortal />
          </ProtectedRoute>
        }
      />

      {/* Staff Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute requireStaff>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/clients" replace />} />
        <Route path="clients" element={<Clients />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="assessments/new" element={<AssessmentForm />} />
        <Route path="assessments/:id" element={<AssessmentForm />} />

        {/* ✅ ONLY Resource Directory - no Service Types */}
        <Route path="resources" element={<HomePage />} />

        <Route path="profile" element={<Profile />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
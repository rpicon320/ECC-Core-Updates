import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import EmailVerification from './components/EmailVerification';
import ClientPortal from './components/ClientPortal';
import Clients from './components/Clients';
import Profile from './components/Profile';
import Admin from './components/Admin';

// Import Assessment Module (consolidated)
import AssessmentModule from './Modules/AssessmentModule';

// Import Calendar and Task Tracker modules
import CalendarModule from './Modules/CalendarModule';
import TaskTrackerModule from './Modules/TaskTrackerModule';

// Import ECCResource App component
import { App as ECCResourceApp } from './Modules/ECCResource';

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
        
        {/* Assessment Module Routes */}
        <Route path="assessments/*" element={<AssessmentModule />} />
        
        {/* Calendar Module */}
        <Route path="calendar" element={<CalendarModule />} />
        
        {/* Task Tracker Module */}
        <Route path="tasks" element={<TaskTrackerModule />} />

        {/* ECCResource App component */}
        <Route path="resources" element={<ECCResourceApp />} />

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
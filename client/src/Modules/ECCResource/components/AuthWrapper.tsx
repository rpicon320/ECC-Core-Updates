import React from 'react';

// This file is deprecated - use the main app's AuthContext instead
export { useAuth } from '../../../contexts/AuthContext';

// Provide a default export for compatibility
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default AuthWrapper;
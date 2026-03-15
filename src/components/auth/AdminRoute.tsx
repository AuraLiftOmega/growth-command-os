import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isSuperAdmin } from '@/config/admin';

/**
 * Route guard that restricts access to super admins only.
 * Non-admin authenticated users are redirected to /dashboard.
 * Unauthenticated users are redirected to /auth.
 */
export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isSuperAdmin(user.email)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

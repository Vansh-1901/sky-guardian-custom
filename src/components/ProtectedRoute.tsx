import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isOfficial, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center animate-pulse">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-tactical text-sm">AUTHENTICATING...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isOfficial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="tactical-panel p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tactical-amber/20 border-2 border-tactical-amber/50 flex items-center justify-center">
            <Shield className="w-8 h-8 text-tactical-amber" />
          </div>
          <h2 className="font-tactical text-lg text-tactical-amber mb-2">ACCESS PENDING</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your account has been created but is awaiting approval from an administrator. 
            You will be granted access once your credentials are verified.
          </p>
          <p className="text-xs text-muted-foreground">
            Contact your system administrator for expedited access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

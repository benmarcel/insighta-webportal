import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "../context/Authcontext";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PrivateRouteProps {
  /** If omitted, any authenticated user may access the route. */
  allowedRoles?: UserRole[];
}

// ─── Loading Spinner ─────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <span className="absolute inset-0 rounded-full border-2 border-[#3b82f6]/20" />
          <span className="absolute inset-0 rounded-full border-t-2 border-[#3b82f6] animate-spin" />
        </div>
        <p className="text-[#4b5563] text-sm font-mono tracking-widest uppercase">
          Verifying session
        </p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Wait for the initial session check before making routing decisions
  if (isLoading) return <LoadingScreen />;

  // Not authenticated → redirect to login, preserving the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but wrong role → redirect to an "unauthorized" page (or root)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed — render the child route
  return <Outlet />;
}
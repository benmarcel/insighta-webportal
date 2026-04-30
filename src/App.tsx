import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/Authcontext";
import PrivateRoute from "./components/Privateroute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public routes ─────────────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ── Protected: any authenticated user ─────────────────────────── */}
          <Route element={<PrivateRoute />}>
            {/* Dashboard is accessible to both roles */}
            <Route
              element={<PrivateRoute allowedRoles={["admin", "analyst"]} />}
            >
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Example: admin-only future route
            <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
            */}
          </Route>

          {/* ── Catch-all ─────────────────────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
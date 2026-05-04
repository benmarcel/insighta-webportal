import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Already logged in → skip to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogin = () => {
    // const state = crypto.randomUUID(); // cryptographically random
    // sessionStorage.setItem("oauth_state", state); // keep it for post-redirect verification if needed
    window.location.href = `${BACKEND_URL}/api/v1/auth/login?source=web`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0a0c10] relative overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#8b949e 1px, transparent 1px), linear-gradient(to right, #8b949e 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Radial glow */}
      <div className="absolute inset-0 bg-gradient-radial from-[#1d4ed8]/5 via-transparent to-transparent" />

      <div className="relative z-10 w-full max-w-sm mx-auto px-4">
        {/* Card */}
        <div className="rounded-2xl border border-[#1f2937] bg-[#0d1117] p-8 shadow-2xl shadow-black/50">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.591 2.25l4.5 1.5m0 0a2.25 2.25 0 002.25-2.25V7.5m-10.5 6l4.5 1.5m0 0l4.5-1.5"
                />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-[#e6edf3] tracking-tight">
              Welcome to Insighta
            </h1>
            <p className="text-sm text-[#4b5563] mt-1.5">
              Sign in to access the profile management portal
            </p>
          </div>

          {/* GitHub login button */}
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#161b22] border border-[#30363d] text-[#e6edf3] font-medium text-sm hover:bg-[#1f2937] hover:border-[#484f58] active:scale-[0.98] transition-all duration-150 group"
          >
            <GitHubIcon className="w-5 h-5 shrink-0" />
            Continue with GitHub
            <svg
              className="w-4 h-4 ml-auto text-[#4b5563] group-hover:text-[#8b949e] group-hover:translate-x-0.5 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>

          <p className="text-center text-xs text-[#30363d] mt-6">
            Secured with PKCE · HTTP-only cookies · CSRF protection
          </p>
        </div>

        <p className="text-center text-xs text-[#21262d] mt-6">
          © {new Date().getFullYear()} Insighta · Profile Intelligence Platform
        </p>
      </div>
    </div>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

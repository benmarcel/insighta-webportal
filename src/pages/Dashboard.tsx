import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/Authcontext";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

interface PaginationMeta {
  totalPages: number;
  currentPage: number;
  totalItems?: number;
}

interface ProfilesResponse {
  data: Profile[];
  meta: PaginationMeta;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-[#0d1117] border-r border-[#1f2937] flex flex-col z-20">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#1f2937]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.591 2.25l4.5 1.5m0 0a2.25 2.25 0 002.25-2.25V7.5m-10.5 6l4.5 1.5m0 0l4.5-1.5" />
            </svg>
          </div>
          <span className="text-white font-semibold tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Insighta
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <NavItem
          icon={<GridIcon />}
          label="Dashboard"
          active
        />
        <NavItem icon={<UsersIcon />} label="Profiles" />
        <NavItem icon={<ChartIcon />} label="Analytics" />
        <NavItem icon={<SettingsIcon />} label="Settings" />
      </nav>

      {/* User card */}
      <div className="px-3 py-4 border-t border-[#1f2937] space-y-1">
        <div className="px-3 py-3 rounded-lg bg-[#161b22] flex items-center gap-3">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full ring-1 ring-[#30363d]" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.username?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#e6edf3] truncate">{user?.username}</p>
            <RoleBadge role={user?.role ?? "analyst"} />
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#8b949e] hover:text-[#f85149] hover:bg-[#161b22] transition-colors text-sm group"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
      active
        ? "bg-[#1c2a3f] text-[#58a6ff] font-medium"
        : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]"
    }`}>
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      {label}
    </button>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "text-[#f97316] bg-[#431407]/50",
    analyst: "text-[#22c55e] bg-[#052e16]/50",
  };
  return (
    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${styles[role] ?? "text-[#8b949e] bg-[#1f2937]"}`}>
      {role}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Profile["status"] }) {
  const cfg: Record<Profile["status"], { dot: string; text: string; bg: string }> = {
    active:   { dot: "bg-green-400",  text: "text-green-400",  bg: "bg-green-400/10"  },
    inactive: { dot: "bg-[#6b7280]",  text: "text-[#6b7280]",  bg: "bg-[#6b7280]/10"  },
    pending:  { dot: "bg-yellow-400", text: "text-yellow-400", bg: "bg-yellow-400/10" },
  };
  const c = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ meta, onChange }: { meta: PaginationMeta; onChange: (page: number) => void }) {
  const { currentPage, totalPages } = meta;
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#1f2937]">
      <p className="text-xs text-[#6b7280]">
        Page <span className="text-[#8b949e] font-medium">{currentPage}</span> of{" "}
        <span className="text-[#8b949e] font-medium">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1">
        <PageBtn label="←" onClick={() => onChange(currentPage - 1)} disabled={currentPage === 1} />
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-[#4b5563] text-sm select-none">…</span>
          ) : (
            <PageBtn
              key={p}
              label={String(p)}
              onClick={() => onChange(p as number)}
              active={p === currentPage}
            />
          )
        )}
        <PageBtn label="→" onClick={() => onChange(currentPage + 1)} disabled={currentPage === totalPages} />
      </div>
    </div>
  );
}

function PageBtn({ label, onClick, disabled, active }: { label: string; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[32px] h-8 px-2 rounded text-sm transition-colors font-mono ${
        active
          ? "bg-[#1c2a3f] text-[#58a6ff] border border-[#1d4ed8]/40"
          : disabled
          ? "text-[#374151] cursor-not-allowed"
          : "text-[#8b949e] hover:bg-[#1f2937] hover:text-[#e6edf3]"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function Dashboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ totalPages: 1, currentPage: 1 });
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(val);
      setPage(1);
    }, 350);
  };

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      const url = debouncedQuery.trim()
        ? `/api/v1/profiles/search?q=${encodeURIComponent(debouncedQuery.trim())}&${params}`
        : `/api/v1/profiles?${params}`;

      const { data } = await axiosInstance.get<ProfilesResponse>(url);
      setProfiles(data.data);
      setMeta(data.meta);
    } catch {
      setError("Failed to load profiles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedQuery]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // CSV Export (admin only)
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await axiosInstance.get("/api/v1/profiles/export/csv", {
        responseType: "blob",
      });
      const blob = new Blob([response.data as BlobPart], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `insighta-profiles-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch {
      setError("CSV export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e6edf3]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />

      <main className="ml-60 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-[#0a0c10]/80 backdrop-blur border-b border-[#1f2937] px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#e6edf3] tracking-tight">Profiles</h1>
            <p className="text-xs text-[#4b5563] mt-0.5">
              {meta.totalItems != null
                ? `${meta.totalItems.toLocaleString()} total records`
                : "Profile directory"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search profiles…"
                className="pl-9 pr-4 py-1.5 w-64 rounded-lg bg-[#161b22] border border-[#30363d] text-sm text-[#e6edf3] placeholder-[#4b5563] focus:outline-none focus:border-[#388bfd]/50 focus:ring-1 focus:ring-[#388bfd]/30 transition"
              />
              {query && (
                <button
                  onClick={() => handleQueryChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b5563] hover:text-[#8b949e]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* CSV Export — Admin only */}
            {user?.role === "admin" && (
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1c2a3f] border border-[#1d4ed8]/30 text-[#58a6ff] text-sm font-medium hover:bg-[#1e3a5f] hover:border-[#1d4ed8]/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isExporting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-t border-[#58a6ff] rounded-full animate-spin" />
                    Exporting…
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export CSV
                  </>
                )}
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8">
          {/* Error banner */}
          {error && (
            <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-[#2d1b1b] border border-[#f85149]/30 text-[#f85149] text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
              <button onClick={() => setError(null)} className="ml-auto hover:opacity-70">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Table card */}
          <div className="rounded-xl border border-[#1f2937] overflow-hidden bg-[#0d1117]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1f2937] bg-[#161b22]">
                    {["Name", "Email", "Company", "Role", "Status", "Created"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#4b5563] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-[#161b22]">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-5 py-3.5">
                            <div
                              className="h-3.5 rounded bg-[#1f2937] animate-pulse"
                              style={{ width: `${40 + Math.random() * 40}%` }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : profiles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <svg className="w-10 h-10 text-[#30363d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                          </svg>
                          <p className="text-[#4b5563] text-sm">
                            {debouncedQuery ? `No profiles matching "${debouncedQuery}"` : "No profiles found"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    profiles.map((profile, i) => (
                      <tr
                        key={profile.id}
                        className={`border-b border-[#161b22] hover:bg-[#161b22]/60 transition-colors ${
                          i % 2 === 0 ? "" : "bg-[#0d1117]"
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1d4ed8] to-[#4f46e5] flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                              {profile.name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <span className="font-medium text-[#e6edf3]">{profile.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[#8b949e] font-mono text-xs">{profile.email}</td>
                        <td className="px-5 py-3.5 text-[#8b949e]">{profile.company}</td>
                        <td className="px-5 py-3.5 text-[#8b949e]">{profile.role}</td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={profile.status} />
                        </td>
                        <td className="px-5 py-3.5 text-[#4b5563] font-mono text-xs">
                          {new Date(profile.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination meta={meta} onChange={setPage} />
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Icon Components ──────────────────────────────────────────────────────────

function GridIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75-9.75A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.75-9.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v16.5c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V3.375zm-9.75 9.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V18c0 .621-.504 1.125-1.125 1.125H3.375A1.125 1.125 0 012.25 18v-4.875z" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { reviewQueue, records } = useData();

  const pendingCount = reviewQueue.length;
  const todayUploads = records.filter((r) => {
    const d = new Date(r.uploaded_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;
  
  const lastLanguage = records[0]?.detected_language || "Hindi";

  return (
    <header className="h-14 shrink-0 bg-white border-b border-parchment-200 px-6 flex items-center justify-between">
      {/* Left: system status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-ink-600">
          <span className="w-2 h-2 rounded-full bg-moss-500 animate-pulse-soft"></span>
          <span>Pipeline active</span>
        </div>
        <span className="text-parchment-200">|</span>
        <span className="text-xs text-ink-600">{todayUploads} uploaded today</span>
        <span className="text-parchment-200">|</span>
        <span className={`lang-badge lang-${lastLanguage} uppercase`}>{lastLanguage} OCR</span>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative text-ink-600 hover:text-ink-950 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1.5 bg-saffron-500 text-ink-950 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-600">{user?.full_name}</span>
          <span className="status-pill bg-ink-100 text-ink-700 capitalize">{user?.role}</span>
          <button
            onClick={logout}
            className="text-xs text-ink-600 hover:text-seal-600 transition-colors ml-1"
            title="Sign out"
          >
            ↗ Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";

const NAV_ITEMS = [
  { to: "/search",       label: "Search Records",     icon: "🔍", roles: ["citizen", "admin", "tehsildar", "clerk", "dm"] },
  { to: "/ingestion",    label: "Ingestion Hub",       icon: "📤", roles: ["admin", "tehsildar", "clerk"] },
  { to: "/verification", label: "Verification Desk",   icon: "✅", roles: ["admin", "tehsildar"] },
  { to: "/analytics",    label: "Analytics",            icon: "📊", roles: ["admin", "tehsildar", "dm"] },
  { to: "/repository",   label: "Document Repository",  icon: "🗄️", roles: ["admin", "tehsildar", "clerk", "dm"] },
  { to: "/audit",        label: "Audit Trail",          icon: "🔗", roles: ["admin", "tehsildar", "dm"] },
  { to: "/users",        label: "User Management",      icon: "👥", roles: ["admin"] },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, hasPermission } = useAuth();
  const { reviewQueue } = useData();

  const initials = user?.full_name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <aside className={`shrink-0 bg-ink-950 text-parchment-100 flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}>
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-ink-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="text-saffron-500 text-xl">⚖️</span>
            <div>
              <p className="font-display text-base font-semibold text-white leading-tight">Bhoomi Setu</p>
              <p className="text-[10px] text-ink-400 tracking-wide uppercase">Land Record Digitization</p>
            </div>
          </div>
        )}
        {collapsed && <span className="text-saffron-500 text-xl mx-auto">⚖️</span>}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="text-ink-400 hover:text-white transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.filter(item => item.roles.includes(user?.role)).map((item) => {
          const isVerify = item.to === "/verification";
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active text-white" : "text-ink-300"}`
              }
            >
              <span className="text-base">{item.icon}</span>
              {!collapsed && <span className="flex-1 whitespace-nowrap">{item.label}</span>}
              {!collapsed && isVerify && reviewQueue.length > 0 && (
                <span className="bg-saffron-500 text-ink-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {reviewQueue.length}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-3 border-t border-ink-800 mt-auto">
        <div className={`flex items-center ${collapsed ? "justify-center gap-0" : "gap-2.5"}`}>
          <div className="w-8 h-8 rounded-full bg-ink-700 flex shrink-0 items-center justify-center text-xs font-bold text-parchment-100">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-ink-400 capitalize truncate">{user?.role} • {user?.district}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

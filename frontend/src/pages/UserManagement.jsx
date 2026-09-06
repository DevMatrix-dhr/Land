import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function UserManagement() {
  const { allUsers, updateUserRole, hasPermission } = useAuth();
  
  if (!hasPermission("approve")) { // or specifically check for 'admin'
    return (
      <div className="p-8 text-center text-ink-600">
        You do not have permission to view this page.
      </div>
    );
  }

  const handleRoleChange = (userId, newRole) => {
    updateUserRole(userId, newRole);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl mb-1">User & Role Management</h1>
          <p className="text-sm text-ink-600">Assign roles and post access credentials to registered staff.</p>
        </div>
      </div>

      <div className="card overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-parchment-100 text-ink-700 text-xs uppercase tracking-wide border-b border-parchment-200">
            <tr>
              <th className="text-left px-5 py-3">Staff Name</th>
              <th className="text-left px-5 py-3">Location</th>
              <th className="text-left px-5 py-3">Current Role</th>
              <th className="text-left px-5 py-3">Permissions Preview</th>
              <th className="text-left px-5 py-3">Assign Post Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-parchment-100">
            {allUsers.map((u) => {
              const isPending = u.role === "pending";
              return (
                <tr key={u.user_id} className={`transition-colors ${isPending ? "bg-amber-50/50" : "hover:bg-parchment-50"}`}>
                  <td className="px-5 py-4">
                    <div className="font-medium text-ink-950">{u.full_name}</div>
                    <div className="text-xs text-ink-500 font-mono mt-0.5">{u.username}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-ink-800">{u.district}</div>
                    <div className="text-xs text-ink-500">{u.tehsil} Tehsil</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`status-pill ${
                      u.role === "admin" ? "bg-seal-500/10 text-seal-700" :
                      u.role === "tehsildar" ? "bg-moss-500/10 text-moss-700" :
                      u.role === "clerk" ? "bg-ink-500/10 text-ink-700" :
                      u.role === "dm" ? "bg-saffron-500/10 text-saffron-700" :
                      "bg-amber-500/10 text-amber-700"
                    } capitalize`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {["upload", "verify", "approve", "analytics"].map(perm => (
                        <div 
                          key={perm} 
                          title={perm}
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                            (u.role === "admin" || (u.role === "tehsildar" && perm !== "upload") || (u.role === "clerk" && (perm === "upload" || perm === "repository")) || (u.role === "dm" && perm === "analytics"))
                            ? "bg-moss-500 text-white" : "bg-parchment-200 text-ink-400"
                          }`}
                        >
                          ✓
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                      className="border border-parchment-200 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-ink-500 hover:border-ink-400 cursor-pointer shadow-sm"
                    >
                      <option value="pending">Pending Assignment</option>
                      <option value="clerk">Clerk (Upload only)</option>
                      <option value="tehsildar">Tehsildar (Verify & Approve)</option>
                      <option value="dm">District Magistrate (Read-only)</option>
                      <option value="admin">System Admin (Full Access)</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

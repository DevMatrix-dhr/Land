import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Login from "./pages/Login.jsx";
import Landing from "./pages/Landing.jsx";
import Register from "./pages/Register.jsx";
import Ingestion from "./pages/Ingestion.jsx";
import Verification from "./pages/Verification.jsx";
import Analytics from "./pages/Analytics.jsx";
import Repository from "./pages/Repository.jsx";
import AuditTrail from "./pages/AuditTrail.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import SearchRecords from "./pages/SearchRecords.jsx";

export default function App() {
  const { user } = useAuth();

  // If no user, show unauthenticated routes
  if (!user) {
    return (
      <div className="font-body">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  // Determine default home by role
  const home = user.role === "admin" ? "/analytics"
              : user.role === "citizen" ? "/search"
              : "/ingestion";

  return (
    <div className="flex h-screen bg-parchment-50 overflow-hidden text-ink-950 font-body">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto bg-parchment-50 relative">
          <Routes>
            <Route path="/" element={<Navigate to={home} replace />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="/search" element={<SearchRecords />} />
            {/* Staff-only routes — hidden from citizens */}
            {user.role !== "citizen" && (
              <>
                <Route path="/ingestion" element={<Ingestion />} />
                <Route path="/verification" element={<Verification />} />
                <Route path="/repository" element={<Repository />} />
              </>
            )}
            {/* Admin + analytics roles */}
            {["admin", "tehsildar", "dm"].includes(user.role) && (
              <>
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/audit" element={<AuditTrail />} />
              </>
            )}
            {/* Admin only */}
            {user.role === "admin" && (
              <Route path="/users" element={<UserManagement />} />
            )}
            <Route path="*" element={<Navigate to={home} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    const result = login(username, password);
    if (result.success) {
      navigate(result.user.role === "admin" ? "/analytics" : (result.user.role === "citizen" ? "/search" : "/ingestion"));
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-ink-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-ink-800 rounded-full opacity-30 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-saffron-500 rounded-full opacity-10 blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-ink-700 rounded-full opacity-20 blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Card */}
        <form onSubmit={handleSubmit} className="bg-parchment-50 rounded-xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl">🇮🇳</span>
              <span className="text-3xl text-saffron-500">⚖️</span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink-950">
              Sign In
            </h1>
            <p className="text-sm text-ink-600 mt-1">Bhoomi Setu — Land Record System</p>
          </div>

          {/* Credentials */}
          <div className="mb-4">
            <label className="block text-xs text-ink-600 mb-1.5 font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              className="w-full border border-parchment-200 rounded-md px-3 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-700/30 focus:border-ink-700"
              placeholder="Enter username"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs text-ink-600 mb-1.5 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="w-full border border-parchment-200 rounded-md px-3 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-700/30 focus:border-ink-700"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-seal-600 font-medium mb-4">{error}</p>}

          <button type="submit" className="w-full bg-ink-950 text-parchment-50 rounded-md py-3 text-sm font-medium hover:bg-ink-800 transition-colors">
            Sign in
          </button>

          <div className="mt-4 pt-4 border-t border-parchment-200">
            <div className="flex justify-between items-center text-xs">
              <Link to="/" className="text-ink-500 hover:text-ink-950">
                ← Back home
              </Link>
              <Link to="/register" className="text-saffron-600 font-medium hover:underline">
                New user? Register
              </Link>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { DISTRICTS, TEHSILS } from "../mock/seedData.js";

export default function Register() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    password: "",
    district: DISTRICTS[0],
    tehsil: TEHSILS[0],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.full_name || !formData.username || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }
    
    const result = registerUser(formData);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/login?type=user");
      }, 3000);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-ink-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-moss-600 rounded-full opacity-20 blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-ink-700 rounded-full opacity-20 blur-3xl -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-parchment-50 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-semibold text-ink-950">Staff Registration</h1>
            <p className="text-sm text-ink-600 mt-1">Register for Bhoomi Setu access</p>
          </div>

          {success ? (
            <div className="bg-moss-50 border border-moss-200 rounded-md p-4 text-center animate-fade-in">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-semibold text-moss-700 mb-1">Registration Successful!</h3>
              <p className="text-xs text-moss-600">
                Your account has been created and is awaiting role assignment from an administrator.
              </p>
              <p className="text-xs text-ink-500 mt-3">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-ink-600 mb-1 font-medium">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full border border-parchment-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-700/30"
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div>
                <label className="block text-xs text-ink-600 mb-1 font-medium">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border border-parchment-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-700/30"
                  placeholder="e.g. ramesh_k"
                />
              </div>

              <div>
                <label className="block text-xs text-ink-600 mb-1 font-medium">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-parchment-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-700/30"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-ink-600 mb-1 font-medium">District</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full border border-parchment-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/30"
                  >
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ink-600 mb-1 font-medium">Tehsil</label>
                  <select
                    name="tehsil"
                    value={formData.tehsil}
                    onChange={handleChange}
                    className="w-full border border-parchment-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/30"
                  >
                    {TEHSILS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {error && <p className="text-xs text-seal-600 font-medium">{error}</p>}

              <button type="submit" className="w-full bg-ink-950 text-parchment-50 rounded-md py-2.5 text-sm font-medium hover:bg-ink-800 transition-colors mt-2">
                Create Account
              </button>

              <div className="text-center pt-3 border-t border-parchment-200 mt-4">
                <span className="text-xs text-ink-500">Already registered? </span>
                <Link to="/login?type=user" className="text-xs text-ink-950 font-semibold hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

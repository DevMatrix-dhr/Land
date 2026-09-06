import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-ink-800 rounded-full opacity-30 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-saffron-500 rounded-full opacity-10 blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-ink-700 rounded-full opacity-20 blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl px-8 animate-fade-in flex flex-col items-center">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-6xl">🇮🇳</span>
            <span className="text-5xl text-saffron-500">⚖️</span>
          </div>
          <h1 className="font-display text-5xl font-semibold text-white mb-4 drop-shadow-md">Bhoomi Setu</h1>
          <p className="text-lg text-ink-300 max-w-2xl mx-auto">
            Intelligent Land Record Digitization & Validation System
          </p>
          <p className="text-xs text-ink-500 mt-3 uppercase tracking-widest font-medium">
            Ministry of Rural Development — DoLR
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 w-full max-w-3xl">
          {/* Admin Portal Card */}
          <div className="glass-panel-dark p-8 flex flex-col h-full transform transition-transform hover:-translate-y-1 hover:shadow-2xl">
            <div className="text-4xl mb-4 text-center">🛡️</div>
            <h2 className="text-xl font-semibold text-center mb-2 text-white">Admin Portal</h2>
            <p className="text-sm text-ink-400 text-center mb-8 flex-1">
              For Administrators and District Magistrates to monitor analytics, manage users, and view the audit trail.
            </p>
            <Link 
              to="/login?type=admin" 
              className="w-full bg-saffron-500 text-ink-950 rounded-md py-3 text-sm font-bold text-center hover:bg-saffron-400 transition-colors"
            >
              Admin Login
            </Link>
          </div>

          {/* User Portal Card */}
          <div className="glass-panel-dark p-8 flex flex-col h-full transform transition-transform hover:-translate-y-1 hover:shadow-2xl">
            <div className="text-4xl mb-4 text-center">👨‍💼</div>
            <h2 className="text-xl font-semibold text-center mb-2 text-white">Staff Portal</h2>
            <p className="text-sm text-ink-400 text-center mb-8 flex-1">
              For Tehsildars and Clerks to upload documents, review AI extractions, and verify land records.
            </p>
            <div className="flex flex-col gap-3 mt-auto">
              <Link 
                to="/login?type=user" 
                className="w-full bg-white text-ink-950 rounded-md py-3 text-sm font-bold text-center hover:bg-parchment-100 transition-colors"
              >
                Staff Login
              </Link>
              <div className="text-center">
                <span className="text-xs text-ink-400">New staff member? </span>
                <Link to="/register" className="text-xs text-saffron-500 hover:text-saffron-400 underline font-medium">
                  Register here
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-center gap-6">
          <span className="text-xs text-ink-500 font-medium tracking-wide">POWERED BY</span>
          <span className="text-xs text-ink-400 font-semibold">OpenCV</span>
          <span className="text-xs text-ink-400 font-semibold">PaddleOCR</span>
          <span className="text-xs text-ink-400 font-semibold">NLP</span>
          <span className="text-xs text-ink-400 font-semibold">DILRMP</span>
        </div>
      </div>
    </div>
  );
}

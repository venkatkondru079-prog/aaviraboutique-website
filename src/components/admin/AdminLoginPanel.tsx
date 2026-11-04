import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  LayoutDashboard, 
  CheckCircle2, 
  LogOut, 
  Info 
} from 'lucide-react';

interface AdminLoginPanelProps {
  onLoginSuccess: () => void;
  isLoggedOut?: boolean;
  onReturnToStore?: () => void;
}

export const AdminLoginPanel: React.FC<AdminLoginPanelProps> = ({ 
  onLoginSuccess, 
  isLoggedOut = false,
  onReturnToStore,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const EXPECTED_EMAIL = 'ramani.kondru@gmail.com';
  const EXPECTED_PASSWORD = 'Jenny@040814';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      const enteredPassword = password.trim();

      if (normalizedEmail === EXPECTED_EMAIL && enteredPassword === EXPECTED_PASSWORD) {
        setIsLoading(false);
        setIsVerified(true);
      } else {
        setIsLoading(false);
        setError('Invalid administrator credentials. Access requires registered Administrator credentials.');
      }
    }, 350);
  };

  const handleConfirmEnterAdminPanel = () => {
    try {
      sessionStorage.setItem('aavira_admin_authenticated', 'true');
    } catch {
      // sessionStorage fallback
    }
    onLoginSuccess();
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 font-sans">
      <div className="max-w-md w-full">
        {/* Luxury Card Container */}
        <div className="bg-white rounded-2xl border border-[#E8DFC9] shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#1C1814] text-[#FAF6ED] p-8 text-center relative border-b border-[#3D3124]">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 overflow-hidden border-2 border-[#C5A059]/60 bg-[#FAF0EC] p-1 shadow-md">
              <img
                src="/aavira-logo.svg"
                alt="Aavira Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2A221A] border border-[#4D3C2C] text-[#C5A059] text-[10px] uppercase tracking-widest font-semibold mb-2">
              <ShieldCheck size={13} />
              <span>Atelier Security Clearance</span>
            </div>

            <h2 className="font-serif text-2xl tracking-wider text-[#FAF6ED]">
              Admin Portal Login
            </h2>
            <p className="text-xs text-[#A89A84] mt-1 tracking-wide">
              Registered Administrator Access Gateway
            </p>
          </div>

          {/* Session Termination Notice */}
          {isLoggedOut && !isVerified && (
            <div className="bg-[#FAF3E8] border-b border-[#EADFCB] px-6 py-3 flex items-center gap-2.5 text-xs text-[#7A5B1E]">
              <Info size={16} className="text-[#C5A059] shrink-0" />
              <span>Your session has been terminated. Please re-authenticate with registered credentials.</span>
            </div>
          )}

          {/* Post-Login Workflow: Upon successful verification, present explicit action prompt */}
          {isVerified ? (
            <div className="p-8 space-y-6 animate-fadeIn">
              <div className="bg-[#F6FAF6] border border-[#CDE7D0] rounded-xl p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#205A32] text-white flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E2F2E5] text-[#205A32] text-[10px] font-bold uppercase tracking-widest mb-1">
                    Authentication Successful
                  </span>
                  <h3 className="font-serif text-lg text-[#1C1814] font-bold">
                    Clearance Verified
                  </h3>
                  <p className="text-xs text-[#4E7D59] font-medium mt-0.5">
                    Authorized Managing Director Session: Mrs. K. Ramani
                  </p>
                </div>
                <p className="text-xs text-[#35573E] pt-2 border-t border-[#D7ECDB] leading-relaxed">
                  Your administrator credentials have been authenticated. Click below to enter the management dashboard.
                </p>
              </div>

              {/* Explicit Action Prompt asking the admin to proceed into the Admin Panel */}
              <div className="space-y-3 text-center">
                <p className="text-sm font-medium text-[#2E2419]">
                  Proceed into the Admin Panel Dashboard?
                </p>

                <button
                  type="button"
                  onClick={handleConfirmEnterAdminPanel}
                  id="enter-admin-panel-btn"
                  className="w-full bg-[#1C1814] hover:bg-[#2F241A] text-[#FAF6ED] py-3.5 px-6 rounded-xl text-sm font-semibold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2.5 border border-[#C5A059]/40 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <LayoutDashboard size={18} className="text-[#C5A059]" />
                  <span>Enter Admin Dashboard</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsVerified(false);
                    setPassword('');
                  }}
                  className="w-full py-2 text-xs text-[#8C7A65] hover:text-[#1C1814] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Cancel / Switch Account</span>
                </button>
              </div>
            </div>
          ) : (
            /* Primary Secure Login Form */
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-[#FFF5F5] border border-[#F5C2C2] text-[#9E2A2B] text-xs flex items-start gap-2.5 animate-shake">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3E33] mb-1.5" htmlFor="admin-email">
                    Administrator Email ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7A65]">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      id="admin-email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter administrator email"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-sm text-[#1A1510] placeholder-[#A09383] focus:outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] transition-colors"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3E33]" htmlFor="admin-password">
                      Security Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7A65]">
                      <Key size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="admin-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter security password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#FAF8F5] border border-[#D9CEBA] rounded-lg text-sm text-[#1A1510] placeholder-[#A09383] focus:outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] transition-colors font-mono"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C7A65] hover:text-[#1A1510] cursor-pointer"
                      aria-label="Toggle password visibility"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1C1814] text-[#F3EBD4] py-3 rounded-lg text-xs uppercase tracking-widest font-semibold hover:bg-[#332920] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md border border-[#3D3023] disabled:opacity-50 cursor-pointer"
                id="admin-login-submit-btn"
              >
                {isLoading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Verify & Login</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Notice */}
          <div className="bg-[#F8F4EE] px-8 py-3.5 text-center border-t border-[#EAE2D4]">
            <p className="text-[11px] text-[#8C7A65] flex items-center justify-center gap-1.5">
              <Lock size={12} />
              <span>Direct access restricted to authorized atelier management</span>
            </p>
          </div>
        </div>

        {onReturnToStore && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onReturnToStore}
              className="text-xs text-[#8C7A65] hover:text-[#1C1814] hover:underline cursor-pointer inline-flex items-center gap-1.5 transition-colors"
              id="admin-login-return-store-btn"
            >
              <span>&larr; Return to Boutique Storefront</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

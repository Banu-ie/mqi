import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email tələb olunur."); return; }
    if (!password.trim()) { setError("Şifrə tələb olunur."); return; }

    setLoading(true);
    setTimeout(() => {
      if (email === "admin@mqicma.az" && password === "REDACTED") {
        onLogin();
        navigate("/admin/dashboard");
      } else {
        setError("Email və ya şifrə yanlışdır.");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] via-[#EEF3FD] to-[#F3F0FF] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B6FE0] to-[#7C5CFC] flex items-center justify-center mx-auto mb-5 shadow-xl">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" strokeLinecap="round"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round"/>
              <path d="M9 9h.01M15 9h.01" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="font-['DM_Serif_Display'] text-[#1A2540] text-2xl mb-1">Admin Panel</div>
          <p className="text-[#6B7A99] text-sm">İcma platformasını idarə etmək üçün daxil olun.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-[#E4E9F4] p-8">
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1A2540] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mqicma.az"
                className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] text-[#1A2540] placeholder-[#6B7A99] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 focus:border-[#3B6FE0] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2540] mb-2">Şifrə</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] text-[#1A2540] placeholder-[#6B7A99] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 focus:border-[#3B6FE0] transition-all"
              />
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-[#7C5CFC] text-sm hover:underline">
                Şifrəni unutmusunuz?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Giriş edilir...
                </>
              ) : (
                "Daxil ol"
              )}
            </button>
          </form>

          <p className="text-center text-[#6B7A99] text-xs mt-6">
            Demo: admin@mqicma.az / REDACTED
          </p>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-[#6B7A99] text-sm hover:text-[#3B6FE0] transition-colors">
            ← İctimai sayta qayıt
          </a>
        </div>
      </div>
    </div>
  );
}

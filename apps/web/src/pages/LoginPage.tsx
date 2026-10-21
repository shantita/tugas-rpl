import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle, ArrowRight } from "lucide-react";
import { MascotHeadLogo } from "../components/MascotHeadLogo";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { Login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await Login(email, password);
      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal masuk. Silakan periksa kembali email dan password Anda.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("demo@mahasiswa.ac.id");
    setPassword("password123");
    setError(null);
    setLoading(true);
    try {
      await Login("demo@mahasiswa.ac.id", "password123");
      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal masuk dengan akun demo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50/60 via-slate-50 to-orange-50/50 relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-xl shadow-orange-500/5 border border-slate-200/90 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl shadow-xl shadow-orange-500/20 border border-amber-300/40 mb-3 animate-mascot-bounce">
            <MascotHeadLogo className="w-12 h-12" withCrown />
          </div>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight">Bud</span>
            <span className="text-2xl font-black text-orange-500 tracking-tight">Cat</span>
          </div>
          <h2 className="text-base font-bold text-slate-700">Masuk ke Akun Anda</h2>
          <p className="mt-1 text-xs text-slate-500">
            Kelola uang saku dan anggaran bulanan mahasiswa bersama Si Oyen.
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@mahasiswa.ac.id"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] disabled:opacity-50 transition-all shadow-lg shadow-orange-500/25"
          >
            <span>{loading ? "Memproses..." : "Masuk"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-semibold">Atau</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl text-orange-700 font-bold text-sm bg-orange-50 hover:bg-orange-100/80 border border-orange-200/80 transition-colors"
        >
          Masuk Sebagai Akun Demo
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Belum memiliki akun?{" "}
            <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700 hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

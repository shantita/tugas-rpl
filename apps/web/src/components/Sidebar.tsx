import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, TrendingUp, TrendingDown, PiggyBank, BarChart3, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { MascotHeadLogo } from "./MascotHeadLogo";

export const Sidebar: React.FC = () => {
  const { User, Logout } = useAuth();

  const navItems = [
    { label: "Dashboard", to: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Pemasukan", to: "/incomes", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Pengeluaran", to: "/expenses", icon: <TrendingDown className="w-5 h-5" /> },
    { label: "Anggaran", to: "/budgets", icon: <PiggyBank className="w-5 h-5" /> },
    { label: "Laporan", to: "/reports", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Profil Saya", to: "/profile", icon: <UserIcon className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-md border border-amber-300/40">
          <MascotHeadLogo className="w-8 h-8" withCrown />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900 leading-tight tracking-tight flex items-center gap-0.5">
            <span>Bud</span>
            <span className="text-orange-500">Cat</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">with Si Oyen 🐾</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-orange-50 to-amber-50/70 text-orange-600 font-bold border-r-2 border-orange-500 shadow-xs"
                  : "text-slate-600 hover:bg-orange-50/40 hover:text-slate-900"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <NavLink
          to="/profile"
          className="flex items-center justify-between p-3 bg-slate-50/80 hover:bg-orange-50/70 rounded-xl mb-2 transition-all group cursor-pointer border border-slate-100 hover:border-orange-200/60"
          title="Buka Pengaturan Profil & Password"
        >
          <div className="truncate">
            <p className="text-xs font-bold text-slate-900 group-hover:text-orange-600 truncate transition-colors">
              {User?.Name || "Mahasiswa"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{User?.Email}</p>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 opacity-0 group-hover:opacity-100 transition-opacity">
            Edit
          </span>
        </NavLink>
        <button
          type="button"
          onClick={Logout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
};

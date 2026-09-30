import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, TrendingUp, TrendingDown, PiggyBank, BarChart3, LogOut, Wallet } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const Sidebar: React.FC = () => {
  const { User, Logout } = useAuth();

  const navItems = [
    { label: "Dashboard", to: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Pemasukan", to: "/incomes", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Pengeluaran", to: "/expenses", icon: <TrendingDown className="w-5 h-5" /> },
    { label: "Anggaran", to: "/budgets", icon: <PiggyBank className="w-5 h-5" /> },
    { label: "Laporan", to: "/reports", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">Monthly Budget</h1>
          <p className="text-xs text-slate-400">Mahasiswa Edition</p>
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
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-2">
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-900 truncate">{User?.Name || "Mahasiswa"}</p>
            <p className="text-xs text-slate-500 truncate">{User?.Email}</p>
          </div>
        </div>
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

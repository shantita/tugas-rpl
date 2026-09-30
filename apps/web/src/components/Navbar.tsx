import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Wallet, LayoutDashboard, TrendingUp, TrendingDown, PiggyBank, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { User, Logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", to: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Pemasukan", to: "/incomes", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Pengeluaran", to: "/expenses", icon: <TrendingDown className="w-5 h-5" /> },
    { label: "Anggaran", to: "/budgets", icon: <PiggyBank className="w-5 h-5" /> },
    { label: "Laporan", to: "/reports", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <header className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Monthly Budget</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-100 p-4 space-y-2 bg-white animate-fade-in">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${
                location.pathname === item.to
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">{User?.Name}</span>
            <button
              type="button"
              onClick={Logout}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:underline"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

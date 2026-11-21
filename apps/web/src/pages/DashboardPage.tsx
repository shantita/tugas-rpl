import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ApiService } from "../services/api.service";
import {
  DashboardSummary,
  CategoryUsage,
  DailyLimitResponse,
  BudgetStatus,
  BudgetType,
} from "@monthly-budgeting-app/shared";
import { MonthYearPicker } from "../components/MonthYearPicker";
import { SummaryCard } from "../components/SummaryCard";
import { DailyLimitCard } from "../components/DailyLimitCard";
import { BudgetProgressBar } from "../components/BudgetProgressBar";
import { StatusBadge } from "../components/StatusBadge";
import { AlertBox } from "../components/AlertBox";
import { FormatRupiah } from "../utils/formatters";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PieChart,
  PlusCircle,
  RefreshCw,
  Bell,
  AlertTriangle,
  AlertCircle,
  X,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<CategoryUsage[]>([]);
  const [dailyLimit, setDailyLimit] = useState<DailyLimitResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const hasAutoOpenedNotif = React.useRef(false);
  const notifDropdownRef = React.useRef<HTMLDivElement>(null);

  // Tutup notifikasi ketika klik di luar dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };

    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, catRes, dlRes] = await Promise.all([
        ApiService.GetSummary(month, year),
        ApiService.GetCategoriesUsage(month, year),
        ApiService.GetDailyLimit(month, year),
      ]);

      if (sumRes.Data) setSummary(sumRes.Data);
      if (catRes.Data) {
        setCategories(catRes.Data);
        // Otomatis buka popup notifikasi saat pertama kali data termuat / setelah refresh / login jika ada budget yang mendekati atau habis
        if (!hasAutoOpenedNotif.current) {
          const hasWarnings = catRes.Data.some(
            (c) => (c.Status === BudgetStatus.NEAR_LIMIT || c.Status === BudgetStatus.EXCEEDED) && c.WarningMessage
          );
          if (hasWarnings) {
            setIsNotifOpen(true);
          }
          hasAutoOpenedNotif.current = true;
        }
      }
      if (dlRes.Data) setDailyLimit(dlRes.Data);
    } catch {
      setError("Gagal mengambil data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const warningCategories = categories.filter(
    (c) => (c.Status === BudgetStatus.NEAR_LIMIT || c.Status === BudgetStatus.EXCEEDED) && c.WarningMessage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Dashboard Keuangan</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Pantau uang saku dan batas belanja harian Anda secara real-time.</p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
          <MonthYearPicker Month={month} Year={year} OnChange={(m, y) => { setMonth(m); setYear(y); }} />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={fetchData}
              title="Muat ulang"
              className="p-2 sm:p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Tombol Notifikasi Peringatan Anggaran */}
            <div ref={notifDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen((prev) => !prev)}
                title="Notifikasi Peringatan Anggaran"
                className={`relative p-2 sm:p-2.5 rounded-xl border transition-all shadow-xs ${
                  isNotifOpen
                    ? "bg-orange-500 text-white border-orange-500 ring-2 ring-orange-500/30"
                    : warningCategories.length > 0
                    ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Bell className="w-4 h-4" />
                {warningCategories.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm animate-pulse">
                    {warningCategories.length}
                  </span>
                )}
              </button>

              {/* Dropdown Notifikasi */}
              {isNotifOpen && (
                <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 sm:w-96 max-w-md mx-auto sm:mx-0 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 p-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Notifikasi Peringatan</h4>
                        <p className="text-[11px] text-slate-400">Peringatan status limit & anggaran</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsNotifOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                    {warningCategories.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        <p className="font-semibold text-slate-700">Tidak ada peringatan baru 🎉</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Semua kategori pengeluaran Anda masih aman terkendali.
                        </p>
                      </div>
                    ) : (
                      warningCategories.map((c) => (
                        <div
                          key={c.CategoryId}
                          className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 transition-colors ${
                            c.Status === BudgetStatus.EXCEEDED
                              ? "bg-rose-50/80 border-rose-200 text-rose-800"
                              : "bg-amber-50/80 border-amber-200 text-amber-800"
                          }`}
                        >
                          {c.Status === BudgetStatus.EXCEEDED ? (
                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-[11px] uppercase tracking-wide opacity-80 mb-0.5">
                              {c.CategoryName}
                            </p>
                            <span>{c.WarningMessage}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <AlertBox Type="error" Message={error} />}

      {dailyLimit && (
        <div>
          <DailyLimitCard
            Item={dailyLimit.Total}
            Balance={summary?.Balance}
            TotalBudget={summary?.TotalBudget}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <SummaryCard
          Title="Total Pemasukan"
          Amount={summary?.TotalIncome || 0}
          Icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          ColorClass="bg-emerald-50"
        />
        <SummaryCard
          Title="Total Pengeluaran"
          Amount={summary?.TotalExpense || 0}
          Icon={<TrendingDown className="w-5 h-5 text-rose-600" />}
          ColorClass="bg-rose-50"
        />
        <SummaryCard
          Title="Saldo"
          Amount={summary?.Balance ?? 0}
          Icon={<Wallet className={`w-5 h-5 ${(summary?.Balance ?? 0) < 0 ? "text-rose-600" : "text-orange-600"}`} />}
          ColorClass={(summary?.Balance ?? 0) < 0 ? "bg-rose-50" : "bg-orange-50"}
          Description="Pemasukan - Pengeluaran"
          IsNegative={(summary?.Balance ?? 0) < 0}
        />
        <SummaryCard
          Title="Total Anggaran"
          Amount={summary?.TotalBudget || 0}
          Icon={<PiggyBank className="w-5 h-5 text-amber-600" />}
          ColorClass="bg-amber-50"
        />
        <SummaryCard
          Title="Sisa Anggaran"
          Amount={summary?.RemainingBudget || 0}
          Icon={<PieChart className="w-5 h-5 text-sky-600" />}
          ColorClass="bg-sky-50"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Penggunaan Anggaran per Kategori</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pantau realisasi pengeluaran terhadap pagu anggaran yang telah ditentukan.</p>
          </div>
          <Link
            to="/budgets"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-xs shadow-orange-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Kelola Anggaran</span>
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-orange-200/70 bg-orange-50/20 rounded-2xl">
            <div className="mx-auto w-12 h-12 rounded-full bg-orange-100/70 text-orange-600 flex items-center justify-center mb-3">
              <PiggyBank className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Belum Ada Anggaran untuk Periode Ini</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              Anda belum menentukan anggaran kategori pada bulan ini. Mulai atur anggaran untuk mengaktifkan perhitungan Daily Spending Limit.
            </p>
            <Link
              to="/budgets"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md shadow-orange-500/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Anggaran Sekarang</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((c) => (
              <div
                key={c.CategoryId}
                className="p-4 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{c.CategoryName}</span>
                    {c.BudgetType === BudgetType.FIXED ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Tetap
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Sementara
                      </span>
                    )}
                  </div>
                  <StatusBadge Status={c.Status} RemainingBudget={c.RemainingBudget} />
                </div>
                <BudgetProgressBar Percentage={c.UsagePercentage} Status={c.Status} />
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
                  <span>
                    Sisa:{" "}
                    <strong
                      className={
                        c.RemainingBudget < 0
                          ? "text-rose-600 font-bold"
                          : c.RemainingBudget === 0
                          ? "text-amber-600 font-bold"
                          : "text-emerald-700 font-bold"
                      }
                    >
                      {FormatRupiah(c.RemainingBudget)}
                    </strong>{" "}
                    <span className="text-slate-400">/ Anggaran {FormatRupiah(c.BudgetAmount)}</span>
                  </span>
                  <span className="font-semibold text-slate-700">
                    {c.RemainingBudget < 0
                      ? `Melebihi anggaran (${Math.round(c.UsagePercentage - 100)}%)`
                      : c.RemainingBudget === 0
                      ? "Batas anggaran (100%)"
                      : `${Math.round(100 - c.UsagePercentage)}% sisa`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

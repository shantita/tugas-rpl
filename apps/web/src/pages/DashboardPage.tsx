import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ApiService } from "../services/api.service";
import {
  DashboardSummary,
  CategoryUsage,
  DailyLimitResponse,
  BudgetStatus,
} from "@monthly-budgeting-app/shared";
import { MonthYearPicker } from "../components/MonthYearPicker";
import { SummaryCard } from "../components/SummaryCard";
import { DailyLimitCard } from "../components/DailyLimitCard";
import { BudgetProgressBar } from "../components/BudgetProgressBar";
import { StatusBadge } from "../components/StatusBadge";
import { AlertBox } from "../components/AlertBox";
import { FormatRupiah } from "../utils/formatters";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, PieChart, PlusCircle, RefreshCw } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<CategoryUsage[]>([]);
  const [dailyLimit, setDailyLimit] = useState<DailyLimitResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      if (catRes.Data) setCategories(catRes.Data);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dashboard Keuangan</h1>
          <p className="text-sm text-slate-500 mt-1">Pantau uang saku dan batas belanja harian Anda secara real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthYearPicker Month={month} Year={year} OnChange={(m, y) => { setMonth(m); setYear(y); }} />
          <button
            type="button"
            onClick={fetchData}
            title="Muat ulang"
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && <AlertBox Type="error" Message={error} />}

      {warningCategories.length > 0 && (
        <div className="space-y-2">
          {warningCategories.map((c) => (
            <AlertBox
              key={c.CategoryId}
              Type={c.Status === BudgetStatus.EXCEEDED ? "error" : "warning"}
              Message={c.WarningMessage!}
            />
          ))}
        </div>
      )}

      {dailyLimit && (
        <div>
          <DailyLimitCard Item={dailyLimit.Total} />
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
          Amount={summary?.Balance || 0}
          Icon={<Wallet className="w-5 h-5 text-indigo-600" />}
          ColorClass="bg-indigo-50"
          Description="Pemasukan - Pengeluaran"
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

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Penggunaan Anggaran per Kategori</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pantau realisasi pengeluaran terhadap pagu anggaran yang telah ditentukan.</p>
          </div>
          <Link
            to="/budgets"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Kelola Anggaran</span>
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <PiggyBank className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Belum Ada Anggaran untuk Periode Ini</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              Anda belum menentukan anggaran kategori pada bulan ini. Mulai atur anggaran untuk mengaktifkan perhitungan Daily Spending Limit.
            </p>
            <Link
              to="/budgets"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
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
                  <span className="font-semibold text-slate-900 text-sm">{c.CategoryName}</span>
                  <StatusBadge Status={c.Status} />
                </div>
                <BudgetProgressBar Percentage={c.UsagePercentage} Status={c.Status} />
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
                  <span>
                    Terpakai: <strong className="text-slate-800">{FormatRupiah(c.ExpenseAmount)}</strong> / {FormatRupiah(c.BudgetAmount)}
                  </span>
                  <span className="font-semibold text-slate-700">{Math.round(c.UsagePercentage)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

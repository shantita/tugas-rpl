import React, { useState, useEffect, useCallback } from "react";
import { ApiService } from "../services/api.service";
import {
  MonthlyReport,
  ExpenseByCategoryItem,
  CategoryUsage,
  Income,
} from "@monthly-budgeting-app/shared";
import { MonthYearPicker } from "../components/MonthYearPicker";
import { SummaryCard } from "../components/SummaryCard";
import { AlertBox } from "../components/AlertBox";
import { FormatRupiah, MonthNames } from "../utils/formatters";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PieChart,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Repeat,
  SlidersHorizontal,
  Scale,
  ShoppingBag,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Helper pembersih deskripsi pemasukan ([TETAP] vs [SEMENTARA])
const parseIncomeTypeAndTitle = (desc: string) => {
  if (desc.startsWith("[TETAP]")) {
    return {
      type: "TETAP",
      cleanTitle: desc.replace(/^\[TETAP\]\s*/, "") || "Pemasukan Tetap",
    };
  }
  if (desc.startsWith("[SEMENTARA]")) {
    return {
      type: "SEMENTARA",
      cleanTitle: desc.replace(/^\[SEMENTARA\]\s*/, "") || "Pemasukan Sementara",
    };
  }
  return {
    type: "SEMENTARA",
    cleanTitle: desc || "Pemasukan Lainnya",
  };
};

export const ReportsPage: React.FC = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Dropdown Pilihan Grafik: "pemasukan" | "pengeluaran" | "perbandingan"
  const [activeChart, setActiveChart] = useState<"pemasukan" | "pengeluaran" | "perbandingan">("pemasukan");

  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [categoriesUsage, setCategoriesUsage] = useState<CategoryUsage[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportRes, usageRes, incomesRes] = await Promise.all([
        ApiService.GetMonthlyReport(month, year),
        ApiService.GetCategoriesUsage(month, year),
        ApiService.GetIncomes(month, year),
      ]);

      if (reportRes.Data) setReport(reportRes.Data);
      if (usageRes.Data) setCategoriesUsage(usageRes.Data);
      if (incomesRes.Data) setIncomes(incomesRes.Data);
    } catch {
      setError("Gagal mengambil data laporan keuangan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================
  // METRIK GLOBAL
  // ==========================================
  const totalIncome = report?.TotalIncome || 0;
  const totalExpense = report?.TotalExpense || 0;
  const balance = report?.Balance || 0;
  const totalBudget = report?.TotalBudget || 0;
  const remainingBudget = report?.RemainingBudget || 0;

  // ==========================================
  // 1. DATA PENDAPATAN & SUMBER TERBESAR
  // ==========================================
  const incomeSourcesMap = new Map<
    string,
    { amount: number; count: number; type: string }
  >();

  let fixedIncomeSum = 0;
  let tempIncomeSum = 0;

  incomes.forEach((inc) => {
    const { type, cleanTitle } = parseIncomeTypeAndTitle(inc.Description);
    const amt = Number(inc.Amount) || 0;

    if (type === "TETAP") {
      fixedIncomeSum += amt;
    } else {
      tempIncomeSum += amt;
    }

    const existing = incomeSourcesMap.get(cleanTitle);
    if (existing) {
      existing.amount += amt;
      existing.count += 1;
    } else {
      incomeSourcesMap.set(cleanTitle, {
        amount: amt,
        count: 1,
        type,
      });
    }
  });

  const incomeSourcesList = Array.from(incomeSourcesMap.entries())
    .map(([sourceName, data]) => ({
      sourceName,
      amount: data.amount,
      count: data.count,
      type: data.type,
      percentage:
        totalIncome > 0
          ? Math.round((data.amount / totalIncome) * 100)
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topIncomeSource =
    incomeSourcesList.length > 0 ? incomeSourcesList[0] : null;

  const incomeColors = [
    "rgba(16, 185, 129, 0.85)", // Emerald
    "rgba(59, 130, 246, 0.85)", // Blue
    "rgba(245, 158, 11, 0.85)", // Amber
    "rgba(139, 92, 246, 0.85)", // Purple
    "rgba(236, 72, 153, 0.85)", // Pink
    "rgba(20, 184, 166, 0.85)", // Teal
  ];

  const incomeChartData = {
    labels: incomeSourcesList.map((item) => item.sourceName),
    datasets: [
      {
        label: "Pemasukan (Rp)",
        data: incomeSourcesList.map((item) => item.amount),
        backgroundColor: incomeColors.slice(0, Math.max(incomeSourcesList.length, 1)),
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const incomeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 12,
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { raw: unknown; label: string }) => {
            const val = Number(context.raw) || 0;
            const pct =
              totalIncome > 0 ? Math.round((val / totalIncome) * 100) : 0;
            return ` ${context.label}: ${FormatRupiah(val)} (${pct}%)`;
          },
        },
      },
    },
    cutout: "68%",
  };

  // ==========================================
  // 2. DATA PENGELUARAN PER KATEGORI
  // ==========================================
  const expenseChartData = {
    labels: report?.ExpenseByCategory.map((c) => c.CategoryName) || [],
    datasets: [
      {
        label: "Total Pengeluaran (Rp)",
        data: report?.ExpenseByCategory.map((c) => c.TotalAmount) || [],
        backgroundColor: "rgba(249, 115, 22, 0.85)",
        borderColor: "rgba(234, 88, 12, 1)",
        hoverBackgroundColor: "rgba(251, 146, 60, 0.95)",
        borderWidth: 1.5,
        borderRadius: 10,
      },
    ],
  };

  const expenseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: { raw: unknown }) => {
            const val = Number(context.raw) || 0;
            return ` Pengeluaran: ${FormatRupiah(val)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => FormatRupiah(Number(value)),
        },
      },
    },
  };

  const topExpenseCategory =
    report?.ExpenseByCategory && report.ExpenseByCategory.length > 0
      ? [...report.ExpenseByCategory].sort((a, b) => b.TotalAmount - a.TotalAmount)[0]
      : null;

  // ==========================================
  // 3. DATA PERBANDINGAN ARUS KAS & BUDGET
  // ==========================================
  const comparisonChartData = {
    labels: ["Pemasukan", "Pengeluaran", "Saldo Sisa"],
    datasets: [
      {
        label: "Nominal Arus Kas (Rp)",
        data: [totalIncome, totalExpense, Math.max(0, balance)],
        backgroundColor: [
          "rgba(16, 185, 129, 0.85)", // Emerald
          "rgba(244, 63, 94, 0.85)", // Rose
          balance >= 0 ? "rgba(59, 130, 246, 0.85)" : "rgba(239, 68, 68, 0.85)", // Blue / Red
        ],
        borderColor: [
          "rgba(5, 150, 105, 1)",
          "rgba(225, 29, 72, 1)",
          balance >= 0 ? "rgba(37, 99, 235, 1)" : "rgba(220, 38, 38, 1)",
        ],
        borderWidth: 1.5,
        borderRadius: 10,
      },
    ],
  };

  const comparisonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: { raw: unknown }) => {
            const val = Number(context.raw) || 0;
            return ` Nominal: ${FormatRupiah(val)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => FormatRupiah(Number(value)),
        },
      },
    },
  };

  const expenseRatio =
    totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;
  const savingsRatio =
    totalIncome > 0
      ? Math.round((Math.max(0, balance) / totalIncome) * 100)
      : 0;

  // Budget vs Expense Data
  const categoriesList = categoriesUsage.map((c) => ({
    name: c.CategoryName,
    budget: c.BudgetAmount,
    expense: c.ExpenseAmount,
    remaining: c.RemainingBudget,
    usagePct: c.UsagePercentage,
    status: c.Status,
  }));

  const budgetVsExpenseChartData = {
    labels: categoriesList.map((c) => c.name),
    datasets: [
      {
        label: "Pagu Anggaran (Budget)",
        data: categoriesList.map((c) => c.budget),
        backgroundColor: "rgba(99, 102, 241, 0.8)", // Indigo
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 1.5,
        borderRadius: 8,
      },
      {
        label: "Realisasi Pengeluaran",
        data: categoriesList.map((c) => c.expense),
        backgroundColor: "rgba(249, 115, 22, 0.85)", // Orange
        borderColor: "rgba(234, 88, 12, 1)",
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  const budgetVsExpenseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
          font: { size: 11, weight: "bold" as const },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { label?: string }; raw: unknown }) => {
            const val = Number(context.raw) || 0;
            return ` ${context.dataset.label}: ${FormatRupiah(val)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => FormatRupiah(Number(value)),
        },
      },
    },
  };

  // Evaluasi penyesuaian budget bulan depan
  const overbudgetCategories = categoriesList.filter((c) => c.expense > c.budget);
  const underbudgetCategories = categoriesList.filter(
    (c) => c.budget > 0 && c.usagePct < 60
  );
  const optimalCategories = categoriesList.filter(
    (c) => c.budget > 0 && c.usagePct >= 60 && c.usagePct <= 100
  );

  let recommendedNextMonthBudget = 0;
  categoriesList.forEach((c) => {
    if (c.expense > c.budget) {
      recommendedNextMonthBudget += Math.round(c.expense * 1.1);
    } else if (c.budget > 0 && c.usagePct < 60) {
      recommendedNextMonthBudget += Math.round(Math.max(c.expense * 1.2, c.budget * 0.75));
    } else {
      recommendedNextMonthBudget += c.budget;
    }
  });

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER UTAMA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Laporan Keuangan & Evaluasi Anggaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Analisis arus kas masuk & keluar, perbandingan budget, dan rekomendasi penyesuaian bulan berikutnya.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MonthYearPicker
            Month={month}
            Year={year}
            OnChange={(m, y) => {
              setMonth(m);
              setYear(y);
            }}
          />
        </div>
      </div>

      {error && <AlertBox Type="error" Message={error} />}

      {/* 5 KARTU METRIK UTAMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <SummaryCard
          Title="Total Pemasukan"
          Amount={totalIncome}
          Icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          ColorClass="bg-emerald-50"
        />
        <SummaryCard
          Title="Total Pengeluaran"
          Amount={totalExpense}
          Icon={<TrendingDown className="w-5 h-5 text-rose-600" />}
          ColorClass="bg-rose-50"
        />
        <SummaryCard
          Title="Saldo Akhir"
          Amount={balance}
          Icon={<Wallet className="w-5 h-5 text-orange-600" />}
          ColorClass="bg-orange-50"
          Description={balance >= 0 ? "Surplus Keuangan" : "Defisit Keuangan"}
          IsNegative={balance < 0}
        />
        <SummaryCard
          Title="Total Pagu Anggaran"
          Amount={totalBudget}
          Icon={<PiggyBank className="w-5 h-5 text-indigo-600" />}
          ColorClass="bg-indigo-50"
        />
        <SummaryCard
          Title="Sisa Anggaran"
          Amount={remainingBudget}
          Icon={<PieChart className="w-5 h-5 text-sky-600" />}
          ColorClass="bg-sky-50"
          Description={
            totalBudget > 0
              ? `${Math.round((remainingBudget / totalBudget) * 100)}% dari plafon`
              : undefined
          }
        />
      </div>

      {/* ======================================================== */}
      {/* TAB PILIHAN TAMPILAN GRAFIK                              */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2 sm:p-2.5 shadow-xs">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {/* TAB 1: PEMASUKAN */}
          <button
            type="button"
            onClick={() => setActiveChart("pemasukan")}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeChart === "pemasukan"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>Pemasukan</span>
          </button>

          {/* TAB 2: PENGELUARAN */}
          <button
            type="button"
            onClick={() => setActiveChart("pengeluaran")}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeChart === "pengeluaran"
                ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <TrendingDown className="w-4 h-4 shrink-0" />
            <span>Pengeluaran</span>
          </button>

          {/* TAB 3: PERBANDINGAN */}
          <button
            type="button"
            onClick={() => setActiveChart("perbandingan")}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeChart === "perbandingan"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Scale className="w-4 h-4 shrink-0" />
            <span>Perbandingan</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. TAMPILAN GRAFIK: PEMASUKAN                           */}
      {/* ======================================================== */}
      {activeChart === "pemasukan" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* KARTU HIGHLIGHT PENDAPATAN PALING BANYAK */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Pendapatan Paling Banyak
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mengetahui sumber penghasilan utama bulan {MonthNames[month - 1]}.
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                {topIncomeSource ? (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sumber Pendapatan Utama</span>
                      </span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        {topIncomeSource.percentage}% Total
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 truncate">
                      {topIncomeSource.sourceName}
                    </h3>
                    <p className="text-2xl font-black text-emerald-600 mt-1">
                      {FormatRupiah(topIncomeSource.amount)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Menyumbang porsi terbesar ({topIncomeSource.percentage}%) dari seluruh pemasukanmu di bulan {MonthNames[month - 1]}.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                    Belum ada data pemasukan yang tercatat di bulan ini.
                  </div>
                )}

                {/* KOMPARASI TETAP VS SEMENTARA */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl border border-indigo-100 bg-indigo-50/50">
                    <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-bold">
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Pemasukan Tetap</span>
                    </div>
                    <p className="text-base font-black text-indigo-900 mt-1">
                      {FormatRupiah(fixedIncomeSum)}
                    </p>
                    <span className="text-[10px] text-indigo-600">
                      {totalIncome > 0 ? Math.round((fixedIncomeSum / totalIncome) * 100) : 0}% porsi rutin
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl border border-amber-100 bg-amber-50/50">
                    <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pemasukan Sementara</span>
                    </div>
                    <p className="text-base font-black text-amber-900 mt-1">
                      {FormatRupiah(tempIncomeSum)}
                    </p>
                    <span className="text-[10px] text-amber-600">
                      {totalIncome > 0 ? Math.round((tempIncomeSum / totalIncome) * 100) : 0}% insidental/freelance
                    </span>
                  </div>
                </div>
              </div>

              {/* DAFTAR PERINGKAT SUMBER */}
              {incomeSourcesList.length > 1 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 mb-2 block">
                    Peringkat Sumber Pendapatan:
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {incomeSourcesList.map((item, idx) => (
                      <div
                        key={item.sourceName}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-slate-800 truncate">
                            {item.sourceName}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-600 shrink-0">
                          {FormatRupiah(item.amount)} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DIAGRAM LINGKARAN SUMBER PEMASUKAN */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Grafik Alokasi Sumber Pemasukan
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Diagram lingkaran pembagian nominal pendapatan berdasarkan sumber.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <PieChart className="w-5 h-5" />
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full my-auto flex items-center justify-center">
                {loading ? (
                  <div className="text-slate-400 text-sm">Memuat grafik pemasukan...</div>
                ) : incomeSourcesList.length === 0 ? (
                  <div className="text-slate-400 text-sm text-center px-4">
                    Belum ada data pemasukan untuk divisualisasikan.
                  </div>
                ) : (
                  <Doughnut data={incomeChartData} options={incomeChartOptions} />
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-400">
                  Diversifikasi sumber pendapatan membantu menjaga kestabilan finansial Anda.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. TAMPILAN GRAFIK: PENGELUARAN                         */}
      {/* ======================================================== */}
      {activeChart === "pengeluaran" && (
        <div className="space-y-6 animate-fade-in">
          {/* HIGHLIGHT PENGELUARAN TERBESAR */}
          {topExpenseCategory && (
            <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-white border border-orange-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                    Kategori Pengeluaran Terbesar
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                    {topExpenseCategory.CategoryName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Menghabiskan {topExpenseCategory.Percentage}% dari seluruh total belanja bulan ini.
                  </p>
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-2xl font-black text-rose-600">
                  {FormatRupiah(topExpenseCategory.TotalAmount)}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  dari total {FormatRupiah(totalExpense)}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* GRAFIK BAR PENGELUARAN PER KATEGORI */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Grafik Pengeluaran per Kategori
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Visualisasi perbandingan total belanja antarkategori.
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>

                <div className="h-64 sm:h-72 w-full mt-4">
                  {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                      Memuat grafik...
                    </div>
                  ) : !report?.ExpenseByCategory || report.ExpenseByCategory.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center px-4">
                      Belum ada data pengeluaran untuk ditampilkan pada grafik.
                    </div>
                  ) : (
                    <Bar data={expenseChartData} options={expenseChartOptions} />
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-400">
                Data realisasi pengeluaran diambil secara otomatis dari catatan transaksi harian.
              </div>
            </div>

            {/* TABEL RINCIAN PENGELUARAN PER KATEGORI */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">
                  Rincian Pengeluaran per Kategori
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Persentase pengeluaran terhadap total belanja bulan ini.
                </p>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Kategori</th>
                      <th className="px-5 py-3.5">Total Belanja</th>
                      <th className="px-5 py-3.5 text-right">Porsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-6 text-center text-slate-400 text-xs">
                          Memuat rincian...
                        </td>
                      </tr>
                    ) : !report?.ExpenseByCategory || report.ExpenseByCategory.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-6 text-center text-slate-400 text-xs">
                          Tidak ada catatan pengeluaran.
                        </td>
                      </tr>
                    ) : (
                      report.ExpenseByCategory.map((c: ExpenseByCategoryItem) => (
                        <tr key={c.CategoryId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3 font-semibold text-slate-800 text-xs">
                            {c.CategoryName}
                          </td>
                          <td className="px-5 py-3 font-bold text-slate-900 text-xs">
                            {FormatRupiah(c.TotalAmount)}
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-slate-600 text-xs">
                            {c.Percentage}%
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAMPILAN GRAFIK: PERBANDINGAN                        */}
      {/* ======================================================== */}
      {activeChart === "perbandingan" && (
        <div className="space-y-6 animate-fade-in">
          {/* GRAFIK CASH FLOW: PEMASUKAN VS PENGELUARAN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Perbandingan Pemasukan & Pengeluaran</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Visualisasi perbandingan total uang masuk terhadap total uang keluar bulan {MonthNames[month - 1]} {year}.
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      balance >= 0
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {balance >= 0 ? "Surplus (Hemat)" : "Defisit (Boncos)"}
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full mt-4">
                  {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                      Memuat grafik perbandingan...
                    </div>
                  ) : totalIncome === 0 && totalExpense === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center px-4">
                      Belum ada catatan transaksi pemasukan maupun pengeluaran pada bulan ini.
                    </div>
                  ) : (
                    <Bar data={comparisonChartData} options={comparisonChartOptions} />
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    Rasio Belanja / Burn Rate
                  </span>
                  <p
                    className={`text-lg sm:text-xl font-black mt-0.5 ${
                      expenseRatio > 100
                        ? "text-rose-600"
                        : expenseRatio > 80
                        ? "text-amber-600"
                        : "text-slate-800"
                    }`}
                  >
                    {expenseRatio}%
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    dari total pemasukan
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    Rasio Tabungan / Surplus
                  </span>
                  <p
                    className={`text-lg sm:text-xl font-black mt-0.5 ${
                      savingsRatio >= 20 ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {savingsRatio}%
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    tersisa untuk ditabung
                  </span>
                </div>
              </div>
            </div>

            {/* ANALISIS CASH FLOW */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <span className="text-xs uppercase tracking-wider font-bold text-amber-300">
                    Analisis Arus Kas
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
                  {balance > 0
                    ? "Keuangan Sehat & Terkendali! 🎉"
                    : balance === 0
                    ? "Keuangan Pas-Pasan (Break Even) ⚖️"
                    : "Peringatan: Pengeluaran Berlebih! 🚨"}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  {balance > 0
                    ? `Bulan ini kamu berhasil menyisihkan saldo surplus sebesar ${FormatRupiah(
                        balance
                      )} (${savingsRatio}% dari pemasukan). Kondisi keuanganmu tergolong sehat.`
                    : balance === 0
                    ? `Total pengeluaranmu persis menghabiskan seluruh pemasukan bulan ini (${FormatRupiah(
                        totalIncome
                      )}). Tidak ada sisa uang yang dapat dialokasikan ke tabungan.`
                    : `Pengeluaran bulan ini melebihi pemasukan sebesar ${FormatRupiah(
                        Math.abs(balance)
                      )}. Kamu mengalami defisit arus kas. Segera rem belanja non-esensial.`}
                </p>

                <div className="space-y-2.5 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-slate-300">Total Uang Masuk</span>
                    <span className="font-bold text-emerald-400">
                      +{FormatRupiah(totalIncome)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-slate-300">Total Uang Keluar</span>
                    <span className="font-bold text-rose-400">
                      -{FormatRupiah(totalExpense)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-white/10 p-2.5 rounded-xl border border-white/15">
                    <span className="font-bold text-white">Sisa Kas Bersih</span>
                    <span
                      className={`font-black text-sm ${
                        balance >= 0 ? "text-amber-300" : "text-rose-400"
                      }`}
                    >
                      {FormatRupiah(balance)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-400">
                <Lightbulb className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  Tips: Pertahankan rasio tabungan minimal 20% setiap bulannya untuk dana darurat.
                </span>
              </div>
            </div>
          </div>

          {/* GRAFIK KOMPARASI PENGELUARAN VS PAGU BUDGET PER KATEGORI */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Grafik Komparasi: Realisasi Pengeluaran vs Pagu Anggaran
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bandingkan pagu anggaran yang direncanakan dengan realisasi pengeluaran riil per kategori belanja.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-indigo-700">
                  <span className="w-3 h-3 rounded-md bg-indigo-500"></span>
                  Pagu Anggaran
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-orange-600">
                  <span className="w-3 h-3 rounded-md bg-orange-500"></span>
                  Realisasi Pengeluaran
                </span>
              </div>
            </div>

            <div className="h-80 w-full mt-4">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Memuat grafik perbandingan anggaran...
                </div>
              ) : categoriesList.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center px-4">
                  Belum ada data anggaran atau pengeluaran pada kategori bulan ini.
                </div>
              ) : (
                <Bar data={budgetVsExpenseChartData} options={budgetVsExpenseChartOptions} />
              )}
            </div>
          </div>

          {/* PANDUAN PENYESUAIAN BUDGET BULAN DEPAN */}
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-50 rounded-3xl border border-orange-200/80 p-5 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-orange-200/60">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-orange-600" />
                  <span>Panduan Penyesuaian Anggaran</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Rekomendasi Penyesuaian Budget Bulan Berikutnya
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                  Gunakan evaluasi riil belanja bulan ini untuk merencanakan pagu anggaran yang lebih realistis dan efektif di bulan depan.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-sm shrink-0 sm:text-right">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Saran Total Budget Bulan Depan
                </span>
                <p className="text-2xl font-black text-orange-600 mt-0.5">
                  {FormatRupiah(recommendedNextMonthBudget)}
                </p>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Budget saat ini: {FormatRupiah(totalBudget)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {/* OVERBUDGET */}
              <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                  <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Overbudget ({overbudgetCategories.length})</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    Plafon Jebol
                  </span>
                </div>
                {overbudgetCategories.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Hebat! Tidak ada kategori yang melebihi pagu anggaran bulan ini. 🎉
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {overbudgetCategories.map((c) => (
                      <div
                        key={c.name}
                        className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{c.name}</span>
                          <span className="text-rose-600">
                            +{FormatRupiah(c.expense - c.budget)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Terpakai {FormatRupiah(c.expense)} dari plafon {FormatRupiah(c.budget)}.
                        </p>
                        <p className="text-[11px] text-rose-700 font-semibold pt-1 border-t border-rose-200/60">
                          💡 Saran: Naikkan anggaran bulan depan menjadi ~{FormatRupiah(Math.round(c.expense * 1.1))} atau kendalikan transaksi pos ini.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* UNDERBUDGET */}
              <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                    <span>Sisa Banyak ({underbudgetCategories.length})</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Alokasi Berlebih
                  </span>
                </div>
                {underbudgetCategories.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Semua alokasi anggaran terpakai proporsional di atas 60%.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {underbudgetCategories.map((c) => (
                      <div
                        key={c.name}
                        className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{c.name}</span>
                          <span className="text-emerald-600 font-semibold">
                            Sisa {FormatRupiah(c.remaining)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Hanya terpakai {c.usagePct}% dari plafon {FormatRupiah(c.budget)}.
                        </p>
                        <p className="text-[11px] text-amber-800 font-semibold pt-1 border-t border-amber-200/60">
                          💡 Saran: Pangkas anggaran ke ~{FormatRupiah(Math.round(Math.max(c.expense * 1.25, c.budget * 0.75)))}, alihkan sisanya ke tabungan.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* OPTIMAL */}
              <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Anggaran Pas ({optimalCategories.length})</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Optimal
                  </span>
                </div>
                {optimalCategories.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Belum ada kategori dalam rentang realisasi ideal (60%-100%).
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {optimalCategories.map((c) => (
                      <div
                        key={c.name}
                        className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{c.name}</span>
                          <span className="text-emerald-700 font-semibold">
                            {c.usagePct}% terpakai
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Realisasi {FormatRupiah(c.expense)} dari plafon {FormatRupiah(c.budget)}.
                        </p>
                        <p className="text-[11px] text-emerald-800 font-semibold pt-1 border-t border-emerald-200/60">
                          ✓ Saran: Pertahankan plafon anggaran ini untuk bulan depan karena sudah sangat presisi.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

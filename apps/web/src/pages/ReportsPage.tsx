import React, { useState, useEffect, useCallback } from "react";
import { ApiService } from "../services/api.service";
import { MonthlyReport, ExpenseByCategoryItem } from "@monthly-budgeting-app/shared";
import { MonthYearPicker } from "../components/MonthYearPicker";
import { SummaryCard } from "../components/SummaryCard";
import { AlertBox } from "../components/AlertBox";
import { FormatRupiah } from "../utils/formatters";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, PieChart } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const ReportsPage: React.FC = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.GetMonthlyReport(month, year);
      if (res.Data) {
        setReport(res.Data);
      }
    } catch {
      setError("Gagal mengambil data laporan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const chartData = {
    labels: report?.ExpenseByCategory.map((c) => c.CategoryName) || [],
    datasets: [
      {
        label: "Total Pengeluaran (Rp)",
        data: report?.ExpenseByCategory.map((c) => c.TotalAmount) || [],
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Laporan Keuangan Bulanan</h1>
          <p className="text-sm text-slate-500 mt-1">Evaluasi arus kas, saldo sisa, dan alokasi pengeluaran per kategori.</p>
        </div>
        <MonthYearPicker Month={month} Year={year} OnChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      {error && <AlertBox Type="error" Message={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <SummaryCard
          Title="Total Pemasukan"
          Amount={report?.TotalIncome || 0}
          Icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          ColorClass="bg-emerald-50"
        />
        <SummaryCard
          Title="Total Pengeluaran"
          Amount={report?.TotalExpense || 0}
          Icon={<TrendingDown className="w-5 h-5 text-rose-600" />}
          ColorClass="bg-rose-50"
        />
        <SummaryCard
          Title="Saldo Akhir"
          Amount={report?.Balance || 0}
          Icon={<Wallet className="w-5 h-5 text-indigo-600" />}
          ColorClass="bg-indigo-50"
          Description="Pemasukan - Pengeluaran"
        />
        <SummaryCard
          Title="Total Anggaran"
          Amount={report?.TotalBudget || 0}
          Icon={<PiggyBank className="w-5 h-5 text-amber-600" />}
          ColorClass="bg-amber-50"
        />
        <SummaryCard
          Title="Sisa Anggaran"
          Amount={report?.RemainingBudget || 0}
          Icon={<PieChart className="w-5 h-5 text-sky-600" />}
          ColorClass="bg-sky-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">Grafik Pengeluaran per Kategori</h2>
          <p className="text-xs text-slate-500 mb-6">Visualisasi perbandingan total belanja antarkategori.</p>

          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Memuat grafik...
              </div>
            ) : !report?.ExpenseByCategory || report.ExpenseByCategory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Belum ada data pengeluaran untuk ditampilkan pada grafik.
              </div>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Rincian Pengeluaran per Kategori</h2>
            <p className="text-xs text-slate-500 mt-1">Persentase pengeluaran terhadap total belanja bulan ini.</p>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Total Pengeluaran</th>
                  <th className="px-6 py-4 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                      Memuat rincian pengeluaran...
                    </td>
                  </tr>
                ) : !report?.ExpenseByCategory || report.ExpenseByCategory.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                      Tidak ada catatan pengeluaran pada periode ini.
                    </td>
                  </tr>
                ) : (
                  report.ExpenseByCategory.map((c: ExpenseByCategoryItem) => (
                    <tr key={c.CategoryId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{c.CategoryName}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{FormatRupiah(c.TotalAmount)}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">{c.Percentage}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

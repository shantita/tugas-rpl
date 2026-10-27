import React, { useState, useEffect, useCallback } from "react";
import { ApiService } from "../services/api.service";
import { Expense, Category } from "@monthly-budgeting-app/shared";
import { MonthYearPicker } from "../components/MonthYearPicker";
import { ConfirmModal } from "../components/ConfirmModal";
import { AlertBox } from "../components/AlertBox";
import { FormatRupiah, FormatDate } from "../utils/formatters";
import { PlusCircle, Edit2, Trash2, TrendingDown, X } from "lucide-react";

export const ExpensesPage: React.FC = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // State untuk pengecekan saldo
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [oldExpenseAmount, setOldExpenseAmount] = useState<number>(0);
  const [balanceWarningOpen, setBalanceWarningOpen] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<{
    CategoryId: number;
    Amount: number;
    Date: string;
    Description: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expRes, catRes] = await Promise.all([
        ApiService.GetExpenses(month, year),
        ApiService.GetCategories(),
      ]);
      if (expRes.Data) setExpenses(expRes.Data);
      if (catRes.Data) {
        setCategories(catRes.Data);
        if (catRes.Data.length > 0 && !categoryId) {
          setCategoryId(catRes.Data[0].Id.toString());
        }
      }
    } catch {
      setError("Gagal mengambil data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [month, year, categoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchBalance = async () => {
    try {
      const summaryRes = await ApiService.GetSummary(month, year);
      if (summaryRes.Data) {
        setCurrentBalance(summaryRes.Data.Balance);
        setTotalIncome(summaryRes.Data.TotalIncome);
      }
    } catch {
      setCurrentBalance(null);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setOldExpenseAmount(0);
    if (categories.length > 0) {
      setCategoryId(categories[0].Id.toString());
    }
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setFormError(null);
    setModalOpen(true);
    fetchBalance();
  };

  const handleOpenEditModal = (expense: Expense) => {
    setEditingId(expense.Id);
    setOldExpenseAmount(expense.Amount);
    setCategoryId(expense.CategoryId.toString());
    setAmount(expense.Amount.toString());
    const formattedDate = new Date(expense.Date).toISOString().split("T")[0];
    setDate(formattedDate);
    setDescription(expense.Description);
    setFormError(null);
    setModalOpen(true);
    fetchBalance();
  };

  // Untuk edit: kembalikan amount lama ke saldo karena akan diganti
  const effectiveBalance =
    currentBalance !== null && editingId
      ? currentBalance + oldExpenseAmount
      : currentBalance;

  const parsedAmount = parseFloat(amount);
  const wouldExceedBalance =
    totalIncome > 0 &&
    effectiveBalance !== null &&
    !isNaN(parsedAmount) &&
    parsedAmount > effectiveBalance;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsedAmt = parseFloat(amount);
    const parsedCatId = parseInt(categoryId, 10);

    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setFormError("Jumlah pengeluaran harus lebih besar dari 0");
      return;
    }
    if (isNaN(parsedCatId) || parsedCatId <= 0) {
      setFormError("Kategori harus dipilih");
      return;
    }

    const submitData = {
      CategoryId: parsedCatId,
      Amount: parsedAmt,
      Date: new Date(date).toISOString(),
      Description: description,
    };

    // Tampilkan peringatan hanya saat tambah baru dan pemasukan sudah ada
    if (!editingId && wouldExceedBalance) {
      setPendingSubmitData(submitData);
      setBalanceWarningOpen(true);
      return;
    }

    await doSubmit(submitData);
  };

  const doSubmit = async (data: {
    CategoryId: number;
    Amount: number;
    Date: string;
    Description: string;
  }) => {
    setSubmitting(true);
    try {
      if (editingId) {
        await ApiService.UpdateExpense(editingId, data);
      } else {
        await ApiService.CreateExpense(data);
      }
      setModalOpen(false);
      setBalanceWarningOpen(false);
      setPendingSubmitData(null);
      fetchData();
    } catch (err: unknown) {
      setBalanceWarningOpen(false);
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Gagal menyimpan data pengeluaran.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedAnyway = async () => {
    if (pendingSubmitData) {
      await doSubmit(pendingSubmitData);
    }
  };

  const handleGoToIncome = () => {
    setBalanceWarningOpen(false);
    setModalOpen(false);
    window.location.href = "/incomes";
  };

  const handleOpenDelete = (id: number) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await ApiService.DeleteExpense(deleteTargetId);
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
      fetchData();
    } catch {
      setError("Gagal menghapus data pengeluaran.");
    }
  };

  const totalExpense = expenses.reduce((sum, item) => sum + item.Amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Manajemen Pengeluaran
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Catat setiap transaksi pengeluaran harian mahasiswa berdasarkan kategorinya.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MonthYearPicker
            Month={month}
            Year={year}
            OnChange={(m, y) => {
              setMonth(m);
              setYear(y);
            }}
          />
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 rounded-xl shadow-md shadow-orange-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Pengeluaran</span>
          </button>
        </div>
      </div>

      {error && <AlertBox Type="error" Message={error} />}

      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Pengeluaran Bulan Ini
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">{FormatRupiah(totalExpense)}</p>
        </div>
        <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
          <TrendingDown className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Memuat data pengeluaran...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="font-semibold text-slate-700">Belum ada catatan pengeluaran</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Gunakan tombol 'Tambah Pengeluaran' untuk mencatat transaksi.
                    </p>
                  </td>
                </tr>
              ) : (
                expenses.map((item) => (
                  <tr key={item.Id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                      {FormatDate(item.Date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {item.Category?.Name || "Umum"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{item.Description}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-rose-600">
                      {FormatRupiah(item.Amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Ubah"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(item.Id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Modal Tambah / Ubah Pengeluaran ===== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? "Ubah Pengeluaran" : "Tambah Pengeluaran"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tampilkan saldo tersedia hanya jika pemasukan sudah ada */}
            {totalIncome > 0 && effectiveBalance !== null && (
              <div className="mt-4 flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Saldo Tersedia
                </span>
                <span
                  className={`text-sm font-black ${
                    effectiveBalance <= 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {FormatRupiah(effectiveBalance)}
                </span>
              </div>
            )}

            {/* Peringatan live jika jumlah melebihi saldo */}
            {wouldExceedBalance && (
              <div className="mt-3">
                <AlertBox
                  Type="warning"
                  Message={`Jumlah pengeluaran (${FormatRupiah(parsedAmount)}) melebihi saldo tersedia (${FormatRupiah(effectiveBalance ?? 0)}). Disarankan tambah pemasukan terlebih dahulu.`}
                />
              </div>
            )}

            {formError && (
              <div className="mt-4">
                <AlertBox Type="error" Message={formError} />
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kategori
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm bg-white cursor-pointer transition-all"
                >
                  {categories.map((c) => (
                    <option key={c.Id} value={c.Id}>
                      {c.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Contoh: 25000"
                  className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm transition-all ${
                    wouldExceedBalance ? "border-amber-400 bg-amber-50/50" : "border-slate-300"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tanggal
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Keterangan
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Makan siang di kantin kampus"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md shadow-orange-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Modal Peringatan Saldo Tidak Cukup ===== */}
      {balanceWarningOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-3xl mb-1">
                ⚠️
              </div>
              <h3 className="text-lg font-bold text-slate-900">Saldo Tidak Cukup!</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pengeluaran sebesar{" "}
                <span className="font-bold text-rose-600">
                  {FormatRupiah(pendingSubmitData?.Amount ?? 0)}
                </span>{" "}
                melebihi saldo tersedia sebesar{" "}
                <span className="font-bold text-slate-800">
                  {FormatRupiah(effectiveBalance ?? 0)}
                </span>
                . Saldo kamu akan jadi minus jika dilanjutkan.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Disarankan untuk menambah pemasukan terlebih dahulu agar keuanganmu tetap sehat.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleGoToIncome}
                className="w-full px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              >
                ✏️ Tambah Pemasukan Dulu
              </button>
              <button
                type="button"
                onClick={handleProceedAnyway}
                disabled={submitting}
                className="w-full px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Tetap Lanjutkan"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setBalanceWarningOpen(false);
                  setPendingSubmitData(null);
                }}
                className="w-full px-4 py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Batal, kembali ke form
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        IsOpen={deleteModalOpen}
        Title="Hapus Pengeluaran"
        Message="Apakah Anda yakin ingin menghapus data pengeluaran ini? Tindakan ini tidak dapat dibatalkan."
        ConfirmText="Hapus Pengeluaran"
        OnConfirm={handleConfirmDelete}
        OnCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

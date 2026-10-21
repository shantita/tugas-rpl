import React, { useState, useEffect, useCallback } from "react";
import { ApiService } from "../services/api.service";
import { Budget, Category } from "@monthly-budgeting-app/shared";
import { MonthYearPicker } from "../components/MonthYearPicker";
import { ConfirmModal } from "../components/ConfirmModal";
import { AlertBox } from "../components/AlertBox";
import { FormatRupiah, MonthNames } from "../utils/formatters";
import { PlusCircle, Edit2, Trash2, PiggyBank, X } from "lucide-react";

export const BudgetsPage: React.FC = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formMonth, setFormMonth] = useState(month);
  const [formYear, setFormYear] = useState(year);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bgtRes, catRes] = await Promise.all([
        ApiService.GetBudgets(month, year),
        ApiService.GetCategories(),
      ]);
      if (bgtRes.Data) setBudgets(bgtRes.Data);
      if (catRes.Data) {
        setCategories(catRes.Data);
        if (catRes.Data.length > 0 && !formCategoryId) {
          setFormCategoryId(catRes.Data[0].Id.toString());
        }
      }
    } catch {
      setError("Gagal mengambil data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [month, year, formCategoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    if (categories.length > 0) {
      setFormCategoryId(categories[0].Id.toString());
    }
    setFormAmount("");
    setFormMonth(month);
    setFormYear(year);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (budget: Budget) => {
    setEditingId(budget.Id);
    setFormCategoryId(budget.CategoryId.toString());
    setFormAmount(budget.Amount.toString());
    setFormMonth(budget.Month);
    setFormYear(budget.Year);
    setFormError(null);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsedAmount = parseFloat(formAmount);
    const parsedCatId = parseInt(formCategoryId, 10);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Jumlah anggaran harus lebih besar dari 0");
      return;
    }

    if (isNaN(parsedCatId) || parsedCatId <= 0) {
      setFormError("Kategori harus dipilih");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await ApiService.UpdateBudget(editingId, {
          CategoryId: parsedCatId,
          Amount: parsedAmount,
          Month: formMonth,
          Year: formYear,
        });
      } else {
        await ApiService.CreateBudget({
          CategoryId: parsedCatId,
          Amount: parsedAmount,
          Month: formMonth,
          Year: formYear,
        });
      }
      setModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Gagal menyimpan anggaran.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (id: number) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await ApiService.DeleteBudget(deleteTargetId);
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
      fetchData();
    } catch {
      setError("Gagal menghapus anggaran.");
    }
  };

  const totalBudget = budgets.reduce((sum, item) => sum + item.Amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Manajemen Anggaran (Budget)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tentukan plafon belanja maksimal per kategori per bulan agar uang saku tidak cepat habis.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MonthYearPicker Month={month} Year={year} OnChange={(m, y) => { setMonth(m); setYear(y); }} />
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 rounded-xl shadow-md shadow-orange-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Anggaran</span>
          </button>
        </div>
      </div>

      {error && <AlertBox Type="error" Message={error} />}

      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Anggaran Periode Ini</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{FormatRupiah(totalBudget)}</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
          <PiggyBank className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Bulan</th>
                <th className="px-6 py-4">Tahun</th>
                <th className="px-6 py-4">Jumlah Anggaran</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Memuat data anggaran...
                  </td>
                </tr>
              ) : budgets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="font-semibold text-slate-700">Belum ada anggaran untuk bulan ini</p>
                    <p className="text-xs text-slate-400 mt-1">Klik tombol 'Tambah Anggaran' untuk mulai menentukan budget.</p>
                  </td>
                </tr>
              ) : (
                budgets.map((item) => (
                  <tr key={item.Id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                      {item.Category?.Name || "Umum"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                      {MonthNames[item.Month - 1]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{item.Year}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-amber-600">{FormatRupiah(item.Amount)}</td>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editingId ? "Ubah Anggaran" : "Tambah Anggaran"}</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
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
                  Jumlah Anggaran (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="Contoh: 1000000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Bulan
                  </label>
                  <select
                    value={formMonth}
                    onChange={(e) => setFormMonth(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm bg-white cursor-pointer transition-all"
                  >
                    {MonthNames.map((name, idx) => (
                      <option key={name} value={idx + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tahun
                  </label>
                  <input
                    type="number"
                    required
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm transition-all"
                  />
                </div>
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

      <ConfirmModal
        IsOpen={deleteModalOpen}
        Title="Hapus Anggaran"
        Message="Apakah Anda yakin ingin menghapus anggaran kategori ini? Tindakan ini tidak dapat dibatalkan."
        ConfirmText="Hapus Anggaran"
        OnConfirm={handleConfirmDelete}
        OnCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

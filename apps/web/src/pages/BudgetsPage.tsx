import React, { useState, useEffect, useCallback } from "react";
import { ApiService } from "../services/api.service";
import { Budget, Category, BudgetType } from "@monthly-budgeting-app/shared";
import { MonthYearPicker } from "../components/MonthYearPicker";
import { ConfirmModal } from "../components/ConfirmModal";
import { AlertBox } from "../components/AlertBox";
import { FormatRupiah, MonthNames } from "../utils/formatters";
import {
  PlusCircle,
  Edit2,
  Trash2,
  PiggyBank,
  X,
  Repeat,
  Calendar,
  Tags,
  Check,
  Sparkles,
} from "lucide-react";

export const BudgetsPage: React.FC = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter tab: Semua, Anggaran Tetap, Anggaran Sementara
  const [activeTab, setActiveTab] = useState<"ALL" | "FIXED" | "TEMPORARY">("ALL");

  // Budget Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formType, setFormType] = useState<BudgetType>(BudgetType.TEMPORARY);
  const [formCategoryId, setFormCategoryId] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formMonth, setFormMonth] = useState(month);
  const [formYear, setFormYear] = useState(year);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Category Management Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState("");
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [catSuccess, setCatSuccess] = useState<string | null>(null);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  // Delete Budget Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Delete Category Modal
  const [deleteCatModalOpen, setDeleteCatModalOpen] = useState(false);
  const [deleteCatTarget, setDeleteCatTarget] = useState<Category | null>(null);

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
    setFormType(BudgetType.TEMPORARY);
    setIsCustomCategory(false);
    setCustomCategoryName("");
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
    const isFixed = budget.Type === BudgetType.FIXED || budget.Month === 0;
    setEditingId(budget.Id);
    setFormType(isFixed ? BudgetType.FIXED : BudgetType.TEMPORARY);
    setIsCustomCategory(false);
    setCustomCategoryName("");
    setFormCategoryId(budget.CategoryId.toString());
    setFormAmount(budget.Amount.toString());
    setFormMonth(budget.Month === 0 ? month : budget.Month);
    setFormYear(budget.Year === 0 ? year : budget.Year);
    setFormError(null);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsedAmount = parseFloat(formAmount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Jumlah anggaran harus lebih besar dari 0");
      return;
    }

    setSubmitting(true);
    try {
      let finalCategoryId: number;

      // Jika pengguna memasukkan nama kategori kustom baru
      if (isCustomCategory) {
        const trimmedName = customCategoryName.trim();
        if (!trimmedName) {
          setFormError("Nama kategori kustom tidak boleh kosong");
          setSubmitting(false);
          return;
        }

        const existingCat = categories.find(
          (c) => c.Name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (existingCat) {
          finalCategoryId = existingCat.Id;
        } else {
          const createCatRes = await ApiService.CreateCategory({ Name: trimmedName });
          if (!createCatRes.Data) {
            throw new Error("Gagal membuat kategori kustom");
          }
          finalCategoryId = createCatRes.Data.Id;
          setCategories((prev) => [...prev, createCatRes.Data!]);
        }
      } else {
        finalCategoryId = parseInt(formCategoryId, 10);
        if (isNaN(finalCategoryId) || finalCategoryId <= 0) {
          setFormError("Kategori harus dipilih");
          setSubmitting(false);
          return;
        }
      }

      if (editingId) {
        await ApiService.UpdateBudget(editingId, {
          CategoryId: finalCategoryId,
          Amount: parsedAmount,
          Month: formType === BudgetType.FIXED ? 0 : formMonth,
          Year: formType === BudgetType.FIXED ? 0 : formYear,
          Type: formType,
        });
      } else {
        await ApiService.CreateBudget({
          CategoryId: finalCategoryId,
          Amount: parsedAmount,
          Month: formType === BudgetType.FIXED ? 0 : formMonth,
          Year: formType === BudgetType.FIXED ? 0 : formYear,
          Type: formType,
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

  // Category Modal Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    setCatSuccess(null);
    const trimmed = newCatInput.trim();
    if (!trimmed) {
      setCatError("Nama kategori tidak boleh kosong");
      return;
    }

    setCatSubmitting(true);
    try {
      const res = await ApiService.CreateCategory({ Name: trimmed });
      if (res.Data) {
        setCategories((prev) => [...prev, res.Data!].sort((a, b) => a.Name.localeCompare(b.Name)));
        setNewCatInput("");
        setCatSuccess(`Kategori "${res.Data.Name}" berhasil ditambahkan.`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCatError(err.message);
      } else {
        setCatError("Gagal menambahkan kategori.");
      }
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: number) => {
    setCatError(null);
    setCatSuccess(null);
    const trimmed = editingCatName.trim();
    if (!trimmed) {
      setCatError("Nama kategori tidak boleh kosong");
      return;
    }

    try {
      const res = await ApiService.UpdateCategory(id, { Name: trimmed });
      if (res.Data) {
        setCategories((prev) =>
          prev.map((c) => (c.Id === id ? res.Data! : c)).sort((a, b) => a.Name.localeCompare(b.Name))
        );
        setEditingCatId(null);
        setCatSuccess("Kategori berhasil diperbarui.");
        fetchData();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCatError(err.message);
      } else {
        setCatError("Gagal memperbarui kategori.");
      }
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    setCatError(null);
    setCatSuccess(null);
    try {
      await ApiService.DeleteCategory(deleteCatTarget.Id);
      setCategories((prev) => prev.filter((c) => c.Id !== deleteCatTarget.Id));
      setDeleteCatModalOpen(false);
      setDeleteCatTarget(null);
      setCatSuccess("Kategori berhasil dihapus.");
      fetchData();
    } catch (err: unknown) {
      setDeleteCatModalOpen(false);
      if (err instanceof Error) {
        setCatError(err.message);
      } else {
        setCatError("Kategori tidak dapat dihapus karena masih digunakan.");
      }
    }
  };

  // Calculations
  const fixedBudgets = budgets.filter((b) => b.Type === BudgetType.FIXED || b.Month === 0);
  const tempBudgets = budgets.filter((b) => b.Type !== BudgetType.FIXED && b.Month !== 0);

  const totalFixed = fixedBudgets.reduce((sum, item) => sum + item.Amount, 0);
  const totalTemp = tempBudgets.reduce((sum, item) => sum + item.Amount, 0);
  const totalBudget = totalFixed + totalTemp;

  const displayedBudgets = budgets.filter((b) => {
    const isFixed = b.Type === BudgetType.FIXED || b.Month === 0;
    if (activeTab === "FIXED") return isFixed;
    if (activeTab === "TEMPORARY") return !isFixed;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Manajemen Anggaran (Budget)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola plafon belanja dengan <strong>Anggaran Tetap</strong> (rutin tiap bulan) dan{" "}
            <strong>Anggaran Sementara</strong> (khusus bulan tertentu), serta kustomisasi kategori belanja Anda.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
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
            onClick={() => {
              setCatError(null);
              setCatSuccess(null);
              setCatModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-all active:scale-95"
            title="Kelola & Kustomisasi Kategori"
          >
            <Tags className="w-4 h-4 text-orange-500" />
            <span>Kustom Kategori</span>
          </button>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Anggaran Bulan Ini
            </span>
            <p className="text-2xl font-black text-amber-600 mt-1">{FormatRupiah(totalBudget)}</p>
            <span className="text-xs text-slate-400 mt-0.5 block">{budgets.length} pos anggaran aktif</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 flex items-center justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Anggaran Tetap (Rutin)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                Tiap Bulan
              </span>
            </div>
            <p className="text-2xl font-black text-indigo-600 mt-1">{FormatRupiah(totalFixed)}</p>
            <span className="text-xs text-slate-400 mt-0.5 block">{fixedBudgets.length} pos tetap</span>
          </div>
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <Repeat className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 flex items-center justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
                Anggaran Sementara
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold">
                {MonthNames[month - 1]}
              </span>
            </div>
            <p className="text-2xl font-black text-orange-600 mt-1">{FormatRupiah(totalTemp)}</p>
            <span className="text-xs text-slate-400 mt-0.5 block">{tempBudgets.length} pos sementara</span>
          </div>
          <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "ALL"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Semua Anggaran ({budgets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("FIXED")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "FIXED"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>Anggaran Tetap ({fixedBudgets.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("TEMPORARY")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "TEMPORARY"
              ? "bg-orange-500 text-white shadow-xs"
              : "text-slate-600 hover:text-orange-600 hover:bg-orange-50"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Anggaran Sementara ({tempBudgets.length})</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Tipe Anggaran</th>
                <th className="px-6 py-4">Masa Berlaku</th>
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
              ) : displayedBudgets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="font-semibold text-slate-700">
                      {activeTab === "FIXED"
                        ? "Belum ada anggaran tetap yang diatur"
                        : activeTab === "TEMPORARY"
                        ? `Belum ada anggaran sementara untuk ${MonthNames[month - 1]} ${year}`
                        : "Belum ada anggaran untuk bulan ini"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Klik tombol 'Tambah Anggaran' untuk mulai menentukan plafon belanja.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedBudgets.map((item) => {
                  const isFixed = item.Type === BudgetType.FIXED || item.Month === 0;
                  return (
                    <tr key={item.Id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-400" />
                          <span>{item.Category?.Name || "Umum"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isFixed ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                            <Repeat className="w-3 h-3" />
                            <span>Tetap (Rutin)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                            <Calendar className="w-3 h-3" />
                            <span>Sementara</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs font-medium">
                        {isFixed ? (
                          <span className="text-indigo-600 font-semibold">Setiap Bulan (Berulang)</span>
                        ) : (
                          <span>
                            {MonthNames[item.Month - 1]} {item.Year}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Ubah Anggaran */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? "Ubah Anggaran" : "Tambah Anggaran"}
              </h3>
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
              {/* Tipe Anggaran: Tetap vs Sementara */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tipe Anggaran
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormType(BudgetType.FIXED)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      formType === BudgetType.FIXED
                        ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Repeat
                          className={`w-4 h-4 ${
                            formType === BudgetType.FIXED ? "text-indigo-600" : "text-slate-400"
                          }`}
                        />
                        <span className="text-sm font-bold text-slate-900">Anggaran Tetap</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          formType === BudgetType.FIXED
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {formType === BudgetType.FIXED && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Sama setiap bulannya secara rutin (misal: Kosan, Uang Makan Pokok, Wifi, SPP).
                    </p>
                  </div>

                  <div
                    onClick={() => setFormType(BudgetType.TEMPORARY)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      formType === BudgetType.TEMPORARY
                        ? "border-orange-500 bg-orange-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar
                          className={`w-4 h-4 ${
                            formType === BudgetType.TEMPORARY ? "text-orange-500" : "text-slate-400"
                          }`}
                        />
                        <span className="text-sm font-bold text-slate-900">Anggaran Sementara</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          formType === BudgetType.TEMPORARY
                            ? "border-orange-500 bg-orange-500 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {formType === BudgetType.TEMPORARY && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Hanya berlaku khusus di bulan yang ditentukan (misal: Beli Kado, Servis, Liburan).
                    </p>
                  </div>
                </div>
              </div>

              {/* Kategori & Kustom Kategori */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Kategori
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      setCustomCategoryName("");
                    }}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isCustomCategory ? "Pilih dari Daftar Kategori" : "+ Buat Kategori Kustom"}</span>
                  </button>
                </div>

                {isCustomCategory ? (
                  <div className="space-y-1.5 animate-fade-in">
                    <input
                      type="text"
                      required
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      placeholder="Ketik nama kategori baru (contoh: Skincare, Buku, Hobi)..."
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-orange-400 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm bg-orange-50/20 transition-all font-medium"
                    />
                    <p className="text-[11px] text-slate-400">
                      Kategori kustom ini akan otomatis tersimpan dan dapat digunakan untuk pengeluaran juga.
                    </p>
                  </div>
                ) : (
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
                )}
              </div>

              {/* Nominal Anggaran */}
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm transition-all font-medium"
                />
              </div>

              {/* Periode Bulan & Tahun (Hanya jika tipe Sementara) */}
              {formType === BudgetType.TEMPORARY ? (
                <div className="grid grid-cols-2 gap-3 p-3 bg-orange-50/40 rounded-2xl border border-orange-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Bulan Berlaku
                    </label>
                    <select
                      value={formMonth}
                      onChange={(e) => setFormMonth(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm bg-white cursor-pointer transition-all"
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
                      Tahun Berlaku
                    </label>
                    <input
                      type="number"
                      required
                      value={formYear}
                      onChange={(e) => setFormYear(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-indigo-900 text-xs flex items-start gap-2.5">
                  <Repeat className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-indigo-950">Berlaku untuk Semua Bulan</p>
                    <p className="text-indigo-700/90 mt-0.5 leading-relaxed">
                      Anggaran tetap akan otomatis aktif di setiap bulan dengan nominal yang sama tanpa harus dibuat
                      ulang tiap bulan.
                    </p>
                  </div>
                </div>
              )}

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
                  {submitting ? "Menyimpan..." : "Simpan Anggaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kustom & Kelola Kategori */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                  <Tags className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Kustomisasi Kategori</h3>
                  <p className="text-xs text-slate-500">Tambah, ubah, atau hapus kategori belanja Anda.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {catError && <AlertBox Type="error" Message={catError} />}
              {catSuccess && <AlertBox Type="info" Message={catSuccess} />}

              {/* Form Tambah Kategori */}
              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input
                  type="text"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder="Nama kategori baru (misal: Skincare, Liburan)..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={catSubmitting}
                  className="px-4 py-2.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-xs transition-colors shrink-0 disabled:opacity-50"
                >
                  {catSubmitting ? "Menambah..." : "+ Tambah"}
                </button>
              </form>
            </div>

            {/* Daftar Kategori */}
            <div className="mt-4 flex-1 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-2xl max-h-64">
              {categories.map((c) => (
                <div key={c.Id} className="p-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                  {editingCatId === c.Id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="px-3 py-1.5 text-sm rounded-lg border border-orange-400 outline-none w-full"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateCategory(c.Id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        title="Simpan"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCatId(null)}
                        className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
                        title="Batal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                        <span className="text-sm font-semibold text-slate-800">{c.Name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatId(c.Id);
                            setEditingCatName(c.Name);
                          }}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Ubah nama"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteCatTarget(c);
                            setDeleteCatModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus kategori"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Budget Confirmation Modal */}
      <ConfirmModal
        IsOpen={deleteModalOpen}
        Title="Hapus Anggaran"
        Message="Apakah Anda yakin ingin menghapus anggaran ini? Tindakan ini tidak dapat dibatalkan."
        ConfirmText="Hapus Anggaran"
        OnConfirm={handleConfirmDelete}
        OnCancel={() => setDeleteModalOpen(false)}
      />

      {/* Delete Category Confirmation Modal */}
      <ConfirmModal
        IsOpen={deleteCatModalOpen}
        Title="Hapus Kategori"
        Message={`Apakah Anda yakin ingin menghapus kategori "${deleteCatTarget?.Name}"? Kategori hanya dapat dihapus jika belum digunakan dalam anggaran atau pengeluaran.`}
        ConfirmText="Hapus Kategori"
        OnConfirm={handleConfirmDeleteCategory}
        OnCancel={() => {
          setDeleteCatModalOpen(false);
          setDeleteCatTarget(null);
        }}
      />
    </div>
  );
};

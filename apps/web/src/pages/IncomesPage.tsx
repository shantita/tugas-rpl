import React, { useState, useEffect, useCallback } from "react";
import { ApiService } from "../services/api.service";
import { Income } from "@monthly-budgeting-app/shared";
import { MonthYearPicker } from "../components/MonthYearPicker";
import { ConfirmModal } from "../components/ConfirmModal";
import { AlertBox } from "../components/AlertBox";
import { FormatRupiah, FormatDate } from "../utils/formatters";
import {
  PlusCircle,
  Edit2,
  Trash2,
  TrendingUp,
  X,
  Repeat,
  Sparkles,
  Check,
  Search,
} from "lucide-react";

type IncomeType = "FIXED" | "TEMPORARY";

// Helper untuk mengekstrak tipe dan deskripsi bersih
const parseIncomeDescription = (rawDesc: string): { type: IncomeType; cleanDesc: string } => {
  if (rawDesc.startsWith("[TETAP]")) {
    return {
      type: "FIXED",
      cleanDesc: rawDesc.replace(/^\[TETAP\]\s*/, ""),
    };
  }
  if (rawDesc.startsWith("[SEMENTARA]")) {
    return {
      type: "TEMPORARY",
      cleanDesc: rawDesc.replace(/^\[SEMENTARA\]\s*/, ""),
    };
  }
  // Default / fallback jika belum ada tag
  return {
    type: "TEMPORARY",
    cleanDesc: rawDesc,
  };
};

export const IncomesPage: React.FC = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Form State untuk Tipe Pemasukan (Tetap vs Sementara)
  const [formType, setFormType] = useState<IncomeType>("FIXED");

  // Filter & Search Tab
  const [activeTab, setActiveTab] = useState<"ALL" | "FIXED" | "TEMPORARY">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchIncomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.GetIncomes(month, year);
      if (res.Data) setIncomes(res.Data);
    } catch {
      setError("Gagal mengambil data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setFormType("FIXED");
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (income: Income) => {
    setEditingId(income.Id);
    setAmount(income.Amount.toString());
    const formattedDate = new Date(income.Date).toISOString().split("T")[0];
    setDate(formattedDate);
    const parsed = parseIncomeDescription(income.Description);
    setFormType(parsed.type);
    setDescription(parsed.cleanDesc);
    setFormError(null);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Jumlah pemasukan harus lebih besar dari 0");
      return;
    }

    if (!description.trim()) {
      setFormError("Keterangan pemasukan wajib diisi.");
      return;
    }

    const tag = formType === "FIXED" ? "[TETAP]" : "[SEMENTARA]";
    const finalDescription = `${tag} ${description.trim()}`;

    const [y, m, d] = date.split("-").map(Number);
    const localDate = new Date(y, m - 1, d, 12, 0, 0);

    setSubmitting(true);
    try {
      if (editingId) {
        await ApiService.UpdateIncome(editingId, {
          Amount: parsedAmount,
          Date: localDate.toISOString(),
          Description: finalDescription,
        });
      } else {
        await ApiService.CreateIncome({
          Amount: parsedAmount,
          Date: localDate.toISOString(),
          Description: finalDescription,
        });
      }
      setModalOpen(false);
      fetchIncomes();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Gagal menyimpan data pemasukan.");
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
      await ApiService.DeleteIncome(deleteTargetId);
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
      fetchIncomes();
    } catch {
      setError("Gagal menghapus data pemasukan.");
    }
  };

  const totalIncome = incomes.reduce((sum, item) => sum + item.Amount, 0);

  // Filter & Search calculations
  const parsedIncomes = incomes.map((item) => {
    const parsed = parseIncomeDescription(item.Description);
    return {
      ...item,
      Type: parsed.type,
      CleanDescription: parsed.cleanDesc,
    };
  });

  const fixedIncomes = parsedIncomes.filter((i) => i.Type === "FIXED");
  const tempIncomes = parsedIncomes.filter((i) => i.Type === "TEMPORARY");

  const totalFixed = fixedIncomes.reduce((sum, item) => sum + item.Amount, 0);
  const totalTemp = tempIncomes.reduce((sum, item) => sum + item.Amount, 0);

  const displayedIncomes = parsedIncomes.filter((item) => {
    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "FIXED" && item.Type === "FIXED") ||
      (activeTab === "TEMPORARY" && item.Type === "TEMPORARY");

    const matchesSearch =
      searchQuery.trim() === "" ||
      item.CleanDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Manajemen Pemasukan</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Catat pemasukan tetap (gaji karyawan, bulanan) maupun sementara (freelance, bonus, komisi).</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <div className="w-full sm:w-auto flex justify-between sm:justify-start">
            <MonthYearPicker Month={month} Year={year} OnChange={(m, y) => { setMonth(m); setYear(y); }} />
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 rounded-xl shadow-md shadow-orange-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Tambah Pemasukan</span>
          </button>
        </div>
      </div>

      {error && <AlertBox Type="error" Message={error} />}

      {/* RINGKASAN PEMASUKAN: TOTAL, TETAP & SEMENTARA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pemasukan Bulan Ini</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{FormatRupiah(totalIncome)}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 flex items-center justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pemasukan Tetap (Gaji/Rutin)</span>
            </div>
            <p className="text-2xl font-black text-indigo-600 mt-1">{FormatRupiah(totalFixed)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{fixedIncomes.length} transaksi tercatat</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <Repeat className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 flex items-center justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pemasukan Sementara (Freelance/Bonus)</span>
            </div>
            <p className="text-2xl font-black text-amber-600 mt-1">{FormatRupiah(totalTemp)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{tempIncomes.length} transaksi tercatat</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILTER SEARCH & TABS (SEMUA, TETAP, SEMENTARA) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pemasukan berdasarkan keterangan (gaji, freelance, dsb)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "ALL"
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            Semua Pemasukan ({incomes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("FIXED")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "FIXED"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80"
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Pemasukan Tetap ({fixedIncomes.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("TEMPORARY")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "TEMPORARY"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100/80"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pemasukan Sementara ({tempIncomes.length})</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Memuat data pemasukan...
                  </td>
                </tr>
              ) : displayedIncomes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="font-semibold text-slate-700">
                      {incomes.length === 0
                        ? "Belum ada catatan pemasukan"
                        : "Tidak ada data pemasukan yang sesuai dengan filter"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {incomes.length === 0
                        ? "Klik tombol 'Tambah Pemasukan' untuk mencatat dana masuk."
                        : "Coba ubah tab tipe atau hapus kata kunci pencarian."}
                    </p>
                  </td>
                </tr>
              ) : (
                displayedIncomes.map((item) => (
                  <tr key={item.Id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">{FormatDate(item.Date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.Type === "FIXED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Repeat className="w-3 h-3" />
                          <span>Tetap</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Sparkles className="w-3 h-3" />
                          <span>Sementara</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{item.CleanDescription}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-emerald-600">{FormatRupiah(item.Amount)}</td>
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
              <h3 className="text-lg font-bold text-slate-900">{editingId ? "Ubah Pemasukan" : "Tambah Pemasukan"}</h3>
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
              {/* Pilihan Tipe Pemasukan: Tetap vs Sementara */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tipe Pemasukan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormType("FIXED")}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      formType === "FIXED"
                        ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Repeat
                          className={`w-4 h-4 ${
                            formType === "FIXED" ? "text-indigo-600" : "text-slate-400"
                          }`}
                        />
                        <span className="text-sm font-bold text-slate-900">Pemasukan Tetap</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          formType === "FIXED"
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {formType === "FIXED" && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Pemasukan rutin bulanan pasti (misal: Gaji Karyawan, Uang Bulanan Tetap).
                    </p>
                  </div>

                  <div
                    onClick={() => setFormType("TEMPORARY")}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      formType === "TEMPORARY"
                        ? "border-amber-500 bg-amber-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles
                          className={`w-4 h-4 ${
                            formType === "TEMPORARY" ? "text-amber-500" : "text-slate-400"
                          }`}
                        />
                        <span className="text-sm font-bold text-slate-900">Pemasukan Sementara</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          formType === "TEMPORARY"
                            ? "border-amber-500 bg-amber-500 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {formType === "TEMPORARY" && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Pemasukan tidak tentu/insidental (misal: Project Freelance, Bonus, Komisi).
                    </p>
                  </div>
                </div>
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
                  placeholder="Contoh: 1500000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 outline-none text-sm transition-all"
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
                  placeholder={
                    formType === "FIXED"
                      ? "Contoh: Gaji Pokok Karyawan PT ABC"
                      : "Contoh: Freelance Desain Grafis / Web Project"
                  }
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

      <ConfirmModal
        IsOpen={deleteModalOpen}
        Title="Hapus Pemasukan"
        Message="Apakah Anda yakin ingin menghapus data pemasukan ini? Tindakan ini tidak dapat dibatalkan."
        ConfirmText="Hapus Pemasukan"
        OnConfirm={handleConfirmDelete}
        OnCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

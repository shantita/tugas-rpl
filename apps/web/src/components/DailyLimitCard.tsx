import React from "react";
import { DailyLimitItem, DailyLimitStatus } from "@monthly-budgeting-app/shared";
import { FormatRupiah } from "../utils/formatters";
import { Sparkles, Calendar, Wallet } from "lucide-react";

interface DailyLimitCardProps {
  Item: DailyLimitItem;
}

export const DailyLimitCard: React.FC<DailyLimitCardProps> = ({ Item }) => {
  const getStatusBadge = () => {
    switch (Item.Status) {
      case DailyLimitStatus.NORMAL:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Aman</span>;
      case DailyLimitStatus.NO_BUDGET:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Belum Ada Anggaran</span>;
      case DailyLimitStatus.PERIOD_ENDED:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Periode Berakhir</span>;
      case DailyLimitStatus.BUDGET_EXCEEDED:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">Melebihi Anggaran</span>;
      case DailyLimitStatus.BUDGET_EMPTY:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Anggaran Habis</span>;
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Daily Spending Limit</span>
          </div>
          {getStatusBadge()}
        </div>

        <div className="mt-5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {FormatRupiah(Item.DailyLimit)}
            </span>
            <span className="text-indigo-200 text-base font-semibold">/ hari</span>
          </div>
          <p className="mt-2 text-sm text-indigo-200 max-w-xl leading-relaxed">
            Jumlah maksimal yang disarankan untuk digunakan per hari berdasarkan sisa anggaran dan sisa hari.
          </p>
          {Item.Message && (
            <p className="mt-2 text-xs font-medium text-amber-300 bg-white/5 inline-block px-3 py-1 rounded-md border border-white/10">
              {Item.Message}
            </p>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10">
              <Calendar className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <p className="text-xs text-indigo-300">Sisa Hari</p>
              <p className="text-sm font-semibold">{Item.RemainingDays} Hari</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10">
              <Wallet className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <p className="text-xs text-indigo-300">Sisa Anggaran</p>
              <p className="text-sm font-semibold">{FormatRupiah(Item.RemainingBudget)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { DailyLimitItem, DailyLimitStatus } from "@monthly-budgeting-app/shared";
import { FormatRupiah } from "../utils/formatters";
import { Sparkles, Calendar, Wallet, CheckCircle2, AlertTriangle, XCircle, SlidersHorizontal } from "lucide-react";
import { BudgetMascot, BudgetMood } from "./BudgetMascot";

interface DailyLimitCardProps {
  Item: DailyLimitItem;
  Balance?: number;
  TotalBudget?: number;
}

export const DailyLimitCard: React.FC<DailyLimitCardProps> = ({ Item, Balance, TotalBudget }) => {
  // Manual mood override for user testing/demoing expressions
  const [previewMood, setPreviewMood] = useState<BudgetMood | "auto">("auto");

  // Calculate automated mood from live financial data
  const calculateAutoMood = (): BudgetMood => {
    if (Item.Status === DailyLimitStatus.NO_BUDGET || Item.Status === DailyLimitStatus.PERIOD_ENDED) {
      return "neutral";
    }

    if (
      Item.Status === DailyLimitStatus.BUDGET_EXCEEDED ||
      Item.Status === DailyLimitStatus.BUDGET_EMPTY ||
      Item.RemainingBudget <= 0
    ) {
      return "crying";
    }

    const remainingPercent =
      Item.BudgetAmount > 0 ? (Item.RemainingBudget / Item.BudgetAmount) * 100 : 0;

    // Check if balance exceeds total budget (user prompt: "kalo masih banyak misal saldonya melebih semua anggaran ekspresi cartoonnya senang")
    const isBalanceExceedingBudget =
      Balance !== undefined &&
      TotalBudget !== undefined &&
      TotalBudget > 0 &&
      Balance >= TotalBudget &&
      remainingPercent >= 30;

    if (isBalanceExceedingBudget || remainingPercent >= 70) {
      return "ecstatic";
    }

    if (remainingPercent >= 40) {
      return "happy";
    }

    if (remainingPercent >= 15) {
      return "warning";
    }

    return "sad";
  };

  const currentMood: BudgetMood = previewMood === "auto" ? calculateAutoMood() : previewMood;

  // Background gradient and cartoon theme classes
  const getThemeConfig = (mood: BudgetMood) => {
    switch (mood) {
      case "ecstatic":
        return {
          gradient: "from-emerald-950 via-teal-900 to-slate-950",
          cardBorder: "border-emerald-500/30",
          glowColor: "bg-emerald-500/20",
          accentColor: "text-emerald-300",
          badgeBg: "bg-emerald-400/20 text-emerald-200 border-emerald-400/40",
          badgeText: "Sultan • Saldo Melimpah 👑",
          badgeIcon: <Sparkles className="w-3.5 h-3.5 text-amber-300" />,
        };
      case "happy":
        return {
          gradient: "from-blue-950 via-sky-900 to-indigo-950",
          cardBorder: "border-sky-500/30",
          glowColor: "bg-sky-500/20",
          accentColor: "text-sky-300",
          badgeBg: "bg-emerald-400/20 text-emerald-200 border-emerald-400/40",
          badgeText: "Budget Aman 😊",
          badgeIcon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case "warning":
        return {
          gradient: "from-amber-950 via-orange-950 to-stone-950",
          cardBorder: "border-amber-500/30",
          glowColor: "bg-amber-500/20",
          accentColor: "text-amber-300",
          badgeBg: "bg-amber-400/20 text-amber-200 border-amber-400/40",
          badgeText: "Mulai Waspada 😅",
          badgeIcon: <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />,
        };
      case "sad":
        return {
          gradient: "from-purple-950 via-slate-900 to-rose-950",
          cardBorder: "border-rose-500/30",
          glowColor: "bg-rose-500/20",
          accentColor: "text-rose-300",
          badgeBg: "bg-rose-400/20 text-rose-200 border-rose-400/40",
          badgeText: "Budget Menipis 🥺",
          badgeIcon: <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />,
        };
      case "crying":
        return {
          gradient: "from-red-950 via-rose-950 to-neutral-950",
          cardBorder: "border-red-500/40",
          glowColor: "bg-red-500/25",
          accentColor: "text-red-300",
          badgeBg: "bg-red-500/30 text-red-100 border-red-400/50 animate-pulse",
          badgeText: "Overbudget / Habis 😭",
          badgeIcon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
        };
      case "neutral":
      default:
        return {
          gradient: "from-slate-900 via-indigo-950 to-slate-950",
          cardBorder: "border-slate-700/50",
          glowColor: "bg-indigo-500/15",
          accentColor: "text-indigo-300",
          badgeBg: "bg-slate-700/50 text-slate-200 border-slate-600",
          badgeText: "Belum Ada Anggaran 📝",
          badgeIcon: <Sparkles className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  const theme = getThemeConfig(currentMood);

  // Remaining percentage
  const remainingPercent =
    Item.BudgetAmount > 0
      ? Math.max(0, Math.min(100, Math.round((Item.RemainingBudget / Item.BudgetAmount) * 100)))
      : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.gradient} border ${theme.cardBorder} p-6 sm:p-8 text-white shadow-2xl transition-all duration-700`}
    >
      {/* BACKGROUND CARTOON SCENERY & PARTICLES */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Ambient atmospheric glow */}
        <div
          className={`absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 ${theme.glowColor} rounded-full blur-3xl transition-colors duration-700`}
        ></div>
        <div
          className={`absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 ${theme.glowColor} rounded-full blur-3xl opacity-50 transition-colors duration-700`}
        ></div>

        {/* ECSTATIC / SULTAN: Confetti, Golden Coins, Sunburst */}
        {currentMood === "ecstatic" && (
          <div className="absolute inset-0">
            {/* Cartoon Sparkles */}
            <div className="absolute top-6 left-1/4 animate-sparkle-pulse text-amber-300 text-lg opacity-75">✨</div>
            <div className="absolute top-20 right-1/3 animate-sparkle-pulse text-yellow-300 text-2xl opacity-60">⭐</div>
            <div className="absolute bottom-12 left-1/3 animate-sparkle-pulse text-emerald-300 text-xl opacity-60">✨</div>
            {/* Cartoon Floating Coins */}
            <div className="absolute top-12 right-12 w-8 h-8 rounded-full bg-amber-400/20 border-2 border-amber-300/40 flex items-center justify-center text-[10px] font-black text-amber-200 animate-mascot-float">
              Rp
            </div>
            <div className="absolute bottom-16 right-28 w-6 h-6 rounded-full bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-[8px] font-black text-amber-200 animate-mascot-bounce">
              Rp
            </div>
            <div className="absolute top-1/2 left-8 w-7 h-7 rounded-full bg-amber-400/15 border border-amber-300/30 flex items-center justify-center text-[9px] font-black text-amber-200 animate-mascot-float">
              Rp
            </div>
          </div>
        )}

        {/* HAPPY: Puffy White Cartoon Clouds & Sunshine */}
        {currentMood === "happy" && (
          <div className="absolute inset-0">
            {/* Floating Clouds SVG */}
            <div className="absolute top-4 right-1/4 opacity-25 animate-cloud-drift">
              <svg width="120" height="50" viewBox="0 0 120 50" fill="white">
                <path d="M 20 40 Q 20 20 40 20 Q 50 8 70 12 Q 85 5 95 18 Q 115 15 110 40 Z" />
              </svg>
            </div>
            <div className="absolute bottom-8 left-16 opacity-15 animate-cloud-drift">
              <svg width="90" height="40" viewBox="0 0 90 40" fill="white">
                <path d="M 15 35 Q 15 18 30 18 Q 40 8 55 12 Q 70 6 78 18 Q 88 15 85 35 Z" />
              </svg>
            </div>
            <div className="absolute top-8 left-1/3 animate-sparkle-pulse text-sky-200 text-xl opacity-60">✨</div>
          </div>
        )}

        {/* WARNING: Floating Autumn/Amber Breeze & Warning Orbs */}
        {currentMood === "warning" && (
          <div className="absolute inset-0">
            <div className="absolute top-8 right-24 text-amber-400/40 text-2xl animate-mascot-float">🍃</div>
            <div className="absolute bottom-12 right-1/3 text-orange-400/30 text-xl animate-mascot-float">🍂</div>
            <div className="absolute top-1/3 left-1/4 text-amber-300/30 text-base animate-sparkle-pulse">⚠️</div>
          </div>
        )}

        {/* SAD: Gloomy Raindrops & Purple Clouds */}
        {currentMood === "sad" && (
          <div className="absolute inset-0">
            <div className="absolute top-4 right-1/3 opacity-30">
              <svg width="100" height="45" viewBox="0 0 100 45" fill="#64748b">
                <path d="M 15 35 Q 15 18 32 18 Q 42 8 60 12 Q 78 5 85 18 Q 98 15 95 35 Z" />
              </svg>
            </div>
            <div className="absolute top-16 left-1/4 text-blue-300 text-lg opacity-40 animate-rain-drop">💧</div>
            <div className="absolute top-24 left-1/2 text-blue-300 text-sm opacity-35 animate-rain-drop">💧</div>
            <div className="absolute top-12 right-20 text-blue-300 text-base opacity-40 animate-rain-drop">💧</div>
          </div>
        )}

        {/* CRYING: Dramatic Storm, Lightning & Raindrops */}
        {currentMood === "crying" && (
          <div className="absolute inset-0">
            {/* Storm Clouds */}
            <div className="absolute top-2 right-16 opacity-40 animate-sparkle-pulse">
              <svg width="140" height="55" viewBox="0 0 140 55" fill="#334155">
                <path d="M 20 45 Q 20 22 45 22 Q 58 10 82 14 Q 102 6 112 22 Q 130 18 128 45 Z" />
              </svg>
            </div>
            {/* Cartoon Lightning */}
            <div className="absolute top-12 left-1/3 text-yellow-300 text-2xl animate-sparkle-pulse opacity-75">⚡</div>
            <div className="absolute bottom-16 right-1/4 text-yellow-300 text-xl animate-sparkle-pulse opacity-60">⚡</div>
            {/* Rain Streaks */}
            <div className="absolute top-8 left-16 text-blue-400 text-xl opacity-60 animate-rain-drop">🌧️</div>
            <div className="absolute top-20 right-1/3 text-sky-400 text-base opacity-50 animate-rain-drop">💧</div>
            <div className="absolute bottom-10 left-1/3 text-sky-400 text-lg opacity-50 animate-rain-drop">💧</div>
          </div>
        )}

        {/* NEUTRAL: Night Sky, Moon & Stars */}
        {currentMood === "neutral" && (
          <div className="absolute inset-0">
            <div className="absolute top-6 right-20 text-yellow-200 text-2xl opacity-75 animate-mascot-float">🌙</div>
            <div className="absolute top-12 left-1/4 text-indigo-300 text-sm opacity-60 animate-sparkle-pulse">⭐</div>
            <div className="absolute bottom-12 right-1/3 text-indigo-300 text-lg opacity-50 animate-sparkle-pulse">✨</div>
          </div>
        )}
      </div>

      {/* FOREGROUND CONTENT */}
      <div className="relative z-10">
        {/* TOP BAR: Tag, Status Badge & Expression Preview Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Daily Spending Limit</span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border backdrop-blur-md shadow-sm ${theme.badgeBg}`}
            >
              {theme.badgeIcon}
              <span>{theme.badgeText}</span>
            </span>
          </div>

          {/* INTERACTIVE CARTOON MOOD PREVIEW SWITCHER */}
          <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md p-1 rounded-xl border border-white/10 text-[11px]">
            <span className="text-white/60 px-1.5 font-medium flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              <span className="hidden sm:inline">Tes Mood:</span>
            </span>
            <button
              type="button"
              onClick={() => setPreviewMood("auto")}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                previewMood === "auto"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              title="Gunakan perhitungan otomatis dari data riil"
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => setPreviewMood("ecstatic")}
              className={`px-1.5 py-0.5 rounded-lg transition-all ${
                previewMood === "ecstatic"
                  ? "bg-emerald-500 text-white font-bold shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              title="Ekspresi Kucing Sultan (Saldo Melimpah)"
            >
              👑 Sultan
            </button>
            <button
              type="button"
              onClick={() => setPreviewMood("happy")}
              className={`px-1.5 py-0.5 rounded-lg transition-all ${
                previewMood === "happy"
                  ? "bg-sky-500 text-white font-bold shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              title="Ekspresi Kucing Senang (Budget Aman)"
            >
              😺 Senang
            </button>
            <button
              type="button"
              onClick={() => setPreviewMood("warning")}
              className={`px-1.5 py-0.5 rounded-lg transition-all ${
                previewMood === "warning"
                  ? "bg-amber-500 text-white font-bold shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              title="Ekspresi Kucing Waspada (Budget Mulai Irit)"
            >
              😿 Waspada
            </button>
            <button
              type="button"
              onClick={() => setPreviewMood("sad")}
              className={`px-1.5 py-0.5 rounded-lg transition-all ${
                previewMood === "sad"
                  ? "bg-rose-500 text-white font-bold shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              title="Ekspresi Kucing Sedih (Budget Menipis)"
            >
              🥺 Sedih
            </button>
            <button
              type="button"
              onClick={() => setPreviewMood("crying")}
              className={`px-1.5 py-0.5 rounded-lg transition-all ${
                previewMood === "crying"
                  ? "bg-red-600 text-white font-bold shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              title="Ekspresi Kucing Nangis (Overbudget)"
            >
              😭 Nangis
            </button>
          </div>
        </div>

        {/* MAIN BODY: 2 Columns on Desktop (Stats on left, Mascot on right) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* LEFT: Financial Figures and Metrics (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-white/70 mb-1">
                Batas Belanja yang Disarankan
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
                  {FormatRupiah(Item.DailyLimit)}
                </span>
                <span className={`text-base sm:text-lg font-bold ${theme.accentColor}`}>/ hari</span>
              </div>
            </div>

            <p className="text-sm text-white/85 leading-relaxed max-w-xl">
              Jumlah maksimal yang disarankan untuk digunakan per hari agar uang sakumu cukup hingga akhir periode bulan ini.
            </p>

            {/* Contextual Status / Notification Alert */}
            {Item.Message && (
              <div className="flex items-center gap-2 bg-black/25 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs text-white/90">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>{Item.Message}</span>
              </div>
            )}

            {/* Mini Budget Health / Progress Indicator */}
            {Item.BudgetAmount > 0 && (
              <div className="bg-black/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-white/75">Kesehatan Sisa Anggaran</span>
                  <span className={theme.accentColor}>
                    {remainingPercent}% Sisa ({FormatRupiah(Item.RemainingBudget)})
                  </span>
                </div>
                <div className="w-full bg-white/15 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      remainingPercent >= 50
                        ? "bg-emerald-400"
                        : remainingPercent >= 20
                        ? "bg-amber-400"
                        : "bg-red-400"
                    }`}
                    style={{ width: `${Math.max(4, Math.min(100, remainingPercent))}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* STAT CARDS: Sisa Hari & Sisa Anggaran */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all">
                <div className="p-2.5 rounded-xl bg-white/10 text-white">
                  <Calendar className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <p className="text-xs text-white/60 font-medium">Sisa Hari</p>
                  <p className="text-base sm:text-lg font-extrabold text-white">
                    {Item.RemainingDays} Hari
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all">
                <div className="p-2.5 rounded-xl bg-white/10 text-white">
                  <Wallet className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-xs text-white/60 font-medium">Sisa Anggaran</p>
                  <p className="text-base sm:text-lg font-extrabold text-white truncate max-w-[130px] sm:max-w-none">
                    {FormatRupiah(Item.RemainingBudget)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Cartoon Mascot with Expressions & Dialogue (lg:col-span-5) */}
          <div className="lg:col-span-5 flex justify-center items-center pt-4 lg:pt-0">
            <BudgetMascot mood={currentMood} size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

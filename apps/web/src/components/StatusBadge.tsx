import React from "react";
import { BudgetStatus, BudgetStatusLabels } from "@monthly-budgeting-app/shared";

interface StatusBadgeProps {
  Status: BudgetStatus;
  RemainingBudget?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ Status, RemainingBudget }) => {
  let label = BudgetStatusLabels[Status] || Status;
  let customStyle: string | null = null;

  // Khusus jika sisa anggaran tepat 0, tampilkan "Batas Anggaran"
  if (Status === BudgetStatus.EXCEEDED && RemainingBudget !== undefined) {
    if (RemainingBudget === 0) {
      label = "Batas Anggaran";
      customStyle = "bg-amber-50 text-amber-800 border-amber-300";
    } else if (RemainingBudget < 0) {
      label = "Melebihi Anggaran";
      customStyle = "bg-rose-50 text-rose-700 border-rose-200";
    }
  }

  const colorStyles = {
    [BudgetStatus.SAFE]: "bg-emerald-50 text-emerald-700 border-emerald-200",
    [BudgetStatus.WARNING]: "bg-amber-50 text-amber-700 border-amber-200",
    [BudgetStatus.NEAR_LIMIT]: "bg-orange-50 text-orange-700 border-orange-200",
    [BudgetStatus.EXCEEDED]: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const style = customStyle || colorStyles[Status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {label}
    </span>
  );
};

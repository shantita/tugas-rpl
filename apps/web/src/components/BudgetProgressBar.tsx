import React from "react";
import { BudgetStatus } from "@monthly-budgeting-app/shared";

interface BudgetProgressBarProps {
  Percentage: number;
  Status: BudgetStatus;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ Percentage, Status }) => {
  const cappedPercentage = Math.min(Math.max(Percentage, 0), 100);

  const barColorStyles = {
    [BudgetStatus.SAFE]: "bg-emerald-500",
    [BudgetStatus.WARNING]: "bg-amber-500",
    [BudgetStatus.NEAR_LIMIT]: "bg-orange-500",
    [BudgetStatus.EXCEEDED]: "bg-rose-500",
  };

  const barColor = barColorStyles[Status] || "bg-indigo-500";

  return (
    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
        style={{ width: `${cappedPercentage}%` }}
      ></div>
    </div>
  );
};

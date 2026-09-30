export enum BudgetStatus {
  SAFE = "SAFE",
  WARNING = "WARNING",
  NEAR_LIMIT = "NEAR_LIMIT",
  EXCEEDED = "EXCEEDED",
}

export const BudgetStatusLabels: Record<BudgetStatus, string> = {
  [BudgetStatus.SAFE]: "Aman",
  [BudgetStatus.WARNING]: "Perlu Perhatian",
  [BudgetStatus.NEAR_LIMIT]: "Mendekati Batas",
  [BudgetStatus.EXCEEDED]: "Melebihi Anggaran",
};

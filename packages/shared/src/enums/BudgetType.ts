export enum BudgetType {
  FIXED = "FIXED",
  TEMPORARY = "TEMPORARY",
}

export const BudgetTypeLabels: Record<BudgetType, string> = {
  [BudgetType.FIXED]: "Anggaran Tetap",
  [BudgetType.TEMPORARY]: "Anggaran Sementara",
};


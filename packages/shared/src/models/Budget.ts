import { Category } from "./Category";
import { BudgetType } from "../enums/BudgetType";

export interface Budget {
  Id: number;
  UserId: number;
  CategoryId: number;
  Amount: number;
  Month: number;
  Year: number;
  Type?: BudgetType;
  CreatedAt: string | Date;
  Category?: Category;
}

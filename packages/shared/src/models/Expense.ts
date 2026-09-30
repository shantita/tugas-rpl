import { Category } from "./Category";

export interface Expense {
  Id: number;
  UserId: number;
  CategoryId: number;
  Amount: number;
  Date: string | Date;
  Description: string;
  CreatedAt: string | Date;
  Category?: Category;
}

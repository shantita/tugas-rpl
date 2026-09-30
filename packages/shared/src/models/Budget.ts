import { Category } from "./Category";

export interface Budget {
  Id: number;
  UserId: number;
  CategoryId: number;
  Amount: number;
  Month: number;
  Year: number;
  CreatedAt: string | Date;
  Category?: Category;
}

import { User } from "../models/User";

export interface AuthResponse {
  Token: string;
  User: User;
}

import dotenv from "dotenv";

dotenv.config();

export const JwtConfig = {
  Secret: process.env.JWT_SECRET || "default_jwt_secret_key_12345",
  ExpiresIn: 60 * 60 * 24 * 7,
};

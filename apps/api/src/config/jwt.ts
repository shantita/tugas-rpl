import dotenv from "dotenv";

dotenv.config();

export const JwtConfig = {
  Secret: process.env.JWT_SECRET || "budcat_dev_jwt_fallback_secret_key_unsecure_local_only",
  ExpiresIn: 60 * 60 * 24 * 7,
};

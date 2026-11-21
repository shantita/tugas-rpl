import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET;
if (!secret && process.env.NODE_ENV === "production") {
  throw new Error("FATAL: JWT_SECRET environment variable is missing in production!");
}

export const JwtConfig = {
  Secret: secret || "budcat_dev_jwt_fallback_secret_key_unsecure_local_only",
  ExpiresIn: 60 * 60 * 24 * 7,
};

import { describe, it, expect } from "vitest";
import bcrypt from "bcrypt";
import {
  RegisterSchema,
  LoginSchema,
  ChangePasswordSchema,
} from "../../src/validators/auth.validator";

describe("US-01: Unit Test Aturan Bisnis Autentikasi Mahasiswa", () => {
  describe("Validasi Registrasi Akun", () => {
    it("menerima pendaftaran dengan data lengkap dan password >= 8 karakter", () => {
      const validPayload = {
        Name: "Budi Santoso",
        Email: "budi.santoso@mahasiswa.ac.id",
        Password: "password123",
      };

      const result = RegisterSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.Name).toBe("Budi Santoso");
        expect(result.data.Email).toBe("budi.santoso@mahasiswa.ac.id");
      }
    });

    it("menolak registrasi jika password kurang dari 8 karakter", () => {
      const shortPasswordPayload = {
        Name: "Budi Santoso",
        Email: "budi.santoso@mahasiswa.ac.id",
        Password: "pendek",
      };

      const result = RegisterSchema.safeParse(shortPasswordPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.errors.map((e) => e.message);
        expect(errorMessages).toContain("Password minimal 8 karakter");
      }
    });

    it("menolak registrasi jika format email tidak valid", () => {
      const invalidEmailPayload = {
        Name: "Budi Santoso",
        Email: "budi.santoso_bukan_email",
        Password: "password123",
      };

      const result = RegisterSchema.safeParse(invalidEmailPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.errors.map((e) => e.message);
        expect(errorMessages).toContain("Format email tidak valid");
      }
    });

    it("menolak registrasi jika nama kosong", () => {
      const emptyNamePayload = {
        Name: "",
        Email: "budi@mahasiswa.ac.id",
        Password: "password123",
      };

      const result = RegisterSchema.safeParse(emptyNamePayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.errors.map((e) => e.message);
        expect(errorMessages).toContain("Nama wajib diisi");
      }
    });
  });

  describe("Aturan Keamanan Password (Hashing & Compare)", () => {
    it("mengenkripsi password dengan bcrypt dan tidak menyimpan teks asli", async () => {
      const plainPassword = "RahasiaMahasiswa123";
      const saltRounds = 10;
      const hash = await bcrypt.hash(plainPassword, saltRounds);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(plainPassword);
      expect(hash.startsWith("$2b$") || hash.startsWith("$2a$")).toBe(true);
    });

    it("memverifikasi password yang cocok secara presisi", async () => {
      const plainPassword = "PasswordAman2024";
      const hash = await bcrypt.hash(plainPassword, 10);

      const isMatch = await bcrypt.compare(plainPassword, hash);
      expect(isMatch).toBe(true);

      const isMismatch = await bcrypt.compare("PasswordSalah123", hash);
      expect(isMismatch).toBe(false);
    });
  });

  describe("Validasi Login & Perubahan Password", () => {
    it("memvalidasi payload login wajib memiliki email dan password", () => {
      const validLogin = {
        Email: "budi@mahasiswa.ac.id",
        Password: "password123",
      };
      expect(LoginSchema.safeParse(validLogin).success).toBe(true);

      const emptyPasswordLogin = {
        Email: "budi@mahasiswa.ac.id",
        Password: "",
      };
      expect(LoginSchema.safeParse(emptyPasswordLogin).success).toBe(false);
    });

    it("mengharuskan password baru minimal 8 karakter pada ganti password", () => {
      const invalidChange = {
        OldPassword: "passwordLama123",
        NewPassword: "123",
      };
      const result = ChangePasswordSchema.safeParse(invalidChange);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Password baru minimal 8 karakter");
      }
    });
  });
});

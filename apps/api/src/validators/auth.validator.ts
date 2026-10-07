import { z } from "zod";

export const RegisterSchema = z.object({
  Name: z.string().min(1, { message: "Nama wajib diisi" }),
  Email: z.string().email({ message: "Format email tidak valid" }),
  Password: z.string().min(8, { message: "Password minimal 8 karakter" }),
});

export const LoginSchema = z.object({
  Email: z.string().email({ message: "Format email tidak valid" }),
  Password: z.string().min(1, { message: "Password wajib diisi" }),
});

export const UpdateProfileSchema = z.object({
  Name: z.string().min(1, { message: "Nama wajib diisi" }),
});

export const ChangePasswordSchema = z.object({
  OldPassword: z.string().min(1, { message: "Password lama wajib diisi" }),
  NewPassword: z.string().min(8, { message: "Password baru minimal 8 karakter" }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";

export class DemoService {
  public static readonly DEMO_EMAIL = "demo@mahasiswa.ac.id";
  public static readonly DEMO_PASSWORD = "password123";

  public static async ResetDemoAccount() {
    // 1. Pastikan kategori-kategori utama lengkap
    const defaultCategories = [
      "Makanan & Minuman",
      "Transportasi",
      "Kos/Tempat Tinggal",
      "Hiburan & Hobi",
      "Belanja Bulanan",
      "Tagihan & Utilitas",
      "Kesehatan",
      "Lainnya",
    ];

    const existingCategories = await prisma.category.findMany();
    const existingNames = new Set(existingCategories.map((c) => c.Name));
    const missingCategories = defaultCategories.filter((name) => !existingNames.has(name));

    for (const name of missingCategories) {
      await prisma.category.create({
        data: { Name: name, UserId: null },
      });
    }

    // 2. Pastikan user demo ada dan password-nya selalu "password123"
    const passwordHash = await bcrypt.hash(this.DEMO_PASSWORD, 10);
    let user = await prisma.user.findUnique({
      where: { Email: this.DEMO_EMAIL },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          Name: "Demo User BudCat",
          Email: this.DEMO_EMAIL,
          PasswordHash: passwordHash,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { Id: user.Id },
        data: {
          Name: "Demo User BudCat",
          PasswordHash: passwordHash,
        },
      });
    }

    // 3. Hapus data transaksi & anggaran lama milik akun demo agar fresh
    await prisma.expense.deleteMany({ where: { UserId: user.Id } });
    await prisma.income.deleteMany({ where: { UserId: user.Id } });
    await prisma.budget.deleteMany({ where: { UserId: user.Id } });

    // 4. Siapkan data periode saat ini
    const categories = await prisma.category.findMany();
    const catMap = new Map(categories.map((c) => [c.Name, c.Id]));

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 5. Buat data pemasukan secara batch
    await prisma.income.createMany({
      data: [
        {
          UserId: user.Id,
          Amount: 4500000,
          Date: new Date(Date.UTC(currentYear, currentMonth - 1, 1, 8, 0, 0)),
          Description: "[TETAP] Gaji Pokok Bulanan",
        },
        {
          UserId: user.Id,
          Amount: 1500000,
          Date: new Date(Date.UTC(currentYear, currentMonth - 1, 5, 10, 0, 0)),
          Description: "[TIDAK TETAP] Project Freelance Web Design",
        },
        {
          UserId: user.Id,
          Amount: 500000,
          Date: new Date(Date.UTC(currentYear, currentMonth - 1, 12, 14, 0, 0)),
          Description: "[TIDAK TETAP] Bonus Kinerja & Komisi",
        },
      ],
    });

    // 6. Buat anggaran untuk SEMUA kategori (Fixed & Temporary) secara batch
    const budgetsData = [
      { name: "Makanan & Minuman", amount: 1500000, month: 0, year: 0 }, // FIXED
      { name: "Transportasi", amount: 500000, month: 0, year: 0 }, // FIXED
      { name: "Kos/Tempat Tinggal", amount: 1200000, month: 0, year: 0 }, // FIXED
      { name: "Tagihan & Utilitas", amount: 400000, month: 0, year: 0 }, // FIXED
      { name: "Hiburan & Hobi", amount: 400000, month: currentMonth, year: currentYear }, // TEMPORARY
      { name: "Belanja Bulanan", amount: 800000, month: currentMonth, year: currentYear }, // TEMPORARY
      { name: "Kesehatan", amount: 300000, month: currentMonth, year: currentYear }, // TEMPORARY
      { name: "Lainnya", amount: 200000, month: currentMonth, year: currentYear }, // TEMPORARY
    ];

    const budgetRecords = budgetsData
      .map((b) => {
        const catId = catMap.get(b.name);
        if (!catId) return null;
        return {
          UserId: user!.Id,
          CategoryId: catId,
          Amount: b.amount,
          Month: b.month,
          Year: b.year,
        };
      })
      .filter((b): b is NonNullable<typeof b> => b !== null);

    if (budgetRecords.length > 0) {
      await prisma.budget.createMany({
        data: budgetRecords,
      });
    }

    // 7. Buat pengeluaran secara batch
    const expensesData = [
      { name: "Makanan & Minuman", amount: 650000, day: 2, desc: "Belanja makan siang & mingguan" },
      { name: "Makanan & Minuman", amount: 650000, day: 8, desc: "Makan di luar bareng teman" },
      { name: "Transportasi", amount: 150000, day: 3, desc: "Bensin kendaraan bulanan" },
      { name: "Transportasi", amount: 100000, day: 10, desc: "Isi saldo e-toll & transportasi umum" },
      { name: "Kos/Tempat Tinggal", amount: 1200000, day: 1, desc: "Sewa tempat tinggal / kos bulanan" },
      { name: "Hiburan & Hobi", amount: 260000, day: 6, desc: "Nonton bioskop & kafe" },
      { name: "Hiburan & Hobi", amount: 200000, day: 14, desc: "Game & langganan streaming" },
      { name: "Tagihan & Utilitas", amount: 250000, day: 4, desc: "Tagihan listrik PLN" },
      { name: "Tagihan & Utilitas", amount: 130000, day: 7, desc: "Paket internet & kuota data" },
      { name: "Belanja Bulanan", amount: 350000, day: 5, desc: "Sabun, sampo, dan kebutuhan bulanan" },
      { name: "Kesehatan", amount: 120000, day: 9, desc: "Vitamin & suplemen kesehatan" },
      { name: "Lainnya", amount: 50000, day: 11, desc: "Biaya administrasi bank & transfer" },
    ];

    const expenseRecords = expensesData
      .map((e) => {
        const catId = catMap.get(e.name);
        if (!catId) return null;
        return {
          UserId: user!.Id,
          CategoryId: catId,
          Amount: e.amount,
          Date: new Date(Date.UTC(currentYear, currentMonth - 1, Math.min(e.day, 28), 12, 0, 0)),
          Description: e.desc,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    if (expenseRecords.length > 0) {
      await prisma.expense.createMany({
        data: expenseRecords,
      });
    }

    return user;
  }
}

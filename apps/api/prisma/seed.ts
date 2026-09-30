import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const defaultCategories = [
    "Makanan",
    "Transportasi",
    "Kos/Kontrakan",
    "Hiburan",
    "Lainnya",
  ];

  for (const name of defaultCategories) {
    await prisma.category.upsert({
      where: { Name: name },
      update: {},
      create: { Name: name },
    });
  }

  const demoEmail = "demo@mahasiswa.ac.id";
  const existingUser = await prisma.user.findUnique({
    where: { Email: demoEmail },
  });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        Name: "Mahasiswa Demo",
        Email: demoEmail,
        PasswordHash: passwordHash,
      },
    });

    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map((c) => [c.Name, c.Id]));

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    await prisma.income.createMany({
      data: [
        {
          UserId: user.Id,
          Amount: 2500000,
          Date: new Date(currentYear, currentMonth - 1, 1),
          Description: "Uang saku bulanan dari orang tua",
        },
        {
          UserId: user.Id,
          Amount: 500000,
          Date: new Date(currentYear, currentMonth - 1, 5),
          Description: "Gaji asisten lab",
        },
      ],
    });

    const budgetsToCreate = [
      { name: "Makanan", amount: 1000000 },
      { name: "Transportasi", amount: 300000 },
      { name: "Kos/Kontrakan", amount: 800000 },
      { name: "Hiburan", amount: 200000 },
      { name: "Lainnya", amount: 200000 },
    ];

    for (const b of budgetsToCreate) {
      const catId = categoryMap.get(b.name);
      if (catId) {
        await prisma.budget.create({
          data: {
            UserId: user.Id,
            CategoryId: catId,
            Amount: b.amount,
            Month: currentMonth,
            Year: currentYear,
          },
        });
      }
    }

    const expensesToCreate = [
      { name: "Makanan", amount: 350000, desc: "Makan siang & malam minggu pertama", day: 2 },
      { name: "Transportasi", amount: 80000, desc: "Bensin motor", day: 3 },
      { name: "Kos/Kontrakan", amount: 800000, desc: "Bayar kos bulan ini", day: 1 },
      { name: "Hiburan", amount: 50000, desc: "Nonton bioskop", day: 4 },
    ];

    for (const e of expensesToCreate) {
      const catId = categoryMap.get(e.name);
      if (catId) {
        await prisma.expense.create({
          data: {
            UserId: user.Id,
            CategoryId: catId,
            Amount: e.amount,
            Date: new Date(currentYear, currentMonth - 1, e.day),
            Description: e.desc,
          },
        });
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

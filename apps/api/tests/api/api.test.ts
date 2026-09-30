import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/config/prisma";

describe("API Integration Tests", () => {
  let userToken: string;
  let otherUserToken: string;
  let testCategoryId: number;
  let otherIncomeId: number;

  const testUserEmail = `test_${Date.now()}@mahasiswa.ac.id`;
  const otherUserEmail = `other_${Date.now()}@mahasiswa.ac.id`;

  beforeAll(async () => {
    let cat = await prisma.category.findFirst({ where: { Name: "Makanan" } });
    if (!cat) {
      cat = await prisma.category.create({ data: { Name: "Makanan" } });
    }
    testCategoryId = cat.Id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("register berhasil membuat akun baru", async () => {
    const res = await request(app).post("/api/auth/register").send({
      Name: "User Test",
      Email: testUserEmail,
      Password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.Success).toBe(true);
    expect(res.body.Data.Token).toBeDefined();
    expect(res.body.Data.User.Email).toBe(testUserEmail);
    userToken = res.body.Data.Token;
  });

  it("register menolak email duplikat", async () => {
    const res = await request(app).post("/api/auth/register").send({
      Name: "User Duplicate",
      Email: testUserEmail,
      Password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.Success).toBe(false);
  });

  it("login berhasil dengan kredensial yang valid", async () => {
    const res = await request(app).post("/api/auth/login").send({
      Email: testUserEmail,
      Password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.Data.Token).toBeDefined();
  });

  it("login menolak password yang salah", async () => {
    const res = await request(app).post("/api/auth/login").send({
      Email: testUserEmail,
      Password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.Success).toBe(false);
  });

  it("menolak income dengan nilai negatif", async () => {
    const res = await request(app)
      .post("/api/incomes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        Amount: -100000,
        Date: new Date().toISOString(),
        Description: "Income negatif",
      });

    expect(res.status).toBe(400);
    expect(res.body.Success).toBe(false);
  });

  it("menolak expense dengan nilai negatif", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        CategoryId: testCategoryId,
        Amount: -50000,
        Date: new Date().toISOString(),
        Description: "Expense negatif",
      });

    expect(res.status).toBe(400);
    expect(res.body.Success).toBe(false);
  });

  it("menolak expense dengan kategori tidak valid", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        CategoryId: 999999,
        Amount: 50000,
        Date: new Date().toISOString(),
        Description: "Kategori invalid",
      });

    expect(res.status).toBe(400);
    expect(res.body.Success).toBe(false);
  });

  it("menolak budget dengan nilai negatif", async () => {
    const res = await request(app)
      .post("/api/budgets")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        CategoryId: testCategoryId,
        Amount: -500000,
        Month: 5,
        Year: 2025,
      });

    expect(res.status).toBe(400);
    expect(res.body.Success).toBe(false);
  });

  it("menolak pembuatan budget duplikat pada kategori dan periode yang sama", async () => {
    const firstRes = await request(app)
      .post("/api/budgets")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        CategoryId: testCategoryId,
        Amount: 500000,
        Month: 5,
        Year: 2025,
      });
    expect(firstRes.status).toBe(201);

    const duplicateRes = await request(app)
      .post("/api/budgets")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        CategoryId: testCategoryId,
        Amount: 600000,
        Month: 5,
        Year: 2025,
      });
    expect(duplicateRes.status).toBe(400);
    expect(duplicateRes.body.Success).toBe(false);
  });

  it("user tidak dapat membaca data milik user lain dan mengembalikan 404", async () => {
    const regRes = await request(app).post("/api/auth/register").send({
      Name: "Other User",
      Email: otherUserEmail,
      Password: "password123",
    });
    otherUserToken = regRes.body.Data.Token;

    const incomeRes = await request(app)
      .post("/api/incomes")
      .set("Authorization", `Bearer ${otherUserToken}`)
      .send({
        Amount: 500000,
        Date: new Date().toISOString(),
        Description: "Income user lain",
      });
    otherIncomeId = incomeRes.body.Data.Id;

    const accessRes = await request(app)
      .get(`/api/incomes/${otherIncomeId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(accessRes.status).toBe(404);
    expect(accessRes.body.Success).toBe(false);
  });

  it("filter periode tidak menyertakan data dari bulan lain", async () => {
    await request(app)
      .post("/api/incomes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        Amount: 100000,
        Date: new Date(2025, 0, 15).toISOString(),
        Description: "Income Januari",
      });

    await request(app)
      .post("/api/incomes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        Amount: 200000,
        Date: new Date(2025, 1, 15).toISOString(),
        Description: "Income Februari",
      });

    const filterJanRes = await request(app)
      .get("/api/incomes?Month=1&Year=2025")
      .set("Authorization", `Bearer ${userToken}`);

    expect(filterJanRes.status).toBe(200);
    expect(filterJanRes.body.Data.length).toBe(1);
    expect(filterJanRes.body.Data[0].Description).toBe("Income Januari");
  });
});

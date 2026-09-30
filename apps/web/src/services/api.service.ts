import {
  ApiResponse,
  AuthResponse,
  User,
  Category,
  Income,
  Expense,
  Budget,
  DashboardSummary,
  CategoryUsage,
  DailyLimitResponse,
  MonthlyReport,
} from "@monthly-budgeting-app/shared";

class ApiServiceClass {
  private BaseUrl = "/api";

  private GetToken(): string | null {
    return localStorage.getItem("token");
  }

  public SetToken(token: string | null) {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  private async Request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.GetToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.BaseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.SetToken(null);
        if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
          window.location.href = "/login";
        }
      }

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.Message || "Gagal memproses permintaan");
      }

      return json;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error("Gagal terhubung ke server. Silakan coba lagi.");
    }
  }

  public async Register(data: { Name: string; Email: string; Password: string }): Promise<ApiResponse<AuthResponse>> {
    return this.Request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public async Login(data: { Email: string; Password: string }): Promise<ApiResponse<AuthResponse>> {
    return this.Request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public async GetMe(): Promise<ApiResponse<User>> {
    return this.Request<User>("/auth/me");
  }

  public async GetCategories(): Promise<ApiResponse<Category[]>> {
    return this.Request<Category[]>("/categories");
  }

  public async CreateCategory(data: { Name: string }): Promise<ApiResponse<Category>> {
    return this.Request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public async UpdateCategory(id: number, data: { Name: string }): Promise<ApiResponse<Category>> {
    return this.Request<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public async DeleteCategory(id: number): Promise<ApiResponse<void>> {
    return this.Request<void>(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  public async GetIncomes(month?: number, year?: number): Promise<ApiResponse<Income[]>> {
    const params = new URLSearchParams();
    if (month) params.append("Month", month.toString());
    if (year) params.append("Year", year.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.Request<Income[]>(`/incomes${query}`);
  }

  public async GetIncomeById(id: number): Promise<ApiResponse<Income>> {
    return this.Request<Income>(`/incomes/${id}`);
  }

  public async CreateIncome(data: { Amount: number; Date: string; Description: string }): Promise<ApiResponse<Income>> {
    return this.Request<Income>("/incomes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public async UpdateIncome(id: number, data: { Amount: number; Date: string; Description: string }): Promise<ApiResponse<Income>> {
    return this.Request<Income>(`/incomes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public async DeleteIncome(id: number): Promise<ApiResponse<void>> {
    return this.Request<void>(`/incomes/${id}`, {
      method: "DELETE",
    });
  }

  public async GetExpenses(month?: number, year?: number): Promise<ApiResponse<Expense[]>> {
    const params = new URLSearchParams();
    if (month) params.append("Month", month.toString());
    if (year) params.append("Year", year.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.Request<Expense[]>(`/expenses${query}`);
  }

  public async GetExpenseById(id: number): Promise<ApiResponse<Expense>> {
    return this.Request<Expense>(`/expenses/${id}`);
  }

  public async CreateExpense(data: {
    CategoryId: number;
    Amount: number;
    Date: string;
    Description: string;
  }): Promise<ApiResponse<Expense>> {
    return this.Request<Expense>("/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public async UpdateExpense(
    id: number,
    data: { CategoryId: number; Amount: number; Date: string; Description: string }
  ): Promise<ApiResponse<Expense>> {
    return this.Request<Expense>(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public async DeleteExpense(id: number): Promise<ApiResponse<void>> {
    return this.Request<void>(`/expenses/${id}`, {
      method: "DELETE",
    });
  }

  public async GetBudgets(month?: number, year?: number): Promise<ApiResponse<Budget[]>> {
    const params = new URLSearchParams();
    if (month) params.append("Month", month.toString());
    if (year) params.append("Year", year.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.Request<Budget[]>(`/budgets${query}`);
  }

  public async GetBudgetById(id: number): Promise<ApiResponse<Budget>> {
    return this.Request<Budget>(`/budgets/${id}`);
  }

  public async CreateBudget(data: {
    CategoryId: number;
    Amount: number;
    Month: number;
    Year: number;
  }): Promise<ApiResponse<Budget>> {
    return this.Request<Budget>("/budgets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public async UpdateBudget(
    id: number,
    data: { CategoryId: number; Amount: number; Month: number; Year: number }
  ): Promise<ApiResponse<Budget>> {
    return this.Request<Budget>(`/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public async DeleteBudget(id: number): Promise<ApiResponse<void>> {
    return this.Request<void>(`/budgets/${id}`, {
      method: "DELETE",
    });
  }

  public async GetSummary(month?: number, year?: number): Promise<ApiResponse<DashboardSummary>> {
    const params = new URLSearchParams();
    if (month) params.append("Month", month.toString());
    if (year) params.append("Year", year.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.Request<DashboardSummary>(`/dashboard/summary${query}`);
  }

  public async GetCategoriesUsage(month?: number, year?: number): Promise<ApiResponse<CategoryUsage[]>> {
    const params = new URLSearchParams();
    if (month) params.append("Month", month.toString());
    if (year) params.append("Year", year.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.Request<CategoryUsage[]>(`/dashboard/categories${query}`);
  }

  public async GetDailyLimit(month?: number, year?: number): Promise<ApiResponse<DailyLimitResponse>> {
    const params = new URLSearchParams();
    if (month) params.append("Month", month.toString());
    if (year) params.append("Year", year.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.Request<DailyLimitResponse>(`/dashboard/daily-limit${query}`);
  }

  public async GetMonthlyReport(month?: number, year?: number): Promise<ApiResponse<MonthlyReport>> {
    const params = new URLSearchParams();
    if (month) params.append("Month", month.toString());
    if (year) params.append("Year", year.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.Request<MonthlyReport>(`/reports/monthly${query}`);
  }
}

export const ApiService = new ApiServiceClass();

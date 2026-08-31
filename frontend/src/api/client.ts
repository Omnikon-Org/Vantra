import {
  User,
  Account,
  Transaction,
  Category,
  Merchant,
  Reconciliation,
  ReconciliationException,
  AuditLog,
  FraudAlert,
  FraudStats
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('vantra_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('vantra_token');
          localStorage.removeItem('vantra_user');
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
        }
        const message = data.message || (data.errors ? JSON.stringify(data.errors) : 'An error occurred');
        throw new Error(message);
      }

      return data as T;
    } catch (error: any) {
      throw error;
    }
  }

  get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
    let query = '';
    if (params) {
      const filtered = Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');
      if (filtered) query = `?${filtered}`;
    }
    return this.request<T>(`${endpoint}${query}`, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<{ success: boolean; token: string; user: User }>('/auth/login', data),
  register: (data: { email: string; password: string; name?: string; tenantName?: string }) =>
    api.post<{ success: boolean; token: string; user: User }>('/auth/register', data),
  getMe: () => api.get<{ success: boolean; user: User }>('/auth/me'),
};

// Accounts API
export const accountsApi = {
  list: () => api.get<{ success: boolean; accounts: Account[] }>('/accounts'),
  getById: (id: string) => api.get<{ success: boolean; account: Account }>(`/accounts/${id}`),
  create: (data: { name: string; type?: 'BANK' | 'CREDIT' | 'CASH'; currency?: string }) =>
    api.post<{ success: boolean; account: Account }>('/accounts', data),
  update: (id: string, data: { name?: string; type?: string; currency?: string }) =>
    api.patch<{ success: boolean; account: Account }>(`/accounts/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean; message: string }>(`/accounts/${id}`),
};

// Categories & Merchants
export const categoriesApi = {
  list: () => api.get<{ success: boolean; categories: Category[] }>('/categories'),
  create: (data: { name: string; type?: 'INCOME' | 'EXPENSE' }) =>
    api.post<{ success: boolean; category: Category }>('/categories', data),
};

export const merchantsApi = {
  list: () => api.get<{ success: boolean; merchants: Merchant[] }>('/merchants'),
  create: (data: { name: string }) => api.post<{ success: boolean; merchant: Merchant }>('/merchants', data),
};

// Transactions API
export const transactionsApi = {
  list: (params?: { page?: number; limit?: number; accountId?: string; categoryId?: string; type?: string; startDate?: string; endDate?: string }) =>
    api.get<{ success: boolean; transactions: Transaction[]; total: number; page: number; limit: number }>('/transactions', params),
  getById: (id: string) => api.get<{ success: boolean; transaction: Transaction }>(`/transactions/${id}`),
  create: (data: { accountId: string; amount: number; type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'; currency?: string; description?: string; categoryId?: string; merchantId?: string; transactionAt?: string }) =>
    api.post<{ success: boolean; transaction: Transaction }>('/transactions', data),
  update: (id: string, data: { description?: string | null; categoryId?: string | null; merchantId?: string | null; status?: string }) =>
    api.patch<{ success: boolean; transaction: Transaction }>(`/transactions/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean; message: string }>(`/transactions/${id}`),
};

// Reconciliation API
export const reconciliationApi = {
  list: (params?: { page?: number; limit?: number; accountId?: string; status?: string }) =>
    api.get<{ success: boolean; reconciliations: Reconciliation[]; total: number; page: number; limit: number }>('/reconciliation', params),
  getById: (id: string) => api.get<{ success: boolean; reconciliation: Reconciliation }>(`/reconciliation/${id}`),
  run: (data: { accountId: string; startDate?: string; endDate?: string; externalRecords: any[]; rules?: { dateToleranceDays?: number; autoReconcileTransactions?: boolean }; notes?: string }) =>
    api.post<{ success: boolean; reconciliation: Reconciliation }>('/reconciliation', data),
  manualMatch: (id: string, data: { reconciliationItemId: string; transactionId: string; notes?: string }) =>
    api.post<{ success: boolean; item: any }>(`/reconciliation/${id}/manual-match`, data),
  resolveDiscrepancy: (id: string, data: { itemId: string; resolution: string; notes?: string }) =>
    api.post<{ success: boolean; item: any }>(`/reconciliation/${id}/resolve`, data),
  delete: (id: string) => api.delete<{ success: boolean; message: string }>(`/reconciliation/${id}`),
};

// Exceptions API
export const exceptionsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; severity?: string; exceptionType?: string; reconciliationId?: string; startDate?: string; endDate?: string }) =>
    api.get<{ success: boolean; exceptions: ReconciliationException[]; total: number; page: number; limit: number }>('/exceptions', params),
  getById: (id: string) => api.get<{ success: boolean; exception: ReconciliationException }>(`/exceptions/${id}`),
  updateStatus: (id: string, data: { status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED'; notes?: string }) =>
    api.patch<{ success: boolean; exception: ReconciliationException }>(`/exceptions/${id}/status`, data),
  resolve: (id: string, data: { resolutionNotes: string }) =>
    api.post<{ success: boolean; exception: ReconciliationException }>(`/exceptions/${id}/resolve`, data),
};

// Audit Logs API
export const auditLogsApi = {
  list: (params?: { page?: number; limit?: number; action?: string; entityType?: string; startDate?: string; endDate?: string }) =>
    api.get<{ success: boolean; auditLogs: AuditLog[]; total: number; page: number; limit: number }>('/audit-logs', params),
};

// Fraud Detection API
export const fraudApi = {
  listAlerts: (params?: { page?: number; limit?: number; status?: string; severity?: string; startDate?: string; endDate?: string }) =>
    api.get<{ success: boolean; alerts: FraudAlert[]; total: number; page: number; limit: number }>('/fraud/alerts', params),
  getAlertById: (id: string) =>
    api.get<{ success: boolean; alert: FraudAlert }>(`/fraud/alerts/${id}`),
  analyzeTransaction: (transactionId: string) =>
    api.post<{ success: boolean; transactionId: string; riskScore: number; severity: string; reasons: string[]; ruleResults: any; alert: FraudAlert | null }>(`/fraud/analyze/${transactionId}`),
  analyzeBatch: (transactionIds?: string[]) =>
    api.post<{ success: boolean; analyzedCount: number; alertsCreated: number; results: any[] }>('/fraud/analyze', { transactionIds }),
  reviewAlert: (id: string, data?: { notes?: string }) =>
    api.post<{ success: boolean; alert: FraudAlert; message: string }>(`/fraud/alerts/${id}/review`, data || {}),
  resolveAlert: (id: string, data: { status: 'CONFIRMED' | 'DISMISSED' | 'RESOLVED'; resolutionNotes: string }) =>
    api.post<{ success: boolean; alert: FraudAlert; message: string }>(`/fraud/alerts/${id}/resolve`, data),
  getStats: () =>
    api.get<{ success: boolean; stats: FraudStats }>('/fraud/stats'),
};


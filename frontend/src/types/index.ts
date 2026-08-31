export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  tenant?: Tenant;
}

export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  tenantId: string;
  name: string;
  type: 'BANK' | 'CREDIT' | 'CASH';
  currency: string;
  balance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
  updatedAt: string;
}

export interface Merchant {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  tenantId: string;
  accountId: string;
  categoryId: string | null;
  merchantId: string | null;
  amount: number | string;
  currency: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  description: string | null;
  reference: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'RECONCILED';
  transactionAt: string;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  merchant?: Merchant | null;
  account?: Account | null;
}

export interface ReconciliationItem {
  id: string;
  tenantId: string;
  reconciliationId: string;
  transactionId: string | null;
  externalReference: string | null;
  externalAmount: number | string | null;
  externalDate: string | null;
  externalDescription: string | null;
  internalAmount: number | string | null;
  matchType: 'EXACT' | 'FUZZY' | 'MANUAL' | 'DISCREPANCY' | 'UNMATCHED';
  status: 'MATCHED' | 'UNMATCHED' | 'DISCREPANT' | 'RESOLVED';
  discrepancyReason: string | null;
  discrepancyAmount: number | string | null;
  confidenceScore: number | string | null;
  createdAt: string;
  updatedAt: string;
  transaction?: Transaction | null;
}

export interface Reconciliation {
  id: string;
  tenantId: string;
  accountId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  startDate: string | null;
  endDate: string | null;
  totalInternal: number;
  totalExternal: number;
  matchedCount: number;
  unmatchedCount: number;
  discrepancyCount: number;
  matchedAmount: number | string;
  discrepancyAmount: number | string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  account?: Account | null;
  items?: ReconciliationItem[];
}

export interface ReconciliationException {
  id: string;
  tenantId: string;
  reconciliationId: string;
  reconciliationItemId: string | null;
  transactionId: string | null;
  exceptionType: 'AMOUNT_MISMATCH' | 'UNMATCHED_EXTERNAL' | 'UNMATCHED_INTERNAL' | 'DESCRIPTION_MISMATCH' | string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
  description: string;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  resolvedById: string | null;
  createdAt: string;
  updatedAt: string;
  reconciliation?: { id: string; accountId: string; status: string; startDate?: string | null; endDate?: string | null } | null;
  transaction?: { id: string; amount: number | string; currency: string; reference: string | null; description: string | null; type?: string; status?: string } | null;
  resolvedBy?: { id: string; email: string; name: string | null; role?: string } | null;
}

export interface RuleResult {
  ruleId: string;
  name: string;
  triggered: boolean;
  score: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface FraudAlert {
  id: string;
  tenantId: string;
  transactionId: string;
  riskScore: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_REVIEW' | 'CONFIRMED' | 'DISMISSED' | 'RESOLVED';
  reasons: string[];
  ruleResults: Record<string, RuleResult>;
  reviewedAt: string | null;
  reviewedById: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
  transaction?: Transaction | null;
  reviewedBy?: { id: string; email: string; name: string | null; role?: string } | null;
}

export interface FraudStats {
  totalAlerts: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  openCount: number;
  inReviewCount: number;
  confirmedCount: number;
  dismissedCount: number;
  resolvedCount: number;
  avgRiskScore: number;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  user?: { id: string; email: string; name: string | null; role: string } | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  [key: string]: any;
}

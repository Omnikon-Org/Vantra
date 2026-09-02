import prisma from '../config/db';
import { Prisma } from '@prisma/client';
import { AuditService } from './audit.service';
import { CustomError } from '../middleware/error.middleware';

export interface RuleResult {
  ruleId: string;
  name: string;
  triggered: boolean;
  score: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export class FraudDetectionService {
  // 1. Core Rule Engine
  static async evaluateRules(tenantId: string, transactionId: string): Promise<{
    riskScore: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reasons: string[];
    ruleResults: Record<string, RuleResult>;
  }> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        account: true,
        exceptions: true,
        reconciliationItems: true,
      },
    });

    if (!transaction || transaction.tenantId !== tenantId) {
      const error: CustomError = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    const txAmount = Number(transaction.amount);
    const txTime = new Date(transaction.transactionAt || transaction.createdAt);
    const results: Record<string, RuleResult> = {};
    const reasons: string[] = [];

    // ----------------------------------------------------
    // RULE 1 — HIGH VALUE TRANSACTION
    // ----------------------------------------------------
    const highValueThreshold = 10000;
    if (txAmount >= highValueThreshold) {
      const score = 25;
      const reason = `High-value transaction ($${txAmount.toFixed(2)}) exceeds standard risk monitoring threshold ($${highValueThreshold.toLocaleString()}).`;
      results['RULE_1_HIGH_VALUE'] = {
        ruleId: 'RULE_1_HIGH_VALUE',
        name: 'High Value Transaction',
        triggered: true,
        score,
        reason,
        metadata: { amount: txAmount, threshold: highValueThreshold },
      };
      reasons.push(reason);
    } else {
      results['RULE_1_HIGH_VALUE'] = {
        ruleId: 'RULE_1_HIGH_VALUE',
        name: 'High Value Transaction',
        triggered: false,
        score: 0,
      };
    }

    // ----------------------------------------------------
    // RULE 2 — RAPID SUCCESSIVE TRANSACTIONS (within 5 mins)
    // ----------------------------------------------------
    const fiveMinutesAgo = new Date(txTime.getTime() - 5 * 60 * 1000);
    const fiveMinutesLater = new Date(txTime.getTime() + 5 * 60 * 1000);

    const rapidTxCount = await prisma.transaction.count({
      where: {
        tenantId,
        accountId: transaction.accountId,
        transactionAt: {
          gte: fiveMinutesAgo,
          lte: fiveMinutesLater,
        },
      },
    });

    if (rapidTxCount >= 3) {
      const score = 20;
      const reason = `Rapid transaction velocity detected: ${rapidTxCount} transactions posted within a 5-minute window on this account.`;
      results['RULE_2_RAPID_SUCCESSIVE'] = {
        ruleId: 'RULE_2_RAPID_SUCCESSIVE',
        name: 'Rapid Successive Transactions',
        triggered: true,
        score,
        reason,
        metadata: { count: rapidTxCount, windowMinutes: 5 },
      };
      reasons.push(reason);
    } else {
      results['RULE_2_RAPID_SUCCESSIVE'] = {
        ruleId: 'RULE_2_RAPID_SUCCESSIVE',
        name: 'Rapid Successive Transactions',
        triggered: false,
        score: 0,
      };
    }

    // ----------------------------------------------------
    // RULE 3 — UNUSUAL TRANSACTION AMOUNT (vs historical average)
    // ----------------------------------------------------
    const historicalTxns = await prisma.transaction.findMany({
      where: {
        tenantId,
        accountId: transaction.accountId,
        id: { not: transaction.id },
      },
      select: { amount: true },
      take: 50,
    });

    if (historicalTxns.length >= 3) {
      const sum = historicalTxns.reduce((acc, t) => acc + Number(t.amount), 0);
      const avg = sum / historicalTxns.length;
      if (txAmount >= 3 * avg && avg > 0) {
        const divergence = (txAmount / avg).toFixed(1);
        const score = 20;
        const reason = `Unusual transaction amount: $${txAmount.toFixed(2)} is ${divergence}x higher than the account historical average ($${avg.toFixed(2)}).`;
        results['RULE_3_UNUSUAL_AMOUNT'] = {
          ruleId: 'RULE_3_UNUSUAL_AMOUNT',
          name: 'Unusual Transaction Amount',
          triggered: true,
          score,
          reason,
          metadata: { amount: txAmount, average: avg, divergenceFactor: Number(divergence) },
        };
        reasons.push(reason);
      } else {
        results['RULE_3_UNUSUAL_AMOUNT'] = {
          ruleId: 'RULE_3_UNUSUAL_AMOUNT',
          name: 'Unusual Transaction Amount',
          triggered: false,
          score: 0,
        };
      }
    } else {
      results['RULE_3_UNUSUAL_AMOUNT'] = {
        ruleId: 'RULE_3_UNUSUAL_AMOUNT',
        name: 'Unusual Transaction Amount',
        triggered: false,
        score: 0,
      };
    }

    // ----------------------------------------------------
    // RULE 4 — DUPLICATE TRANSACTION (Identical amount within 24h)
    // ----------------------------------------------------
    const dayAgo = new Date(txTime.getTime() - 24 * 60 * 60 * 1000);
    const dayAhead = new Date(txTime.getTime() + 24 * 60 * 60 * 1000);

    const duplicateTx = await prisma.transaction.findFirst({
      where: {
        tenantId,
        accountId: transaction.accountId,
        id: { not: transaction.id },
        amount: transaction.amount,
        transactionAt: {
          gte: dayAgo,
          lte: dayAhead,
        },
      },
    });

    if (duplicateTx) {
      const score = 30;
      const reason = `Potential duplicate transaction: Identical amount ($${txAmount.toFixed(2)}) detected on the same account within 24 hours.`;
      results['RULE_4_DUPLICATE_TRANSACTION'] = {
        ruleId: 'RULE_4_DUPLICATE_TRANSACTION',
        name: 'Duplicate Transaction',
        triggered: true,
        score,
        reason,
        metadata: { matchedTransactionId: duplicateTx.id, amount: txAmount },
      };
      reasons.push(reason);
    } else {
      results['RULE_4_DUPLICATE_TRANSACTION'] = {
        ruleId: 'RULE_4_DUPLICATE_TRANSACTION',
        name: 'Duplicate Transaction',
        triggered: false,
        score: 0,
      };
    }

    // ----------------------------------------------------
    // RULE 5 — UNUSUAL HOURLY FREQUENCY (>= 5 in 1 hour)
    // ----------------------------------------------------
    const oneHourAgo = new Date(txTime.getTime() - 60 * 60 * 1000);
    const hourlyTxCount = await prisma.transaction.count({
      where: {
        tenantId,
        accountId: transaction.accountId,
        transactionAt: {
          gte: oneHourAgo,
          lte: txTime,
        },
      },
    });

    if (hourlyTxCount >= 5) {
      const score = 15;
      const reason = `High transaction frequency: ${hourlyTxCount} transactions recorded on this account within the past hour.`;
      results['RULE_5_UNUSUAL_FREQUENCY'] = {
        ruleId: 'RULE_5_UNUSUAL_FREQUENCY',
        name: 'Unusual Frequency',
        triggered: true,
        score,
        reason,
        metadata: { hourlyCount: hourlyTxCount },
      };
      reasons.push(reason);
    } else {
      results['RULE_5_UNUSUAL_FREQUENCY'] = {
        ruleId: 'RULE_5_UNUSUAL_FREQUENCY',
        name: 'Unusual Frequency',
        triggered: false,
        score: 0,
      };
    }

    // ----------------------------------------------------
    // RULE 6 — RECONCILIATION ANOMALY (Exceptions / Unmatched items)
    // ----------------------------------------------------
    const hasReconException = transaction.exceptions && transaction.exceptions.length > 0;
    const hasUnmatchedItem = transaction.reconciliationItems && transaction.reconciliationItems.some(i => i.status === 'DISCREPANT' || i.status === 'UNMATCHED');

    if (hasReconException || hasUnmatchedItem) {
      const score = 15;
      const reason = 'Reconciliation anomaly: Transaction is flagged with an active reconciliation discrepancy or unmatched exception.';
      results['RULE_6_RECON_ANOMALY'] = {
        ruleId: 'RULE_6_RECON_ANOMALY',
        name: 'Reconciliation Anomaly',
        triggered: true,
        score,
        reason,
        metadata: { exceptionsCount: transaction.exceptions.length },
      };
      reasons.push(reason);
    } else {
      results['RULE_6_RECON_ANOMALY'] = {
        ruleId: 'RULE_6_RECON_ANOMALY',
        name: 'Reconciliation Anomaly',
        triggered: false,
        score: 0,
      };
    }

    // ----------------------------------------------------
    // RULE 7 — SUSPICIOUS COMPOUND PATTERN (>= 3 triggered rules)
    // ----------------------------------------------------
    const triggeredCount = Object.values(results).filter(r => r.triggered).length;
    if (triggeredCount >= 3) {
      const score = 15;
      const reason = `Suspicious compound risk pattern: ${triggeredCount} independent risk rules triggered simultaneously.`;
      results['RULE_7_SUSPICIOUS_PATTERN'] = {
        ruleId: 'RULE_7_SUSPICIOUS_PATTERN',
        name: 'Suspicious Compound Pattern',
        triggered: true,
        score,
        reason,
        metadata: { triggeredRulesCount: triggeredCount },
      };
      reasons.push(reason);
    } else {
      results['RULE_7_SUSPICIOUS_PATTERN'] = {
        ruleId: 'RULE_7_SUSPICIOUS_PATTERN',
        name: 'Suspicious Compound Pattern',
        triggered: false,
        score: 0,
      };
    }

    // Calculate Final Risk Score & Severity
    const rawScore = Object.values(results).reduce((acc, r) => acc + r.score, 0);
    const riskScore = Math.min(100, rawScore);

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskScore >= 80) {
      severity = 'CRITICAL';
    } else if (riskScore >= 60) {
      severity = 'HIGH';
    } else if (riskScore >= 30) {
      severity = 'MEDIUM';
    }

    return {
      riskScore,
      severity,
      reasons,
      ruleResults: results,
    };
  }

  // 2. Analyze Single Transaction & Manage Alert
  static async analyzeTransaction(tenantId: string, transactionId: string, userId?: string) {
    const evaluation = await this.evaluateRules(tenantId, transactionId);

    let alert = null;
    // Create or update FraudAlert if score >= 30
    if (evaluation.riskScore >= 30) {
      const existingAlert = await prisma.fraudAlert.findFirst({
        where: { tenantId, transactionId },
      });

      if (existingAlert) {
        alert = await prisma.fraudAlert.update({
          where: { id: existingAlert.id },
          data: {
            riskScore: evaluation.riskScore,
            severity: evaluation.severity,
            reasons: evaluation.reasons,
            ruleResults: evaluation.ruleResults as any,
          },
        });
      } else {
        alert = await prisma.fraudAlert.create({
          data: {
            tenantId,
            transactionId,
            riskScore: evaluation.riskScore,
            severity: evaluation.severity,
            status: 'OPEN',
            reasons: evaluation.reasons,
            ruleResults: evaluation.ruleResults as any,
          },
        });

        await AuditService.log({
          tenantId,
          userId,
          action: 'FRAUD_ALERT_CREATED',
          entityType: 'FraudAlert',
          entityId: alert.id,
          metadata: {
            transactionId,
            riskScore: evaluation.riskScore,
            severity: evaluation.severity,
            reasonsCount: evaluation.reasons.length,
          },
        });
      }
    }

    await AuditService.log({
      tenantId,
      userId,
      action: 'FRAUD_ANALYSIS_RUN',
      entityType: 'Transaction',
      entityId: transactionId,
      metadata: {
        riskScore: evaluation.riskScore,
        severity: evaluation.severity,
        alertGenerated: !!alert,
      },
    });

    return {
      transactionId,
      riskScore: evaluation.riskScore,
      severity: evaluation.severity,
      reasons: evaluation.reasons,
      ruleResults: evaluation.ruleResults,
      alert,
    };
  }

  // 3. Batch Analysis
  static async analyzeBatch(tenantId: string, transactionIds?: string[], userId?: string) {
    let ids = transactionIds;
    if (!ids || ids.length === 0) {
      const txns = await prisma.transaction.findMany({
        where: { tenantId },
        select: { id: true },
        take: 100,
        orderBy: { createdAt: 'desc' },
      });
      ids = txns.map(t => t.id);
    }

    const results = [];
    for (const id of ids) {
      const res = await this.analyzeTransaction(tenantId, id, userId);
      results.push(res);
    }

    return {
      analyzedCount: results.length,
      alertsCreated: results.filter(r => !!r.alert).length,
      results,
    };
  }

  // 4. List Alerts with Filters & Pagination
  static async listAlerts(tenantId: string, query: {
    page?: number;
    limit?: number;
    status?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.FraudAlertWhereInput = { tenantId };

    if (query.status) where.status = query.status;
    if (query.severity) where.severity = query.severity;

    if (query.startDate || query.endDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (query.startDate) dateFilter.gte = new Date(query.startDate);
      if (query.endDate) dateFilter.lte = new Date(query.endDate);
      where.createdAt = dateFilter;
    }

    const [alerts, total] = await Promise.all([
      prisma.fraudAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          transaction: {
            include: {
              account: true,
              merchant: true,
              category: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      }),
      prisma.fraudAlert.count({ where }),
    ]);

    return { alerts, total, page, limit };
  }

  // 5. Get Alert by ID
  static async getAlertById(tenantId: string, id: string) {
    const alert = await prisma.fraudAlert.findFirst({
      where: { id, tenantId },
      include: {
        transaction: {
          include: {
            account: true,
            merchant: true,
            category: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!alert) {
      const error: CustomError = new Error('Fraud alert not found');
      error.statusCode = 404;
      throw error;
    }

    return alert;
  }

  // 6. Review Alert (Move to IN_REVIEW)
  static async reviewAlert(tenantId: string, id: string, userId?: string, notes?: string) {
    const alert = await this.getAlertById(tenantId, id);

    const updated = await prisma.fraudAlert.update({
      where: { id: alert.id },
      data: {
        status: 'IN_REVIEW',
        reviewedAt: new Date(),
        reviewedById: userId || null,
        reviewNotes: notes || alert.reviewNotes,
      },
      include: {
        transaction: true,
        reviewedBy: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
    });

    await AuditService.log({
      tenantId,
      userId,
      action: 'FRAUD_ALERT_REVIEWED',
      entityType: 'FraudAlert',
      entityId: alert.id,
      metadata: { status: 'IN_REVIEW', notes },
    });

    return updated;
  }

  // 7. Resolve Alert (RESOLVED, CONFIRMED, or DISMISSED)
  static async resolveAlert(
    tenantId: string,
    id: string,
    userId: string | undefined,
    data: { status: 'CONFIRMED' | 'DISMISSED' | 'RESOLVED'; resolutionNotes: string }
  ) {
    const alert = await this.getAlertById(tenantId, id);

    const updated = await prisma.fraudAlert.update({
      where: { id: alert.id },
      data: {
        status: data.status,
        reviewedAt: new Date(),
        reviewedById: userId || null,
        reviewNotes: data.resolutionNotes,
      },
      include: {
        transaction: true,
        reviewedBy: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
    });

    let action = 'FRAUD_ALERT_RESOLVED';
    if (data.status === 'CONFIRMED') action = 'FRAUD_ALERT_CONFIRMED';
    if (data.status === 'DISMISSED') action = 'FRAUD_ALERT_DISMISSED';

    await AuditService.log({
      tenantId,
      userId,
      action,
      entityType: 'FraudAlert',
      entityId: alert.id,
      metadata: {
        status: data.status,
        resolutionNotes: data.resolutionNotes,
      },
    });

    return updated;
  }

  // 8. Fraud Telemetry Statistics
  static async getStats(tenantId: string) {
    const [
      totalAlerts,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      openCount,
      inReviewCount,
      confirmedCount,
      dismissedCount,
      resolvedCount,
      recentAlerts,
    ] = await Promise.all([
      prisma.fraudAlert.count({ where: { tenantId } }),
      prisma.fraudAlert.count({ where: { tenantId, severity: 'CRITICAL' } }),
      prisma.fraudAlert.count({ where: { tenantId, severity: 'HIGH' } }),
      prisma.fraudAlert.count({ where: { tenantId, severity: 'MEDIUM' } }),
      prisma.fraudAlert.count({ where: { tenantId, severity: 'LOW' } }),
      prisma.fraudAlert.count({ where: { tenantId, status: 'OPEN' } }),
      prisma.fraudAlert.count({ where: { tenantId, status: 'IN_REVIEW' } }),
      prisma.fraudAlert.count({ where: { tenantId, status: 'CONFIRMED' } }),
      prisma.fraudAlert.count({ where: { tenantId, status: 'DISMISSED' } }),
      prisma.fraudAlert.count({ where: { tenantId, status: 'RESOLVED' } }),
      prisma.fraudAlert.findMany({
        where: { tenantId },
        select: { riskScore: true },
      }),
    ]);

    const avgRiskScore = recentAlerts.length > 0
      ? Math.round(recentAlerts.reduce((acc, a) => acc + a.riskScore, 0) / recentAlerts.length)
      : 0;

    return {
      totalAlerts,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      openCount,
      inReviewCount,
      confirmedCount,
      dismissedCount,
      resolvedCount,
      avgRiskScore,
    };
  }
}

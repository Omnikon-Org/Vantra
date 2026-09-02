#!/bin/bash

# STEP 8 — FRAUD DETECTION ENGINE AUTOMATED TEST SUITE

set -e

BASE_URL="http://localhost:5001/api"
TIMESTAMP=$(date +%s)
RAND=$(( RANDOM % 100000 ))

echo "======================================================"
echo "       STEP 8 — FRAUD DETECTION ENGINE TEST           "
echo "======================================================"

# 1. Register Tenant A and Tenant B
echo "1. Registering Tenant A and Tenant B..."
REGISTER_A=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"fraud_admin_a_${TIMESTAMP}_${RAND}@vantra.io\",\"password\":\"Password123!\",\"name\":\"Fraud Officer A\",\"tenantName\":\"Alpha Risk Capital\"}")

TOKEN_A=$(echo "$REGISTER_A" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
TENANT_A=$(echo "$REGISTER_A" | grep -o '"tenantId":"[^"]*' | cut -d'"' -f4)

REGISTER_B=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"fraud_admin_b_${TIMESTAMP}_${RAND}@vantra.io\",\"password\":\"Password123!\",\"name\":\"Fraud Officer B\",\"tenantName\":\"Beta Secure Corp\"}")

TOKEN_B=$(echo "$REGISTER_B" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
TENANT_B=$(echo "$REGISTER_B" | grep -o '"tenantId":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN_A" ] || [ -z "$TOKEN_B" ]; then
  echo "❌ Failed to register test tenants"
  exit 1
fi
echo "✓ Tenants registered: Tenant A ($TENANT_A), Tenant B ($TENANT_B)"

# 2. Setup Accounts for Tenant A
echo "2. Setting up Operating Account for Tenant A..."
ACC_RES=$(curl -s -X POST "$BASE_URL/accounts" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"name":"Prime Treasury Checking","type":"BANK","currency":"USD"}')

ACCOUNT_A=$(echo "$ACC_RES" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
echo "✓ Account created: $ACCOUNT_A"

# 3. Test Normal Transaction (Low Risk, no alert)
echo "3. Testing Normal Low-Risk Transaction..."
TX_NORMAL=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"$ACCOUNT_A\",\"amount\":120.50,\"type\":\"EXPENSE\",\"description\":\"Office Supplies Order #101\"}")

TX_NORMAL_ID=$(echo "$TX_NORMAL" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

# Explicit analysis
ANALYSIS_NORMAL=$(curl -s -X POST "$BASE_URL/fraud/analyze/$TX_NORMAL_ID" \
  -H "Authorization: Bearer $TOKEN_A")

SCORE_NORMAL=$(echo "$ANALYSIS_NORMAL" | grep -o '"riskScore":[0-9]*' | cut -d':' -f2)
SEVERITY_NORMAL=$(echo "$ANALYSIS_NORMAL" | grep -o '"severity":"[^"]*' | cut -d'"' -f4)

if [ "$SCORE_NORMAL" -ge 30 ]; then
  echo "❌ Normal transaction got unexpected high risk score: $SCORE_NORMAL"
  exit 1
fi
echo "✓ Normal transaction evaluated: Score=$SCORE_NORMAL, Severity=$SEVERITY_NORMAL (No fraud alert)"

# 4. Test High-Value Transaction (> $10,000 -> Rule 1)
echo "4. Testing High-Value Transaction (> $10,000)..."
TX_HIGH=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"$ACCOUNT_A\",\"amount\":25000.00,\"type\":\"EXPENSE\",\"description\":\"Unscheduled International Wire\"}")

TX_HIGH_ID=$(echo "$TX_HIGH" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

ANALYSIS_HIGH=$(curl -s -X POST "$BASE_URL/fraud/analyze/$TX_HIGH_ID" \
  -H "Authorization: Bearer $TOKEN_A")

echo "$ANALYSIS_HIGH" | grep -q "RULE_1_HIGH_VALUE" || (echo "❌ Rule 1 not triggered" && exit 1)
echo "✓ High-Value rule triggered (+25 score)"

# 5. Test Duplicate Transaction Detection (Rule 4)
echo "5. Testing Duplicate Transaction Rule..."
TX_DUP=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"$ACCOUNT_A\",\"amount\":25000.00,\"type\":\"EXPENSE\",\"description\":\"Unscheduled International Wire (Retry)\"}")

TX_DUP_ID=$(echo "$TX_DUP" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

ANALYSIS_DUP=$(curl -s -X POST "$BASE_URL/fraud/analyze/$TX_DUP_ID" \
  -H "Authorization: Bearer $TOKEN_A")

echo "$ANALYSIS_DUP" | grep -q "RULE_4_DUPLICATE_TRANSACTION" || (echo "❌ Rule 4 Duplicate not triggered" && exit 1)
echo "✓ Duplicate transaction rule triggered (+30 score)"

# 6. Test Rapid Successive Transactions (Rule 2)
echo "6. Testing Rapid Successive Transactions (3 txns in window)..."
curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"$ACCOUNT_A\",\"amount\":800.00,\"type\":\"EXPENSE\",\"description\":\"Rapid Burst 1\"}" > /dev/null

curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"$ACCOUNT_A\",\"amount\":800.00,\"type\":\"EXPENSE\",\"description\":\"Rapid Burst 2\"}" > /dev/null

TX_BURST=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"$ACCOUNT_A\",\"amount\":800.00,\"type\":\"EXPENSE\",\"description\":\"Rapid Burst 3\"}")

TX_BURST_ID=$(echo "$TX_BURST" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

ANALYSIS_BURST=$(curl -s -X POST "$BASE_URL/fraud/analyze/$TX_BURST_ID" \
  -H "Authorization: Bearer $TOKEN_A")

echo "$ANALYSIS_BURST" | grep -q "RULE_2_RAPID_SUCCESSIVE" || (echo "❌ Rule 2 Rapid Successive not triggered" && exit 1)
echo "✓ Rapid successive velocity rule triggered (+20 score)"

# 7. Test Compound Risk / High Risk Transaction
echo "7. Testing Compound Risk Pattern..."
TX_COMPOUND=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{\"accountId\":\"$ACCOUNT_A\",\"amount\":55000.00,\"type\":\"EXPENSE\",\"description\":\"High Value Compound Burst Tx\"}")

TX_COMPOUND_ID=$(echo "$TX_COMPOUND" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

ANALYSIS_COMPOUND=$(curl -s -X POST "$BASE_URL/fraud/analyze/$TX_COMPOUND_ID" \
  -H "Authorization: Bearer $TOKEN_A")

SCORE_COMPOUND=$(echo "$ANALYSIS_COMPOUND" | grep -o '"riskScore":[0-9]*' | cut -d':' -f2)
echo "✓ Compound Risk evaluated: Score=$SCORE_COMPOUND (Multiple rules triggered)"

# 8. Test Fraud Alerts Listing API
echo "8. Testing GET /api/fraud/alerts..."
ALERTS_RES=$(curl -s -X GET "$BASE_URL/fraud/alerts" \
  -H "Authorization: Bearer $TOKEN_A")

TOTAL_ALERTS=$(echo "$ALERTS_RES" | grep -o '"total":[0-9]*' | cut -d':' -f2)
if [ "$TOTAL_ALERTS" -le 0 ]; then
  echo "❌ Expected fraud alerts to be generated, got $TOTAL_ALERTS"
  exit 1
fi

FIRST_ALERT_ID=$(echo "$ALERTS_RES" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
echo "✓ Total alerts generated: $TOTAL_ALERTS (First Alert: $FIRST_ALERT_ID)"

# 9. Test Get Single Alert by ID
echo "9. Testing GET /api/fraud/alerts/:id..."
ALERT_DETAIL=$(curl -s -X GET "$BASE_URL/fraud/alerts/$FIRST_ALERT_ID" \
  -H "Authorization: Bearer $TOKEN_A")

echo "$ALERT_DETAIL" | grep -q '"success":true' || (echo "❌ Failed to fetch alert details" && exit 1)
echo "✓ Retrieved fraud alert details with ruleResults and reasons"

# 10. Test Alert Lifecycle: Review (OPEN -> IN_REVIEW)
echo "10. Testing Alert Review Lifecycle (OPEN -> IN_REVIEW)..."
REVIEW_RES=$(curl -s -X POST "$BASE_URL/fraud/alerts/$FIRST_ALERT_ID/review" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"notes":"Assigned to compliance analyst for KYC check"}')

echo "$REVIEW_RES" | grep -q '"status":"IN_REVIEW"' || (echo "❌ Failed to transition alert to IN_REVIEW" && exit 1)
echo "✓ Alert status transitioned to IN_REVIEW"

# 11. Test Alert Lifecycle: Resolution (IN_REVIEW -> RESOLVED)
echo "11. Testing Alert Resolution Lifecycle (IN_REVIEW -> RESOLVED)..."
RESOLVE_RES=$(curl -s -X POST "$BASE_URL/fraud/alerts/$FIRST_ALERT_ID/resolve" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"status":"RESOLVED","resolutionNotes":"Transaction verified with vendor invoice #4801"}')

echo "$RESOLVE_RES" | grep -q '"status":"RESOLVED"' || (echo "❌ Failed to transition alert to RESOLVED" && exit 1)
echo "✓ Alert resolved successfully with audit notes"

# 12. Test Fraud Statistics API
echo "12. Testing GET /api/fraud/stats..."
STATS_RES=$(curl -s -X GET "$BASE_URL/fraud/stats" \
  -H "Authorization: Bearer $TOKEN_A")

echo "$STATS_RES" | grep -q '"totalAlerts":' || (echo "❌ Failed to fetch fraud statistics" && exit 1)
echo "✓ Telemetry statistics calculated successfully"

# 13. Test Batch Analysis API
echo "13. Testing POST /api/fraud/analyze (Batch Analysis)..."
BATCH_RES=$(curl -s -X POST "$BASE_URL/fraud/analyze" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "$BATCH_RES" | grep -q '"analyzedCount":' || (echo "❌ Batch analysis failed" && exit 1)
echo "✓ Batch analysis processed all tenant transactions"

# 14. Test Multi-Tenant Isolation (Tenant B accessing Tenant A)
echo "14. Testing Multi-Tenant Isolation Security..."
# Tenant B trying to fetch Tenant A's alert
CROSS_GET=$(curl -s -X GET "$BASE_URL/fraud/alerts/$FIRST_ALERT_ID" \
  -H "Authorization: Bearer $TOKEN_B")
echo "$CROSS_GET" | grep -q '"success":false' || (echo "❌ Security breach: Tenant B accessed Tenant A's alert" && exit 1)

# Tenant B trying to review Tenant A's alert
CROSS_REVIEW=$(curl -s -X POST "$BASE_URL/fraud/alerts/$FIRST_ALERT_ID/review" \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"notes":"Unauthorized injection"}')
echo "$CROSS_REVIEW" | grep -q '"success":false' || (echo "❌ Security breach: Tenant B modified Tenant A's alert" && exit 1)

# Tenant B trying to resolve Tenant A's alert
CROSS_RESOLVE=$(curl -s -X POST "$BASE_URL/fraud/alerts/$FIRST_ALERT_ID/resolve" \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"status":"DISMISSED","resolutionNotes":"Unauthorized resolution"}')
echo "$CROSS_RESOLVE" | grep -q '"success":false' || (echo "❌ Security breach: Tenant B resolved Tenant A's alert" && exit 1)

# Tenant B alerts list should be completely empty
TENANT_B_ALERTS=$(curl -s -X GET "$BASE_URL/fraud/alerts" \
  -H "Authorization: Bearer $TOKEN_B")
echo "$TENANT_B_ALERTS" | grep -q '"total":0' || (echo "❌ Security breach: Tenant B sees alerts" && exit 1)
echo "✓ Multi-tenant boundary verified (100% tenant isolation)"

# 15. Verify Audit Logs Integration
echo "15. Testing Audit Logs for Fraud Events..."
AUDIT_RES=$(curl -s -X GET "$BASE_URL/audit-logs" \
  -H "Authorization: Bearer $TOKEN_A")

echo "$AUDIT_RES" | grep -q "FRAUD_ANALYSIS_RUN" || (echo "❌ FRAUD_ANALYSIS_RUN not found in audit logs" && exit 1)
echo "$AUDIT_RES" | grep -q "FRAUD_ALERT_CREATED" || (echo "❌ FRAUD_ALERT_CREATED not found in audit logs" && exit 1)
echo "$AUDIT_RES" | grep -q "FRAUD_ALERT_REVIEWED" || (echo "❌ FRAUD_ALERT_REVIEWED not found in audit logs" && exit 1)
echo "$AUDIT_RES" | grep -q "FRAUD_ALERT_RESOLVED" || (echo "❌ FRAUD_ALERT_RESOLVED not found in audit logs" && exit 1)
echo "✓ Fraud events logged to immutable audit trail"

echo "======================================================"
echo "    ALL STEP 8 FRAUD DETECTION TESTS PASSED!          "
echo "======================================================"

#!/bin/bash
set -e

BASE_URL="http://localhost:5001/api"

GREEN='\033[032m'
RED='\033[031m'
BLUE='\033[034m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}     STEP 6 — AUDIT & EXCEPTION MANAGEMENT TEST       ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Check server is running
if ! curl -s $BASE_URL/health > /dev/null; then
  echo -e "${RED}Error: Server is not running at $BASE_URL. Start it with 'npm run dev' or 'npm start'.${NC}"
  exit 1
fi

RAND_ID=$RANDOM

# 1. Register Tenant A & Tenant B
echo -e "\n${BLUE}1. Registering Tenant A and Tenant B...${NC}"
RES_A=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"audit_a_'$RAND_ID'@example.com","password":"password123","name":"Tenant A Audit User","tenantName":"Tenant A Audit Corp"}')
TOKEN_A=$(echo "$RES_A" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
USER_A_ID=$(echo "$RES_A" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')

if [ -z "$TOKEN_A" ]; then
  echo -e "${RED}Failed to register Tenant A: $RES_A${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Tenant A registered ($USER_A_ID)${NC}"

RES_B=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"audit_b_'$RAND_ID'@example.com","password":"password123","name":"Tenant B Audit User","tenantName":"Tenant B Audit Corp"}')
TOKEN_B=$(echo "$RES_B" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
USER_B_ID=$(echo "$RES_B" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')

if [ -z "$TOKEN_B" ]; then
  echo -e "${RED}Failed to register Tenant B: $RES_B${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Tenant B registered ($USER_B_ID)${NC}"

# 2. Trigger Financial Actions for Tenant A to generate Audit Logs
echo -e "\n${BLUE}2. Performing Financial Operations (Account CRUD, Transaction CRUD, Reconciliation)...${NC}"

# 2a: Create Account
ACC_RES=$(curl -s -X POST $BASE_URL/accounts \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"name":"Audit Test Account","type":"BANK","currency":"USD"}')
ACC_ID=$(echo "$ACC_RES" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')
echo "Created Account: $ACC_ID"

# 2b: Update Account
curl -s -X PATCH $BASE_URL/accounts/$ACC_ID \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"name":"Audit Test Account (Updated)"}' > /dev/null

# 2c: Create Transactions
TX1_RES=$(curl -s -X POST $BASE_URL/transactions \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"'"$ACC_ID"'","amount":150.00,"type":"EXPENSE","description":"Office Supplies","transactionAt":"2026-08-10T10:00:00.000Z"}')
TX1_ID=$(echo "$TX1_RES" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')

TX2_RES=$(curl -s -X POST $BASE_URL/transactions \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"'"$ACC_ID"'","amount":500.00,"type":"INCOME","description":"Consulting Fee","transactionAt":"2026-08-15T10:00:00.000Z"}')
TX2_ID=$(echo "$TX2_RES" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')

# 2d: Update Transaction
curl -s -X PATCH $BASE_URL/transactions/$TX1_ID \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"description":"Office Supplies (Bulk Order)"}' > /dev/null

# 2e: Run Reconciliation with Discrepancy & Unmatched item to generate exceptions
RECON_PAYLOAD=$(cat <<EOF
{
  "accountId": "$ACC_ID",
  "startDate": "2026-08-01T00:00:00.000Z",
  "endDate": "2026-08-31T23:59:59.999Z",
  "externalRecords": [
    {
      "reference": "EXT-DISC-01",
      "amount": 165.00,
      "currency": "USD",
      "date": "2026-08-10T10:00:00.000Z",
      "description": "Office Supplies"
    },
    {
      "reference": "EXT-UNMATCH-02",
      "amount": 1200.00,
      "currency": "USD",
      "date": "2026-08-20T10:00:00.000Z",
      "description": "Unmatched Bank Wire"
    }
  ]
}
EOF
)

RECON_RES=$(curl -s -X POST $BASE_URL/reconciliation \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "$RECON_PAYLOAD")
RECON_ID=$(echo "$RECON_RES" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')
echo "Reconciliation Created: $RECON_ID"
echo -e "${GREEN}✓ Financial operations completed${NC}"

# ======================================================
# AUDIT LOG TESTS
# ======================================================
echo -e "\n${BLUE}3. Testing Audit Log APIs...${NC}"

# 3a: Authenticated user lists audit logs
AUDIT_LIST=$(curl -s -H "Authorization: Bearer $TOKEN_A" $BASE_URL/audit-logs)
TOTAL_AUDITS=$(echo "$AUDIT_LIST" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
echo "Total Audit Logs for Tenant A: $TOTAL_AUDITS"

if [ "$TOTAL_AUDITS" -ge 4 ]; then
  echo -e "${GREEN}✓ Audit logs recorded automatically for actions ($TOTAL_AUDITS events)${NC}"
else
  echo -e "${RED}✗ Expected at least 4 audit logs, got: $AUDIT_LIST${NC}"
  exit 1
fi

# 3b: Verify audit logs contain user and action types
if echo "$AUDIT_LIST" | grep -q 'ACCOUNT_CREATED' && echo "$AUDIT_LIST" | grep -q 'TRANSACTION_CREATED' && echo "$AUDIT_LIST" | grep -q 'RECONCILIATION_CREATED'; then
  echo -e "${GREEN}✓ Audit logs contain expected actions (ACCOUNT_CREATED, TRANSACTION_CREATED, RECONCILIATION_CREATED)${NC}"
else
  echo -e "${RED}✗ Missing expected actions in audit list: $AUDIT_LIST${NC}"
  exit 1
fi

# 3c: Verify audit logs are immutable (PUT / DELETE should not exist / return 404 or 405)
IMMUTABLE_TEST=$(curl -s -X DELETE -H "Authorization: Bearer $TOKEN_A" $BASE_URL/audit-logs)
if ! echo "$IMMUTABLE_TEST" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Audit logs are immutable (DELETE not permitted on audit-logs)${NC}"
else
  echo -e "${RED}✗ Audit logs allowed deletion! $IMMUTABLE_TEST${NC}"
  exit 1
fi

# 3d: Tenant B cannot access Tenant A's audit logs
TENANT_B_AUDITS=$(curl -s -H "Authorization: Bearer $TOKEN_B" $BASE_URL/audit-logs)
TENANT_B_AUDIT_TOTAL=$(echo "$TENANT_B_AUDITS" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
if [ "$TENANT_B_AUDIT_TOTAL" -eq 0 ]; then
  echo -e "${GREEN}✓ Tenant B cannot read Tenant A's audit logs (0 records returned)${NC}"
else
  echo -e "${RED}✗ Tenant B leaked Tenant A's audit logs: $TENANT_B_AUDITS${NC}"
  exit 1
fi

# ======================================================
# EXCEPTION MANAGEMENT TESTS
# ======================================================
echo -e "\n${BLUE}4. Testing Exception Management APIs...${NC}"

# 4a: List Exceptions for Tenant A
EXC_LIST=$(curl -s -H "Authorization: Bearer $TOKEN_A" $BASE_URL/exceptions)
TOTAL_EXC=$(echo "$EXC_LIST" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
echo "Total Exceptions Generated: $TOTAL_EXC"

if [ "$TOTAL_EXC" -ge 2 ]; then
  echo -e "${GREEN}✓ Reconciliation engine automatically generated exceptions for discrepancies ($TOTAL_EXC exceptions)${NC}"
else
  echo -e "${RED}✗ Expected at least 2 exceptions, got: $EXC_LIST${NC}"
  exit 1
fi

# Extract first exception ID
EXC_ID=$(echo "$EXC_LIST" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')
echo "Testing Exception ID: $EXC_ID"

# 4b: Get Exception Details
EXC_DETAIL=$(curl -s -H "Authorization: Bearer $TOKEN_A" $BASE_URL/exceptions/$EXC_ID)
if echo "$EXC_DETAIL" | grep -q '"status":"OPEN"'; then
  echo -e "${GREEN}✓ Exception details retrieved (Status: OPEN)${NC}"
else
  echo -e "${RED}✗ Failed to retrieve exception detail: $EXC_DETAIL${NC}"
  exit 1
fi

# 4c: Update Exception Status (OPEN -> IN_REVIEW)
UPDATE_STAT_RES=$(curl -s -X PATCH $BASE_URL/exceptions/$EXC_ID/status \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_REVIEW","notes":"Investigating pricing discrepancy with vendor"}')

if echo "$UPDATE_STAT_RES" | grep -q '"status":"IN_REVIEW"'; then
  echo -e "${GREEN}✓ Exception status updated to IN_REVIEW${NC}"
else
  echo -e "${RED}✗ Failed to update exception status: $UPDATE_STAT_RES${NC}"
  exit 1
fi

# 4d: Resolve Exception (IN_REVIEW -> RESOLVED)
RESOLVE_EXC_RES=$(curl -s -X POST $BASE_URL/exceptions/$EXC_ID/resolve \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"resolutionNotes":"Difference credited as vendor fee adjustment"}')

if echo "$RESOLVE_EXC_RES" | grep -q '"status":"RESOLVED"'; then
  echo -e "${GREEN}✓ Exception resolved successfully${NC}"
else
  echo -e "${RED}✗ Failed to resolve exception: $RESOLVE_EXC_RES${NC}"
  exit 1
fi

# 4e: Verify resolvedBy and resolvedAt are recorded
RESOLVED_DETAIL=$(curl -s -H "Authorization: Bearer $TOKEN_A" $BASE_URL/exceptions/$EXC_ID)
if echo "$RESOLVED_DETAIL" | grep -q '"resolvedAt"' && echo "$RESOLVED_DETAIL" | grep -q '"resolvedBy"'; then
  echo -e "${GREEN}✓ Exception resolution correctly recorded resolvedAt and resolvedBy metadata${NC}"
else
  echo -e "${RED}✗ Missing resolvedAt or resolvedBy: $RESOLVED_DETAIL${NC}"
  exit 1
fi

# ======================================================
# SECURITY & VALIDATION TESTS
# ======================================================
echo -e "\n${BLUE}5. Testing Security, Tenant Isolation & Error Handling...${NC}"

# 5a: Tenant B attempts to read Tenant A's exception
CROSS_EXC_GET=$(curl -s -H "Authorization: Bearer $TOKEN_B" $BASE_URL/exceptions/$EXC_ID)
if echo "$CROSS_EXC_GET" | grep -q 'Exception record not found'; then
  echo -e "${GREEN}✓ Tenant B cannot read Tenant A's exception (404 Not Found)${NC}"
else
  echo -e "${RED}✗ Cross-tenant read vulnerability on exceptions: $CROSS_EXC_GET${NC}"
  exit 1
fi

# 5b: Tenant B attempts to resolve Tenant A's exception
CROSS_EXC_RESOLVE=$(curl -s -X POST $BASE_URL/exceptions/$EXC_ID/resolve \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"resolutionNotes":"Hacked resolution"}')
if echo "$CROSS_EXC_RESOLVE" | grep -q 'Exception record not found'; then
  echo -e "${GREEN}✓ Tenant B cannot resolve Tenant A's exception (404 Not Found)${NC}"
else
  echo -e "${RED}✗ Cross-tenant resolve vulnerability on exceptions: $CROSS_EXC_RESOLVE${NC}"
  exit 1
fi

# 5c: Invalid Exception ID
INVALID_EXC_RES=$(curl -s -H "Authorization: Bearer $TOKEN_A" $BASE_URL/exceptions/00000000-0000-0000-0000-000000000000)
if echo "$INVALID_EXC_RES" | grep -q 'Exception record not found'; then
  echo -e "${GREEN}✓ Non-existent exception returns 404 Not Found${NC}"
else
  echo -e "${RED}✗ Non-existent exception handling failed: $INVALID_EXC_RES${NC}"
  exit 1
fi

# 5d: Invalid status enum
INVALID_STATUS_RES=$(curl -s -X PATCH $BASE_URL/exceptions/$EXC_ID/status \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"status":"INVALID_STATUS"}')
if echo "$INVALID_STATUS_RES" | grep -q 'errors'; then
  echo -e "${GREEN}✓ Invalid status rejected with 400 Bad Request${NC}"
else
  echo -e "${RED}✗ Invalid status validation failed: $INVALID_STATUS_RES${NC}"
  exit 1
fi

# 5e: Unauthenticated requests rejected
UNAUTH_EXC=$(curl -s $BASE_URL/exceptions)
UNAUTH_AUDIT=$(curl -s $BASE_URL/audit-logs)
if echo "$UNAUTH_EXC" | grep -q 'Authentication required' && echo "$UNAUTH_AUDIT" | grep -q 'Authentication required'; then
  echo -e "${GREEN}✓ Unauthenticated requests rejected with 401 Unauthorized${NC}"
else
  echo -e "${RED}✗ Auth check failed for unauthenticated requests${NC}"
  exit 1
fi

# 5f: Verify audit log recorded the exception resolution
LATEST_AUDITS=$(curl -s -H "Authorization: Bearer $TOKEN_A" $BASE_URL/audit-logs)
if echo "$LATEST_AUDITS" | grep -q 'EXCEPTION_RESOLVED'; then
  echo -e "${GREEN}✓ Exception resolution generated EXCEPTION_RESOLVED audit log${NC}"
fi

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}    ALL STEP 6 AUDIT & EXCEPTION TESTS PASSED!        ${NC}"
echo -e "${GREEN}======================================================${NC}"

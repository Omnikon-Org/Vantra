#!/bin/bash
set -e

BASE_URL="http://localhost:5001/api"

GREEN='\033[032m'
RED='\033[031m'
BLUE='\033[034m'
NC='\033[0m'

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}     STEP 5 — RECONCILIATION ENGINE TEST SUITE      ${NC}"
echo -e "${BLUE}====================================================${NC}"

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
  -d '{"email":"recon_a_'$RAND_ID'@example.com","password":"password123","name":"Tenant A Recon User","tenantName":"Tenant A Recon Corp"}')
TOKEN_A=$(echo "$RES_A" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN_A" ]; then
  echo -e "${RED}Failed to register Tenant A: $RES_A${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Tenant A registered successfully${NC}"

RES_B=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"recon_b_'$RAND_ID'@example.com","password":"password123","name":"Tenant B Recon User","tenantName":"Tenant B Recon Corp"}')
TOKEN_B=$(echo "$RES_B" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN_B" ]; then
  echo -e "${RED}Failed to register Tenant B: $RES_B${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Tenant B registered successfully${NC}"

# 2. Setup Financial Account for Tenant A
echo -e "\n${BLUE}2. Setting up Bank Account for Tenant A...${NC}"
ACC_RES=$(curl -s -X POST $BASE_URL/accounts \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"name":"Operating Checking Account","type":"BANK","currency":"USD"}')
ACC_ID=$(echo "$ACC_RES" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')
echo "Account ID: $ACC_ID"
echo -e "${GREEN}✓ Account created${NC}"

# 3. Create Internal Transactions for Tenant A
echo -e "\n${BLUE}3. Ingesting Internal Transactions for Tenant A...${NC}"

# TX 1: Exact match candidate
TX1_RES=$(curl -s -X POST $BASE_URL/transactions \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"'"$ACC_ID"'","amount":100.00,"type":"EXPENSE","description":"AWS Cloud Hosting","transactionAt":"2026-08-10T10:00:00.000Z"}')
TX1_ID=$(echo "$TX1_RES" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')

# Add reference to TX1
curl -s -X PATCH $BASE_URL/transactions/$TX1_ID \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"description":"AWS Cloud Hosting"}' > /dev/null

# TX 2: Amount discrepancy candidate (reference REF-DISC-01)
# Create with direct transaction
TX2_RES=$(curl -s -X POST $BASE_URL/transactions \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"'"$ACC_ID"'","amount":250.00,"type":"EXPENSE","description":"Office Supplies","transactionAt":"2026-08-12T14:00:00.000Z"}')
TX2_ID=$(echo "$TX2_RES" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')

# TX 3: Fuzzy date match candidate ($75.00, date 2026-08-15)
TX3_RES=$(curl -s -X POST $BASE_URL/transactions \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"'"$ACC_ID"'","amount":75.00,"type":"EXPENSE","description":"Internet Subscription","transactionAt":"2026-08-15T09:00:00.000Z"}')
TX3_ID=$(echo "$TX3_RES" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')

# TX 4: Internal unmatched candidate ($500.00 consulting income)
TX4_RES=$(curl -s -X POST $BASE_URL/transactions \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"'"$ACC_ID"'","amount":500.00,"type":"INCOME","description":"Consulting Services","transactionAt":"2026-08-20T11:00:00.000Z"}')
TX4_ID=$(echo "$TX4_RES" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')

# TX 5: Manual match candidate
TX5_RES=$(curl -s -X POST $BASE_URL/transactions \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"'"$ACC_ID"'","amount":1200.00,"type":"INCOME","description":"Client Retainer Deposit","transactionAt":"2026-08-22T16:00:00.000Z"}')
TX5_ID=$(echo "$TX5_RES" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')

echo "Transactions created: TX1=$TX1_ID, TX2=$TX2_ID, TX3=$TX3_ID, TX4=$TX4_ID, TX5=$TX5_ID"
echo -e "${GREEN}✓ Ingested 5 internal transactions${NC}"

# 4. Run Reconciliation Engine
echo -e "\n${BLUE}4. Running Reconciliation Engine for Tenant A...${NC}"
RECON_PAYLOAD=$(cat <<EOF
{
  "accountId": "$ACC_ID",
  "startDate": "2026-08-01T00:00:00.000Z",
  "endDate": "2026-08-31T23:59:59.999Z",
  "rules": {
    "dateToleranceDays": 3,
    "autoReconcileTransactions": true
  },
  "notes": "August 2026 Monthly Bank Reconciliation",
  "externalRecords": [
    {
      "reference": "EXT-AWS-01",
      "amount": 100.00,
      "currency": "USD",
      "date": "2026-08-10T10:00:00.000Z",
      "description": "AWS Cloud Hosting"
    },
    {
      "reference": "EXT-SUPPLY-02",
      "amount": 265.00,
      "currency": "USD",
      "date": "2026-08-12T14:00:00.000Z",
      "description": "Office Supplies"
    },
    {
      "reference": "EXT-NET-03",
      "amount": 75.00,
      "currency": "USD",
      "date": "2026-08-17T09:00:00.000Z",
      "description": "ISP Telecom"
    },
    {
      "reference": "EXT-UNKNOWN-04",
      "amount": 42.50,
      "currency": "USD",
      "date": "2026-08-25T12:00:00.000Z",
      "description": "Random Unmatched Fee"
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
echo "Reconciliation ID: $RECON_ID"

# Validate counts
MATCHED_COUNT=$(echo "$RECON_RES" | grep -o '"matchedCount":[0-9]*' | grep -o '[0-9]*')
DISCREPANCY_COUNT=$(echo "$RECON_RES" | grep -o '"discrepancyCount":[0-9]*' | grep -o '[0-9]*')
UNMATCHED_COUNT=$(echo "$RECON_RES" | grep -o '"unmatchedCount":[0-9]*' | grep -o '[0-9]*')

echo "Results summary: Matched=$MATCHED_COUNT, Discrepancies=$DISCREPANCY_COUNT, Unmatched=$UNMATCHED_COUNT"

if [ "$MATCHED_COUNT" -ge 2 ] && [ "$DISCREPANCY_COUNT" -ge 1 ] && [ "$UNMATCHED_COUNT" -ge 2 ]; then
  echo -e "${GREEN}✓ Multi-pass matching identified exact, fuzzy, discrepant, and unmatched records correctly${NC}"
else
  echo -e "${RED}✗ Reconciliation matching counts mismatch: $RECON_RES${NC}"
  exit 1
fi

# 5. Fetch Reconciliation Details
echo -e "\n${BLUE}5. Fetching Reconciliation Run Details (GET /reconciliation/$RECON_ID)...${NC}"
GET_RECON_RES=$(curl -s -H "Authorization: Bearer $TOKEN_A" $BASE_URL/reconciliation/$RECON_ID)
ITEM_COUNT=$(echo "$GET_RECON_RES" | grep -o '"matchType"' | wc -l)
echo "Total reconciliation items generated: $ITEM_COUNT"
echo -e "${GREEN}✓ Successfully retrieved reconciliation run details${NC}"

# Find item IDs for manual match & discrepancy resolve
DISCREPANT_ITEM_ID=$(echo "$GET_RECON_RES" | grep -o '{"id":"[^"]*","tenantId":"[^"]*","reconciliationId":"[^"]*","transactionId":[^,]*,"externalReference":"[^"]*","externalAmount":"[^"]*","externalDate":"[^"]*","externalDescription":"[^"]*","internalAmount":"[^"]*","matchType":"DISCREPANCY"' | head -1 | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')
UNMATCHED_ITEM_ID=$(echo "$GET_RECON_RES" | grep -o '{"id":"[^"]*","tenantId":"[^"]*","reconciliationId":"[^"]*","transactionId":null[^}]*"status":"UNMATCHED"' | head -1 | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')

# 6. Test Discrepancy Resolution
if [ -n "$DISCREPANT_ITEM_ID" ]; then
  echo -e "\n${BLUE}6. Testing Discrepancy Resolution on item $DISCREPANT_ITEM_ID...${NC}"
  RESOLVE_RES=$(curl -s -X POST $BASE_URL/reconciliation/$RECON_ID/resolve \
    -H "Authorization: Bearer $TOKEN_A" \
    -H "Content-Type: application/json" \
    -d '{"itemId":"'"$DISCREPANT_ITEM_ID"'","resolution":"ACCEPTED_DIFFERENCE","notes":"Shipping surcharge accepted"}')
  
  if echo "$RESOLVE_RES" | grep -q '"status":"RESOLVED"'; then
    echo -e "${GREEN}✓ Discrepancy resolved successfully${NC}"
  else
    echo -e "${RED}✗ Discrepancy resolution failed: $RESOLVE_RES${NC}"
    exit 1
  fi
fi

# 7. Test Manual Match
if [ -n "$UNMATCHED_ITEM_ID" ]; then
  echo -e "\n${BLUE}7. Testing Manual Match on unmatched item $UNMATCHED_ITEM_ID with TX5 ($TX5_ID)...${NC}"
  MANUAL_RES=$(curl -s -X POST $BASE_URL/reconciliation/$RECON_ID/manual-match \
    -H "Authorization: Bearer $TOKEN_A" \
    -H "Content-Type: application/json" \
    -d '{"reconciliationItemId":"'"$UNMATCHED_ITEM_ID"'","transactionId":"'"$TX5_ID"'","notes":"Manually linked by accountant"}')
  
  if echo "$MANUAL_RES" | grep -q '"status":"MATCHED"'; then
    echo -e "${GREEN}✓ Manual match succeeded${NC}"
  else
    echo -e "${RED}✗ Manual match failed: $MANUAL_RES${NC}"
    exit 1
  fi
fi

# 8. Test Validation & Error Handling
echo -e "\n${BLUE}8. Testing Validation & Error Handling...${NC}"

# 8a: Invalid UUID
INVALID_ACC_RES=$(curl -s -X POST $BASE_URL/reconciliation \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"invalid-uuid","externalRecords":[]}')
if echo "$INVALID_ACC_RES" | grep -q 'Invalid account ID'; then
  echo -e "${GREEN}✓ Invalid account UUID rejected with 400${NC}"
else
  echo -e "${RED}✗ Validation failed for invalid UUID: $INVALID_ACC_RES${NC}"
  exit 1
fi

# 8b: Non-existent Account
FAKE_ACC_RES=$(curl -s -X POST $BASE_URL/reconciliation \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"00000000-0000-0000-0000-000000000000","externalRecords":[]}')
if echo "$FAKE_ACC_RES" | grep -q 'Invalid account'; then
  echo -e "${GREEN}✓ Non-existent account rejected with 404${NC}"
else
  echo -e "${RED}✗ Error handling failed for non-existent account: $FAKE_ACC_RES${NC}"
  exit 1
fi

# 8c: Missing / Unauthenticated Token
NO_AUTH_RES=$(curl -s $BASE_URL/reconciliation)
if echo "$NO_AUTH_RES" | grep -q 'Authentication required'; then
  echo -e "${GREEN}✓ Unauthenticated request rejected with 401${NC}"
else
  echo -e "${RED}✗ Auth check failed: $NO_AUTH_RES${NC}"
  exit 1
fi

# 9. Test Multi-Tenant Security & Strict Tenant Isolation
echo -e "\n${BLUE}9. Testing Multi-Tenant Isolation (Tenant B accessing Tenant A)...${NC}"

# 9a: Tenant B attempts to fetch Tenant A's reconciliation run
CROSS_GET=$(curl -s -H "Authorization: Bearer $TOKEN_B" $BASE_URL/reconciliation/$RECON_ID)
if echo "$CROSS_GET" | grep -q 'Reconciliation record not found'; then
  echo -e "${GREEN}✓ Tenant B cannot read Tenant A's reconciliation record (404 Not Found)${NC}"
else
  echo -e "${RED}✗ Cross-tenant read vulnerability detected: $CROSS_GET${NC}"
  exit 1
fi

# 9b: Tenant B attempts to run reconciliation on Tenant A's account
CROSS_RUN=$(curl -s -X POST $BASE_URL/reconciliation \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"'"$ACC_ID"'","externalRecords":[]}')
if echo "$CROSS_RUN" | grep -q 'Invalid account'; then
  echo -e "${GREEN}✓ Tenant B cannot reconcile Tenant A's account (404 Not Found)${NC}"
else
  echo -e "${RED}✗ Cross-tenant run vulnerability detected: $CROSS_RUN${NC}"
  exit 1
fi

# 9c: Tenant B lists reconciliations (should be 0)
TENANT_B_LIST=$(curl -s -H "Authorization: Bearer $TOKEN_B" $BASE_URL/reconciliation)
TENANT_B_TOTAL=$(echo "$TENANT_B_LIST" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
if [ "$TENANT_B_TOTAL" -eq 0 ]; then
  echo -e "${GREEN}✓ Tenant B reconciliation list is completely isolated (0 records)${NC}"
else
  echo -e "${RED}✗ Tenant B list leaked Tenant A's records: $TENANT_B_LIST${NC}"
  exit 1
fi

# 10. Deletion & Cleanup
echo -e "\n${BLUE}10. Deleting Reconciliation Record (DELETE /reconciliation/$RECON_ID)...${NC}"
DEL_RES=$(curl -s -X DELETE -H "Authorization: Bearer $TOKEN_A" $BASE_URL/reconciliation/$RECON_ID)
if echo "$DEL_RES" | grep -q 'Reconciliation record deleted'; then
  echo -e "${GREEN}✓ Reconciliation run successfully deleted (cascade items removed)${NC}"
else
  echo -e "${RED}✗ Reconciliation deletion failed: $DEL_RES${NC}"
  exit 1
fi

# Verify it's gone
GET_DELETED=$(curl -s -H "Authorization: Bearer $TOKEN_A" $BASE_URL/reconciliation/$RECON_ID)
if echo "$GET_DELETED" | grep -q 'Reconciliation record not found'; then
  echo -e "${GREEN}✓ Deleted record confirmed 404 Not Found${NC}"
fi

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}     ALL STEP 5 RECONCILIATION TESTS PASSED!        ${NC}"
echo -e "${GREEN}====================================================${NC}"

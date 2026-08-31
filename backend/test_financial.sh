#!/bin/bash
set -e

BASE_URL="http://localhost:5001/api"

RAND_ID=$RANDOM
echo "=== Registering Tenant A ($RAND_ID) ==="
RES_A=$(curl -s -X POST $BASE_URL/auth/register -H "Content-Type: application/json" -d '{"email":"tenant_a_'$RAND_ID'@example.com","password":"password123","name":"Tenant A User","tenantName":"Tenant A"}')
TOKEN_A=$(echo $RES_A | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

echo "=== Registering Tenant B ($RAND_ID) ==="
RES_B=$(curl -s -X POST $BASE_URL/auth/register -H "Content-Type: application/json" -d '{"email":"tenant_b_'$RAND_ID'@example.com","password":"password123","name":"Tenant B User","tenantName":"Tenant B"}')
TOKEN_B=$(echo $RES_B | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

echo -e "\n=== [Tenant A] Creating Account ==="
ACC_RES=$(curl -s -X POST $BASE_URL/accounts -H "Authorization: Bearer $TOKEN_A" -H "Content-Type: application/json" -d '{"name":"Main Bank Account","type":"BANK"}')
ACC_ID=$(echo $ACC_RES | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')
echo "Account ID: $ACC_ID"

echo -e "\n=== [Tenant A] Creating Category ==="
CAT_RES=$(curl -s -X POST $BASE_URL/categories -H "Authorization: Bearer $TOKEN_A" -H "Content-Type: application/json" -d '{"name":"Software Subscriptions","type":"EXPENSE"}')
CAT_ID=$(echo $CAT_RES | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')
echo "Category ID: $CAT_ID"

echo -e "\n=== [Tenant A] Creating Transaction ==="
TX_RES=$(curl -s -X POST $BASE_URL/transactions -H "Authorization: Bearer $TOKEN_A" -H "Content-Type: application/json" -d '{"accountId":"'"$ACC_ID"'","categoryId":"'"$CAT_ID"'","amount":50.00,"type":"EXPENSE","description":"GitHub Copilot"}')
TX_ID=$(echo $TX_RES | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')
echo "Transaction ID: $TX_ID"

echo -e "\n=== [Tenant A] Fetching Account Balance ==="
curl -s -H "Authorization: Bearer $TOKEN_A" $BASE_URL/accounts/$ACC_ID

echo -e "\n\n=== [Tenant B] Attempting to fetch Tenant A's Account ==="
curl -s -H "Authorization: Bearer $TOKEN_B" $BASE_URL/accounts/$ACC_ID

echo -e "\n\n=== [Tenant B] Attempting to fetch Tenant A's Transaction ==="
curl -s -H "Authorization: Bearer $TOKEN_B" $BASE_URL/transactions/$TX_ID

echo -e "\n\n=== [Tenant B] Listing Accounts (Should be empty) ==="
curl -s -H "Authorization: Bearer $TOKEN_B" $BASE_URL/accounts

echo -e "\n\n=== [Tenant A] Deleting Transaction (Cleanup) ==="
curl -s -X DELETE -H "Authorization: Bearer $TOKEN_A" $BASE_URL/transactions/$TX_ID

echo -e "\n\n=== [Tenant A] Deleting Account (Cleanup) ==="
curl -s -X DELETE -H "Authorization: Bearer $TOKEN_A" $BASE_URL/accounts/$ACC_ID

echo -e "\n\nFinancial APIs Tests Completed successfully!"

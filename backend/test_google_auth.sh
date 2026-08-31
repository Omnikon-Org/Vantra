#!/bin/bash
set -e

BASE_URL="http://localhost:5001/api"

GREEN='\033[032m'
RED='\033[031m'
BLUE='\033[034m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}        GOOGLE OAUTH 2.0 INTEGRATION TEST SUITE       ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Check server is running
if ! curl -s $BASE_URL/health > /dev/null; then
  echo -e "${RED}Error: Server is not running at $BASE_URL. Start it with 'npm run dev' or 'npm start'.${NC}"
  exit 1
fi

RAND_ID=$RANDOM

# 1. Test Google OAuth Initiation Route
echo -e "\n${BLUE}1. Testing Google OAuth redirect initiation (GET /api/auth/google)...${NC}"
REDIRECT_RES=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/auth/google)
if [ "$REDIRECT_RES" == "302" ] || [ "$REDIRECT_RES" == "200" ]; then
  echo -e "${GREEN}✓ Google OAuth route exists and initiates redirect (HTTP $REDIRECT_RES)${NC}"
else
  echo -e "${RED}✗ Unexpected response from /api/auth/google: HTTP $REDIRECT_RES${NC}"
  exit 1
fi

# 2. Test New Google User Onboarding (Automatic Tenant Provisioning)
echo -e "\n${BLUE}2. Testing New Google User Onboarding (Auto Tenant Provisioning)...${NC}"
NEW_GOOGLE_RES=$(curl -s -X POST $BASE_URL/auth/google/mock \
  -H "Content-Type: application/json" \
  -d '{
    "sub": "google_sub_'$RAND_ID'",
    "email": "new_google_'$RAND_ID'@apexcapital.com",
    "name": "Sarah Chen"
  }')

TOKEN_GOOGLE=$(node -e 'const res = JSON.parse(process.argv[1]); console.log(res.token || "");' "$NEW_GOOGLE_RES")
TENANT_GOOGLE_ID=$(node -e 'const res = JSON.parse(process.argv[1]); console.log(res.user?.tenantId || "");' "$NEW_GOOGLE_RES")
USER_GOOGLE_ID=$(node -e 'const res = JSON.parse(process.argv[1]); console.log(res.user?.id || "");' "$NEW_GOOGLE_RES")

if [ -n "$TOKEN_GOOGLE" ] && [ -n "$TENANT_GOOGLE_ID" ]; then
  echo -e "${GREEN}✓ New Google user created atomically with new Tenant ($TENANT_GOOGLE_ID)${NC}"
else
  echo -e "${RED}✗ Failed to onboard new Google user: $NEW_GOOGLE_RES${NC}"
  exit 1
fi

# 3. Test Protected /api/auth/me with Google JWT
echo -e "\n${BLUE}3. Testing GET /api/auth/me with Google JWT...${NC}"
ME_RES=$(curl -s -H "Authorization: Bearer $TOKEN_GOOGLE" $BASE_URL/auth/me)
if echo "$ME_RES" | grep -q 'new_google_'$RAND_ID'@apexcapital.com'; then
  echo -e "${GREEN}✓ Google JWT verified and returned authenticated user profile & tenant${NC}"
else
  echo -e "${RED}✗ Failed to authenticate with Google JWT: $ME_RES${NC}"
  exit 1
fi

# 4. Test Existing User Account Linking (Password User links Google ID)
echo -e "\n${BLUE}4. Testing Existing Password User Account Linking...${NC}"
PWD_USER_EMAIL="existing_user_${RAND_ID}@vantra.io"
PWD_RES=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$PWD_USER_EMAIL"'",
    "password": "password123",
    "name": "David Miller",
    "tenantName": "Miller Global Capital"
  }')

PWD_USER_ID=$(node -e 'const res = JSON.parse(process.argv[1]); console.log(res.user?.id || "");' "$PWD_RES")
PWD_TENANT_ID=$(node -e 'const res = JSON.parse(process.argv[1]); console.log(res.user?.tenantId || "");' "$PWD_RES")

# Google sign in with the same email
LINK_RES=$(curl -s -X POST $BASE_URL/auth/google/mock \
  -H "Content-Type: application/json" \
  -d '{
    "sub": "google_sub_linked_'$RAND_ID'",
    "email": "'"$PWD_USER_EMAIL"'",
    "name": "David Miller"
  }')

LINK_USER_ID=$(node -e 'const res = JSON.parse(process.argv[1]); console.log(res.user?.id || "");' "$LINK_RES")
LINK_TENANT_ID=$(node -e 'const res = JSON.parse(process.argv[1]); console.log(res.user?.tenantId || "");' "$LINK_RES")

if [ "$PWD_USER_ID" == "$LINK_USER_ID" ] && [ "$PWD_TENANT_ID" == "$LINK_TENANT_ID" ]; then
  echo -e "${GREEN}✓ Google identity successfully linked to existing account without duplicating user ($PWD_USER_ID)${NC}"
else
  echo -e "${RED}✗ Account linking failed. Expected user $PWD_USER_ID, got $LINK_USER_ID${NC}"
  exit 1
fi

# Verify password login still works after linking
PWD_LOGIN_RES=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$PWD_USER_EMAIL"'",
    "password": "password123"
  }')

if echo "$PWD_LOGIN_RES" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Password login continues to work for linked account${NC}"
else
  echo -e "${RED}✗ Password login broke after linking Google account: $PWD_LOGIN_RES${NC}"
  exit 1
fi

# 5. Test Multi-Tenant Isolation for Google Users
echo -e "\n${BLUE}5. Testing Multi-Tenant Isolation with Google JWT...${NC}"
ACC_RES=$(curl -s -X POST $BASE_URL/accounts \
  -H "Authorization: Bearer $TOKEN_GOOGLE" \
  -H "Content-Type: application/json" \
  -d '{"name":"Google Tenant Checking","type":"BANK","currency":"USD"}')
ACC_ID=$(node -e 'const res = JSON.parse(process.argv[1]); console.log(res.account?.id || "");' "$ACC_RES")

PWD_TOKEN=$(node -e 'const res = JSON.parse(process.argv[1]); console.log(res.token || "");' "$PWD_LOGIN_RES")
CROSS_RES=$(curl -s -H "Authorization: Bearer $PWD_TOKEN" $BASE_URL/accounts/$ACC_ID)
if echo "$CROSS_RES" | grep -q 'Account not found'; then
  echo -e "${GREEN}✓ Multi-tenant boundary intact: Cross-tenant access rejected with 404${NC}"
else
  echo -e "${RED}✗ Cross-tenant leak detected: $CROSS_RES${NC}"
  exit 1
fi

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}    ALL GOOGLE OAUTH INTEGRATION TESTS PASSED!        ${NC}"
echo -e "${GREEN}======================================================${NC}"

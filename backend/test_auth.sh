#!/bin/bash
echo "Testing /api/health"
curl -s http://localhost:5001/api/health
echo -e "\n\Testing /api/health/db"
curl -s http://localhost:5001/api/health/db
echo -e "\n\nTesting Register"
REGISTER_RES=$(curl -s -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","tenantName":"Test Org"}')
echo $REGISTER_RES

echo -e "\n\nTesting Login"
LOGIN_RES=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')
echo $LOGIN_RES

TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

echo -e "\n\nTesting Me with valid token"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5001/api/auth/me

echo -e "\n\nTesting Me without token"
curl -s http://localhost:5001/api/auth/me

echo -e "\n\nTesting Me with invalid token"
curl -s -H "Authorization: Bearer invalid_token" http://localhost:5001/api/auth/me

#!/bin/bash

# Script de test pour l'inscription avec le champ country

echo "========================================="
echo "Test 1: Inscription avec country"
echo "========================================="

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Country",
    "email": "test.country@example.com",
    "password": "Test1234!",
    "country": "Haiti"
  }'

echo -e "\n\n========================================="
echo "Test 2: Inscription sans country (devrait échouer pour USER)"
echo "========================================="

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "NoCountry",
    "email": "test.nocountry@example.com",
    "password": "Test1234!"
  }'

echo -e "\n\n========================================="
echo "Test 3: Inscription ADMIN sans country (devrait réussir)"
echo "========================================="

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "Test",
    "email": "admin.test@example.com",
    "password": "Test1234!",
    "role": "ADMIN"
  }'

echo -e "\n\n========================================="
echo "Test 4: Inscription avec country invalide"
echo "========================================="

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Invalid",
    "email": "test.invalid@example.com",
    "password": "Test1234!",
    "country": "H"
  }'

echo -e "\n"

#!/bin/bash
COOKIE_FILE="cookie.txt"
curl -s -c $COOKIE_FILE -X POST http://localhost:8000/login -H "Content-Type: application/json" -d '{"email": "test@test.com", "password": "password"}' > /dev/null
curl -s -b $COOKIE_FILE http://localhost:8000/me

#!/usr/bin/env python3
import requests
import json

print("🔐 TESTING LOGIN ENDPOINT")
print("=" * 40)

# Test login with existing user
login_data = {
    "email": "divya@gmail.com", 
    "password": "123456"
}

try:
    response = requests.post(
        "http://localhost:5000/api/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Login successful!")
    else:
        print("❌ Login failed")
        
except Exception as e:
    print(f"❌ Error: {e}")

print("\n🔍 Testing if user exists...")
try:
    response = requests.post(
        "http://localhost:5000/api/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com", 
            "password": "123456",
            "university": "Test University",
            "graduationYear": 2023
        },
        headers={"Content-Type": "application/json"}
    )
    print(f"Register Status: {response.status_code}")
    print(f"Register Response: {response.text}")
except Exception as e:
    print(f"Register Error: {e}")

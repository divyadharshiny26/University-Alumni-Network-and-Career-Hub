#!/usr/bin/env python3
import requests
import json

print("🔐 TESTING WITH CORRECT CREDENTIALS")
print("=" * 40)

# Test with the user that exists
login_data = {
    "email": "test@example.com", 
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
        result = response.json()
        print("✅ Login successful!")
        print(f"Token: {result['token'][:50]}...")
        print(f"User: {result['user']['name']}")
    else:
        print("❌ Login failed")
        
except Exception as e:
    print(f"❌ Error: {e}")

print("\n🎯 SOLUTION:")
print("The user 'divya@gmail.com' either doesn't exist or has wrong password.")
print("Use existing credentials or register a new account.")

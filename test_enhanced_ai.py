#!/usr/bin/env python3
import requests
import json

print("🤖 TESTING ENHANCED AI RESPONSES")
print("=" * 50)

# Test different scenarios
test_cases = [
    {
        "name": "AI&DS 2nd Year Skills",
        "message": "hi I am in 2nd year AI&DS department, what skills to learn for future growth?"
    },
    {
        "name": "Follow-up Skills Question", 
        "message": "extra skills to be learned?"
    },
    {
        "name": "Career Guidance",
        "message": "what career options after AI&DS?"
    },
    {
        "name": "Interview Preparation",
        "message": "how to prepare for placements?"
    },
    {
        "name": "Salary Information",
        "message": "what about salary packages?"
    }
]

for i, test in enumerate(test_cases):
    print(f"\n📝 Test {i+1}: {test['name']}")
    print("-" * 30)
    
    try:
        response = requests.post(
            "http://localhost:5000/api/career/chat",
            json={"message": test['message']},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Response: {result['response']}")
        else:
            print(f"❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

print("\n" + "=" * 50)
print("🎉 Enhanced AI Testing Complete!")

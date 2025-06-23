#!/usr/bin/env python3
"""
Authentication Test Script for Healthcare Center App
--------------------------------------------------
This script tests the JWT authentication flow by:
1. Attempting to log in with provided credentials
2. Using the received JWT token to access protected endpoints
3. Testing role-based access control restrictions
"""

import requests
import json
from pprint import pprint
import argparse
import sys

base_url = "http://localhost:8000"  # FastAPI server address

def check_server_running():
    """Check if the FastAPI server is running"""
    try:
        response = requests.get(f"{base_url}/docs", timeout=2)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

def test_authentication(email, password):
    """Test the authentication flow"""
    print("=== Healthcare Center API Authentication Test ===\n")
    
    # Check if server is running
    if not check_server_running():
        print("ERROR: FastAPI server is not running!")
        print("Please start the server with: python run.py")
        print("Then run this script again.")
        return None
    
    # Step 1: Authenticate and get token
    print("1. Authenticating user...")
    try:
        auth_response = requests.post(
            f"{base_url}/token",
            data={"username": email, "password": password},
        )
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to server: {e}")
        return None
    
    if auth_response.status_code != 200:
        print(f"Authentication failed: {auth_response.status_code}")
        print(auth_response.text)
        return None
    
    token_data = auth_response.json()
    token = token_data["access_token"]
    user_info = token_data["user"]
    
    print(f"Authentication successful!")
    print(f"User: {user_info['full_name']} ({user_info['email']})")
    print(f"Role: {user_info['role']}")
    print(f"Token: {token[:20]}...[truncated]")
    
    # Step 2: Test the /me endpoint
    print("\n2. Testing /me endpoint...")
    me_response = requests.get(
        f"{base_url}/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if me_response.status_code == 200:
        print("Successfully retrieved user profile!")
    else:
        print(f"Error accessing /me: {me_response.status_code}")
        print(me_response.text)
    
    # Step 3: Test role-based routes
    print("\n3. Testing role-based access control...")
    
    # Admin route
    admin_response = requests.get(
        f"{base_url}/protected/admin-only",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Admin route: {'Accessible' if admin_response.status_code == 200 else 'Forbidden'}")
    
    # Doctor route
    doctor_response = requests.get(
        f"{base_url}/protected/doctor-only",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Doctor route: {'Accessible' if doctor_response.status_code == 200 else 'Forbidden'}")
    
    # Staff route (all roles)
    staff_response = requests.get(
        f"{base_url}/protected/staff-access",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Staff route: {'Accessible' if staff_response.status_code == 200 else 'Forbidden'}")
    
    return token

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test authentication flow for Healthcare Center API")
    parser.add_argument("--email", default="admin@example.com", help="Email address (default: admin@example.com)")
    parser.add_argument("--password", default="admin123", help="Password (default: admin123)")
    
    args = parser.parse_args()
    
    print(f"Testing with credentials: {args.email} / {args.password}")
    
    # Run the tests
    token = test_authentication(args.email, args.password)
    if not token:
        sys.exit(1)

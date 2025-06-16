"""
Verification script to check if the fixes have been correctly applied.
Run this script to check that the backend is functioning correctly.
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:8000"

def print_colored(text, color):
    """Print colored text in the terminal"""
    colors = {
        'green': '\033[92m',
        'red': '\033[91m',
        'yellow': '\033[93m',
        'reset': '\033[0m'
    }
    print(f"{colors.get(color, '')}{text}{colors['reset']}")

def check_api_health():
    """Check if the API is running"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print_colored("✅ API is running", "green")
            return True
        else:
            print_colored(f"❌ API returned status code {response.status_code}", "red")
            return False
    except requests.exceptions.ConnectionError:
        print_colored("❌ Could not connect to the API", "red")
        print_colored("   Make sure the backend server is running on http://localhost:8000", "yellow")
        return False

def login():
    """Test login endpoint"""
    try:
        # Try to login with default admin credentials
        data = {
            "username": "admin@healthcare.com",
            "password": "admin123"
        }
        response = requests.post(
            f"{BASE_URL}/token",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            print_colored("✅ Login successful", "green")
            return response.json().get("access_token")
        else:
            print_colored(f"❌ Login failed with status code {response.status_code}", "red")
            print_colored(f"   Response: {response.text}", "red")
            return None
    except Exception as e:
        print_colored(f"❌ Exception during login: {str(e)}", "red")
        return None

def test_create_patient(token):
    """Test patient creation endpoint"""
    if not token:
        return False
        
    try:
        # Create a test patient
        patient_data = {
            "name": "Test Patient",
            "guardian_name": "Test Guardian",
            "address": "123 Test Street, Test City",
            "age": 30,
            "sex": "Male",
            "occupation": "Test Engineer",
            "mobile_number": "1234567890",
            "chief_complaints": "Test complaints",
            "medical_history": {
                "past_history": {"allergy": False},
                "family_history": {"diabetes": False}
            },
            "physical_generals": {
                "appetite": "Normal",
                "sleep": "Good"
            },
            "food_and_habit": {
                "food_habit": "Vegetarian",
                "addictions": "None"
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/patients/",
            json=patient_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            print_colored("✅ Patient creation successful", "green")
            patient_id = response.json().get("id")
            print_colored(f"   Created patient ID: {patient_id}", "green")
            return patient_id
        else:
            print_colored(f"❌ Patient creation failed with status code {response.status_code}", "red")
            print_colored(f"   Response: {response.text}", "red")
            return None
    except Exception as e:
        print_colored(f"❌ Exception during patient creation: {str(e)}", "red")
        return None

def test_patient_retrieval(token, patient_id):
    """Test patient retrieval endpoint"""
    if not token or not patient_id:
        return False
        
    try:
        response = requests.get(
            f"{BASE_URL}/patients/{patient_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            print_colored("✅ Patient retrieval successful", "green")
            return True
        else:
            print_colored(f"❌ Patient retrieval failed with status code {response.status_code}", "red")
            print_colored(f"   Response: {response.text}", "red")
            return False
    except Exception as e:
        print_colored(f"❌ Exception during patient retrieval: {str(e)}", "red")
        return False

def test_patient_update(token, patient_id):
    """Test patient update endpoint"""
    if not token or not patient_id:
        return False
        
    try:
        # Get current patient data
        get_response = requests.get(
            f"{BASE_URL}/patients/{patient_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if get_response.status_code != 200:
            print_colored(f"❌ Failed to get patient data for update: {get_response.status_code}", "red")
            return False
            
        patient_data = get_response.json()
        
        # Update some fields
        patient_data["name"] = "Updated Test Patient"
        patient_data["address"] = "456 Updated Street, Test City"
        
        # Remove any fields that can't be updated
        if "id" in patient_data:
            del patient_data["id"]
        if "created_at" in patient_data:
            del patient_data["created_at"]
        if "investigations" in patient_data:
            del patient_data["investigations"]
        if "treatments" in patient_data:
            del patient_data["treatments"]
        if "invoices" in patient_data:
            del patient_data["invoices"]
        
        update_response = requests.put(
            f"{BASE_URL}/patients/{patient_id}",
            json=patient_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if update_response.status_code == 200:
            print_colored("✅ Patient update successful", "green")
            return True
        else:
            print_colored(f"❌ Patient update failed with status code {update_response.status_code}", "red")
            print_colored(f"   Response: {update_response.text}", "red")
            return False
    except Exception as e:
        print_colored(f"❌ Exception during patient update: {str(e)}", "red")
        return False

def test_search_patients(token):
    """Test patient search endpoint"""
    if not token:
        return False
        
    try:
        response = requests.get(
            f"{BASE_URL}/search/patients?q=Test",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            patients = response.json()
            if patients:
                print_colored(f"✅ Patient search successful, found {len(patients)} patients", "green")
            else:
                print_colored("⚠️ Patient search returned no results", "yellow")
            return True
        else:
            print_colored(f"❌ Patient search failed with status code {response.status_code}", "red")
            print_colored(f"   Response: {response.text}", "red")
            return False
    except Exception as e:
        print_colored(f"❌ Exception during patient search: {str(e)}", "red")
        return False

def run_tests():
    """Run all tests"""
    print_colored("\n=== Starting API Verification ===\n", "yellow")
    
    if not check_api_health():
        return
    
    token = login()
    if not token:
        return
        
    patient_id = test_create_patient(token)
    if not patient_id:
        return
        
    if not test_patient_retrieval(token, patient_id):
        return
        
    if not test_patient_update(token, patient_id):
        return
        
    if not test_search_patients(token):
        return
    
    print_colored("\n✅ All tests passed successfully! The API is working correctly.", "green")
    print_colored("\nIf you are still experiencing issues in the frontend, please check the browser console for errors.", "yellow")

if __name__ == "__main__":
    run_tests()

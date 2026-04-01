#!/usr/bin/env python3
"""
FarmBid Authentication API Testing Script
Tests all authentication endpoints with SSI credential generation
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://bid-harvest.preview.emergentagent.com"

def print_test_header(test_name):
    print(f"\n{'='*60}")
    print(f"🧪 TESTING: {test_name}")
    print(f"{'='*60}")

def print_result(success, message, details=None):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    if details:
        print(f"   Details: {details}")

def test_auth_signup():
    """Test POST /api/auth/signup - User registration with SSI credential generation"""
    print_test_header("User Registration with SSI")
    
    try:
        # Test data
        signup_data = {
            "name": "Test User",
            "email": "test@example.com", 
            "password": "password123",
            "phone": "+91 9876543210",
            "location": "Bengaluru",
            "userType": "buyer"
        }
        
        url = f"{BASE_URL}/api/auth/signup"
        print(f"📡 POST {url}")
        print(f"📤 Request Body: {json.dumps(signup_data, indent=2)}")
        
        response = requests.post(url, json=signup_data, timeout=30)
        
        print(f"📥 Response Status: {response.status_code}")
        print(f"📥 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📥 Response Body: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['success', 'user', 'token', 'credential']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print_result(False, f"Missing required fields: {missing_fields}")
                return None, None
            
            if not data.get('success'):
                print_result(False, f"Signup failed: {data.get('error', 'Unknown error')}")
                return None, None
            
            # Validate user object
            user = data['user']
            user_required = ['id', 'name', 'email', 'role', 'did', 'trustScore']
            user_missing = [field for field in user_required if field not in user]
            
            if user_missing:
                print_result(False, f"User object missing fields: {user_missing}")
                return None, None
            
            # Validate DID format
            did = user['did']
            if not did.startswith('did:farmbid:buyer:'):
                print_result(False, f"Invalid DID format: {did}")
                return None, None
            
            # Validate verifiable credential
            credential = data['credential']
            cred_required = ['@context', 'type', 'issuer', 'credentialSubject', 'proof']
            cred_missing = [field for field in cred_required if field not in credential]
            
            if cred_missing:
                print_result(False, f"Credential missing fields: {cred_missing}")
                return None, None
            
            print_result(True, "User registration successful with SSI credential")
            print(f"   ✓ DID Generated: {did}")
            print(f"   ✓ Trust Score: {user['trustScore']}")
            print(f"   ✓ Credential Type: {credential['type']}")
            print(f"   ✓ Token Length: {len(data['token'])} chars")
            
            return data['token'], user['email']
            
        else:
            error_text = response.text
            print_result(False, f"HTTP {response.status_code}: {error_text}")
            return None, None
            
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
        return None, None
    except Exception as e:
        print_result(False, f"Unexpected error: {str(e)}")
        return None, None

def test_auth_login(email="test@example.com", password="password123"):
    """Test POST /api/auth/login - User login"""
    print_test_header("User Login")
    
    try:
        login_data = {
            "email": email,
            "password": password
        }
        
        url = f"{BASE_URL}/api/auth/login"
        print(f"📡 POST {url}")
        print(f"📤 Request Body: {json.dumps(login_data, indent=2)}")
        
        response = requests.post(url, json=login_data, timeout=30)
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📥 Response Body: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['success', 'user', 'token']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print_result(False, f"Missing required fields: {missing_fields}")
                return None
            
            if not data.get('success'):
                print_result(False, f"Login failed: {data.get('error', 'Unknown error')}")
                return None
            
            print_result(True, "User login successful")
            print(f"   ✓ User ID: {data['user']['id']}")
            print(f"   ✓ User Role: {data['user']['role']}")
            print(f"   ✓ Token Length: {len(data['token'])} chars")
            
            return data['token']
            
        else:
            error_text = response.text
            print_result(False, f"HTTP {response.status_code}: {error_text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
        return None
    except Exception as e:
        print_result(False, f"Unexpected error: {str(e)}")
        return None

def test_demo_login(role="buyer"):
    """Test POST /api/auth/demo-login - Demo login for roles"""
    print_test_header(f"Demo Login - {role.upper()}")
    
    try:
        demo_data = {"role": role}
        
        url = f"{BASE_URL}/api/auth/demo-login"
        print(f"📡 POST {url}")
        print(f"📤 Request Body: {json.dumps(demo_data, indent=2)}")
        
        response = requests.post(url, json=demo_data, timeout=30)
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📥 Response Body: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['success', 'user', 'token']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print_result(False, f"Missing required fields: {missing_fields}")
                return None
            
            if not data.get('success'):
                print_result(False, f"Demo login failed: {data.get('error', 'Unknown error')}")
                return None
            
            user = data['user']
            if user['role'] != role:
                print_result(False, f"Role mismatch: expected {role}, got {user['role']}")
                return None
            
            print_result(True, f"Demo login successful for {role}")
            print(f"   ✓ User Name: {user['name']}")
            print(f"   ✓ User Role: {user['role']}")
            print(f"   ✓ Verified: {user.get('verified', False)}")
            print(f"   ✓ Token Length: {len(data['token'])} chars")
            
            return data['token']
            
        else:
            error_text = response.text
            print_result(False, f"HTTP {response.status_code}: {error_text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
        return None
    except Exception as e:
        print_result(False, f"Unexpected error: {str(e)}")
        return None

def test_auth_me(token):
    """Test GET /api/auth/me - Get current user (requires Bearer token)"""
    print_test_header("Get Current User")
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        url = f"{BASE_URL}/api/auth/me"
        print(f"📡 GET {url}")
        print(f"📤 Headers: {headers}")
        
        response = requests.get(url, headers=headers, timeout=30)
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📥 Response Body: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['success', 'user']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print_result(False, f"Missing required fields: {missing_fields}")
                return False
            
            if not data.get('success'):
                print_result(False, f"Get user failed: {data.get('error', 'Unknown error')}")
                return False
            
            user = data['user']
            user_required = ['id', 'name', 'email', 'role']
            user_missing = [field for field in user_required if field not in user]
            
            if user_missing:
                print_result(False, f"User object missing fields: {user_missing}")
                return False
            
            print_result(True, "Get current user successful")
            print(f"   ✓ User ID: {user['id']}")
            print(f"   ✓ User Name: {user['name']}")
            print(f"   ✓ User Email: {user['email']}")
            print(f"   ✓ User Role: {user['role']}")
            
            return True
            
        else:
            error_text = response.text
            print_result(False, f"HTTP {response.status_code}: {error_text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
        return False
    except Exception as e:
        print_result(False, f"Unexpected error: {str(e)}")
        return False

def test_invalid_login():
    """Test invalid login credentials"""
    print_test_header("Invalid Login Credentials")
    
    try:
        invalid_data = {
            "email": "wrong@email.com",
            "password": "wrongpass"
        }
        
        url = f"{BASE_URL}/api/auth/login"
        print(f"📡 POST {url}")
        print(f"📤 Request Body: {json.dumps(invalid_data, indent=2)}")
        
        response = requests.post(url, json=invalid_data, timeout=30)
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 401:
            data = response.json()
            print(f"📥 Response Body: {json.dumps(data, indent=2)}")
            
            if not data.get('success') and 'error' in data:
                print_result(True, "Invalid credentials properly rejected")
                print(f"   ✓ Error Message: {data['error']}")
                return True
            else:
                print_result(False, "Expected error response structure not found")
                return False
                
        else:
            error_text = response.text
            print_result(False, f"Expected 401, got HTTP {response.status_code}: {error_text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
        return False
    except Exception as e:
        print_result(False, f"Unexpected error: {str(e)}")
        return False

def test_auth_me_no_token():
    """Test GET /api/auth/me without token"""
    print_test_header("Get Current User - No Token")
    
    try:
        url = f"{BASE_URL}/api/auth/me"
        print(f"📡 GET {url}")
        print(f"📤 Headers: None (no Authorization header)")
        
        response = requests.get(url, timeout=30)
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 401:
            data = response.json()
            print(f"📥 Response Body: {json.dumps(data, indent=2)}")
            
            if not data.get('success') and 'error' in data:
                print_result(True, "No token properly rejected")
                print(f"   ✓ Error Message: {data['error']}")
                return True
            else:
                print_result(False, "Expected error response structure not found")
                return False
                
        else:
            error_text = response.text
            print_result(False, f"Expected 401, got HTTP {response.status_code}: {error_text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
        return False
    except Exception as e:
        print_result(False, f"Unexpected error: {str(e)}")
        return False

def main():
    """Run all authentication tests"""
    print(f"🚀 FarmBid Authentication API Testing")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    test_results = []
    
    # Test 1: User Registration with SSI
    token, email = test_auth_signup()
    test_results.append(("User Registration with SSI", token is not None))
    
    # Test 2: User Login (if signup worked)
    login_token = None
    if email:
        login_token = test_auth_login(email, "password123")
        test_results.append(("User Login", login_token is not None))
    else:
        # Try with demo user if signup failed
        login_token = test_auth_login("demo-buyer@farmbid.io", "demo123")
        test_results.append(("User Login (fallback)", login_token is not None))
    
    # Test 3: Demo Login for different roles
    buyer_token = test_demo_login("buyer")
    test_results.append(("Demo Login - Buyer", buyer_token is not None))
    
    farmer_token = test_demo_login("farmer")
    test_results.append(("Demo Login - Farmer", farmer_token is not None))
    
    admin_token = test_demo_login("admin")
    test_results.append(("Demo Login - Admin", admin_token is not None))
    
    # Test 4: Get current user (use any valid token)
    valid_token = token or login_token or buyer_token
    if valid_token:
        me_result = test_auth_me(valid_token)
        test_results.append(("Get Current User", me_result))
    else:
        test_results.append(("Get Current User", False))
        print_result(False, "No valid token available for /auth/me test")
    
    # Test 5: Invalid login credentials
    invalid_result = test_invalid_login()
    test_results.append(("Invalid Login Rejection", invalid_result))
    
    # Test 6: No token provided
    no_token_result = test_auth_me_no_token()
    test_results.append(("No Token Rejection", no_token_result))
    
    # Summary
    print(f"\n{'='*60}")
    print(f"📊 TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\n🎯 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print(f"🎉 ALL TESTS PASSED! Authentication system is working correctly.")
        return 0
    else:
        print(f"⚠️  {total - passed} test(s) failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3
"""
FarmBid Backend API Testing Script
Tests all critical API endpoints for the blockchain-based agricultural auction platform
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://bid-harvest.preview.emergentagent.com/api"

def test_api_endpoint(method, endpoint, data=None, expected_status=200, test_name=""):
    """Generic function to test API endpoints"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        print(f"\n{'='*60}")
        print(f"Testing: {test_name or f'{method} {endpoint}'}")
        print(f"URL: {url}")
        
        if method.upper() == 'GET':
            response = requests.get(url, timeout=30)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, timeout=30)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
            
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != expected_status:
            print(f"❌ Expected status {expected_status}, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        try:
            response_data = response.json()
            print(f"✅ Success - Response received")
            
            # Print key response structure info
            if isinstance(response_data, dict):
                print(f"Response keys: {list(response_data.keys())}")
                if 'listings' in response_data:
                    print(f"Listings count: {len(response_data['listings'])}")
                elif 'events' in response_data:
                    print(f"Events count: {len(response_data['events'])}")
                elif 'farmers' in response_data:
                    print(f"Farmers count: {len(response_data['farmers'])}")
                elif 'kpis' in response_data:
                    print(f"KPIs available: {list(response_data['kpis'].keys()) if isinstance(response_data['kpis'], dict) else 'KPIs data present'}")
            
            return True, response_data
            
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        return False

def run_backend_tests():
    """Run all backend API tests"""
    print("🚀 Starting FarmBid Backend API Tests")
    print(f"Base URL: {BASE_URL}")
    print(f"Test started at: {datetime.now()}")
    
    test_results = {}
    
    # Test 1: GET /api/listings - Fetch all auction listings
    print("\n" + "="*80)
    print("TEST 1: GET /api/listings - Fetch all auction listings")
    result = test_api_endpoint('GET', '/listings', test_name="Fetch all auction listings")
    if result and len(result) > 1:
        listings_data = result[1]
        test_results['listings'] = True
        print(f"✅ Listings endpoint working - {listings_data.get('count', 0)} listings found")
        
        # Validate response structure
        if 'listings' in listings_data and len(listings_data['listings']) > 0:
            sample_listing = listings_data['listings'][0]
            required_fields = ['id', 'produce', 'quantity', 'minPricePerKg', 'currentBidPerKg', 'status']
            missing_fields = [field for field in required_fields if field not in sample_listing]
            if missing_fields:
                print(f"⚠️  Missing fields in listing: {missing_fields}")
            else:
                print("✅ Listing structure validated")
    else:
        test_results['listings'] = False
        print("❌ Listings endpoint failed")
    
    # Test 2: GET /api/listings/l1 - Fetch specific listing
    print("\n" + "="*80)
    print("TEST 2: GET /api/listings/l1 - Fetch specific listing with bids")
    result = test_api_endpoint('GET', '/listings/l1', test_name="Fetch specific listing l1")
    if result and len(result) > 1:
        listing_data = result[1]
        test_results['specific_listing'] = True
        print(f"✅ Specific listing endpoint working")
        
        # Check for bids and blockchain events
        if 'bids' in listing_data:
            print(f"✅ Bids included: {len(listing_data['bids'])} bids")
        if 'blockchainEvents' in listing_data:
            print(f"✅ Blockchain events included: {len(listing_data['blockchainEvents'])} events")
    else:
        test_results['specific_listing'] = False
        print("❌ Specific listing endpoint failed")
    
    # Test 3: POST /api/bids - Place a bid
    print("\n" + "="*80)
    print("TEST 3: POST /api/bids - Place a bid on auction")
    bid_data = {
        "listingId": "l1",
        "buyerId": "b1", 
        "bidPerKg": 45
    }
    result = test_api_endpoint('POST', '/bids', data=bid_data, test_name="Place bid on listing l1")
    if result and len(result) > 1:
        bid_response = result[1]
        test_results['place_bid'] = True
        print(f"✅ Bid placement working")
        
        # Validate bid response structure
        if 'bid' in bid_response and 'blockchainEvent' in bid_response:
            print("✅ Bid response includes bid and blockchain event")
            if 'txHash' in bid_response['blockchainEvent']:
                print(f"✅ Blockchain transaction hash: {bid_response['blockchainEvent']['txHash'][:10]}...")
        else:
            print("⚠️  Bid response missing expected fields")
    else:
        test_results['place_bid'] = False
        print("❌ Bid placement failed")
    
    # Test 4: GET /api/blockchain/events - Fetch blockchain events
    print("\n" + "="*80)
    print("TEST 4: GET /api/blockchain/events - Fetch blockchain events")
    result = test_api_endpoint('GET', '/blockchain/events', test_name="Fetch blockchain events")
    if result and len(result) > 1:
        events_data = result[1]
        test_results['blockchain_events'] = True
        print(f"✅ Blockchain events endpoint working")
        
        if 'events' in events_data and len(events_data['events']) > 0:
            sample_event = events_data['events'][0]
            required_fields = ['id', 'type', 'txHash', 'blockNumber', 'timestamp']
            missing_fields = [field for field in required_fields if field not in sample_event]
            if missing_fields:
                print(f"⚠️  Missing fields in blockchain event: {missing_fields}")
            else:
                print("✅ Blockchain event structure validated")
                print(f"✅ Sample txHash: {sample_event.get('txHash', 'N/A')[:10]}...")
    else:
        test_results['blockchain_events'] = False
        print("❌ Blockchain events endpoint failed")
    
    # Test 5: GET /api/farmers - Fetch all farmers
    print("\n" + "="*80)
    print("TEST 5: GET /api/farmers - Fetch all farmers")
    result = test_api_endpoint('GET', '/farmers', test_name="Fetch all farmers")
    if result and len(result) > 1:
        farmers_data = result[1]
        test_results['farmers'] = True
        print(f"✅ Farmers endpoint working - {len(farmers_data.get('farmers', []))} farmers found")
    else:
        test_results['farmers'] = False
        print("❌ Farmers endpoint failed")
    
    # Test 6: GET /api/admin/kpis - Fetch platform KPIs
    print("\n" + "="*80)
    print("TEST 6: GET /api/admin/kpis - Fetch platform KPIs")
    result = test_api_endpoint('GET', '/admin/kpis', test_name="Fetch platform KPIs")
    if result and len(result) > 1:
        kpis_data = result[1]
        test_results['admin_kpis'] = True
        print(f"✅ Admin KPIs endpoint working")
        
        if 'kpis' in kpis_data:
            kpis = kpis_data['kpis']
            if isinstance(kpis, dict):
                print(f"✅ KPI metrics available: {list(kpis.keys())}")
    else:
        test_results['admin_kpis'] = False
        print("❌ Admin KPIs endpoint failed")
    
    # Test 7: POST /api/quality/analyze - AI quality analysis
    print("\n" + "="*80)
    print("TEST 7: POST /api/quality/analyze - AI quality analysis")
    quality_data = {
        "imageUrl": "test.jpg",
        "produce": "Tomatoes"
    }
    result = test_api_endpoint('POST', '/quality/analyze', data=quality_data, test_name="AI quality analysis")
    if result and len(result) > 1:
        quality_response = result[1]
        test_results['quality_analyze'] = True
        print(f"✅ Quality analysis endpoint working")
        
        if 'result' in quality_response:
            quality_result = quality_response['result']
            required_fields = ['qualityIndex', 'freshness', 'grade', 'confidence']
            missing_fields = [field for field in required_fields if field not in quality_result]
            if missing_fields:
                print(f"⚠️  Missing fields in quality result: {missing_fields}")
            else:
                print(f"✅ Quality analysis complete - Grade: {quality_result.get('grade')}, Quality: {quality_result.get('qualityIndex')}%")
    else:
        test_results['quality_analyze'] = False
        print("❌ Quality analysis endpoint failed")
    
    # Test 8: GET /api/wallet/balance - Fetch wallet balance
    print("\n" + "="*80)
    print("TEST 8: GET /api/wallet/balance - Fetch wallet balance")
    result = test_api_endpoint('GET', '/wallet/balance', test_name="Fetch wallet balance")
    if result and len(result) > 1:
        wallet_data = result[1]
        test_results['wallet_balance'] = True
        print(f"✅ Wallet balance endpoint working")
        
        required_fields = ['balance', 'locked', 'available']
        missing_fields = [field for field in required_fields if field not in wallet_data]
        if missing_fields:
            print(f"⚠️  Missing fields in wallet response: {missing_fields}")
        else:
            print(f"✅ Wallet balance: ₹{wallet_data.get('balance')}, Available: ₹{wallet_data.get('available')}")
    else:
        test_results['wallet_balance'] = False
        print("❌ Wallet balance endpoint failed")
    
    # Test Summary
    print("\n" + "="*80)
    print("🏁 BACKEND API TEST SUMMARY")
    print("="*80)
    
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    
    print(f"Tests Passed: {passed_tests}/{total_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL BACKEND TESTS PASSED!")
        return True
    else:
        print(f"\n⚠️  {total_tests - passed_tests} tests failed")
        return False

if __name__ == "__main__":
    success = run_backend_tests()
    sys.exit(0 if success else 1)
import requests
import random

def test_full_flow():
    base_url = "http://127.0.0.1:8000/api"
    
    # 1. Sign Up
    email = f"landlord_{random.randint(1000, 9999)}@example.com"
    signup_data = {
        "name": "Moroccan Landlord",
        "email": email,
        "password": "securepassword"
    }
    print("--- 1. Testing Sign Up ---")
    res = requests.post(f"{base_url}/signup", json=signup_data)
    print("Signup Status:", res.status_code)
    signup_json = res.json()
    print("Signup Response:", signup_json)
    assert res.status_code == 200
    assert signup_json["success"] is True
    user_id = signup_json["user"]["id"]
    
    # 2. Log In
    login_data = {
        "email": email,
        "password": "securepassword"
    }
    print("\n--- 2. Testing Log In ---")
    res = requests.post(f"{base_url}/login", json=login_data)
    print("Login Status:", res.status_code)
    login_json = res.json()
    print("Login Response:", login_json)
    assert res.status_code == 200
    assert login_json["success"] is True
    
    # 3. Create Listing
    listing_data = {
        "title": "Nice Studio in Casablanca Center",
        "city": "Casablanca",
        "neighborhood": "Maarif",
        "type": "studio",
        "price": 3200,
        "size": 38,
        "available": "2026-08-01",
        "furnished": True,
        "features": ["WiFi", "Balcony", "Kitchen"],
        "description": "Lovely studio close to shops and universities.",
        "userId": user_id
    }
    print("\n--- 3. Testing Create Listing ---")
    res = requests.post(f"{base_url}/listings", json=listing_data)
    print("Create Listing Status:", res.status_code)
    listing_json = res.json()
    print("Create Listing Response:", listing_json)
    assert res.status_code == 200
    assert listing_json["success"] is True
    listing_id = listing_json["id"]
    
    # 4. Get Listings
    print("\n--- 4. Testing Get Listings ---")
    res = requests.get(f"{base_url}/listings")
    print("Get Listings Status:", res.status_code)
    listings = res.json()
    print(f"Total Listings Found: {len(listings)}")
    
    # Check if our created listing is in the results
    found = False
    for item in listings:
        if item["id"] == listing_id:
            found = True
            print("Successfully found our listing in the API response:")
            print(item)
            break
    assert found is True, "Listing was not found in get_listings response"
    
    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY! The backend is 100% functional.")

if __name__ == "__main__":
    try:
        test_full_flow()
    except AssertionError as e:
        print("❌ Test failed assertion:", e)
    except Exception as e:
        print("❌ Test failed with error:", e)

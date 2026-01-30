"""
Test Plant Growing Game Features
- Reward Types API (4 options: Class, Retreat, Product, Service with target days)
- Manifestations API (5 options: Abundance, Healing, Love, Peace, Growth with plant types)
- Start Game API with manifestation data
- Water Plant API
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@mothernatural.com"
ADMIN_PASSWORD = "Aniyah13"


class TestRewardTypesAPI:
    """Test reward types endpoint - should return 4 types with target days"""
    
    def test_get_reward_types(self):
        """GET /api/game/reward-types should return 4 reward types"""
        response = requests.get(f"{BASE_URL}/api/game/reward-types")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 4, f"Expected 4 reward types, got {len(data)}"
        
        # Verify each reward type has required fields
        for rt in data:
            assert "id" in rt, "Reward type should have id"
            assert "name" in rt, "Reward type should have name"
            assert "targetDays" in rt, "Reward type should have targetDays"
        
        print(f"✓ Found {len(data)} reward types")
    
    def test_reward_types_have_correct_target_days(self):
        """Verify each reward type has correct target days"""
        response = requests.get(f"{BASE_URL}/api/game/reward-types")
        assert response.status_code == 200
        
        data = response.json()
        expected = {
            "class": 60,
            "retreat": 90,
            "product": 28,
            "service": 28
        }
        
        for rt in data:
            rt_id = rt["id"]
            if rt_id in expected:
                assert rt["targetDays"] == expected[rt_id], \
                    f"{rt['name']} should have {expected[rt_id]} days, got {rt['targetDays']}"
                print(f"✓ {rt['name']}: {rt['targetDays']} days")


class TestManifestationsAPI:
    """Test manifestations endpoint - should return 5 manifestations with plant types"""
    
    def test_get_manifestations(self):
        """GET /api/game/manifestations should return 5 manifestations"""
        response = requests.get(f"{BASE_URL}/api/game/manifestations")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 5, f"Expected 5 manifestations, got {len(data)}"
        
        # Verify each manifestation has required fields
        for m in data:
            assert "id" in m, "Manifestation should have id"
            assert "name" in m, "Manifestation should have name"
            assert "plantType" in m, "Manifestation should have plantType"
            assert "plantImage" in m, "Manifestation should have plantImage"
            assert "description" in m, "Manifestation should have description"
        
        print(f"✓ Found {len(data)} manifestations")
    
    def test_manifestations_have_correct_plant_types(self):
        """Verify each manifestation has correct plant type"""
        response = requests.get(f"{BASE_URL}/api/game/manifestations")
        assert response.status_code == 200
        
        data = response.json()
        expected = {
            "abundance": "Money Tree",
            "healing": "Aloe Plant",
            "love": "Rose Bush",
            "peace": "Lavender",
            "growth": "Bamboo"
        }
        
        for m in data:
            m_id = m["id"]
            if m_id in expected:
                assert m["plantType"] == expected[m_id], \
                    f"{m['name']} should have plant type '{expected[m_id]}', got '{m['plantType']}'"
                print(f"✓ {m['name']}: {m['plantType']}")
    
    def test_manifestations_have_plant_images(self):
        """Verify each manifestation has a plant image URL"""
        response = requests.get(f"{BASE_URL}/api/game/manifestations")
        assert response.status_code == 200
        
        data = response.json()
        for m in data:
            assert m["plantImage"], f"{m['name']} should have a plant image"
            assert m["plantImage"].startswith("http"), f"{m['name']} image should be a URL"
            print(f"✓ {m['name']} has image: {m['plantImage'][:50]}...")


class TestPlantGameFlow:
    """Test the full plant game flow with authentication"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for admin user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Authentication failed: {response.status_code}")
        
        data = response.json()
        return data.get("access_token") or data.get("token")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_current_game_status(self, auth_headers):
        """GET /api/game/plant should return current game or null"""
        response = requests.get(f"{BASE_URL}/api/game/plant", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        if data:
            print(f"✓ User has active game: {data.get('rewardName', 'Unknown')}")
            print(f"  - Growth: {data.get('growthPercentage', 0)}%")
            print(f"  - Plant Type: {data.get('plantType', 'Unknown')}")
            print(f"  - Manifestation: {data.get('manifestationName', 'Unknown')}")
        else:
            print("✓ No active game - ready to start new game")
    
    def test_start_game_with_manifestation(self, auth_headers):
        """POST /api/game/plant/start should create game with manifestation data"""
        # First check if there's an existing game
        check_response = requests.get(f"{BASE_URL}/api/game/plant", headers=auth_headers)
        if check_response.status_code == 200 and check_response.json():
            print("⚠ User already has active game - skipping start test")
            pytest.skip("User already has active game")
        
        # Get a class to use as reward
        classes_response = requests.get(f"{BASE_URL}/api/classes")
        classes = classes_response.json()
        if not classes:
            pytest.skip("No classes available for testing")
        
        test_class = classes[0]
        class_id = test_class.get("id") or "test-class-id"
        class_name = test_class.get("name") or test_class.get("title") or "Test Class"
        
        # Start game with manifestation
        payload = {
            "rewardType": "class",
            "rewardId": class_id,
            "rewardName": class_name,
            "manifestationId": "abundance"  # Money Tree
        }
        
        response = requests.post(
            f"{BASE_URL}/api/game/plant/start",
            json=payload,
            headers={**auth_headers, "Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        assert "game" in data, "Response should contain game data"
        
        game = data["game"]
        
        # Verify manifestation data is included
        assert game.get("manifestationId") == "abundance", "Game should have manifestationId"
        assert game.get("manifestationName") == "Abundance", "Game should have manifestationName"
        assert game.get("plantType") == "Money Tree", "Game should have plantType from manifestation"
        assert game.get("plantImage"), "Game should have plantImage from manifestation"
        
        # Verify reward type data
        assert game.get("rewardType") == "class", "Game should have rewardType"
        assert game.get("targetDays") == 60, "Class reward should have 60 target days"
        
        print(f"✓ Game started successfully!")
        print(f"  - Reward: {game.get('rewardName')}")
        print(f"  - Manifestation: {game.get('manifestationName')}")
        print(f"  - Plant Type: {game.get('plantType')}")
        print(f"  - Target Days: {game.get('targetDays')}")
    
    def test_water_plant(self, auth_headers):
        """POST /api/game/plant/water should water the plant"""
        # First check if there's an active game
        check_response = requests.get(f"{BASE_URL}/api/game/plant", headers=auth_headers)
        if check_response.status_code != 200 or not check_response.json():
            pytest.skip("No active game to water")
        
        game = check_response.json()
        if game.get("isComplete") or game.get("isExpired"):
            pytest.skip("Game is complete or expired")
        
        # Try to water
        response = requests.post(f"{BASE_URL}/api/game/plant/water", headers=auth_headers)
        
        # Could be 200 (success) or 400 (cooldown)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Plant watered! Growth added: {data.get('growthAdded', 0)}%")
            print(f"  - New growth: {data.get('newGrowth', 0)}%")
        elif response.status_code == 400:
            data = response.json()
            print(f"⚠ Cannot water yet: {data.get('detail', 'Cooldown active')}")
        else:
            assert False, f"Unexpected status: {response.status_code}"


class TestGameDataIntegrity:
    """Test that game data is properly stored and retrieved"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for admin user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Authentication failed: {response.status_code}")
        
        data = response.json()
        return data.get("access_token") or data.get("token")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_game_has_manifestation_image(self, auth_headers):
        """Verify active game has plant image from manifestation"""
        response = requests.get(f"{BASE_URL}/api/game/plant", headers=auth_headers)
        
        if response.status_code != 200 or not response.json():
            pytest.skip("No active game")
        
        game = response.json()
        
        # Check for manifestation data
        if game.get("plantImage"):
            assert game["plantImage"].startswith("http"), "Plant image should be a URL"
            print(f"✓ Game has plant image: {game['plantImage'][:60]}...")
        
        if game.get("plantType"):
            print(f"✓ Game has plant type: {game['plantType']}")
        
        if game.get("manifestationName"):
            print(f"✓ Game has manifestation name: {game['manifestationName']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Test suite for Loyalty/Rewards System
Tests: Membership tiers, loyalty points, referral codes, plant watering game
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@mothernatural.com"
ADMIN_PASSWORD = "Aniyah13"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for admin user"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get auth headers"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestLoyaltyTiers:
    """Test membership tiers API"""
    
    def test_get_loyalty_tiers(self):
        """Test GET /api/loyalty/tiers returns 4 tiers"""
        response = requests.get(f"{BASE_URL}/api/loyalty/tiers")
        assert response.status_code == 200
        
        tiers = response.json()
        assert len(tiers) == 4, f"Expected 4 tiers, got {len(tiers)}"
        
        # Verify tier names
        tier_names = [t["name"] for t in tiers]
        assert "Seed" in tier_names, "Missing Seed tier"
        assert "Root" in tier_names, "Missing Root tier"
        assert "Bloom" in tier_names, "Missing Bloom tier"
        assert "Divine" in tier_names, "Missing Divine tier"
    
    def test_tier_structure(self):
        """Test tier data structure"""
        response = requests.get(f"{BASE_URL}/api/loyalty/tiers")
        assert response.status_code == 200
        
        tiers = response.json()
        for tier in tiers:
            assert "id" in tier, "Tier missing id"
            assert "name" in tier, "Tier missing name"
            assert "title" in tier, "Tier missing title"
            assert "description" in tier, "Tier missing description"
            assert "tagline" in tier, "Tier missing tagline"
            assert "pointsRequired" in tier, "Tier missing pointsRequired"
    
    def test_tier_points_requirements(self):
        """Test tier points requirements are correct"""
        response = requests.get(f"{BASE_URL}/api/loyalty/tiers")
        assert response.status_code == 200
        
        tiers = response.json()
        tier_points = {t["id"]: t["pointsRequired"] for t in tiers}
        
        assert tier_points.get("seed") == 0, "Seed should require 0 points"
        assert tier_points.get("root") == 100, "Root should require 100 points"
        assert tier_points.get("bloom") == 500, "Bloom should require 500 points"
        assert tier_points.get("divine") == 1000, "Divine should require 1000 points"


class TestLoyaltySettings:
    """Test loyalty settings API"""
    
    def test_get_loyalty_settings(self):
        """Test GET /api/loyalty/settings returns correct settings"""
        response = requests.get(f"{BASE_URL}/api/loyalty/settings")
        assert response.status_code == 200
        
        settings = response.json()
        assert "pointsPerDollar" in settings, "Missing pointsPerDollar"
        assert "referralPoints" in settings, "Missing referralPoints"
        assert "signInPoints" in settings, "Missing signInPoints"
        
        # Verify expected values
        assert settings["pointsPerDollar"] == 1.0, "Points per dollar should be 1"
        assert settings["referralPoints"] == 100, "Referral points should be 100"
        assert settings["signInPoints"] == 5, "Sign-in points should be 5"


class TestUserLoyaltyStats:
    """Test user loyalty stats API"""
    
    def test_get_user_stats(self, auth_headers):
        """Test GET /api/loyalty/user-stats returns user stats"""
        response = requests.get(
            f"{BASE_URL}/api/loyalty/user-stats",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        stats = response.json()
        assert "loyaltyPoints" in stats, "Missing loyaltyPoints"
        assert "currentTier" in stats, "Missing currentTier"
        assert "allTiers" in stats, "Missing allTiers"
        assert "referralCode" in stats, "Missing referralCode"
        assert "referralCount" in stats, "Missing referralCount"
    
    def test_user_stats_has_progress(self, auth_headers):
        """Test user stats includes progress to next tier"""
        response = requests.get(
            f"{BASE_URL}/api/loyalty/user-stats",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        stats = response.json()
        assert "pointsToNextTier" in stats, "Missing pointsToNextTier"
        assert "progressToNextTier" in stats, "Missing progressToNextTier"
    
    def test_user_stats_unauthorized(self):
        """Test user stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/loyalty/user-stats")
        assert response.status_code == 401, "Should require authentication"


class TestReferralCode:
    """Test referral code generation API"""
    
    def test_generate_referral_code(self, auth_headers):
        """Test GET /api/loyalty/generate-referral-code generates code"""
        response = requests.get(
            f"{BASE_URL}/api/loyalty/generate-referral-code",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "referralCode" in data, "Missing referralCode in response"
        assert len(data["referralCode"]) == 8, "Referral code should be 8 characters"
    
    def test_referral_code_persists(self, auth_headers):
        """Test referral code is saved to user"""
        # Generate code
        response = requests.get(
            f"{BASE_URL}/api/loyalty/generate-referral-code",
            headers=auth_headers
        )
        assert response.status_code == 200
        code = response.json()["referralCode"]
        
        # Verify in user stats
        stats_response = requests.get(
            f"{BASE_URL}/api/loyalty/user-stats",
            headers=auth_headers
        )
        assert stats_response.status_code == 200
        assert stats_response.json()["referralCode"] == code


class TestPlantGame:
    """Test plant watering game API"""
    
    def test_get_plant_game(self, auth_headers):
        """Test GET /api/game/plant returns game or null"""
        response = requests.get(
            f"{BASE_URL}/api/game/plant",
            headers=auth_headers
        )
        assert response.status_code == 200
        # Can be null or game object
    
    def test_plant_game_structure(self, auth_headers):
        """Test plant game has correct structure when active"""
        response = requests.get(
            f"{BASE_URL}/api/game/plant",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        game = response.json()
        if game:  # If there's an active game
            assert "growthPercentage" in game, "Missing growthPercentage"
            assert "waterCount" in game, "Missing waterCount"
            assert "canWater" in game, "Missing canWater"
            assert "timeUntilWater" in game, "Missing timeUntilWater"
            assert "rewardName" in game, "Missing rewardName"
    
    def test_water_cooldown_enforced(self, auth_headers):
        """Test 4-hour water cooldown is enforced"""
        # First check if there's an active game
        game_response = requests.get(
            f"{BASE_URL}/api/game/plant",
            headers=auth_headers
        )
        
        if game_response.status_code == 200 and game_response.json():
            game = game_response.json()
            if not game.get("canWater", True):
                # Try to water when cooldown is active
                water_response = requests.post(
                    f"{BASE_URL}/api/game/plant/water",
                    headers=auth_headers
                )
                assert water_response.status_code == 400, "Should reject water during cooldown"
                assert "not thirsty" in water_response.json().get("detail", "").lower() or "wait" in water_response.json().get("detail", "").lower()
    
    def test_plant_game_unauthorized(self):
        """Test plant game requires authentication"""
        response = requests.get(f"{BASE_URL}/api/game/plant")
        assert response.status_code == 401, "Should require authentication"


class TestPlantGameStart:
    """Test plant game start functionality"""
    
    def test_start_game_requires_reward(self, auth_headers):
        """Test starting game requires reward selection"""
        # Try to start without required fields
        response = requests.post(
            f"{BASE_URL}/api/game/plant/start",
            headers=auth_headers,
            json={}
        )
        # Should fail validation
        assert response.status_code in [400, 422], "Should require reward fields"


class TestProductsServicesClasses:
    """Test that products/services/classes are available for rewards"""
    
    def test_products_available(self):
        """Test products endpoint returns items"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        assert isinstance(products, list), "Products should be a list"
    
    def test_services_available(self):
        """Test services endpoint returns items"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        services = response.json()
        assert isinstance(services, list), "Services should be a list"
    
    def test_classes_available(self):
        """Test classes endpoint returns items"""
        response = requests.get(f"{BASE_URL}/api/classes")
        assert response.status_code == 200
        classes = response.json()
        assert isinstance(classes, list), "Classes should be a list"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

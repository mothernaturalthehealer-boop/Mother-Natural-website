"""
Test suite for Services API and PWA Manifest/Icons
Tests the fixes for:
1. Services created in admin panel showing on appointments page
2. App icon and name for mobile home screen
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestServicesAPI:
    """Test /api/services endpoint - services should be fetched from API, not localStorage"""
    
    def test_get_services_endpoint_returns_200(self):
        """Test that /api/services endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/services returns 200")
    
    def test_get_services_returns_list(self):
        """Test that /api/services returns a list"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/services returns a list with {len(data)} services")
    
    def test_services_have_valid_ids(self):
        """Test that all services have valid IDs (not null)"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        services = response.json()
        
        for service in services:
            assert service.get('id') is not None, f"Service {service.get('name')} has null ID"
            assert len(str(service.get('id'))) > 0, f"Service {service.get('name')} has empty ID"
        
        print(f"✓ All {len(services)} services have valid IDs")
    
    def test_services_have_required_fields(self):
        """Test that services have required fields for appointments page"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        services = response.json()
        
        required_fields = ['id', 'name', 'duration', 'price']
        
        for service in services:
            for field in required_fields:
                assert field in service, f"Service missing required field: {field}"
        
        print(f"✓ All services have required fields: {required_fields}")
    
    def test_create_service_returns_valid_id(self):
        """Test that creating a service returns a valid ID"""
        test_service = {
            "name": "TEST_Service_For_Appointments",
            "duration": "60 min",
            "price": 75.0,
            "description": "Test service for appointments page",
            "paymentType": "full",
            "deposit": 0
        }
        
        response = requests.post(f"{BASE_URL}/api/services", json=test_service)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get('success') == True
        assert data.get('id') is not None
        assert len(data.get('id')) > 0
        
        # Verify service appears in GET
        get_response = requests.get(f"{BASE_URL}/api/services")
        services = get_response.json()
        created_service = next((s for s in services if s.get('id') == data.get('id')), None)
        assert created_service is not None, "Created service not found in GET response"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/services/{data.get('id')}")
        
        print(f"✓ Created service has valid ID: {data.get('id')}")
    
    def test_existing_service_has_valid_data(self):
        """Test that the existing 'Updated Service' has valid data"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        services = response.json()
        
        # Find the existing service
        existing_service = next((s for s in services if s.get('name') == 'Updated Service'), None)
        
        if existing_service:
            assert existing_service.get('id') is not None
            assert existing_service.get('duration') == '90 min'
            assert existing_service.get('price') == 100.0
            print(f"✓ Existing 'Updated Service' has valid data: ID={existing_service.get('id')}")
        else:
            print("⚠ No 'Updated Service' found in database")


class TestManifestAndIcons:
    """Test PWA manifest.json and icon files for mobile home screen"""
    
    def test_manifest_json_accessible(self):
        """Test that manifest.json is accessible"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ manifest.json is accessible")
    
    def test_manifest_has_correct_name(self):
        """Test that manifest.json has correct app name (not 'emergent')"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        manifest = response.json()
        
        assert manifest.get('name') == "Mother Natural: The Healing Lab", \
            f"Expected 'Mother Natural: The Healing Lab', got '{manifest.get('name')}'"
        assert manifest.get('short_name') == "Natural Healing Lab", \
            f"Expected 'Natural Healing Lab', got '{manifest.get('short_name')}'"
        
        print(f"✓ manifest.json has correct name: {manifest.get('name')}")
        print(f"✓ manifest.json has correct short_name: {manifest.get('short_name')}")
    
    def test_manifest_has_icons(self):
        """Test that manifest.json has icon definitions"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        manifest = response.json()
        
        icons = manifest.get('icons', [])
        assert len(icons) >= 2, f"Expected at least 2 icons, got {len(icons)}"
        
        # Check for required icon sizes
        icon_sizes = [icon.get('sizes') for icon in icons]
        assert any('192' in str(size) for size in icon_sizes), "Missing 192x192 icon"
        assert any('512' in str(size) for size in icon_sizes), "Missing 512x512 icon"
        
        print(f"✓ manifest.json has {len(icons)} icons defined")
    
    def test_manifest_has_theme_color(self):
        """Test that manifest.json has purple theme color"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        manifest = response.json()
        
        assert manifest.get('theme_color') == "#a78bfa", \
            f"Expected purple theme color '#a78bfa', got '{manifest.get('theme_color')}'"
        
        print(f"✓ manifest.json has correct theme_color: {manifest.get('theme_color')}")
    
    def test_favicon_accessible(self):
        """Test that favicon.ico is accessible"""
        response = requests.head(f"{BASE_URL}/favicon.ico")
        assert response.status_code == 200, f"favicon.ico not accessible: {response.status_code}"
        print(f"✓ favicon.ico is accessible")
    
    def test_logo192_accessible(self):
        """Test that logo192.png is accessible"""
        response = requests.head(f"{BASE_URL}/logo192.png")
        assert response.status_code == 200, f"logo192.png not accessible: {response.status_code}"
        print(f"✓ logo192.png is accessible")
    
    def test_logo512_accessible(self):
        """Test that logo512.png is accessible"""
        response = requests.head(f"{BASE_URL}/logo512.png")
        assert response.status_code == 200, f"logo512.png not accessible: {response.status_code}"
        print(f"✓ logo512.png is accessible")
    
    def test_apple_touch_icon_accessible(self):
        """Test that apple-touch-icon.png is accessible"""
        response = requests.head(f"{BASE_URL}/apple-touch-icon.png")
        assert response.status_code == 200, f"apple-touch-icon.png not accessible: {response.status_code}"
        print(f"✓ apple-touch-icon.png is accessible")


class TestIndexHTML:
    """Test index.html meta tags for PWA"""
    
    def test_index_html_accessible(self):
        """Test that index.html is accessible"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ index.html is accessible")
    
    def test_index_html_has_correct_title(self):
        """Test that index.html has correct title"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        
        assert "Mother Natural: The Healing Lab" in response.text, \
            "Title 'Mother Natural: The Healing Lab' not found in index.html"
        
        print(f"✓ index.html has correct title")
    
    def test_index_html_has_apple_meta_tags(self):
        """Test that index.html has Apple PWA meta tags"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        
        assert 'apple-mobile-web-app-capable' in response.text, \
            "Missing apple-mobile-web-app-capable meta tag"
        assert 'apple-mobile-web-app-title' in response.text, \
            "Missing apple-mobile-web-app-title meta tag"
        assert 'apple-touch-icon' in response.text, \
            "Missing apple-touch-icon link"
        
        print(f"✓ index.html has Apple PWA meta tags")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

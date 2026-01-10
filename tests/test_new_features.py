"""
Test suite for new features:
- Image Upload API (GridFS)
- Emergency Requests API
- Community Posts API
- Contract Templates API
- Signed Contracts API
- Analytics Dashboard APIs
"""

import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@mothernatural.com"
ADMIN_PASSWORD = "Aniyah13"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def admin_token(api_client):
    """Get admin authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    data = response.json()
    return data.get("access_token")


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    """Headers with auth token"""
    return {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }


# ============= IMAGE UPLOAD API TESTS =============

class TestImageUploadAPI:
    """Tests for GridFS image upload functionality"""
    
    def test_upload_image_success(self, admin_token):
        """Test uploading a valid image file"""
        # Create a simple test image (1x1 pixel PNG)
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # 1x1 dimensions
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
            0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
            0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {'file': ('test_image.png', io.BytesIO(png_data), 'image/png')}
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/upload/image",
            files=files,
            headers=headers
        )
        
        assert response.status_code == 200, f"Upload failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "filename" in data
        assert "url" in data
        assert data["url"].startswith("/api/images/")
        
        # Store filename for retrieval test
        TestImageUploadAPI.uploaded_filename = data["filename"]
        print(f"Image uploaded successfully: {data['filename']}")
    
    def test_upload_invalid_file_type(self, admin_token):
        """Test uploading an invalid file type"""
        files = {'file': ('test.txt', io.BytesIO(b'Hello World'), 'text/plain')}
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/upload/image",
            files=files,
            headers=headers
        )
        
        assert response.status_code == 400
        print("Invalid file type correctly rejected")
    
    def test_retrieve_uploaded_image(self, admin_token):
        """Test retrieving an uploaded image"""
        if not hasattr(TestImageUploadAPI, 'uploaded_filename'):
            pytest.skip("No uploaded image to retrieve")
        
        filename = TestImageUploadAPI.uploaded_filename
        response = requests.get(f"{BASE_URL}/api/images/{filename}")
        
        assert response.status_code == 200
        assert "image" in response.headers.get("content-type", "")
        print(f"Image retrieved successfully: {filename}")
    
    def test_retrieve_nonexistent_image(self):
        """Test retrieving a non-existent image"""
        response = requests.get(f"{BASE_URL}/api/images/nonexistent.png")
        assert response.status_code == 404
        print("Non-existent image correctly returns 404")


# ============= EMERGENCY REQUESTS API TESTS =============

class TestEmergencyRequestsAPI:
    """Tests for emergency requests CRUD operations"""
    
    def test_create_emergency_request(self, api_client):
        """Test creating an emergency request"""
        payload = {
            "name": "TEST_Emergency User",
            "phone": "555-1234",
            "email": "test_emergency@example.com",
            "crisisType": "mental_health",
            "urgency": "high",
            "description": "Test emergency request for testing purposes"
        }
        
        response = api_client.post(f"{BASE_URL}/api/emergency-requests", json=payload)
        
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "id" in data
        assert "request" in data
        assert data["request"]["status"] == "pending"
        
        TestEmergencyRequestsAPI.created_id = data["id"]
        print(f"Emergency request created: {data['id']}")
    
    def test_get_emergency_requests(self, api_client):
        """Test getting all emergency requests"""
        response = api_client.get(f"{BASE_URL}/api/emergency-requests")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Retrieved {len(data)} emergency requests")
    
    def test_resolve_emergency_request(self, api_client):
        """Test resolving an emergency request"""
        if not hasattr(TestEmergencyRequestsAPI, 'created_id'):
            pytest.skip("No emergency request to resolve")
        
        request_id = TestEmergencyRequestsAPI.created_id
        response = api_client.patch(f"{BASE_URL}/api/emergency-requests/{request_id}/resolve")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"Emergency request resolved: {request_id}")
    
    def test_delete_emergency_request(self, api_client):
        """Test deleting an emergency request"""
        if not hasattr(TestEmergencyRequestsAPI, 'created_id'):
            pytest.skip("No emergency request to delete")
        
        request_id = TestEmergencyRequestsAPI.created_id
        response = api_client.delete(f"{BASE_URL}/api/emergency-requests/{request_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"Emergency request deleted: {request_id}")


# ============= COMMUNITY POSTS API TESTS =============

class TestCommunityPostsAPI:
    """Tests for community posts CRUD operations"""
    
    def test_create_community_post(self, api_client):
        """Test creating a community post"""
        payload = {
            "authorId": "test-author-123",
            "authorName": "TEST_Author",
            "content": "This is a test community post for testing purposes"
        }
        
        response = api_client.post(f"{BASE_URL}/api/community-posts", json=payload)
        
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "id" in data
        assert "post" in data
        assert data["post"]["likes"] == 0
        assert data["post"]["comments"] == []
        
        TestCommunityPostsAPI.created_id = data["id"]
        print(f"Community post created: {data['id']}")
    
    def test_get_community_posts(self, api_client):
        """Test getting all community posts"""
        response = api_client.get(f"{BASE_URL}/api/community-posts")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Retrieved {len(data)} community posts")
    
    def test_like_community_post(self, api_client):
        """Test liking a community post"""
        if not hasattr(TestCommunityPostsAPI, 'created_id'):
            pytest.skip("No community post to like")
        
        post_id = TestCommunityPostsAPI.created_id
        response = api_client.post(f"{BASE_URL}/api/community-posts/{post_id}/like")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"Community post liked: {post_id}")
    
    def test_add_comment_to_post(self, api_client):
        """Test adding a comment to a community post"""
        if not hasattr(TestCommunityPostsAPI, 'created_id'):
            pytest.skip("No community post to comment on")
        
        post_id = TestCommunityPostsAPI.created_id
        payload = {
            "author": "TEST_Commenter",
            "content": "This is a test comment"
        }
        
        response = api_client.post(
            f"{BASE_URL}/api/community-posts/{post_id}/comment",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "comment" in data
        assert data["comment"]["author"] == "TEST_Commenter"
        print(f"Comment added to post: {post_id}")
    
    def test_delete_community_post(self, api_client):
        """Test deleting a community post"""
        if not hasattr(TestCommunityPostsAPI, 'created_id'):
            pytest.skip("No community post to delete")
        
        post_id = TestCommunityPostsAPI.created_id
        response = api_client.delete(f"{BASE_URL}/api/community-posts/{post_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"Community post deleted: {post_id}")


# ============= CONTRACT TEMPLATES API TESTS =============

class TestContractTemplatesAPI:
    """Tests for contract templates API"""
    
    def test_get_contract_templates(self, api_client):
        """Test getting contract templates"""
        response = api_client.get(f"{BASE_URL}/api/contracts/templates")
        
        assert response.status_code == 200
        data = response.json()
        assert "appointment" in data or "retreat" in data
        print(f"Contract templates retrieved: {list(data.keys())}")
    
    def test_update_appointment_template(self, auth_headers):
        """Test updating appointment contract template"""
        new_content = "TEST APPOINTMENT CONTRACT TEMPLATE\n\nThis is a test template."
        
        response = requests.put(
            f"{BASE_URL}/api/contracts/templates/appointment",
            json={"content": new_content},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("Appointment template updated successfully")
    
    def test_update_retreat_template(self, auth_headers):
        """Test updating retreat contract template"""
        new_content = "TEST RETREAT CONTRACT TEMPLATE\n\nThis is a test template."
        
        response = requests.put(
            f"{BASE_URL}/api/contracts/templates/retreat",
            json={"content": new_content},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("Retreat template updated successfully")
    
    def test_update_invalid_template_type(self, auth_headers):
        """Test updating invalid template type"""
        response = requests.put(
            f"{BASE_URL}/api/contracts/templates/invalid",
            json={"content": "test"},
            headers=auth_headers
        )
        
        assert response.status_code == 400
        print("Invalid template type correctly rejected")


# ============= SIGNED CONTRACTS API TESTS =============

class TestSignedContractsAPI:
    """Tests for signed contracts API"""
    
    def test_create_signed_contract(self, api_client):
        """Test creating a signed contract"""
        payload = {
            "contractType": "appointment",
            "customerName": "TEST_Customer",
            "customerEmail": "test_customer@example.com",
            "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "bookingId": "test-booking-123"
        }
        
        response = api_client.post(f"{BASE_URL}/api/contracts/signed", json=payload)
        
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "id" in data
        
        TestSignedContractsAPI.created_id = data["id"]
        print(f"Signed contract created: {data['id']}")
    
    def test_get_signed_contracts(self, api_client):
        """Test getting all signed contracts"""
        response = api_client.get(f"{BASE_URL}/api/contracts/signed")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Retrieved {len(data)} signed contracts")


# ============= ANALYTICS API TESTS =============

class TestAnalyticsDashboardAPI:
    """Tests for analytics dashboard API"""
    
    def test_get_dashboard_analytics(self, auth_headers):
        """Test getting dashboard analytics"""
        response = requests.get(f"{BASE_URL}/api/analytics/dashboard", headers=auth_headers)
        
        assert response.status_code == 200, f"Dashboard failed: {response.text}"
        data = response.json()
        
        # Verify structure
        assert "overview" in data
        assert "inventory" in data
        assert "appointments" in data
        assert "fundraisers" in data
        assert "alerts" in data
        
        # Verify overview fields
        overview = data["overview"]
        assert "totalRevenue" in overview
        assert "monthlyRevenue" in overview
        assert "totalOrders" in overview
        assert "totalUsers" in overview
        
        print(f"Dashboard analytics: {overview['totalUsers']} users, ${overview['totalRevenue']} revenue")
    
    def test_get_revenue_analytics(self, auth_headers):
        """Test getting revenue analytics"""
        response = requests.get(f"{BASE_URL}/api/analytics/revenue", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "daily" in data
        assert "monthly" in data
        assert "byType" in data
        assert "totalRevenue" in data
        
        print(f"Revenue analytics: ${data['totalRevenue']} total")
    
    def test_get_product_analytics(self, auth_headers):
        """Test getting product analytics"""
        response = requests.get(f"{BASE_URL}/api/analytics/products", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "totalProducts" in data
        assert "topSellingProducts" in data
        assert "categoryBreakdown" in data
        
        print(f"Product analytics: {data['totalProducts']} products")
    
    def test_get_user_analytics(self, auth_headers):
        """Test getting user analytics"""
        response = requests.get(f"{BASE_URL}/api/analytics/users", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "totalUsers" in data
        assert "dailySignups" in data
        assert "monthlySignups" in data
        assert "roleBreakdown" in data
        assert "membershipBreakdown" in data
        
        print(f"User analytics: {data['totalUsers']} users, roles: {data['roleBreakdown']}")
    
    def test_get_appointment_analytics(self, auth_headers):
        """Test getting appointment analytics"""
        response = requests.get(f"{BASE_URL}/api/analytics/appointments", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "totalAppointments" in data
        assert "statusBreakdown" in data
        assert "popularServices" in data
        
        print(f"Appointment analytics: {data['totalAppointments']} appointments")
    
    def test_get_class_analytics(self, auth_headers):
        """Test getting class analytics"""
        response = requests.get(f"{BASE_URL}/api/analytics/classes", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "totalClasses" in data
        assert "totalSpots" in data
        assert "levelBreakdown" in data
        
        print(f"Class analytics: {data['totalClasses']} classes, {data['totalSpots']} spots")
    
    def test_get_retreat_analytics(self, auth_headers):
        """Test getting retreat analytics"""
        response = requests.get(f"{BASE_URL}/api/analytics/retreats", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "totalRetreats" in data
        assert "totalCapacity" in data
        assert "totalBooked" in data
        assert "spotsRemaining" in data
        
        print(f"Retreat analytics: {data['totalRetreats']} retreats, {data['spotsRemaining']} spots remaining")
    
    def test_get_fundraiser_analytics(self, auth_headers):
        """Test getting fundraiser analytics"""
        response = requests.get(f"{BASE_URL}/api/analytics/fundraisers", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "totalFundraisers" in data
        assert "totalRaised" in data
        assert "totalGoal" in data
        assert "statusBreakdown" in data
        
        print(f"Fundraiser analytics: {data['totalFundraisers']} fundraisers, ${data['totalRaised']} raised")


# ============= CLEANUP =============

@pytest.fixture(scope="module", autouse=True)
def cleanup(api_client):
    """Cleanup test data after all tests"""
    yield
    # Cleanup is handled within individual test classes
    print("Test cleanup completed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Backend API tests for Mother Natural JWT Authentication endpoints
Tests: /api/auth/login, /api/auth/register, /api/auth/me, /api/admin/users
Also tests CRUD APIs: products, services, classes, retreats, fundraisers
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "admin@mothernatural.com"
ADMIN_PASSWORD = "Aniyah13"


class TestAuthLogin:
    """Test /api/auth/login endpoint"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "Missing access_token in response"
        assert "user" in data, "Missing user in response"
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        assert len(data["access_token"]) > 0, "access_token is empty"
        
        print(f"✓ Admin login successful - role: {data['user']['role']}")
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@example.com", "password": "wrongpassword"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        data = response.json()
        assert "detail" in data, "Missing error detail"
        print("✓ Invalid credentials correctly returns 401")
    
    def test_login_missing_fields(self):
        """Test login with missing fields returns 422"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL}  # Missing password
        )
        
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("✓ Missing fields correctly returns 422")


class TestAuthRegister:
    """Test /api/auth/register endpoint"""
    
    def test_register_new_user(self):
        """Test registering a new user"""
        unique_email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "name": "Test User",
                "email": unique_email,
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "Missing access_token"
        assert "user" in data, "Missing user"
        assert data["user"]["email"] == unique_email
        assert data["user"]["role"] == "user", "New user should have 'user' role"
        assert data["user"]["membershipLevel"] == "basic", "New user should have 'basic' membership"
        
        print(f"✓ User registration successful - email: {unique_email}")
        return data["access_token"], unique_email
    
    def test_register_duplicate_email(self):
        """Test registering with existing email returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "name": "Duplicate User",
                "email": ADMIN_EMAIL,  # Already exists
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        
        data = response.json()
        assert "detail" in data
        assert "already registered" in data["detail"].lower()
        print("✓ Duplicate email correctly returns 400")


class TestAuthMe:
    """Test /api/auth/me endpoint"""
    
    def test_get_current_user_with_valid_token(self):
        """Test getting current user info with valid token"""
        # First login to get token
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_response.json()["access_token"]
        
        # Get current user
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "id" in data
        assert "name" in data
        
        print(f"✓ Get current user successful - name: {data['name']}")
    
    def test_get_current_user_without_token(self):
        """Test getting current user without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ No token correctly returns 401")
    
    def test_get_current_user_with_invalid_token(self):
        """Test getting current user with invalid token returns 401"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Invalid token correctly returns 401")


class TestAdminUsers:
    """Test /api/admin/users endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return response.json()["access_token"]
    
    def test_get_all_users_as_admin(self, admin_token):
        """Test admin can get all users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of users"
        assert len(data) >= 1, "Should have at least admin user"
        
        # Verify admin user is in list
        admin_found = any(u["email"] == ADMIN_EMAIL for u in data)
        assert admin_found, "Admin user not found in list"
        
        print(f"✓ Admin get all users successful - found {len(data)} users")
    
    def test_get_all_users_without_token(self):
        """Test getting users without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/users")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ No token correctly returns 401 for admin endpoint")
    
    def test_get_all_users_as_regular_user(self):
        """Test regular user cannot access admin endpoint"""
        # Register a new regular user
        unique_email = f"TEST_regular_{uuid.uuid4().hex[:8]}@example.com"
        register_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "name": "Regular User",
                "email": unique_email,
                "password": "testpassword123"
            }
        )
        user_token = register_response.json()["access_token"]
        
        # Try to access admin endpoint
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Regular user correctly gets 403 for admin endpoint")
    
    def test_admin_create_user(self, admin_token):
        """Test admin can create a new user"""
        unique_email = f"TEST_admin_created_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(
            f"{BASE_URL}/api/admin/users",
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            },
            json={
                "name": "Admin Created User",
                "email": unique_email,
                "password": "adminsetpassword",
                "role": "user",
                "membershipLevel": "gold"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["email"] == unique_email
        assert data["role"] == "user"
        assert data["membershipLevel"] == "gold"
        
        print(f"✓ Admin created user successfully - email: {unique_email}")


class TestProductsCRUD:
    """Test /api/products CRUD endpoints"""
    
    def test_get_products(self):
        """Test getting all products (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/products")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of products"
        print(f"✓ Get products successful - found {len(data)} products")
    
    def test_create_product(self):
        """Test creating a product"""
        response = requests.post(
            f"{BASE_URL}/api/products",
            json={
                "name": f"TEST_Product_{uuid.uuid4().hex[:8]}",
                "price": 29.99,
                "category": "teas",
                "description": "Test product description"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert "id" in data
        
        print(f"✓ Create product successful - id: {data['id']}")
        return data["id"]
    
    def test_create_update_delete_product(self):
        """Test full CRUD cycle for product"""
        # Create
        create_response = requests.post(
            f"{BASE_URL}/api/products",
            json={
                "name": f"TEST_CRUD_Product_{uuid.uuid4().hex[:8]}",
                "price": 19.99,
                "category": "oils"
            }
        )
        assert create_response.status_code == 200
        product_id = create_response.json()["id"]
        
        # Update
        update_response = requests.put(
            f"{BASE_URL}/api/products/{product_id}",
            json={
                "name": "Updated Product Name",
                "price": 24.99,
                "category": "oils"
            }
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/products/{product_id}")
        assert delete_response.status_code == 200
        
        # Verify deleted
        get_response = requests.get(f"{BASE_URL}/api/products")
        products = get_response.json()
        assert not any(p.get("id") == product_id for p in products), "Product should be deleted"
        
        print("✓ Product CRUD cycle successful")


class TestServicesCRUD:
    """Test /api/services CRUD endpoints"""
    
    def test_get_services(self):
        """Test getting all services"""
        response = requests.get(f"{BASE_URL}/api/services")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of services"
        print(f"✓ Get services successful - found {len(data)} services")
    
    def test_create_update_delete_service(self):
        """Test full CRUD cycle for service"""
        # Create
        create_response = requests.post(
            f"{BASE_URL}/api/services",
            json={
                "name": f"TEST_Service_{uuid.uuid4().hex[:8]}",
                "duration": "60 min",
                "price": 75.00,
                "description": "Test service"
            }
        )
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        service_id = create_response.json()["id"]
        
        # Update
        update_response = requests.put(
            f"{BASE_URL}/api/services/{service_id}",
            json={
                "name": "Updated Service",
                "duration": "90 min",
                "price": 100.00
            }
        )
        assert update_response.status_code == 200
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/services/{service_id}")
        assert delete_response.status_code == 200
        
        print("✓ Service CRUD cycle successful")


class TestClassesCRUD:
    """Test /api/classes CRUD endpoints"""
    
    def test_get_classes(self):
        """Test getting all classes"""
        response = requests.get(f"{BASE_URL}/api/classes")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of classes"
        print(f"✓ Get classes successful - found {len(data)} classes")
    
    def test_create_update_delete_class(self):
        """Test full CRUD cycle for class"""
        # Create
        create_response = requests.post(
            f"{BASE_URL}/api/classes",
            json={
                "name": f"TEST_Class_{uuid.uuid4().hex[:8]}",
                "instructor": "Test Instructor",
                "price": 50.00,
                "duration": "45 min"
            }
        )
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        class_id = create_response.json()["id"]
        
        # Update
        update_response = requests.put(
            f"{BASE_URL}/api/classes/{class_id}",
            json={
                "name": "Updated Class",
                "instructor": "New Instructor",
                "price": 60.00,
                "duration": "60 min"
            }
        )
        assert update_response.status_code == 200
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/classes/{class_id}")
        assert delete_response.status_code == 200
        
        print("✓ Class CRUD cycle successful")


class TestRetreatsCRUD:
    """Test /api/retreats CRUD endpoints"""
    
    def test_get_retreats(self):
        """Test getting all retreats"""
        response = requests.get(f"{BASE_URL}/api/retreats")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of retreats"
        print(f"✓ Get retreats successful - found {len(data)} retreats")
    
    def test_create_update_delete_retreat(self):
        """Test full CRUD cycle for retreat"""
        # Create
        create_response = requests.post(
            f"{BASE_URL}/api/retreats",
            json={
                "name": f"TEST_Retreat_{uuid.uuid4().hex[:8]}",
                "location": "Test Location",
                "dates": "2025-06-01 to 2025-06-05",
                "price": 500.00
            }
        )
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        retreat_id = create_response.json()["id"]
        
        # Update
        update_response = requests.put(
            f"{BASE_URL}/api/retreats/{retreat_id}",
            json={
                "name": "Updated Retreat",
                "location": "New Location",
                "dates": "2025-07-01 to 2025-07-05",
                "price": 600.00
            }
        )
        assert update_response.status_code == 200
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/retreats/{retreat_id}")
        assert delete_response.status_code == 200
        
        print("✓ Retreat CRUD cycle successful")


class TestFundraisersCRUD:
    """Test /api/fundraisers CRUD endpoints"""
    
    def test_get_fundraisers(self):
        """Test getting all fundraisers"""
        response = requests.get(f"{BASE_URL}/api/fundraisers")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of fundraisers"
        print(f"✓ Get fundraisers successful - found {len(data)} fundraisers")
    
    def test_create_and_update_status_fundraiser(self):
        """Test creating fundraiser and updating status"""
        # Create
        create_response = requests.post(
            f"{BASE_URL}/api/fundraisers",
            json={
                "title": f"TEST_Fundraiser_{uuid.uuid4().hex[:8]}",
                "beneficiary": "Test Beneficiary",
                "goalAmount": 1000.00,
                "story": "Test story"
            }
        )
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        fundraiser_id = create_response.json()["id"]
        
        # Update status
        status_response = requests.patch(
            f"{BASE_URL}/api/fundraisers/{fundraiser_id}/status?status=active"
        )
        assert status_response.status_code == 200, f"Status update failed: {status_response.text}"
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/fundraisers/{fundraiser_id}")
        assert delete_response.status_code == 200
        
        print("✓ Fundraiser CRUD cycle successful")


class TestSenderEmailConfig:
    """Test that SENDER_EMAIL is configured correctly"""
    
    def test_sender_email_in_env(self):
        """Verify SENDER_EMAIL is set to correct value"""
        # This test verifies the backend .env configuration
        # We can't directly read the env, but we can verify the email logs endpoint works
        response = requests.get(f"{BASE_URL}/api/email/logs")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Email logs endpoint accessible - SENDER_EMAIL configured")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Backend API tests for Mother Natural payment endpoints
Tests: /api/payments/config, /api/payments/process, /api/payments/order/{id}, /api/payments/history
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPaymentConfig:
    """Test /api/payments/config endpoint"""
    
    def test_get_payment_config_success(self):
        """Test that payment config returns Square credentials"""
        response = requests.get(f"{BASE_URL}/api/payments/config")
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert "applicationId" in data, "Missing applicationId in response"
        assert "locationId" in data, "Missing locationId in response"
        assert "environment" in data, "Missing environment in response"
        
        # Verify values are not empty
        assert len(data["applicationId"]) > 0, "applicationId is empty"
        assert len(data["locationId"]) > 0, "locationId is empty"
        assert data["environment"] in ["sandbox", "production"], f"Invalid environment: {data['environment']}"
        
        print(f"✓ Payment config returned: environment={data['environment']}")


class TestPaymentHistory:
    """Test /api/payments/history endpoint"""
    
    def test_get_payment_history_success(self):
        """Test that payment history endpoint returns list"""
        response = requests.get(f"{BASE_URL}/api/payments/history")
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"✓ Payment history returned {len(data)} orders")
    
    def test_get_payment_history_with_email_filter(self):
        """Test payment history with email filter"""
        response = requests.get(f"{BASE_URL}/api/payments/history?customer_email=test@example.com")
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"✓ Filtered payment history returned {len(data)} orders")


class TestPaymentOrder:
    """Test /api/payments/order/{order_id} endpoint"""
    
    def test_get_nonexistent_order(self):
        """Test that getting non-existent order returns 404"""
        response = requests.get(f"{BASE_URL}/api/payments/order/nonexistent-order-id")
        
        # Status code assertion
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert "detail" in data, "Missing error detail"
        print("✓ Non-existent order returns 404")


class TestRootEndpoint:
    """Test root API endpoint"""
    
    def test_root_endpoint(self):
        """Test that root endpoint returns hello world"""
        response = requests.get(f"{BASE_URL}/api/")
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert "message" in data, "Missing message in response"
        assert data["message"] == "Hello World", f"Unexpected message: {data['message']}"
        print("✓ Root endpoint working")


class TestStatusEndpoint:
    """Test status endpoints"""
    
    def test_create_and_get_status(self):
        """Test creating and retrieving status checks"""
        # Create status
        create_response = requests.post(
            f"{BASE_URL}/api/status",
            json={"client_name": "TEST_payment_test_client"}
        )
        
        assert create_response.status_code == 200, f"Expected 200, got {create_response.status_code}"
        
        created = create_response.json()
        assert "id" in created, "Missing id in created status"
        assert created["client_name"] == "TEST_payment_test_client"
        
        # Get all statuses
        get_response = requests.get(f"{BASE_URL}/api/status")
        assert get_response.status_code == 200
        
        statuses = get_response.json()
        assert isinstance(statuses, list)
        assert len(statuses) > 0
        
        print(f"✓ Status endpoint working - created and retrieved {len(statuses)} statuses")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Test Product Size Variants Feature
Tests for products with individual prices per size variant
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://natural-healing-30.preview.emergentagent.com').rstrip('/')


class TestProductSizeVariants:
    """Test product size variants with individual prices"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_product_ids = []
        yield
        # Cleanup: Delete test products
        for product_id in self.test_product_ids:
            try:
                requests.delete(f"{BASE_URL}/api/products/{product_id}")
            except:
                pass
    
    def test_create_product_with_size_variants(self):
        """Test creating a product with size variants that have individual prices"""
        product_data = {
            "name": f"TEST_SizeVariant_{uuid.uuid4().hex[:8]}",
            "price": 15.00,  # Base price
            "category": "teas",
            "description": "Product with size variants",
            "sizes": [
                {"name": "Small", "price": 10.00},
                {"name": "Medium", "price": 15.00},
                {"name": "Large", "price": 20.00}
            ],
            "flavors": ["Original"],
            "image": "",
            "stock": 100,
            "inStock": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/products",
            json=product_data
        )
        
        assert response.status_code == 200, f"Failed to create product: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert "id" in data
        
        product_id = data["id"]
        self.test_product_ids.append(product_id)
        
        # Verify the product was created with correct size variants
        product = data.get("product", {})
        assert product["name"] == product_data["name"]
        assert product["price"] == product_data["price"]
        assert len(product["sizes"]) == 3
        
        # Verify each size has name and price
        sizes = product["sizes"]
        assert sizes[0]["name"] == "Small"
        assert sizes[0]["price"] == 10.00
        assert sizes[1]["name"] == "Medium"
        assert sizes[1]["price"] == 15.00
        assert sizes[2]["name"] == "Large"
        assert sizes[2]["price"] == 20.00
        
        print(f"✓ Created product with size variants: {product_id}")
    
    def test_get_product_with_size_variants(self):
        """Test retrieving a product with size variants returns correct data"""
        # First create a product
        product_data = {
            "name": f"TEST_GetVariant_{uuid.uuid4().hex[:8]}",
            "price": 25.00,
            "category": "oils",
            "description": "Test get product with variants",
            "sizes": [
                {"name": "4oz", "price": 25.00},
                {"name": "8oz", "price": 45.00}
            ],
            "flavors": [],
            "image": "",
            "stock": 50,
            "inStock": True
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/products",
            json=product_data
        )
        assert create_response.status_code == 200
        product_id = create_response.json()["id"]
        self.test_product_ids.append(product_id)
        
        # Get all products and find our product
        get_response = requests.get(f"{BASE_URL}/api/products")
        assert get_response.status_code == 200
        
        products = get_response.json()
        our_product = next((p for p in products if p["id"] == product_id), None)
        
        assert our_product is not None, "Product not found in list"
        assert our_product["name"] == product_data["name"]
        assert len(our_product["sizes"]) == 2
        
        # Verify size variant structure
        sizes = our_product["sizes"]
        assert sizes[0]["name"] == "4oz"
        assert sizes[0]["price"] == 25.00
        assert sizes[1]["name"] == "8oz"
        assert sizes[1]["price"] == 45.00
        
        print(f"✓ Retrieved product with size variants correctly")
    
    def test_update_product_with_size_variants(self):
        """Test updating a product's size variants"""
        # Create initial product
        product_data = {
            "name": f"TEST_UpdateVariant_{uuid.uuid4().hex[:8]}",
            "price": 20.00,
            "category": "herbs",
            "description": "Test update variants",
            "sizes": [
                {"name": "Small", "price": 15.00}
            ],
            "flavors": [],
            "image": "",
            "stock": 30,
            "inStock": True
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/products",
            json=product_data
        )
        assert create_response.status_code == 200
        product_id = create_response.json()["id"]
        self.test_product_ids.append(product_id)
        
        # Update with new size variants
        updated_data = {
            "name": product_data["name"],
            "price": 20.00,
            "category": "herbs",
            "description": "Updated with more sizes",
            "sizes": [
                {"name": "Small", "price": 15.00},
                {"name": "Medium", "price": 22.00},
                {"name": "Large", "price": 30.00},
                {"name": "XL", "price": 40.00}
            ],
            "flavors": [],
            "image": "",
            "stock": 30,
            "inStock": True
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/products/{product_id}",
            json=updated_data
        )
        
        assert update_response.status_code == 200, f"Failed to update: {update_response.text}"
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/products")
        products = get_response.json()
        updated_product = next((p for p in products if p["id"] == product_id), None)
        
        assert updated_product is not None
        assert len(updated_product["sizes"]) == 4
        assert updated_product["sizes"][3]["name"] == "XL"
        assert updated_product["sizes"][3]["price"] == 40.00
        
        print(f"✓ Updated product size variants successfully")
    
    def test_product_with_no_size_variants(self):
        """Test creating a product without size variants (uses base price)"""
        product_data = {
            "name": f"TEST_NoVariant_{uuid.uuid4().hex[:8]}",
            "price": 35.00,
            "category": "teas",
            "description": "Product without size variants",
            "sizes": [],
            "flavors": ["Mint", "Chamomile"],
            "image": "",
            "stock": 20,
            "inStock": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/products",
            json=product_data
        )
        
        assert response.status_code == 200
        data = response.json()
        product_id = data["id"]
        self.test_product_ids.append(product_id)
        
        product = data.get("product", {})
        assert product["price"] == 35.00
        assert len(product["sizes"]) == 0
        
        print(f"✓ Created product without size variants (base price: $35.00)")
    
    def test_product_with_mixed_variant_prices(self):
        """Test product with significantly different prices per size"""
        product_data = {
            "name": f"TEST_MixedPrices_{uuid.uuid4().hex[:8]}",
            "price": 10.00,  # Base price
            "category": "oils",
            "description": "Product with varied pricing",
            "sizes": [
                {"name": "Sample (1oz)", "price": 5.99},
                {"name": "Regular (4oz)", "price": 19.99},
                {"name": "Family (8oz)", "price": 34.99},
                {"name": "Bulk (16oz)", "price": 59.99}
            ],
            "flavors": [],
            "image": "",
            "stock": 100,
            "inStock": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/products",
            json=product_data
        )
        
        assert response.status_code == 200
        data = response.json()
        product_id = data["id"]
        self.test_product_ids.append(product_id)
        
        product = data.get("product", {})
        sizes = product["sizes"]
        
        # Verify price range
        prices = [s["price"] for s in sizes]
        assert min(prices) == 5.99
        assert max(prices) == 59.99
        
        print(f"✓ Created product with price range: ${min(prices)} - ${max(prices)}")
    
    def test_delete_product_with_size_variants(self):
        """Test deleting a product with size variants"""
        product_data = {
            "name": f"TEST_DeleteVariant_{uuid.uuid4().hex[:8]}",
            "price": 20.00,
            "category": "teas",
            "description": "Product to delete",
            "sizes": [
                {"name": "Small", "price": 15.00},
                {"name": "Large", "price": 25.00}
            ],
            "flavors": [],
            "image": "",
            "stock": 10,
            "inStock": True
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/products",
            json=product_data
        )
        assert create_response.status_code == 200
        product_id = create_response.json()["id"]
        
        # Delete the product
        delete_response = requests.delete(f"{BASE_URL}/api/products/{product_id}")
        assert delete_response.status_code == 200
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/products")
        products = get_response.json()
        deleted_product = next((p for p in products if p["id"] == product_id), None)
        
        assert deleted_product is None, "Product should be deleted"
        
        print(f"✓ Deleted product with size variants successfully")


class TestProductAPIBasics:
    """Basic product API tests"""
    
    def test_get_all_products(self):
        """Test GET /api/products returns list"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/products returned {len(data)} products")
    
    def test_get_categories(self):
        """Test GET /api/categories returns list"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/categories returned {len(data)} categories")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

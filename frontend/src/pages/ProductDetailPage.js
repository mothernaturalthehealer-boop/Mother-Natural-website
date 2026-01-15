import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, ArrowLeft, Star, Heart, Truck, Shield, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Handle size variants with prices
  const getSizeOptions = () => {
    if (!product?.sizes || product.sizes.length === 0) return [];
    return product.sizes.map(size => {
      if (typeof size === 'object' && size.name) {
        return { name: size.name, price: size.price };
      }
      return { name: size, price: product.price };
    });
  };

  const sizeOptions = product ? getSizeOptions() : [];
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [selectedFlavor, setSelectedFlavor] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (response.ok) {
          const products = await response.json();
          const found = products.find(p => p.id === productId);
          if (found) {
            setProduct(found);
            // Set default selections
            if (found.flavors?.length > 0) {
              setSelectedFlavor(found.flavors[0]);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      }
      setLoading(false);
    };
    loadProduct();
  }, [productId]);

  // Update size options when product loads
  useEffect(() => {
    if (product && sizeOptions.length > 0) {
      setSelectedSizeIndex(0);
    }
  }, [product]);

  const getCurrentPrice = () => {
    if (sizeOptions.length > 0 && sizeOptions[selectedSizeIndex]) {
      return sizeOptions[selectedSizeIndex].price;
    }
    return product?.price || 0;
  };

  const handleSizeChange = (value) => {
    const index = sizeOptions.findIndex(s => s.name === value);
    setSelectedSizeIndex(index >= 0 ? index : 0);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const selectedSize = sizeOptions.length > 0 ? sizeOptions[selectedSizeIndex]?.name : '';
    const currentPrice = getCurrentPrice();
    
    const variantInfo = [];
    if (selectedSize) variantInfo.push(selectedSize);
    if (selectedFlavor) variantInfo.push(selectedFlavor);
    
    const variantId = `${product.id}${selectedSize ? `-${selectedSize}` : ''}${selectedFlavor ? `-${selectedFlavor}` : ''}`;
    let displayName = product.name;
    if (variantInfo.length > 0) {
      displayName = `${product.name} (${variantInfo.join(' - ')})`;
    }
    
    // Add to cart with quantity
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: variantId,
        productId: product.id,
        name: displayName,
        price: currentPrice,
        image: product.image,
        type: 'product',
        size: selectedSize || null,
        flavor: selectedFlavor || null
      });
    }
    
    toast.success(`${quantity}x ${displayName} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => navigate('/shop')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();
  const hasMultipleSizes = sizeOptions.length > 1;
  const hasMultipleFlavors = product.flavors && product.flavors.length > 1;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/shop')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              <img
                src={product.image || 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white backdrop-blur"
              >
                <Heart className="h-5 w-5" />
              </Button>
              {product.inStock !== false && (
                <Badge className="absolute top-4 left-4 bg-green-500">In Stock</Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Rating */}
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="capitalize text-sm">
                {product.category || 'Uncategorized'}
              </Badge>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">(Reviews)</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl sm:text-4xl font-bold">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">${currentPrice.toFixed(2)}</span>
              {hasMultipleSizes && (
                <span className="text-muted-foreground">
                  (varies by size)
                </span>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground text-lg leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            <Separator />

            {/* Size Selection */}
            {hasMultipleSizes && (
              <div className="space-y-3">
                <label className="text-sm font-semibold">Select Size</label>
                <Select 
                  value={sizeOptions[selectedSizeIndex]?.name || ''} 
                  onValueChange={handleSizeChange}
                >
                  <SelectTrigger className="w-full h-12" data-testid="product-size-select">
                    <SelectValue placeholder="Choose a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeOptions.map((size) => (
                      <SelectItem key={size.name} value={size.name} className="py-3">
                        <div className="flex justify-between items-center w-full gap-8">
                          <span className="font-medium">{size.name}</span>
                          <span className="text-green-600 font-bold">${size.price.toFixed(2)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Flavor Selection */}
            {hasMultipleFlavors && (
              <div className="space-y-3">
                <label className="text-sm font-semibold">Select Flavor</label>
                <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
                  <SelectTrigger className="w-full h-12" data-testid="product-flavor-select">
                    <SelectValue placeholder="Choose a flavor" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.flavors.map((flavor) => (
                      <SelectItem key={flavor} value={flavor} className="py-3">
                        {flavor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full h-14 text-lg bg-primary hover:bg-primary-dark"
              onClick={handleAddToCart}
              disabled={product.inStock === false}
              data-testid="add-to-cart-detail"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart - ${(currentPrice * quantity).toFixed(2)}
            </Button>

            <Separator />

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center p-4">
                <CardContent className="p-0">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">Orders $50+</p>
                </CardContent>
              </Card>
              <Card className="text-center p-4">
                <CardContent className="p-0">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">100% Protected</p>
                </CardContent>
              </Card>
              <Card className="text-center p-4">
                <CardContent className="p-0">
                  <RefreshCw className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30 Day Policy</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { toast } from 'sonner';

export const ShopPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState('all');

  const products = [
    {
      id: 1,
      name: 'Lavender Calm Tea',
      description: 'Soothing herbal blend for relaxation and peaceful sleep',
      price: 18.99,
      category: 'teas',
      image: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg',
      rating: 4.8,
      inStock: true
    },
    {
      id: 2,
      name: 'Morning Energy Tea',
      description: 'Revitalizing blend to start your day with natural energy',
      price: 16.99,
      category: 'teas',
      image: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg',
      rating: 4.7,
      inStock: true
    },
    {
      id: 3,
      name: 'Digestive Harmony Tea',
      description: 'Gentle herbs to support digestive wellness',
      price: 19.99,
      category: 'teas',
      image: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg',
      rating: 4.9,
      inStock: true
    },
    {
      id: 4,
      name: 'Healing Herbal Tincture',
      description: 'Potent blend for immune support and vitality',
      price: 24.99,
      category: 'tinctures',
      image: 'https://images.pexels.com/photos/672051/pexels-photo-672051.jpeg',
      rating: 4.9,
      inStock: true
    },
    {
      id: 5,
      name: 'Stress Relief Tincture',
      description: 'Natural adaptogenic formula for stress management',
      price: 26.99,
      category: 'tinctures',
      image: 'https://images.pexels.com/photos/672051/pexels-photo-672051.jpeg',
      rating: 4.8,
      inStock: true
    },
    {
      id: 6,
      name: 'Sleep Support Tincture',
      description: 'Gentle formula to promote restful sleep',
      price: 25.99,
      category: 'tinctures',
      image: 'https://images.pexels.com/photos/672051/pexels-photo-672051.jpeg',
      rating: 4.7,
      inStock: true
    },
    {
      id: 7,
      name: 'Rose Essential Oil',
      description: 'Pure rose oil for skincare and aromatherapy',
      price: 32.99,
      category: 'oils',
      image: 'https://images.pexels.com/photos/932577/pexels-photo-932577.jpeg',
      rating: 5.0,
      inStock: true
    },
    {
      id: 8,
      name: 'Lavender Essential Oil',
      description: 'Calming lavender oil for relaxation',
      price: 28.99,
      category: 'oils',
      image: 'https://images.pexels.com/photos/932577/pexels-photo-932577.jpeg',
      rating: 4.9,
      inStock: true
    },
    {
      id: 9,
      name: 'Eucalyptus Essential Oil',
      description: 'Refreshing oil for respiratory support',
      price: 29.99,
      category: 'oils',
      image: 'https://images.pexels.com/photos/932577/pexels-photo-932577.jpeg',
      rating: 4.8,
      inStock: true
    },
    {
      id: 10,
      name: 'Healing with Herbs Book',
      description: 'Comprehensive guide to herbal medicine',
      price: 34.99,
      category: 'books',
      image: 'https://images.pexels.com/photos/1181672/pexels-photo-1181672.jpeg',
      rating: 4.9,
      inStock: true
    },
    {
      id: 11,
      name: 'Natural Remedies Guide',
      description: 'Essential handbook for home healing',
      price: 29.99,
      category: 'books',
      image: 'https://images.pexels.com/photos/1181672/pexels-photo-1181672.jpeg',
      rating: 4.8,
      inStock: true
    },
    {
      id: 12,
      name: 'Wellness Journal',
      description: 'Guided journal for your healing journey',
      price: 24.99,
      category: 'books',
      image: 'https://images.pexels.com/photos/1181672/pexels-photo-1181672.jpeg',
      rating: 4.7,
      inStock: true
    },
  ];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: 'product'
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Natural Wellness Shop</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handcrafted products infused with nature's healing power
          </p>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-12">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 h-auto">
            <TabsTrigger value="all" className="py-3">All Products</TabsTrigger>
            <TabsTrigger value="teas" className="py-3">Teas</TabsTrigger>
            <TabsTrigger value="tinctures" className="py-3">Tinctures</TabsTrigger>
            <TabsTrigger value="oils" className="py-3">Oils</TabsTrigger>
            <TabsTrigger value="books" className="py-3">Books</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-elegant transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground capitalize">
                  {product.category}
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-3 left-3 bg-white/80 hover:bg-white backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              <CardHeader className="flex-grow">
                <CardTitle className="font-heading text-lg line-clamp-1">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm">
                  {product.description}
                </CardDescription>
                <div className="flex items-center space-x-1 mt-2">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
              </CardHeader>
              
              <CardFooter className="flex flex-col space-y-3 mt-auto">
                <div className="flex items-center justify-between w-full">
                  <span className="text-2xl font-bold text-primary">${product.price}</span>
                  {product.inStock && (
                    <Badge variant="outline" className="border-success text-success">
                      In Stock
                    </Badge>
                  )}
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary-dark"
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

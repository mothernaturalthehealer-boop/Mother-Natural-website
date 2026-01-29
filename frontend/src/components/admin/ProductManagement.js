import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ImageCropUploader } from '@/components/ImageCropUploader';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const ProductManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [showEditProductDialog, setShowEditProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', category: '', description: '', sizes: [], flavors: [], image: '', stock: '', isHidden: false, lowStockThreshold: 5
  });
  // Size variant inputs (name + price)
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizePrice, setNewSizePrice] = useState('');
  const [editSizeName, setEditSizeName] = useState('');
  const [editSizePrice, setEditSizePrice] = useState('');
  // Flavor inputs
  const [newFlavorInput, setNewFlavorInput] = useState('');
  const [editFlavorInput, setEditFlavorInput] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/api/products?include_hidden=true`),
        fetch(`${API_URL}/api/categories`)
      ]);
      if (productsRes.ok) setProducts(await productsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
    } catch (error) {
      console.error('Failed to load data:', error);
      const savedProducts = localStorage.getItem('adminProducts');
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      const savedCategories = localStorage.getItem('adminCategories');
      if (savedCategories) setCategories(JSON.parse(savedCategories));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/categories?name=${encodeURIComponent(newCategory.trim())}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        toast.success('Category added successfully!');
        setNewCategory('');
        setShowAddCategoryDialog(false);
        loadData();
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to add category');
      }
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  const handleDeleteCategory = async (cat) => {
    try {
      await fetch(`${API_URL}/api/categories/${encodeURIComponent(cat)}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      toast.success('Category deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleAddSizeVariant = () => {
    if (!newSizeName.trim()) {
      toast.error('Please enter a size name');
      return;
    }
    if (!newSizePrice || parseFloat(newSizePrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    const exists = newProduct.sizes.some(s => s.name.toLowerCase() === newSizeName.trim().toLowerCase());
    if (exists) {
      toast.error('This size already exists');
      return;
    }
    setNewProduct({
      ...newProduct,
      sizes: [...newProduct.sizes, { name: newSizeName.trim(), price: parseFloat(newSizePrice) }]
    });
    setNewSizeName('');
    setNewSizePrice('');
  };

  const handleRemoveSizeVariant = (idx) => {
    setNewProduct({
      ...newProduct,
      sizes: newProduct.sizes.filter((_, i) => i !== idx)
    });
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock) || 0,
          inStock: parseInt(newProduct.stock) > 0,
          lowStockThreshold: parseInt(newProduct.lowStockThreshold) || 5,
          category: newProduct.category || (categories[0]?.toLowerCase() || ''),
          image: newProduct.image || 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'
        })
      });
      if (response.ok) {
        toast.success('Product added successfully!');
        setShowAddProductDialog(false);
        setNewProduct({ name: '', price: '', category: '', description: '', sizes: [], flavors: [], image: '', stock: '', lowStockThreshold: 5 });
        setNewSizeName('');
        setNewSizePrice('');
        loadData();
      } else {
        toast.error('Failed to add product');
      }
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const handleEditProduct = (product) => {
    // Convert old format sizes (strings) to new format (objects with name and price)
    const convertedSizes = (product.sizes || []).map(size => {
      if (typeof size === 'string') {
        return { name: size, price: product.price };
      }
      return size;
    });
    setEditingProduct({ ...product, sizes: convertedSizes });
    setShowEditProductDialog(true);
  };

  const handleEditAddSizeVariant = () => {
    if (!editSizeName.trim()) {
      toast.error('Please enter a size name');
      return;
    }
    if (!editSizePrice || parseFloat(editSizePrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    const exists = editingProduct.sizes?.some(s => s.name.toLowerCase() === editSizeName.trim().toLowerCase());
    if (exists) {
      toast.error('This size already exists');
      return;
    }
    setEditingProduct({
      ...editingProduct,
      sizes: [...(editingProduct.sizes || []), { name: editSizeName.trim(), price: parseFloat(editSizePrice) }]
    });
    setEditSizeName('');
    setEditSizePrice('');
  };

  const handleEditRemoveSizeVariant = (idx) => {
    setEditingProduct({
      ...editingProduct,
      sizes: editingProduct.sizes.filter((_, i) => i !== idx)
    });
  };

  const handleSaveEditedProduct = async () => {
    if (!editingProduct.name || !editingProduct.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ 
          ...editingProduct, 
          price: parseFloat(editingProduct.price),
          stock: parseInt(editingProduct.stock) || 0,
          inStock: parseInt(editingProduct.stock) > 0,
          lowStockThreshold: parseInt(editingProduct.lowStockThreshold) || 5
        })
      });
      if (response.ok) {
        toast.success('Product updated successfully');
        setShowEditProductDialog(false);
        setEditingProduct(null);
        setEditSizeName('');
        setEditSizePrice('');
        loadData();
      } else {
        toast.error('Failed to update product');
      }
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await fetch(`${API_URL}/api/products/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      toast.success('Product deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  // Helper to get price display for a product
  const getPriceDisplay = (product) => {
    if (product.sizes && product.sizes.length > 0) {
      const prices = product.sizes.map(s => typeof s === 'object' ? s.price : product.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        return `$${minPrice.toFixed(2)}`;
      }
      return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    }
    return `$${(product.price || 0).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Categories Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-heading text-2xl">Product Categories</CardTitle>
            <CardDescription>Manage your product categories</CardDescription>
          </div>
          <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
            <Button onClick={() => setShowAddCategoryDialog(true)} variant="outline"><Plus className="h-4 w-4 mr-2" />Add Category</Button>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">Add New Category</DialogTitle>
                <DialogDescription>Enter a name for the new category.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="catName">Category Name *</Label>
                  <Input id="catName" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="e.g., Oils, Herbs" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddCategoryDialog(false)}>Cancel</Button>
                <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary-dark">Add Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground">No categories yet. Add one to get started.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge key={cat} variant="secondary" className="px-3 py-1 text-sm">
                  {cat}
                  <button onClick={() => handleDeleteCategory(cat)} className="ml-2 text-muted-foreground hover:text-destructive">×</button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-heading text-2xl">Products</CardTitle>
            <CardDescription>{products.length} products in your shop</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
            </Button>
            <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
              <Button onClick={() => setShowAddProductDialog(true)} className="bg-primary hover:bg-primary-dark"><Plus className="h-4 w-4 mr-2" />Add Product</Button>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-heading">Add New Product</DialogTitle>
                  <DialogDescription>Fill in the product details below.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input id="name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g., Organic Lavender Oil" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Base Price ($) *</Label>
                    <Input id="price" type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="19.99" />
                    <p className="text-xs text-muted-foreground">This is the default price. Size variants below can have different prices.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Count *</Label>
                    <Input id="stock" type="number" min="0" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="100" />
                    <p className="text-xs text-muted-foreground">Number of items available. Customers will see stock availability.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Alert Threshold</Label>
                    <Input id="lowStockThreshold" type="number" min="1" value={newProduct.lowStockThreshold} onChange={(e) => setNewProduct({ ...newProduct, lowStockThreshold: e.target.value })} placeholder="5" />
                    <p className="text-xs text-muted-foreground">Get notified when stock falls below this number.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    {categories.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-2 border rounded-md bg-muted">No categories yet. Please add categories first.</p>
                    ) : (
                      <select id="category" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                        {categories.map((cat) => (<option key={cat} value={cat.toLowerCase()}>{cat}</option>))}
                      </select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Product description..." rows={3} />
                  </div>
                  
                  {/* Size Variants with Prices */}
                  <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
                    <Label className="text-base font-semibold">Size Variants with Prices</Label>
                    <p className="text-xs text-muted-foreground">Add different sizes with their own prices (e.g., Small $10, Large $20).</p>
                    <div className="flex gap-2">
                      <Input 
                        value={newSizeName} 
                        onChange={(e) => setNewSizeName(e.target.value)} 
                        placeholder="Size name (e.g., Small, 4oz)" 
                        className="flex-1"
                      />
                      <Input 
                        type="number" 
                        step="0.01"
                        value={newSizePrice} 
                        onChange={(e) => setNewSizePrice(e.target.value)} 
                        placeholder="Price"
                        className="w-24"
                      />
                      <Button type="button" variant="outline" onClick={handleAddSizeVariant}>Add</Button>
                    </div>
                    {newProduct.sizes.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {newProduct.sizes.map((size, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-background p-2 rounded border">
                            <span className="font-medium">{size.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 font-semibold">${size.price.toFixed(2)}</span>
                              <button 
                                type="button" 
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveSizeVariant(idx)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Flavors */}
                  <div className="space-y-2">
                    <Label>Flavors (Optional)</Label>
                    <p className="text-xs text-muted-foreground">Add multiple flavors if this product comes in different flavors.</p>
                    <div className="flex gap-2">
                      <Input value={newFlavorInput} onChange={(e) => setNewFlavorInput(e.target.value)} placeholder="e.g., Vanilla, Lavender" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newFlavorInput.trim() && !newProduct.flavors.includes(newFlavorInput.trim())) { setNewProduct({ ...newProduct, flavors: [...newProduct.flavors, newFlavorInput.trim()] }); setNewFlavorInput(''); }}}} />
                      <Button type="button" variant="outline" onClick={() => { if (newFlavorInput.trim() && !newProduct.flavors.includes(newFlavorInput.trim())) { setNewProduct({ ...newProduct, flavors: [...newProduct.flavors, newFlavorInput.trim()] }); setNewFlavorInput(''); }}}>Add</Button>
                    </div>
                    {newProduct.flavors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newProduct.flavors.map((flavor, idx) => (
                          <Badge key={idx} variant="secondary" className="px-3 py-1">{flavor}<button type="button" className="ml-2 text-muted-foreground hover:text-destructive" onClick={() => setNewProduct({ ...newProduct, flavors: newProduct.flavors.filter((_, i) => i !== idx) })}>×</button></Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <ImageCropUploader
                    label="Product Image"
                    currentImage={newProduct.image}
                    onImageUploaded={(url) => setNewProduct({ ...newProduct, image: url })}
                    aspectRatio={1}
                  />

                  {/* Hidden Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        {newProduct.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        Hide from Customers
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Hidden products won't appear on your shop until you're ready
                      </p>
                    </div>
                    <Switch
                      checked={newProduct.isHidden || false}
                      onCheckedChange={(checked) => setNewProduct({ ...newProduct, isHidden: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddProductDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary-dark">Add Product</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No products yet. Click &quot;Add Product&quot; to get started.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className={product.isHidden ? 'opacity-60' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{product.category || 'uncategorized'}</Badge></TableCell>
                    <TableCell className="font-semibold text-green-600">{getPriceDisplay(product)}</TableCell>
                    <TableCell>
                      {product.stock > 0 ? (
                        <Badge variant={product.stock <= 5 ? "destructive" : "secondary"}>
                          {product.stock} in stock
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Out of stock</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.isHidden ? (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">Hidden</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-300">Visible</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes?.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {product.sizes.length} size{product.sizes.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {product.flavors?.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {product.flavors.length} flavor{product.flavors.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {(!product.sizes?.length && !product.flavors?.length) && <span className="text-muted-foreground">-</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={showEditProductDialog} onOpenChange={setShowEditProductDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Product</DialogTitle>
            <DialogDescription>Update the product details below.</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editProductName">Product Name *</Label>
                <Input id="editProductName" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editProductPrice">Base Price ($) *</Label>
                <Input id="editProductPrice" type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} />
                <p className="text-xs text-muted-foreground">This is the default price when no size variant is selected.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editProductStock">Stock Count *</Label>
                <Input id="editProductStock" type="number" min="0" value={editingProduct.stock || ''} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} placeholder="100" />
                <p className="text-xs text-muted-foreground">Number of items available. Customers will see stock availability.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLowStockThreshold">Low Stock Alert Threshold</Label>
                <Input id="editLowStockThreshold" type="number" min="1" value={editingProduct.lowStockThreshold || 5} onChange={(e) => setEditingProduct({ ...editingProduct, lowStockThreshold: e.target.value })} placeholder="5" />
                <p className="text-xs text-muted-foreground">Get notified when stock falls below this number.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editProductCategory">Category</Label>
                <select id="editProductCategory" value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                  {categories.map((cat) => (<option key={cat} value={cat.toLowerCase()}>{cat}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editProductDesc">Description</Label>
                <Textarea id="editProductDesc" value={editingProduct.description || ''} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={3} />
              </div>

              {/* Size Variants with Prices */}
              <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
                <Label className="text-base font-semibold">Size Variants with Prices</Label>
                <p className="text-xs text-muted-foreground">Each size can have its own price.</p>
                <div className="flex gap-2">
                  <Input 
                    value={editSizeName} 
                    onChange={(e) => setEditSizeName(e.target.value)} 
                    placeholder="Size name" 
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    step="0.01"
                    value={editSizePrice} 
                    onChange={(e) => setEditSizePrice(e.target.value)} 
                    placeholder="Price"
                    className="w-24"
                  />
                  <Button type="button" variant="outline" onClick={handleEditAddSizeVariant}>Add</Button>
                </div>
                {editingProduct.sizes?.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {editingProduct.sizes.map((size, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-background p-2 rounded border">
                        <span className="font-medium">{typeof size === 'object' ? size.name : size}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-semibold">
                            ${(typeof size === 'object' ? size.price : editingProduct.price).toFixed(2)}
                          </span>
                          <button 
                            type="button" 
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleEditRemoveSizeVariant(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Flavors */}
              <div className="space-y-2">
                <Label>Flavors</Label>
                <div className="flex gap-2">
                  <Input value={editFlavorInput} onChange={(e) => setEditFlavorInput(e.target.value)} placeholder="Add flavor" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (editFlavorInput.trim() && !editingProduct.flavors?.includes(editFlavorInput.trim())) { setEditingProduct({ ...editingProduct, flavors: [...(editingProduct.flavors || []), editFlavorInput.trim()] }); setEditFlavorInput(''); }}}} />
                  <Button type="button" variant="outline" onClick={() => { if (editFlavorInput.trim() && !editingProduct.flavors?.includes(editFlavorInput.trim())) { setEditingProduct({ ...editingProduct, flavors: [...(editingProduct.flavors || []), editFlavorInput.trim()] }); setEditFlavorInput(''); }}}>Add</Button>
                </div>
                {editingProduct.flavors?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingProduct.flavors.map((flavor, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1">{flavor}<button type="button" className="ml-2 text-muted-foreground hover:text-destructive" onClick={() => setEditingProduct({ ...editingProduct, flavors: editingProduct.flavors.filter((_, i) => i !== idx) })}>×</button></Badge>
                    ))}
                  </div>
                )}
              </div>

              <ImageCropUploader
                label="Product Image"
                currentImage={editingProduct.image || ''}
                onImageUploaded={(url) => setEditingProduct({ ...editingProduct, image: url })}
                aspectRatio={1}
              />

              {/* Hidden Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    {editingProduct.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    Hide from Customers
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Hidden products won't appear on your shop until you're ready
                  </p>
                </div>
                <Switch
                  checked={editingProduct.isHidden || false}
                  onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isHidden: checked })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProductDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEditedProduct} className="bg-primary hover:bg-primary-dark">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

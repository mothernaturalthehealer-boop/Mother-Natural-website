import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ImageUpload } from '@/components/ImageUpload';

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
    name: '', price: '', category: '', description: '', sizes: [], flavors: [], image: ''
  });
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newFlavorInput, setNewFlavorInput] = useState('');
  const [editSizeInput, setEditSizeInput] = useState('');
  const [editFlavorInput, setEditFlavorInput] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/categories`)
      ]);
      if (productsRes.ok) setProducts(await productsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
    } catch (error) {
      console.error('Failed to load data:', error);
      // Fallback to localStorage
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
          category: newProduct.category || (categories[0]?.toLowerCase() || ''),
          image: newProduct.image || 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'
        })
      });
      if (response.ok) {
        toast.success('Product added successfully!');
        setShowAddProductDialog(false);
        setNewProduct({ name: '', price: '', category: '', description: '', sizes: [], flavors: [], image: '' });
        setNewSizeInput('');
        setNewFlavorInput('');
        loadData();
      } else {
        toast.error('Failed to add product');
      }
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product, sizes: product.sizes || [], flavors: product.flavors || [], image: product.image || '' });
    setEditSizeInput('');
    setEditFlavorInput('');
    setShowEditProductDialog(true);
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
        body: JSON.stringify({ ...editingProduct, price: parseFloat(editingProduct.price) })
      });
      if (response.ok) {
        toast.success('Product updated successfully');
        setShowEditProductDialog(false);
        setEditingProduct(null);
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

  return (
    <div className="space-y-4">
      {/* Categories Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-heading text-xl">Product Categories</CardTitle>
            <CardDescription>Manage your product categories</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
            </Button>
            <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
              <Button onClick={() => setShowAddCategoryDialog(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />Add Category
              </Button>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>Create a new product category</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">Category Name</Label>
                    <Input
                      id="categoryName"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="e.g., Teas, Oils, Tinctures"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddCategoryDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary-dark">Add Category</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No categories yet. Add your first category above.</p>
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
            <CardDescription>Manage your shop products</CardDescription>
          </div>
          <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
            <Button onClick={() => setShowAddProductDialog(true)} className="bg-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />Add Product
            </Button>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading">Add New Product</DialogTitle>
                <DialogDescription>Add a new product to your shop</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input id="productName" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g., Lavender Calm Tea" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input id="price" type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="19.99" />
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
                <div className="space-y-2">
                  <Label>Sizes (Optional)</Label>
                  <p className="text-xs text-muted-foreground">Add multiple sizes if this product comes in different sizes.</p>
                  <div className="flex gap-2">
                    <Input value={newSizeInput} onChange={(e) => setNewSizeInput(e.target.value)} placeholder="e.g., Small, 4oz" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newSizeInput.trim() && !newProduct.sizes.includes(newSizeInput.trim())) { setNewProduct({ ...newProduct, sizes: [...newProduct.sizes, newSizeInput.trim()] }); setNewSizeInput(''); }}}} />
                    <Button type="button" variant="outline" onClick={() => { if (newSizeInput.trim() && !newProduct.sizes.includes(newSizeInput.trim())) { setNewProduct({ ...newProduct, sizes: [...newProduct.sizes, newSizeInput.trim()] }); setNewSizeInput(''); }}}>Add</Button>
                  </div>
                  {newProduct.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newProduct.sizes.map((size, idx) => (
                        <Badge key={idx} variant="secondary" className="px-3 py-1">{size}<button type="button" className="ml-2 text-muted-foreground hover:text-destructive" onClick={() => setNewProduct({ ...newProduct, sizes: newProduct.sizes.filter((_, i) => i !== idx) })}>×</button></Badge>
                      ))}
                    </div>
                  )}
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="productImage">Image URL (Optional)</Label>
                  <Input id="productImage" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} placeholder="https://example.com/image.jpg" />
                  <p className="text-xs text-muted-foreground">Paste a URL to an image. Leave empty for default image.</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddProductDialog(false)}>Cancel</Button>
                <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary-dark">Add Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <TableHead>Variants</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{product.category}</Badge></TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {product.sizes?.length > 0 && <span className="text-muted-foreground">Sizes: {product.sizes.join(', ')}</span>}
                        {product.flavors?.length > 0 && <span className="text-muted-foreground">Flavors: {product.flavors.join(', ')}</span>}
                        {(!product.sizes || product.sizes.length === 0) && (!product.flavors || product.flavors.length === 0) && <span className="text-muted-foreground">-</span>}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{product.description || '-'}</TableCell>
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
            <DialogDescription>Update product details</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editProductName">Product Name *</Label>
                <Input id="editProductName" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editProductPrice">Price ($) *</Label>
                <Input id="editProductPrice" type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} />
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
              <div className="space-y-2">
                <Label>Sizes</Label>
                <div className="flex gap-2">
                  <Input value={editSizeInput} onChange={(e) => setEditSizeInput(e.target.value)} placeholder="Add size" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (editSizeInput.trim() && !editingProduct.sizes?.includes(editSizeInput.trim())) { setEditingProduct({ ...editingProduct, sizes: [...(editingProduct.sizes || []), editSizeInput.trim()] }); setEditSizeInput(''); }}}} />
                  <Button type="button" variant="outline" onClick={() => { if (editSizeInput.trim() && !editingProduct.sizes?.includes(editSizeInput.trim())) { setEditingProduct({ ...editingProduct, sizes: [...(editingProduct.sizes || []), editSizeInput.trim()] }); setEditSizeInput(''); }}}>Add</Button>
                </div>
                {editingProduct.sizes?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingProduct.sizes.map((size, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1">{size}<button type="button" className="ml-2 text-muted-foreground hover:text-destructive" onClick={() => setEditingProduct({ ...editingProduct, sizes: editingProduct.sizes.filter((_, i) => i !== idx) })}>×</button></Badge>
                    ))}
                  </div>
                )}
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="editProductImage">Image URL</Label>
                <Input id="editProductImage" value={editingProduct.image || ''} onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })} placeholder="https://example.com/image.jpg" />
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

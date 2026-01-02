import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package, Users, Calendar, Mountain, Settings } from 'lucide-react';

export const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'teas',
    description: ''
  });

  const [fundraisers, setFundraisers] = useState([]);
  const [showAddFundraiserDialog, setShowAddFundraiserDialog] = useState(false);
  const [newFundraiser, setNewFundraiser] = useState({
    title: '',
    beneficiary: '',
    story: '',
    goalAmount: '',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    endDate: ''
  });

  // Load fundraisers from localStorage
  useEffect(() => {
    const savedFundraisers = localStorage.getItem('fundraisers');
    if (savedFundraisers) {
      setFundraisers(JSON.parse(savedFundraisers));
    }
  }, []);

  const [products, setProducts] = useState([
    { id: 1, name: 'Lavender Calm Tea', price: 18.99, category: 'Teas', stock: 45 },
    { id: 2, name: 'Healing Herbal Tincture', price: 24.99, category: 'Tinctures', stock: 32 },
    { id: 3, name: 'Rose Essential Oil', price: 32.99, category: 'Oils', stock: 28 },
    { id: 4, name: 'Healing with Herbs Book', price: 34.99, category: 'Books', stock: 15 },
  ]);

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const stats = [
    { label: 'Total Products', value: '48', icon: Package, color: 'text-primary' },
    { label: 'Active Users', value: '1,234', icon: Users, color: 'text-accent' },
    { label: 'Appointments', value: '87', icon: Calendar, color: 'text-secondary' },
    { label: 'Retreats Booked', value: '23', icon: Mountain, color: 'text-natural' },
  ];

  const recentOrders = [
    { id: '1001', customer: 'Sarah Johnson', total: 51.98, status: 'Shipped', date: 'June 10, 2024' },
    { id: '1002', customer: 'Michael Chen', total: 189.00, status: 'Processing', date: 'June 11, 2024' },
    { id: '1003', customer: 'Jennifer Lee', total: 24.99, status: 'Delivered', date: 'June 9, 2024' },
  ];

  const appointments = [
    { id: 1, client: 'Emma Williams', service: 'Energy Healing', date: 'June 15, 2024', time: '2:00 PM' },
    { id: 2, client: 'Lisa Martinez', service: 'Health Consultation', date: 'June 16, 2024', time: '10:00 AM' },
  ];

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const product = {
      id: products.length + 1,
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      stock: 0
    };

    setProducts([...products, product]);
    toast.success('Product added successfully!');
    setShowAddProductDialog(false);
    setNewProduct({ name: '', price: '', category: 'teas', description: '' });
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success('Product deleted successfully');
  };

  const handleAddFundraiser = () => {
    if (!newFundraiser.title || !newFundraiser.beneficiary || !newFundraiser.goalAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const fundraiser = {
      id: Date.now(),
      title: newFundraiser.title,
      beneficiary: newFundraiser.beneficiary,
      story: newFundraiser.story,
      goalAmount: parseFloat(newFundraiser.goalAmount),
      raisedAmount: 0,
      image: newFundraiser.image,
      createdDate: new Date().toISOString().split('T')[0],
      endDate: newFundraiser.endDate,
      status: 'active',
      contributors: 0
    };

    const updatedFundraisers = [...fundraisers, fundraiser];
    setFundraisers(updatedFundraisers);
    localStorage.setItem('fundraisers', JSON.stringify(updatedFundraisers));
    
    toast.success('Fundraiser created successfully!');
    setShowAddFundraiserDialog(false);
    setNewFundraiser({
      title: '',
      beneficiary: '',
      story: '',
      goalAmount: '',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      endDate: ''
    });
  };

  const handleDeleteFundraiser = (id) => {
    const updatedFundraisers = fundraisers.filter(f => f.id !== id);
    setFundraisers(updatedFundraisers);
    localStorage.setItem('fundraisers', JSON.stringify(updatedFundraisers));
    toast.success('Fundraiser deleted successfully');
  };

  const handleToggleFundraiserStatus = (id) => {
    const updatedFundraisers = fundraisers.map(f => {
      if (f.id === id) {
        return { ...f, status: f.status === 'active' ? 'closed' : 'active' };
      }
      return f;
    });
    setFundraisers(updatedFundraisers);
    localStorage.setItem('fundraisers', JSON.stringify(updatedFundraisers));
    toast.success('Fundraiser status updated');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your wellness platform</p>
          </div>
          <Settings className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="fundraisers">Fundraisers</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-2xl">Products</CardTitle>
                    <CardDescription>Manage your product catalog</CardDescription>
                  </div>
                  <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary-dark">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-heading">Add New Product</DialogTitle>
                        <DialogDescription>
                          Create a new product in your catalog
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="productName">Product Name</Label>
                          <Input
                            id="productName"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            placeholder="e.g., Lavender Calm Tea"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            placeholder="19.99"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <select
                            id="category"
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          >
                            <option value="teas">Teas</option>
                            <option value="tinctures">Tinctures</option>
                            <option value="oils">Oils</option>
                            <option value="books">Books</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            placeholder="Product description..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddProductDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary-dark">
                          Add Product
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock > 20 ? 'default' : 'destructive'}>
                            {product.stock} units
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Recent Orders</CardTitle>
                <CardDescription>Manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>${order.total}</TableCell>
                        <TableCell>
                          <Badge
                            variant={order.status === 'Delivered' ? 'default' : 'outline'}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Upcoming Appointments</CardTitle>
                <CardDescription>Manage client bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium">{apt.client}</TableCell>
                        <TableCell>{apt.service}</TableCell>
                        <TableCell>{apt.date}</TableCell>
                        <TableCell>{apt.time}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-2xl">User Management</CardTitle>
                <CardDescription>Manage community members</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-12">
                  User management features coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

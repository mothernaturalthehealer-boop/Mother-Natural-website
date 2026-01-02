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

    // Load contract templates
    const savedContracts = localStorage.getItem('contractTemplates');
    if (savedContracts) {
      setContractTemplates(JSON.parse(savedContracts));
    } else {
      setContractTemplates(defaultContractTemplates);
    }

    // Load signed contracts
    const savedSignedContracts = localStorage.getItem('signedContracts');
    if (savedSignedContracts) {
      setSignedContracts(JSON.parse(savedSignedContracts));
    }

    // Load emergency requests
    const savedEmergencyRequests = localStorage.getItem('emergencyRequests');
    if (savedEmergencyRequests) {
      setEmergencyRequests(JSON.parse(savedEmergencyRequests));
    }
  }, []);

  const [contractTemplates, setContractTemplates] = useState({});
  const [signedContracts, setSignedContracts] = useState([]);
  const [editingContract, setEditingContract] = useState(null);
  const [showEditContractDialog, setShowEditContractDialog] = useState(false);

  const defaultContractTemplates = {
    appointment: `APPOINTMENT BOOKING AGREEMENT\n\nThis agreement is between Mother Natural: The Healing Lab and the client for appointment booking services.\n\n1. CANCELLATION POLICY\n- Cancellations must be made at least 24 hours in advance\n- Cancellations made less than 24 hours before the scheduled appointment will result in a 50% charge\n- No-shows will be charged the full appointment fee\n\n2. RESCHEDULING\n- Appointments may be rescheduled up to 24 hours in advance at no charge\n- Late arrivals may result in shortened appointment time\n\n3. PAYMENT TERMS\n- Payment is due at the time of booking\n- Accepted payment methods include credit/debit cards\n\n4. HEALTH & WELLNESS\n- Client agrees to disclose any relevant health conditions\n- Services are complementary and not a substitute for medical care\n- Client releases Mother Natural from liability for any adverse reactions\n\n5. CONDUCT\n- Client agrees to maintain respectful behavior during appointments\n- Mother Natural reserves the right to refuse service\n\nBy signing below, you acknowledge that you have read, understood, and agree to these terms.`,
    retreat: `RETREAT BOOKING AGREEMENT\n\nThis agreement is between Mother Natural: The Healing Lab and the client for retreat booking services.\n\n1. CANCELLATION & REFUND POLICY\n- Cancellations more than 60 days before retreat: Full refund minus $100 processing fee\n- Cancellations 30-60 days before retreat: 50% refund\n- Cancellations less than 30 days before retreat: No refund\n- Deposits are non-refundable\n\n2. PAYMENT TERMS\n- Payment plans available as specified during booking\n- Final payment must be received 30 days before retreat start date\n- Failure to complete payment may result in forfeiture of booking\n\n3. PARTICIPANT RESPONSIBILITIES\n- Participants must be in reasonable health to participate\n- Special dietary requirements must be communicated at least 14 days in advance\n- Participants are responsible for their own travel arrangements and insurance\n\n4. RETREAT POLICIES\n- Participants agree to follow retreat schedule and guidelines\n- Use of alcohol or illegal substances is prohibited\n- Disruptive behavior may result in removal without refund\n\n5. LIABILITY WAIVER\n- Client acknowledges physical activities and releases Mother Natural from liability\n- Client is responsible for their own health insurance\n- Mother Natural is not liable for lost or stolen personal items\n\n6. CHANGES TO RETREAT\n- Mother Natural reserves the right to modify retreat schedule due to weather or circumstances\n- In case of retreat cancellation by Mother Natural, full refund will be provided\n\nBy signing below, you acknowledge that you have read, understood, and agree to these terms.`
  };

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

  const handleEditContract = (type) => {
    setEditingContract({
      type: type,
      text: contractTemplates[type] || defaultContractTemplates[type]
    });
    setShowEditContractDialog(true);
  };

  const handleSaveContract = () => {
    if (!editingContract.text.trim()) {
      toast.error('Contract cannot be empty');
      return;
    }

    const updatedTemplates = {
      ...contractTemplates,
      [editingContract.type]: editingContract.text
    };
    setContractTemplates(updatedTemplates);
    localStorage.setItem('contractTemplates', JSON.stringify(updatedTemplates));
    
    toast.success('Contract template updated successfully!');
    setShowEditContractDialog(false);
    setEditingContract(null);
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
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="fundraisers">Fundraisers</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
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

          {/* Fundraisers Tab */}
          <TabsContent value="fundraisers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-2xl">Fundraisers</CardTitle>
                    <CardDescription>Manage community fundraisers</CardDescription>
                  </div>
                  <Dialog open={showAddFundraiserDialog} onOpenChange={setShowAddFundraiserDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary-dark">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Fundraiser
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="font-heading">Create New Fundraiser</DialogTitle>
                        <DialogDescription>
                          Set up a fundraiser to support a community member in need
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="fundraiserTitle">Fundraiser Title *</Label>
                          <Input
                            id="fundraiserTitle"
                            value={newFundraiser.title}
                            onChange={(e) => setNewFundraiser({ ...newFundraiser, title: e.target.value })}
                            placeholder="e.g., Support Sarah's Healing Journey"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="beneficiary">Beneficiary Name *</Label>
                          <Input
                            id="beneficiary"
                            value={newFundraiser.beneficiary}
                            onChange={(e) => setNewFundraiser({ ...newFundraiser, beneficiary: e.target.value })}
                            placeholder="e.g., Sarah Johnson"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="goalAmount">Goal Amount ($) *</Label>
                          <Input
                            id="goalAmount"
                            type="number"
                            value={newFundraiser.goalAmount}
                            onChange={(e) => setNewFundraiser({ ...newFundraiser, goalAmount: e.target.value })}
                            placeholder="5000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date *</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={newFundraiser.endDate}
                            onChange={(e) => setNewFundraiser({ ...newFundraiser, endDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="story">Story/Description *</Label>
                          <Textarea
                            id="story"
                            value={newFundraiser.story}
                            onChange={(e) => setNewFundraiser({ ...newFundraiser, story: e.target.value })}
                            placeholder="Share the beneficiary's story and how funds will help..."
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl">Image URL (optional)</Label>
                          <Input
                            id="imageUrl"
                            value={newFundraiser.image}
                            onChange={(e) => setNewFundraiser({ ...newFundraiser, image: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddFundraiserDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddFundraiser} className="bg-primary hover:bg-primary-dark">
                          Create Fundraiser
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {fundraisers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No fundraisers created yet. Click "Create Fundraiser" to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Beneficiary</TableHead>
                        <TableHead>Goal</TableHead>
                        <TableHead>Raised</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fundraisers.map((fundraiser) => (
                        <TableRow key={fundraiser.id}>
                          <TableCell className="font-medium">{fundraiser.title}</TableCell>
                          <TableCell>{fundraiser.beneficiary}</TableCell>
                          <TableCell>${fundraiser.goalAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-semibold">${fundraiser.raisedAmount.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round((fundraiser.raisedAmount / fundraiser.goalAmount) * 100)}% funded
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={fundraiser.status === 'active' ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => handleToggleFundraiserStatus(fundraiser.id)}
                            >
                              {fundraiser.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{fundraiser.endDate}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteFundraiser(fundraiser.id)}
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contract Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Contract Templates</CardTitle>
                  <CardDescription>Edit your booking agreement templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Appointment Contract</CardTitle>
                      <CardDescription>Used for all appointment bookings</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleEditContract('appointment')}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Template
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="border-secondary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Retreat Contract</CardTitle>
                      <CardDescription>Used for all retreat bookings</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleEditContract('retreat')}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Template
                      </Button>
                    </CardFooter>
                  </Card>
                </CardContent>
              </Card>

              {/* Signed Contracts */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Signed Contracts</CardTitle>
                  <CardDescription>View all client agreements ({signedContracts.length} total)</CardDescription>
                </CardHeader>
                <CardContent>
                  {signedContracts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No signed contracts yet
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {signedContracts.slice().reverse().map((contract) => (
                        <Card key={contract.id} className="border-border/50">
                          <CardHeader className="py-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-sm capitalize">{contract.type} Contract</CardTitle>
                                <CardDescription className="text-xs mt-1">
                                  Signed: {new Date(contract.signedDate).toLocaleDateString()}
                                </CardDescription>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {contract.bookingDetails.service || contract.bookingDetails.retreat}
                              </Badge>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Edit Contract Dialog */}
            <Dialog open={showEditContractDialog} onOpenChange={setShowEditContractDialog}>
              <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">
                    Edit {editingContract?.type === 'appointment' ? 'Appointment' : 'Retreat'} Contract
                  </DialogTitle>
                  <DialogDescription>
                    This contract will be shown to clients before they complete their booking
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="contractText" className="text-base font-semibold mb-2 block">
                    Contract Text
                  </Label>
                  <Textarea
                    id="contractText"
                    value={editingContract?.text || ''}
                    onChange={(e) => setEditingContract({ ...editingContract, text: e.target.value })}
                    rows={20}
                    className="font-mono text-sm"
                    placeholder="Enter your contract terms..."
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Tip: Use clear language and include cancellation policy, payment terms, and liability information
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditContractDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveContract} className="bg-primary hover:bg-primary-dark">
                    Save Contract Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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

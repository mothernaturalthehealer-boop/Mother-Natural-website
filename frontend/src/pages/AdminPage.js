import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Package, Users, Calendar, Mountain, Settings, Check, BarChart3, Receipt, Bell, Gamepad2 } from 'lucide-react';

// Import admin management components
import {
  ProductManagement,
  ServiceManagement,
  ClassManagement,
  RetreatManagement,
  FundraiserManagement,
  UserManagement,
  AppointmentManagement,
  OrderManagement,
  EmergencyManagement,
  CommunityManagement,
  ContractManagement,
  AnalyticsDashboard
} from '@/components/admin';
import { TaxSettings } from '@/components/admin/TaxSettings';
import { NotificationSettings } from '@/components/admin/NotificationSettings';

export const AdminPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [adminSettings, setAdminSettings] = useState({
    businessName: 'Mother Natural: The Healing Lab',
    contactEmail: 'admin@mothernatural.com',
    contactPhone: '',
    notificationsEnabled: true
  });

  // Stats for dashboard
  const [stats, setStats] = useState({
    products: 0,
    services: 0,
    users: 0,
    orders: 0,
    appointments: 0,
    retreats: 0
  });

  // Check authentication and admin role
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      toast.error('Please login to access the admin panel');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
  }, [user, loading, navigate]);

  // Load stats from database
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/dashboard`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            products: data.inventory?.products || 0,
            services: data.inventory?.services || 0,
            users: data.overview?.totalUsers || 0,
            orders: data.overview?.totalOrders || 0,
            appointments: data.appointments?.total || 0,
            retreats: data.inventory?.retreats || 0
          });
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
        // Fallback to localStorage
        const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
        const services = JSON.parse(localStorage.getItem('adminServices') || '[]');
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const appointments = JSON.parse(localStorage.getItem('userAppointments') || '[]');
        const retreats = JSON.parse(localStorage.getItem('adminRetreats') || '[]');
        
        setStats({
          products: products.length,
          services: services.length,
          users: users.length,
          orders: orders.length,
          appointments: appointments.length,
          retreats: retreats.length
        });
      }
    };
    
    loadStats();

    // Load admin settings
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setAdminSettings(JSON.parse(savedSettings));
    }
  }, [activeTab]);

  const handleSaveSettings = () => {
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
    toast.success('Settings saved successfully');
    setShowSettingsDialog(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not admin (redirect will happen)
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your wellness business</p>
          </div>
          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
            <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading">Admin Settings</DialogTitle>
                <DialogDescription>Configure your business settings</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={adminSettings.businessName}
                    onChange={(e) => setAdminSettings({ ...adminSettings, businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={adminSettings.contactEmail}
                    onChange={(e) => setAdminSettings({ ...adminSettings, contactEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={adminSettings.contactPhone}
                    onChange={(e) => setAdminSettings({ ...adminSettings, contactPhone: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={adminSettings.notificationsEnabled}
                    onChange={(e) => setAdminSettings({ ...adminSettings, notificationsEnabled: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="notifications">Enable email notifications</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
                <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary-dark">Save Settings</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('products')}>
            <CardHeader className="pb-2">
              <CardDescription>Products</CardDescription>
              <CardTitle className="text-2xl">{stats.products}</CardTitle>
            </CardHeader>
            <CardContent>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('services')}>
            <CardHeader className="pb-2">
              <CardDescription>Services</CardDescription>
              <CardTitle className="text-2xl">{stats.services}</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('retreats')}>
            <CardHeader className="pb-2">
              <CardDescription>Retreats</CardDescription>
              <CardTitle className="text-2xl">{stats.retreats}</CardTitle>
            </CardHeader>
            <CardContent>
              <Mountain className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('orders')}>
            <CardHeader className="pb-2">
              <CardDescription>Orders</CardDescription>
              <CardTitle className="text-2xl">{stats.orders}</CardTitle>
            </CardHeader>
            <CardContent>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('appointments')}>
            <CardHeader className="pb-2">
              <CardDescription>Appointments</CardDescription>
              <CardTitle className="text-2xl">{stats.appointments}</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('users')}>
            <CardHeader className="pb-2">
              <CardDescription>Users</CardDescription>
              <CardTitle className="text-2xl">{stats.users}</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="retreats">Retreats</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="fundraisers">Fundraisers</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tax" className="bg-green-500/10">
              <Receipt className="h-4 w-4 mr-1" />Tax
            </TabsTrigger>
            <TabsTrigger value="notifications" className="bg-amber-500/10">
              <Bell className="h-4 w-4 mr-1" />Notifications
            </TabsTrigger>
            <TabsTrigger value="analytics" className="bg-primary/10">
              <BarChart3 className="h-4 w-4 mr-1" />Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <ServiceManagement />
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <ClassManagement />
          </TabsContent>

          <TabsContent value="retreats" className="space-y-4">
            <RetreatManagement />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <AppointmentManagement />
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            <EmergencyManagement />
          </TabsContent>

          <TabsContent value="community" className="space-y-4">
            <CommunityManagement />
          </TabsContent>

          <TabsContent value="fundraisers" className="space-y-4">
            <FundraiserManagement />
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <ContractManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>

          <TabsContent value="tax" className="space-y-4">
            <TaxSettings />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

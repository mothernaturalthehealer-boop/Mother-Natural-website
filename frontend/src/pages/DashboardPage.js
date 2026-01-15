import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, ShoppingBag, BookOpen, Mountain, Award, FileText } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const DashboardPage = () => {
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [signedContracts, setSignedContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadUserData = async () => {
      setLoading(true);
      try {
        // Load user's appointments
        const aptsResponse = await fetch(`${API_URL}/api/appointments`, {
          headers: getAuthHeaders()
        });
        if (aptsResponse.ok) {
          const allApts = await aptsResponse.json();
          // Filter to user's appointments by email
          const userApts = allApts.filter(apt => 
            apt.email === user.email || apt.userId === user.id
          );
          setAppointments(userApts);
        }

        // Load user's orders
        const ordersResponse = await fetch(`${API_URL}/api/orders`, {
          headers: getAuthHeaders()
        });
        if (ordersResponse.ok) {
          const allOrders = await ordersResponse.json();
          // Filter to user's orders
          const userOrders = allOrders.filter(order => 
            order.email === user.email || order.userId === user.id || order.customer_email === user.email
          );
          setOrders(userOrders);
        }

        // Load user's signed contracts
        const contractsResponse = await fetch(`${API_URL}/api/contracts/signed`, {
          headers: getAuthHeaders()
        });
        if (contractsResponse.ok) {
          const allContracts = await contractsResponse.json();
          // Filter to user's contracts
          const userContracts = allContracts.filter(contract => 
            contract.customerEmail === user.email || contract.userId === user.id
          );
          setSignedContracts(userContracts);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
      setLoading(false);
    };

    loadUserData();
  }, [user, navigate, getAuthHeaders]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Your personal dashboard</p>
        </div>

        {/* Membership Card */}
        <Card className="mb-8 bg-gradient-primary border-0 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-2xl mb-2">Membership Status</CardTitle>
                <CardDescription className="text-white/80">
                  Member since {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'Recently'}
                </CardDescription>
              </div>
              <Badge className="bg-white text-primary text-lg px-4 py-2">
                <Award className="h-5 w-5 mr-2" />
                {user.membershipLevel || 'Basic'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-2xl font-semibold">Your Appointments</h2>
              <Button onClick={() => navigate('/appointments')} variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Book New
              </Button>
            </div>
            {loading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>
            ) : appointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">No appointments yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Book your first appointment to get started
                  </p>
                  <Button onClick={() => navigate('/appointments')} className="mt-4">
                    Book an Appointment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              appointments.map((apt) => (
                <Card key={apt.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-heading text-lg">{apt.serviceName || apt.service}</CardTitle>
                        <CardDescription>{apt.date} at {apt.time}</CardDescription>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          apt.status === 'confirmed' ? 'border-green-500 text-green-600' :
                          apt.status === 'denied' ? 'border-red-500 text-red-600' :
                          'border-primary text-primary'
                        }
                      >
                        {apt.status || 'Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-2xl font-semibold">Order History</h2>
              <Button onClick={() => navigate('/shop')} variant="outline">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </div>
            {loading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your order history will appear here after your first purchase
                  </p>
                  <Button onClick={() => navigate('/shop')} className="mt-4">
                    Browse Shop
                  </Button>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-heading text-lg">Order #{order.id?.slice(-8) || order.id}</CardTitle>
                        <CardDescription>
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent order'}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          order.status === 'completed' || order.status === 'Delivered'
                            ? 'border-green-500 text-green-600'
                            : 'border-primary text-primary'
                        }`}
                      >
                        {order.status || 'Processing'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order.items && (
                        <div className="text-sm text-muted-foreground">
                          {order.items.map(item => item.name).join(', ')}
                        </div>
                      )}
                      <div className="text-lg font-bold text-primary">
                        ${((order.total_amount || 0) / 100).toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-2xl font-semibold">Signed Contracts</h2>
              <Badge variant="outline">{signedContracts.length} contracts</Badge>
            </div>
            {loading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>
            ) : signedContracts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">No signed contracts yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Contracts will appear here after booking appointments or retreats
                  </p>
                </CardContent>
              </Card>
            ) : (
              signedContracts.slice().reverse().map((contract) => (
                <Card key={contract.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-heading text-lg capitalize">
                          {contract.contractType} Booking Agreement
                        </CardTitle>
                        <CardDescription>
                          Signed on {contract.signedAt ? new Date(contract.signedAt).toLocaleDateString() : 'Recently'}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-500 text-white">Signed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Customer: {contract.customerName}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Explore Tab */}
          <TabsContent value="explore" className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold mb-4">Explore More</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/classes')}>
                <CardContent className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="font-heading text-lg font-semibold">Classes</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Explore our variety of classes
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/retreats')}>
                <CardContent className="text-center py-8">
                  <Mountain className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="font-heading text-lg font-semibold">Retreats</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Join a transformative retreat
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/community')}>
                <CardContent className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="font-heading text-lg font-semibold">Community</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Connect with others
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

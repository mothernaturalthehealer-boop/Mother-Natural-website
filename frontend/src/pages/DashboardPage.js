import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, ShoppingBag, BookOpen, Mountain, User, Award, FileText } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const upcomingAppointments = [
    {
      id: 1,
      service: 'Energy Healing Session',
      date: 'June 15, 2024',
      time: '2:00 PM',
      practitioner: 'Sarah Johnson'
    },
    {
      id: 2,
      service: 'Holistic Health Consultation',
      date: 'June 22, 2024',
      time: '10:00 AM',
      practitioner: 'Dr. Lisa Martinez'
    },
  ];

  const enrolledClasses = [
    {
      id: 1,
      name: 'Introduction to Herbalism',
      progress: 50,
      nextSession: 'June 18, 2024 - 6:00 PM'
    },
    {
      id: 2,
      name: 'Meditation & Mindfulness',
      progress: 75,
      nextSession: 'June 17, 2024 - 7:00 AM'
    },
  ];

  const bookedRetreats = [
    {
      id: 1,
      name: 'Mountain Meditation Retreat',
      dates: 'June 15-17, 2024',
      location: 'Blue Ridge Mountains, NC',
      status: 'Confirmed'
    },
  ];

  const recentOrders = [
    {
      id: 1,
      date: 'June 10, 2024',
      items: ['Lavender Calm Tea', 'Rose Essential Oil'],
      total: 51.98,
      status: 'Shipped'
    },
    {
      id: 2,
      date: 'June 5, 2024',
      items: ['Healing Herbal Tincture'],
      total: 24.99,
      status: 'Delivered'
    },
  ];

  // Get user's signed contracts
  const signedContracts = JSON.parse(localStorage.getItem('signedContracts') || '[]').filter(
    contract => contract.userId === user.id
  );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Your wellness dashboard</p>
        </div>

        {/* Membership Card */}
        <Card className="mb-8 bg-gradient-primary border-0 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-2xl mb-2">Membership Status</CardTitle>
                <CardDescription className="text-white/80">
                  Member since {new Date(user.joinedDate).toLocaleDateString()}
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
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="retreats">Retreats</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-2xl font-semibold">Upcoming Appointments</h2>
              <Button onClick={() => navigate('/appointments')} variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Book New
              </Button>
            </div>
            {upcomingAppointments.map((apt) => (
              <Card key={apt.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-heading text-lg">{apt.service}</CardTitle>
                      <CardDescription>with {apt.practitioner}</CardDescription>
                    </div>
                    <Badge variant="outline" className="border-primary text-primary">
                      Confirmed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {apt.date} at {apt.time}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-2xl font-semibold">Enrolled Classes</h2>
              <Button onClick={() => navigate('/classes')} variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Classes
              </Button>
            </div>
            {enrolledClasses.map((cls) => (
              <Card key={cls.id}>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">{cls.name}</CardTitle>
                  <CardDescription>Next session: {cls.nextSession}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{cls.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${cls.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Retreats Tab */}
          <TabsContent value="retreats" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-2xl font-semibold">Booked Retreats</h2>
              <Button onClick={() => navigate('/retreats')} variant="outline">
                <Mountain className="mr-2 h-4 w-4" />
                Explore Retreats
              </Button>
            </div>
            {bookedRetreats.map((retreat) => (
              <Card key={retreat.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-heading text-lg">{retreat.name}</CardTitle>
                      <CardDescription>{retreat.location}</CardDescription>
                    </div>
                    <Badge className="bg-success text-success-foreground">
                      {retreat.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {retreat.dates}
                  </div>
                </CardContent>
              </Card>
            ))}
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
            {recentOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-heading text-lg">Order #{order.id}</CardTitle>
                      <CardDescription>{order.date}</CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        order.status === 'Delivered'
                          ? 'border-success text-success'
                          : 'border-primary text-primary'
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {order.items.join(', ')}
                    </div>
                    <div className="text-lg font-bold text-primary">${order.total}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

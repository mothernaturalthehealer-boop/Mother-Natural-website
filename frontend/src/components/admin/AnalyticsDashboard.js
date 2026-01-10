import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, DollarSign, Users, ShoppingBag, Calendar, BookOpen, Mountain, Heart, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const AnalyticsDashboard = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [retreatData, setRetreatData] = useState(null);
  const [fundraiserData, setFundraiserData] = useState(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      
      // Load all analytics data in parallel
      const [dashboard, revenue, products, users, appointments, classes, retreats, fundraisers] = await Promise.all([
        fetch(`${API_URL}/api/analytics/dashboard`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/api/analytics/revenue`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/api/analytics/products`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/api/analytics/users`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/api/analytics/appointments`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/api/analytics/classes`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/api/analytics/retreats`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/api/analytics/fundraisers`, { headers }).then(r => r.ok ? r.json() : null)
      ]);

      setDashboardData(dashboard);
      setRevenueData(revenue);
      setProductData(products);
      setUserData(users);
      setAppointmentData(appointments);
      setClassData(classes);
      setRetreatData(retreats);
      setFundraiserData(fundraisers);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
    setLoading(false);
  }, [getAuthHeaders]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const StatCard = ({ title, value, icon: Icon, description, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend !== undefined && (
          <div className={`flex items-center text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(trend)}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ProgressBar = ({ value, max, label }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-heading text-2xl">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive business insights and performance metrics</p>
        </div>
        <Button variant="outline" onClick={loadAnalytics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`$${(dashboardData?.overview?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          description={`$${(dashboardData?.overview?.monthlyRevenue || 0).toFixed(2)} this month`}
        />
        <StatCard 
          title="Total Users" 
          value={dashboardData?.overview?.totalUsers || 0}
          icon={Users}
          description={`${dashboardData?.overview?.newUsersThisMonth || 0} new this month`}
        />
        <StatCard 
          title="Total Orders" 
          value={dashboardData?.overview?.totalOrders || 0}
          icon={ShoppingBag}
        />
        <StatCard 
          title="Appointments" 
          value={dashboardData?.appointments?.total || 0}
          icon={Calendar}
          description={`${dashboardData?.appointments?.pending || 0} pending`}
        />
      </div>

      {/* Alerts Section */}
      {(dashboardData?.alerts?.pendingEmergencies > 0 || dashboardData?.alerts?.pendingAppointments > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-orange-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            {dashboardData?.alerts?.pendingEmergencies > 0 && (
              <Badge variant="destructive">{dashboardData.alerts.pendingEmergencies} Emergency Requests</Badge>
            )}
            {dashboardData?.alerts?.pendingAppointments > 0 && (
              <Badge variant="secondary">{dashboardData.alerts.pendingAppointments} Pending Appointments</Badge>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-2">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="retreats">Retreats</TabsTrigger>
          <TabsTrigger value="fundraisers">Fundraisers</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Type</CardTitle>
                <CardDescription>Breakdown of revenue sources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {revenueData?.byType && Object.entries(revenueData.byType).map(([type, amount]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="capitalize">{type}</span>
                    <span className="font-bold">${(amount || 0).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>${(revenueData?.totalRevenue || 0).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {revenueData?.monthly?.slice(-6).map((item) => (
                    <div key={item.month} className="flex justify-between items-center text-sm">
                      <span>{item.month}</span>
                      <span className="font-medium">${(item.revenue || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>By revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {productData?.topSellingProducts?.length > 0 ? (
                  <div className="space-y-3">
                    {productData.topSellingProducts.map((product, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{product.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">({product.quantity} sold)</span>
                        </div>
                        <span className="font-bold">${(product.revenue || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No sales data yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>{productData?.totalProducts || 0} total products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {productData?.categoryBreakdown?.map((cat) => (
                    <div key={cat.category} className="flex justify-between items-center">
                      <span className="capitalize">{cat.category}</span>
                      <Badge variant="secondary">{cat.count} products</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userData?.roleBreakdown && Object.entries(userData.roleBreakdown).map(([role, count]) => (
                  <div key={role} className="flex justify-between items-center">
                    <span className="capitalize">{role}s</span>
                    <Badge variant={role === 'admin' ? 'default' : 'secondary'}>{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Membership Levels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userData?.membershipBreakdown && Object.entries(userData.membershipBreakdown).map(([level, count]) => (
                  <div key={level} className="flex justify-between items-center">
                    <span className="capitalize">{level}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Signups</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userData?.dailySignups?.slice(-7).map((item) => (
                    <div key={item.date} className="flex justify-between items-center text-sm">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span className="font-medium">{item.signups} new</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status</CardTitle>
                <CardDescription>{appointmentData?.totalAppointments || 0} total appointments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointmentData?.statusBreakdown && Object.entries(appointmentData.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="capitalize">{status}</span>
                    <Badge variant={
                      status === 'confirmed' ? 'default' :
                      status === 'pending' ? 'secondary' :
                      status === 'denied' ? 'destructive' : 'outline'
                    }>{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Services</CardTitle>
                <CardDescription>Most booked services</CardDescription>
              </CardHeader>
              <CardContent>
                {appointmentData?.popularServices?.length > 0 ? (
                  <div className="space-y-3">
                    {appointmentData.popularServices.map((service, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span>{service.name}</span>
                        <Badge variant="outline">{service.count} bookings</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No appointment data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Class Overview</CardTitle>
                <CardDescription>{classData?.totalClasses || 0} active classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Available Spots</span>
                    <span className="font-bold">{classData?.totalSpots || 0}</span>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">By Level</h4>
                    {classData?.levelBreakdown && Object.entries(classData.levelBreakdown).map(([level, count]) => (
                      <div key={level} className="flex justify-between items-center text-sm">
                        <span>{level}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {classData?.classes?.slice(0, 5).map((cls, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{cls.name}</span>
                        <span className="text-xs text-muted-foreground block">{cls.instructor}</span>
                      </div>
                      <span className="font-bold">${cls.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Retreats Tab */}
        <TabsContent value="retreats" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Retreat Capacity</CardTitle>
                <CardDescription>{retreatData?.totalRetreats || 0} active retreats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressBar 
                  value={retreatData?.totalBooked || 0}
                  max={retreatData?.totalCapacity || 1}
                  label="Overall Occupancy"
                />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{retreatData?.totalBooked || 0}</div>
                    <div className="text-xs text-muted-foreground">Booked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{retreatData?.spotsRemaining || 0}</div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Retreats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {retreatData?.retreats?.map((retreat, i) => (
                    <div key={i} className="border-b pb-2 last:border-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{retreat.name}</span>
                        <span className="font-bold">${retreat.price}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>{retreat.location}</span>
                        <span>{retreat.spotsLeft} spots left</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fundraisers Tab */}
        <TabsContent value="fundraisers" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Fundraiser Overview</CardTitle>
                <CardDescription>{fundraiserData?.totalFundraisers || 0} total fundraisers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressBar 
                  value={fundraiserData?.totalRaised || 0}
                  max={fundraiserData?.totalGoal || 1}
                  label="Overall Progress"
                />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">${(fundraiserData?.totalRaised || 0).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Raised</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">${(fundraiserData?.totalGoal || 0).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Goal</div>
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant="secondary">{fundraiserData?.totalContributors || 0} Contributors</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fundraiser Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fundraiserData?.statusBreakdown && Object.entries(fundraiserData.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="capitalize">{status}</span>
                    <Badge variant={
                      status === 'active' ? 'default' :
                      status === 'pending' ? 'secondary' :
                      status === 'rejected' ? 'destructive' : 'outline'
                    }>{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

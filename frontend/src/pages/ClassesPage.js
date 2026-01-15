import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Clock, Users, Calendar, BookOpen, DollarSign, Package } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const ClassesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showPackageDialog, setShowPackageDialog] = useState(false);

  // Load classes from database
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await fetch(`${API_URL}/api/classes`);
        if (response.ok) {
          const data = await response.json();
          // Filter out any classes with null IDs
          setClasses(data.filter(c => c.id));
        }
      } catch (error) {
        console.error('Failed to load classes:', error);
      }
      setLoading(false);
    };
    loadClasses();
  }, []);

  const formatClassDays = (days) => {
    if (!days || days.length === 0) return null;
    if (days.length === 1) return days[0] + 's';
    if (days.length === 2) return days.join(' & ');
    return days.map(d => d.substring(0, 3)).join(', ');
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleEnroll = (classItem, packageDeal = null) => {
    if (!user) {
      toast.error('Please login to enroll in classes');
      navigate('/login');
      return;
    }

    const enrollmentData = {
      id: packageDeal ? `${classItem.id}-pkg-${packageDeal.sessions}` : classItem.id,
      name: packageDeal ? `${classItem.name} - ${packageDeal.name}` : classItem.name,
      price: packageDeal ? packageDeal.price : classItem.price,
      image: classItem.image,
      type: 'class',
      sessions: packageDeal ? packageDeal.sessions : classItem.sessions
    };

    addToCart(enrollmentData);
    toast.success(`${enrollmentData.name} added to cart!`);
    setShowPackageDialog(false);
  };

  const handleEnrollClick = (classItem) => {
    const hasPackages = classItem.packageDeals && classItem.packageDeals.length > 0;
    const hasDropIn = classItem.dropInPrice && classItem.dropInPrice > 0;
    
    if (hasPackages || hasDropIn) {
      setSelectedClass(classItem);
      setShowPackageDialog(true);
    } else {
      handleEnroll(classItem);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Classes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our variety of classes designed to support your journey
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading classes...</span>
          </div>
        ) : classes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <Card
                key={classItem.id}
                className="group hover:shadow-elegant transition-all duration-300 overflow-hidden flex flex-col"
                data-testid={`class-card-${classItem.id}`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={classItem.image || 'https://images.pexels.com/photos/7879933/pexels-photo-7879933.jpeg'}
                    alt={classItem.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {classItem.level && (
                      <Badge className="bg-primary text-primary-foreground">
                        {classItem.level}
                      </Badge>
                    )}
                    {classItem.spots && classItem.spots <= 5 && (
                      <Badge className="bg-warning text-warning-foreground">
                        {classItem.spots} spots left
                      </Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="flex-grow">
                  <CardTitle className="font-heading text-xl">{classItem.name}</CardTitle>
                  {classItem.instructor && (
                    <CardDescription className="text-sm font-medium">
                      with {classItem.instructor}
                    </CardDescription>
                  )}
                  {classItem.description && (
                    <p className="text-muted-foreground text-sm mt-2 whitespace-pre-wrap line-clamp-3">
                      {classItem.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-2">
                  {/* Class Days & Time */}
                  {(classItem.classDays?.length > 0 || classItem.classTime) && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>
                        {formatClassDays(classItem.classDays)}
                        {classItem.classTime && ` at ${formatTime(classItem.classTime)}`}
                      </span>
                    </div>
                  )}
                  
                  {/* Start Date */}
                  {classItem.startDate && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>
                        Starts {new Date(classItem.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {classItem.duration && ` • ${classItem.duration}`}
                      </span>
                    </div>
                  )}

                  {/* Sessions Info */}
                  {classItem.sessions > 0 && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                      {classItem.sessions} sessions total
                    </div>
                  )}

                  {/* Spots Available */}
                  {classItem.spots && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                      {classItem.spots} spots available
                    </div>
                  )}

                  {/* Package Deals Indicator */}
                  {classItem.packageDeals && classItem.packageDeals.length > 0 && (
                    <div className="flex items-center text-sm text-primary">
                      <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                      {classItem.packageDeals.length} package deal{classItem.packageDeals.length > 1 ? 's' : ''} available
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-3 mt-auto">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl font-bold text-primary">${classItem.price}</span>
                    <span className="text-sm text-muted-foreground">full course</span>
                  </div>
                  {classItem.dropInPrice > 0 && (
                    <div className="text-sm text-muted-foreground w-full">
                      Drop-in: ${classItem.dropInPrice}/class
                    </div>
                  )}
                  <Button
                    className="w-full bg-primary hover:bg-primary-dark"
                    onClick={() => handleEnrollClick(classItem)}
                    data-testid={`enroll-btn-${classItem.id}`}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Enroll Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Classes Coming Soon</h3>
            <p className="text-muted-foreground">
              Our classes are being scheduled. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* Package Selection Dialog */}
      <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Choose Your Option</DialogTitle>
            <DialogDescription>
              Select how you'd like to enroll in {selectedClass?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedClass && (
            <div className="space-y-4 py-4">
              {/* Full Course Option */}
              <div 
                className="p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleEnroll(selectedClass)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Full Course</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedClass.sessions} sessions • Complete program
                    </p>
                  </div>
                  <span className="text-xl font-bold text-primary">${selectedClass.price}</span>
                </div>
              </div>

              {/* Package Deals */}
              {selectedClass.packageDeals?.map((deal, index) => (
                <div 
                  key={index}
                  className="p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleEnroll(selectedClass, deal)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{deal.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {deal.sessions} sessions
                      </p>
                    </div>
                    <span className="text-xl font-bold text-primary">${deal.price}</span>
                  </div>
                </div>
              ))}

              {/* Drop-in Option */}
              {selectedClass.dropInPrice > 0 && (
                <div 
                  className="p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleEnroll(selectedClass, { name: 'Single Drop-in', sessions: 1, price: selectedClass.dropInPrice })}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Single Drop-in</h4>
                      <p className="text-sm text-muted-foreground">
                        One class session
                      </p>
                    </div>
                    <span className="text-xl font-bold text-primary">${selectedClass.dropInPrice}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPackageDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

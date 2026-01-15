import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Clock, Users, Calendar, BookOpen } from 'lucide-react';

export const ClassesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [classes, setClasses] = useState([]);

  // Load classes from localStorage (admin-managed)
  useEffect(() => {
    const adminClasses = localStorage.getItem('adminClasses');
    if (adminClasses) {
      const parsed = JSON.parse(adminClasses);
      if (parsed.length > 0) {
        setClasses(parsed);
        return;
      }
    }
    // No classes configured by admin - show empty state
    setClasses([]);
  }, []);

  const handleEnroll = (classItem) => {
    if (!user) {
      toast.error('Please login to enroll in classes');
      navigate('/login');
      return;
    }

    addToCart({
      id: classItem.id,
      name: classItem.name,
      price: classItem.price,
      image: classItem.image,
      type: 'class'
    });
    toast.success(`${classItem.name} added to cart!`);
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

        {/* Classes Grid */}
        {classes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <Card
                key={classItem.id}
                className="group hover:shadow-elegant transition-all duration-300 overflow-hidden flex flex-col"
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
                    <CardDescription className="text-sm">
                      with {classItem.instructor}
                    </CardDescription>
                  )}
                  <p className="text-muted-foreground text-sm mt-2">
                    {classItem.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-2">
                  {classItem.duration && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {classItem.duration} {classItem.sessions && `• ${classItem.sessions} sessions`}
                    </div>
                  )}
                  {classItem.schedule && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {classItem.schedule}
                    </div>
                  )}
                  {classItem.spots && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {classItem.spots} spots available
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-3 mt-auto">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl font-bold text-primary">${classItem.price}</span>
                    <span className="text-sm text-muted-foreground">one-time payment</span>
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary-dark"
                    onClick={() => handleEnroll(classItem)}
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
    </div>
  );
};

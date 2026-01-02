import React from 'react';
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

  const classes = [
    {
      id: 1,
      name: 'Introduction to Herbalism',
      instructor: 'Sarah Johnson',
      description: 'Learn the fundamentals of working with medicinal herbs',
      duration: '4 weeks',
      sessions: 8,
      price: 149,
      image: 'https://images.pexels.com/photos/7879933/pexels-photo-7879933.jpeg',
      schedule: 'Tuesdays 6-8 PM',
      spots: 5,
      level: 'Beginner'
    },
    {
      id: 2,
      name: 'Meditation & Mindfulness',
      instructor: 'Michael Chen',
      description: 'Develop a daily meditation practice for inner peace',
      duration: '6 weeks',
      sessions: 12,
      price: 189,
      image: 'https://images.pexels.com/photos/7879933/pexels-photo-7879933.jpeg',
      schedule: 'Mondays & Thursdays 7-8 AM',
      spots: 8,
      level: 'All Levels'
    },
    {
      id: 3,
      name: 'Essential Oils Mastery',
      instructor: 'Emma Williams',
      description: 'Master the art of aromatherapy and essential oil blending',
      duration: '3 weeks',
      sessions: 6,
      price: 129,
      image: 'https://images.pexels.com/photos/7879933/pexels-photo-7879933.jpeg',
      schedule: 'Wednesdays 6-8 PM',
      spots: 3,
      level: 'Intermediate'
    },
    {
      id: 4,
      name: 'Holistic Nutrition',
      instructor: 'Dr. Lisa Martinez',
      description: 'Discover how food can be your medicine',
      duration: '8 weeks',
      sessions: 16,
      price: 249,
      image: 'https://images.pexels.com/photos/7879933/pexels-photo-7879933.jpeg',
      schedule: 'Tuesdays & Thursdays 5-6:30 PM',
      spots: 10,
      level: 'All Levels'
    },
    {
      id: 5,
      name: 'Energy Healing Certification',
      instructor: 'Sophia Anderson',
      description: 'Professional training in energy healing modalities',
      duration: '12 weeks',
      sessions: 24,
      price: 599,
      image: 'https://images.pexels.com/photos/7879933/pexels-photo-7879933.jpeg',
      schedule: 'Saturdays 9 AM-3 PM',
      spots: 6,
      level: 'Advanced'
    },
    {
      id: 6,
      name: 'Yoga for Healing',
      instructor: 'Maya Patel',
      description: 'Therapeutic yoga practices for body and mind',
      duration: '6 weeks',
      sessions: 12,
      price: 169,
      image: 'https://images.pexels.com/photos/7879933/pexels-photo-7879933.jpeg',
      schedule: 'Mondays & Wednesdays 6-7:30 PM',
      spots: 12,
      level: 'All Levels'
    },
  ];

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
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Wellness Classes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expand your knowledge and deepen your practice with our expert-led courses
          </p>
        </div>

        {/* Classes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card
              key={classItem.id}
              className="group hover:shadow-elegant transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={classItem.image}
                  alt={classItem.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge className="bg-primary text-primary-foreground">
                    {classItem.level}
                  </Badge>
                  {classItem.spots <= 5 && (
                    <Badge className="bg-warning text-warning-foreground">
                      {classItem.spots} spots left
                    </Badge>
                  )}
                </div>
              </div>

              <CardHeader className="flex-grow">
                <CardTitle className="font-heading text-xl">{classItem.name}</CardTitle>
                <CardDescription className="text-sm">
                  with {classItem.instructor}
                </CardDescription>
                <p className="text-muted-foreground text-sm mt-2">
                  {classItem.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  {classItem.duration} • {classItem.sessions} sessions
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {classItem.schedule}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  {classItem.spots} spots available
                </div>
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
      </div>
    </div>
  );
};

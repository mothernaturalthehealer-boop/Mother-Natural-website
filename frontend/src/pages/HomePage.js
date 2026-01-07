import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Users, Calendar, ShoppingBag, BookOpen, Mountain, Star } from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  // Load featured products and testimonials from localStorage
  useEffect(() => {
    // Load products (show first 3 as featured)
    const savedProducts = localStorage.getItem('adminProducts');
    if (savedProducts) {
      const products = JSON.parse(savedProducts);
      setFeaturedProducts(products.slice(0, 3));
    }

    // Load testimonials from community posts (show first 3 with good content)
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      // Convert community posts to testimonial format
      const testimonialPosts = posts.slice(0, 3).map(post => ({
        name: post.author?.name || 'Community Member',
        text: post.content,
        rating: 5,
        image: post.author?.avatar || ''
      }));
      setTestimonials(testimonialPosts);
    }
  }, []);

  const services = [
    {
      icon: Calendar,
      title: 'Personal Sessions',
      description: 'One-on-one healing appointments tailored to your journey',
      link: '/appointments',
      color: 'text-primary'
    },
    {
      icon: BookOpen,
      title: 'Wellness Classes',
      description: 'Learn holistic practices from meditation to herbalism',
      link: '/classes',
      color: 'text-accent'
    },
    {
      icon: Mountain,
      title: 'Healing Retreats',
      description: 'Immersive experiences in nature for deep transformation',
      link: '/retreats',
      color: 'text-secondary'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-primary-light/50 text-primary-dark border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Natural Healing & Wellness
            </Badge>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Embrace Your
              <span className="block text-gradient">Natural Healing</span>
              Journey
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover the transformative power of nature through our holistic products, healing services, and supportive community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/shop')}
                className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-elegant group"
              >
                <ShoppingBag className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Explore Shop
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/retreats')}
                className="border-primary/30 hover:bg-primary/5"
              >
                <Mountain className="mr-2 h-5 w-5" />
                View Retreats
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 botanical-pattern">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Personalized pathways to wellness, designed to nurture your body, mind, and spirit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur"
                >
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="font-heading text-2xl">{service.title}</CardTitle>
                    <CardDescription className="text-base">{service.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      onClick={() => navigate(service.link)}
                      className="w-full hover:bg-primary/10 text-primary"
                    >
                      Learn More
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Featured Products</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handcrafted with love, infused with nature's healing essence
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-elegant transition-all duration-300 overflow-hidden">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={product.image || 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground capitalize">
                        {product.category}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="font-heading text-xl">{product.name}</CardTitle>
                      <CardDescription className="text-2xl font-bold text-primary">
                        ${product.price}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        className="w-full bg-primary hover:bg-primary-dark"
                        onClick={() => navigate('/shop')}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/shop')}
                  className="border-primary/30"
                >
                  Browse All Products
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">Products coming soon!</p>
              <Button
                variant="outline"
                onClick={() => navigate('/shop')}
                className="border-primary/30"
              >
                Visit Shop
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-6">Why Choose Mother Natural?</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-2">Handcrafted with Love</h3>
                    <p className="text-muted-foreground">Every product is carefully crafted using traditional methods and pure, natural ingredients.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-2">Holistic Approach</h3>
                    <p className="text-muted-foreground">We address the whole person - body, mind, and spirit - for true transformation.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-secondary-light flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-2">Supportive Community</h3>
                    <p className="text-muted-foreground">Join a nurturing community of like-minded individuals on the healing path.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.pexels.com/photos/3865676/pexels-photo-3865676.jpeg"
                alt="Wellness"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4">What Our Community Says</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from real people on their healing journeys
            </p>
          </div>

          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur border-border/50">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      {testimonial.image ? (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {testimonial.name?.charAt(0) || 'M'}
                          </span>
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base">{testimonial.name}</CardTitle>
                        <div className="flex space-x-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-base italic">
                      "{testimonial.text?.length > 150 ? testimonial.text.slice(0, 150) + '...' : testimonial.text}"
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                Join our community and share your wellness journey!
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/community')}
                className="border-primary/30"
              >
                Visit Community
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-primary border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <img
                src="https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg"
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader className="text-center relative z-10 py-16">
              <CardTitle className="font-heading text-4xl sm:text-5xl font-bold mb-4">
                Begin Your Healing Journey Today
              </CardTitle>
              <CardDescription className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
                Join our community and discover the transformative power of natural wellness
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/signup')}
                  className="bg-white hover:bg-white/90 text-primary"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Join Community
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/contact')}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Contact Us
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};

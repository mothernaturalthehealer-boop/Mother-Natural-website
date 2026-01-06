import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ContractSigningDialog } from '@/components/ContractSigningDialog';
import { PaymentForm } from '@/components/PaymentForm';
import { toast } from 'sonner';
import { Mountain, Calendar, Users, MapPin, DollarSign, CheckCircle2, ArrowLeft } from 'lucide-react';

export const RetreatsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRetreat, setSelectedRetreat] = useState(null);
  const [paymentOption, setPaymentOption] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [retreats, setRetreats] = useState([]);

  // Default retreats (fallback if admin hasn't created any)
  const defaultRetreats = [
    {
      id: 1,
      name: 'Mountain Meditation Retreat',
      location: 'Blue Ridge Mountains, NC',
      duration: '3 days / 2 nights',
      dates: 'June 15-17, 2024',
      price: 899,
      image: 'https://images.pexels.com/photos/35439440/pexels-photo-35439440.jpeg',
      description: 'Immerse yourself in silent meditation surrounded by majestic mountain peaks',
      includes: ['Accommodations', 'All Meals', 'Guided Meditation', 'Nature Walks', 'Yoga Sessions'],
      capacity: 20,
      spotsLeft: 7,
      paymentOptions: [
        { id: 'full', label: 'Pay in Full', amount: 899, description: 'One-time payment' },
        { id: 'deposit', label: 'Deposit', amount: 300, description: 'Pay $300 now, $599 later' },
      ]
    },
    {
      id: 2,
      name: 'Coastal Healing Sanctuary',
      location: 'Big Sur, California',
      duration: '5 days / 4 nights',
      dates: 'July 20-24, 2024',
      price: 1499,
      image: 'https://images.pexels.com/photos/35439440/pexels-photo-35439440.jpeg',
      description: 'Rejuvenate by the ocean with healing practices and nourishing cuisine',
      includes: ['Oceanfront Lodging', 'Organic Meals', 'Energy Healing', 'Sound Bath', 'Beach Ceremonies'],
      capacity: 15,
      spotsLeft: 4,
      paymentOptions: [
        { id: 'full', label: 'Pay in Full', amount: 1499, description: 'One-time payment' },
        { id: '50-50', label: '50/50 Split', amount: 750, description: 'Pay $750 now, $749 in 30 days' },
        { id: '3-installments', label: '3 Installments', amount: 500, description: '$500 now, then 2 monthly payments' },
      ]
    },
    {
      id: 3,
      name: 'Desert Transformation Journey',
      location: 'Sedona, Arizona',
      duration: '7 days / 6 nights',
      dates: 'August 10-16, 2024',
      price: 2199,
      image: 'https://images.pexels.com/photos/35439440/pexels-photo-35439440.jpeg',
      description: 'Deep spiritual work in the powerful energy vortexes of Sedona',
      includes: ['Private Casita', 'Farm-to-Table Meals', 'Shamanic Journey', 'Crystal Healing', 'Vortex Tours'],
      capacity: 12,
      spotsLeft: 3,
      paymentOptions: [
        { id: 'full', label: 'Pay in Full', amount: 2199, description: 'One-time payment' },
        { id: 'deposit', label: 'Deposit Only', amount: 500, description: 'Pay $500 now, $1699 later' },
        { id: 'monthly', label: 'Monthly Plan', amount: 550, description: '4 monthly payments of $550' },
      ]
    },
    {
      id: 4,
      name: 'Forest Bathing Immersion',
      location: 'Olympic National Park, WA',
      duration: '4 days / 3 nights',
      dates: 'September 5-8, 2024',
      price: 1199,
      image: 'https://images.pexels.com/photos/35439440/pexels-photo-35439440.jpeg',
      description: 'Connect deeply with nature through the Japanese practice of Shinrin-yoku',
      includes: ['Rustic Cabin', 'Plant-Based Meals', 'Forest Therapy', 'Herbal Workshops', 'Campfire Circles'],
      capacity: 16,
      spotsLeft: 9,
      paymentOptions: [
        { id: 'full', label: 'Pay in Full', amount: 1199, description: 'One-time payment' },
        { id: '50-50', label: '50/50 Split', amount: 600, description: 'Pay $600 now, $599 in 30 days' },
      ]
    },
    {
      id: 5,
      name: "Women's Empowerment Retreat",
      location: 'Asheville, North Carolina',
      duration: '4 days / 3 nights',
      dates: 'October 12-15, 2024',
      price: 1099,
      image: 'https://images.pexels.com/photos/35439440/pexels-photo-35439440.jpeg',
      description: 'A sacred gathering for women to reclaim their power and connect with sisterhood',
      includes: ['Shared Lodge', 'Nourishing Meals', 'Sister Circles', 'Breathwork', 'Creative Expression'],
      capacity: 24,
      spotsLeft: 11,
      paymentOptions: [
        { id: 'full', label: 'Pay in Full', amount: 1099, description: 'One-time payment' },
        { id: 'deposit', label: 'Deposit', amount: 350, description: 'Pay $350 now, $749 later' },
        { id: '3-installments', label: '3 Installments', amount: 367, description: '3 monthly payments of $367' },
      ]
    },
  ];

  // Load retreats from localStorage (admin-managed)
  useEffect(() => {
    const adminRetreats = localStorage.getItem('adminRetreats');
    if (adminRetreats) {
      const parsed = JSON.parse(adminRetreats);
      if (parsed.length > 0) {
        setRetreats(parsed);
        return;
      }
    }
    // No retreats configured by admin - show empty state
    setRetreats([]);
  }, []);

  const handleBookRetreat = (retreat) => {
    if (!user) {
      toast.error('Please login to book a retreat');
      navigate('/login');
      return;
    }

    setSelectedRetreat(retreat);
    setPaymentOption('');
    setShowPaymentDialog(true);
  };

  const handlePayment = () => {
    if (!paymentOption) {
      toast.error('Please select a payment option');
      return;
    }

    const option = selectedRetreat.paymentOptions.find(o => o.id === paymentOption);
    
    // Prepare booking data for contract
    const booking = {
      userId: user.id,
      retreat: selectedRetreat.name,
      location: selectedRetreat.location,
      dates: selectedRetreat.dates,
      duration: selectedRetreat.duration,
      paymentPlan: option.label,
      paymentPlanId: option.id,
      amount: option.amount,
      totalPrice: selectedRetreat.price
    };
    
    setBookingData(booking);
    setShowPaymentDialog(false);
    setShowContractDialog(true);
  };

  const handleContractSigned = (signedContract) => {
    // After contract is signed, show payment form
    setShowContractDialog(false);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (data) => {
    // Save retreat booking to localStorage for admin to see
    const existingBookings = JSON.parse(localStorage.getItem('retreatBookings') || '[]');
    const newBooking = {
      id: Date.now(),
      oderId: data.orderId,
      paymentId: data.paymentId,
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      retreatName: bookingData.retreat,
      location: bookingData.location,
      dates: bookingData.dates,
      paymentPlan: bookingData.paymentPlan,
      paidAmount: bookingData.amount,
      totalPrice: bookingData.totalPrice,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('retreatBookings', JSON.stringify([...existingBookings, newBooking]));
    
    toast.success(`Retreat booked! Payment of $${bookingData.amount} processed successfully.`);
    
    // Reset all states
    setShowPaymentForm(false);
    setSelectedRetreat(null);
    setPaymentOption('');
    setBookingData(null);
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
  };

  // Show payment form after contract signing
  if (showPaymentForm && bookingData) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => {
              setShowPaymentForm(false);
              setBookingData(null);
            }}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="font-heading text-3xl font-bold mb-4 text-center">Complete Your Retreat Booking</h1>
          
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Retreat:</span>
                  <span className="font-medium">{bookingData.retreat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{bookingData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dates:</span>
                  <span className="font-medium">{bookingData.dates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{bookingData.duration}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Full Price:</span>
                    <span>${bookingData.totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Plan:</span>
                    <span className="font-medium">{bookingData.paymentPlan}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-primary mt-2">
                    <span>Due Now:</span>
                    <span>${bookingData.amount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <PaymentForm
            amount={bookingData.amount}
            items={[{
              id: `retreat-${Date.now()}`,
              name: bookingData.retreat,
              quantity: 1,
              price: bookingData.amount
            }]}
            paymentType="retreat"
            customerEmail={user?.email}
            customerName={user?.name}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Healing Retreats</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transformative experiences in nature's most sacred spaces
          </p>
        </div>

        {/* Retreats Grid */}
        <div className="space-y-8">
          {retreats.map((retreat) => (
            <Card key={retreat.id} className="overflow-hidden hover:shadow-elegant transition-shadow" data-testid={`retreat-card-${retreat.id}`}>
              <div className="grid md:grid-cols-5 gap-0">
                {/* Image */}
                <div className="md:col-span-2 relative h-64 md:h-auto">
                  <img
                    src={retreat.image}
                    alt={retreat.name}
                    className="w-full h-full object-cover"
                  />
                  {retreat.spotsLeft <= 5 && (
                    <Badge className="absolute top-4 right-4 bg-warning text-warning-foreground">
                      Only {retreat.spotsLeft} spots left!
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="md:col-span-3 flex flex-col">
                  <CardHeader>
                    <CardTitle className="font-heading text-2xl sm:text-3xl">{retreat.name}</CardTitle>
                    <CardDescription className="text-base">{retreat.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        {retreat.location}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        {retreat.dates}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mountain className="h-4 w-4 mr-2 text-primary" />
                        {retreat.duration}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        {retreat.spotsLeft} of {retreat.capacity} available
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">What's Included:</h4>
                      <div className="flex flex-wrap gap-2">
                        {retreat.includes && retreat.includes.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="border-primary/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 border-t pt-6">
                    <div>
                      <div className="text-3xl font-bold text-primary">${retreat.price}</div>
                      <p className="text-sm text-muted-foreground">Flexible payment options available</p>
                    </div>
                    <Button
                      size="lg"
                      onClick={() => handleBookRetreat(retreat)}
                      className="bg-primary hover:bg-primary-dark w-full sm:w-auto"
                      data-testid={`book-retreat-${retreat.id}`}
                    >
                      <Mountain className="mr-2 h-5 w-5" />
                      Book Retreat
                    </Button>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Options Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Choose Payment Option</DialogTitle>
            <DialogDescription>
              {selectedRetreat?.name} - ${selectedRetreat?.price}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <RadioGroup value={paymentOption} onValueChange={setPaymentOption}>
              {selectedRetreat?.paymentOptions?.map((option) => (
                <div
                  key={option.id}
                  className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setPaymentOption(option.id)}
                  data-testid={`payment-option-${option.id}`}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <div className="flex-grow">
                    <Label htmlFor={option.id} className="cursor-pointer">
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                      <div className="text-lg font-bold text-primary mt-1">${option.amount}</div>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              className="bg-primary hover:bg-primary-dark"
              data-testid="proceed-to-payment-btn"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contract Signing Dialog */}
      {bookingData && (
        <ContractSigningDialog
          open={showContractDialog}
          onOpenChange={setShowContractDialog}
          contractType="retreat"
          bookingDetails={{
            ...bookingData,
            amount: `$${bookingData.amount}`,
            totalPrice: `$${bookingData.totalPrice}`
          }}
          onSignComplete={handleContractSigned}
        />
      )}
    </div>
  );
};

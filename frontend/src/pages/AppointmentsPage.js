import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ContractSigningDialog } from '@/components/ContractSigningDialog';
import { PaymentForm } from '@/components/PaymentForm';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, DollarSign, ArrowLeft } from 'lucide-react';

export const AppointmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [selectedService, setSelectedService] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [services, setServices] = useState([]);

  // Default services (fallback if admin hasn't created any)
  const defaultServices = [
    {
      id: 1,
      name: 'Energy Healing Session',
      duration: '60 min',
      price: 85,
      description: 'Restore balance and harmony through energy work',
      paymentType: 'full'
    },
    {
      id: 2,
      name: 'Holistic Health Consultation',
      duration: '90 min',
      price: 120,
      description: 'Comprehensive wellness assessment and personalized plan',
      paymentType: 'deposit',
      deposit: 60
    },
    {
      id: 3,
      name: 'Herbal Medicine Consultation',
      duration: '45 min',
      price: 75,
      description: 'Custom herbal recommendations for your needs',
      paymentType: 'full'
    },
    {
      id: 4,
      name: 'Spiritual Guidance Session',
      duration: '60 min',
      price: 95,
      description: 'Connect with your inner wisdom and life purpose',
      paymentType: 'full'
    },
  ];

  // Load services from localStorage (admin-managed)
  useEffect(() => {
    const adminServices = localStorage.getItem('adminServices');
    if (adminServices) {
      const parsed = JSON.parse(adminServices);
      if (parsed.length > 0) {
        setServices(parsed);
        return;
      }
    }
    // No services configured by admin - show empty state
    setServices([]);
  }, []);

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const handleBooking = () => {
    if (!user) {
      toast.error('Please login to book an appointment');
      navigate('/login');
      return;
    }

    if (!selectedService || !selectedTime) {
      toast.error('Please select a service and time');
      return;
    }

    const service = services.find(s => s.id.toString() === selectedService);
    
    // Prepare booking data for contract
    const booking = {
      userId: user.id,
      service: service.name,
      date: date.toLocaleDateString(),
      time: selectedTime,
      price: service.price,
      paymentType: service.paymentType,
      deposit: service.deposit || 0,
      notes: notes || 'None'
    };
    
    setBookingData(booking);
    setShowContractDialog(true);
  };

  const handleContractSigned = (signedContract) => {
    // After contract is signed, show payment form
    setShowContractDialog(false);
    setShowPaymentForm(true);
  };

  const getPaymentAmount = () => {
    if (!bookingData) return 0;
    return bookingData.paymentType === 'deposit' ? bookingData.deposit : bookingData.price;
  };

  const handlePaymentSuccess = (data) => {
    // Save appointment to localStorage for admin to see
    const existingAppointments = JSON.parse(localStorage.getItem('userAppointments') || '[]');
    const newAppointment = {
      id: Date.now(),
      userId: user.id,
      clientName: user.name,
      clientEmail: user.email,
      service: bookingData.service,
      date: bookingData.date,
      time: bookingData.time,
      price: bookingData.price,
      paidAmount: getPaymentAmount(),
      paymentType: bookingData.paymentType,
      notes: bookingData.notes,
      status: 'pending',
      paymentId: data.paymentId,
      orderId: data.orderId,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('userAppointments', JSON.stringify([...existingAppointments, newAppointment]));
    
    toast.success(`Appointment booked for ${bookingData.date} at ${bookingData.time}!`);
    
    // Reset form
    setSelectedService('');
    setSelectedTime('');
    setNotes('');
    setBookingData(null);
    setShowPaymentForm(false);
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
            onClick={() => setShowPaymentForm(false)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="font-heading text-3xl font-bold mb-4 text-center">Complete Your Booking</h1>
          
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">{bookingData.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{bookingData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{bookingData.time}</span>
                </div>
                {bookingData.paymentType === 'deposit' && (
                  <>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Full Price:</span>
                      <span>${bookingData.price}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-primary">
                      <span>Deposit Due Now:</span>
                      <span>${bookingData.deposit}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <PaymentForm
            amount={getPaymentAmount()}
            items={[{
              id: `apt-${Date.now()}`,
              name: bookingData.service,
              quantity: 1,
              price: getPaymentAmount()
            }]}
            paymentType="appointment"
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
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Book an Appointment</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Schedule your personalized healing session with our practitioners
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Services */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-heading text-2xl font-semibold mb-4">Select a Service</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedService === service.id.toString()
                      ? 'ring-2 ring-primary shadow-elegant'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedService(service.id.toString())}
                  data-testid={`service-card-${service.id}`}
                >
                  <CardHeader>
                    <CardTitle className="font-heading text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1 font-semibold text-primary">
                        <DollarSign className="h-4 w-4" />
                        <span>{service.price}</span>
                      </div>
                    </div>
                    {service.paymentType === 'deposit' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        ${service.deposit} deposit required
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="font-heading">Schedule Details</CardTitle>
                <CardDescription>Choose your preferred date and time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Calendar */}
                <div>
                  <Label className="mb-2 block">Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

                {/* Time Slot */}
                <div>
                  <Label className="mb-2 block">Select Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger data-testid="time-select">
                      <SelectValue placeholder="Choose a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="mb-2 block">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific concerns or questions?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-primary hover:bg-primary-dark"
                  onClick={handleBooking}
                  disabled={!selectedService || !selectedTime}
                  data-testid="book-appointment-btn"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Contract Signing Dialog */}
      {bookingData && (
        <ContractSigningDialog
          open={showContractDialog}
          onOpenChange={setShowContractDialog}
          contractType="appointment"
          bookingDetails={{
            ...bookingData,
            price: `$${bookingData.price}`
          }}
          onSignComplete={handleContractSigned}
        />
      )}
    </div>
  );
};

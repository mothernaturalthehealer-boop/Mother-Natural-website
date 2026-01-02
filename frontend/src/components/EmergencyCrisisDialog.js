import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertCircle, Phone, Heart, Clock } from 'lucide-react';

export const EmergencyCrisisDialog = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    immediateRisk: 'no',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error('Please provide your name and phone number');
      return;
    }

    // Create emergency request
    const emergencyRequest = {
      id: Date.now(),
      ...formData,
      timestamp: new Date().toISOString(),
      status: 'pending',
      priority: formData.immediateRisk === 'yes' ? 'critical' : 'high'
    };

    // Save to localStorage
    const existingRequests = JSON.parse(localStorage.getItem('emergencyRequests') || '[]');
    existingRequests.unshift(emergencyRequest);
    localStorage.setItem('emergencyRequests', JSON.stringify(existingRequests));

    setSubmitted(true);
    toast.success('Emergency request submitted. You will be contacted immediately.');

    // Reset form after showing success
    setTimeout(() => {
      setFormData({
        name: '',
        phone: '',
        email: '',
        immediateRisk: 'no',
        message: ''
      });
      setSubmitted(false);
      onOpenChange(false);
    }, 5000);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-success" />
            </div>
            <DialogTitle className="font-heading text-2xl mb-2">Help is On The Way</DialogTitle>
            <DialogDescription className="text-base">
              Your emergency request has been received. We will contact you immediately at {formData.phone}.
            </DialogDescription>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-6">
              <p className="text-sm font-semibold mb-2">While you wait:</p>
              <p className="text-sm text-muted-foreground">
                Please keep your phone nearby. If you're in immediate danger, call 911 or the National Suicide Prevention Lifeline.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="font-heading text-2xl">Emergency Crisis Support</DialogTitle>
              <DialogDescription>
                You're not alone. We're here to help you through this.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Crisis Hotlines - Always Visible */}
        <Alert className="border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-semibold">If you're in immediate danger, call 911 now</AlertTitle>
          <AlertDescription className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <div>
                <div className="font-semibold">National Suicide Prevention Lifeline</div>
                <a href="tel:988" className="text-destructive font-bold hover:underline">988 or 1-800-273-8255</a>
                <div className="text-xs">Available 24/7 - Free & Confidential</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <div>
                <div className="font-semibold">Crisis Text Line</div>
                <div className="font-bold">Text HOME to <span className="text-destructive">741741</span></div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Request Immediate Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    Your Name <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="First name is enough"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center">
                    Phone Number <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Are you in immediate risk of harm?</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="immediateRisk"
                      value="yes"
                      checked={formData.immediateRisk === 'yes'}
                      onChange={(e) => setFormData({ ...formData, immediateRisk: e.target.value })}
                      className="h-4 w-4"
                    />
                    <span>Yes - Please call 911 first</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="immediateRisk"
                      value="no"
                      checked={formData.immediateRisk === 'no'}
                      onChange={(e) => setFormData({ ...formData, immediateRisk: e.target.value })}
                      className="h-4 w-4"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">What's happening? (Optional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share as much or as little as you're comfortable with..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This helps us understand how to best support you, but it's not required.
                </p>
              </div>

              <Alert>
                <Heart className="h-4 w-4" />
                <AlertDescription>
                  <strong>Response Time:</strong> We typically respond within 15-30 minutes during business hours.
                  For immediate crisis support, please use the hotlines above.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                size="lg"
              >
                <AlertCircle className="mr-2 h-5 w-5" />
                Submit Emergency Request
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* Reassurance */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="font-semibold mb-2">You're taking a courageous step by reaching out.</p>
          <p className="text-muted-foreground">
            Your message will be treated with complete confidentiality. We're here to support you through this difficult time.
            You matter, and your life has value.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

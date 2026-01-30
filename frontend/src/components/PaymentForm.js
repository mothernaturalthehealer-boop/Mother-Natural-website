import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, CreditCard as CreditCardIcon, CheckCircle2, Lock, Ticket, X } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Square icon component
const SquareIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

// Stripe icon component
const StripeIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
  </svg>
);

// PayPal icon component  
const PayPalIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082H9.825l-1.68 10.665h4.442c.459 0 .85-.334.922-.788l.038-.19.73-4.621.047-.252a.942.942 0 0 1 .93-.788h.585c3.79 0 6.757-1.539 7.623-5.992.347-1.782.197-3.268-.24-4.33z"/>
  </svg>
);

export const PaymentForm = ({ 
  amount, 
  items, 
  paymentType = 'product',
  customerEmail,
  customerName,
  onSuccess,
  onError 
}) => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [card, setCard] = useState(null);
  const [payments, setPayments] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('square');
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  
  // Calculate final amount
  const discountAmount = appliedDiscount?.discountAmount || 0;
  const finalAmount = Math.max(0, amount - discountAmount);

  // Validate discount code
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code');
      return;
    }
    
    setIsValidatingCode(true);
    try {
      const response = await fetch(`${API_URL}/api/discount-codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode.trim(),
          orderAmount: amount,
          orderType: paymentType
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppliedDiscount(data);
        toast.success(`Discount applied: ${data.discountType === 'percentage' ? `${data.discountValue}% off` : `$${data.discountValue} off`}`);
      } else {
        const err = await response.json();
        toast.error(err.detail || 'Invalid discount code');
        setAppliedDiscount(null);
      }
    } catch (error) {
      toast.error('Failed to validate discount code');
      setAppliedDiscount(null);
    }
    setIsValidatingCode(false);
  };
  
  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
  };

  useEffect(() => {
    fetchPaymentConfig();
    
    // Check if returning from Stripe
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      pollStripeStatus(sessionId);
    }
  }, []);

  const fetchPaymentConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/api/payments/config`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment config');
      }
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching payment config:', error);
      setErrorMessage('Failed to load payment configuration.');
      toast.error('Failed to load payment form');
    } finally {
      setIsLoading(false);
    }
  };

  // Poll Stripe payment status
  const pollStripeStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      toast.error('Payment status check timed out. Please check your email for confirmation.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/payments/stripe/status/${sessionId}`);
      const data = await response.json();

      if (data.paymentStatus === 'paid') {
        setPaymentComplete(true);
        toast.success('Payment successful!');
        if (onSuccess) {
          onSuccess({ orderId: data.orderId, paymentMethod: 'stripe' });
        }
        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      // Continue polling
      setTimeout(() => pollStripeStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  // Initialize Square Web Payments SDK
  const initializeSquare = useCallback(async () => {
    if (!config || !window.Square) return;

    try {
      const paymentsInstance = window.Square.payments(config.applicationId, config.locationId);
      setPayments(paymentsInstance);

      const cardInstance = await paymentsInstance.card();
      await cardInstance.attach('#card-container');
      setCard(cardInstance);
    } catch (error) {
      console.error('Error initializing Square:', error);
      setErrorMessage('Failed to initialize payment form.');
    }
  }, [config]);

  // Load Square SDK script
  useEffect(() => {
    if (!config || selectedPaymentMethod !== 'square') return;

    const existingScript = document.querySelector('script[src*="square"]');
    if (existingScript) {
      if (window.Square) {
        initializeSquare();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = config.environment === 'production' 
      ? 'https://web.squarecdn.com/v1/square.js'
      : 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.async = true;
    script.onload = () => initializeSquare();
    script.onerror = () => setErrorMessage('Failed to load Square SDK');
    document.body.appendChild(script);

    return () => {
      if (card) card.destroy();
    };
  }, [config, initializeSquare, selectedPaymentMethod]);

  // Handle Square payment
  const handleSquarePayment = async () => {
    if (!card) {
      toast.error('Payment form not ready.');
      return;
    }

    const tokenResult = await card.tokenize();
    if (tokenResult.status !== 'OK') {
      const errorMsg = tokenResult.errors?.map(e => e.message).join(', ') || 'Card validation failed';
      throw new Error(errorMsg);
    }

    const response = await fetch(`${API_URL}/api/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceId: tokenResult.token,
        amount: Math.round(amount * 100),
        currency: 'USD',
        paymentType,
        items: items.map(item => ({
          id: item.id || String(Date.now()),
          name: item.name,
          quantity: item.quantity || 1,
          price: Math.round(item.price * 100),
          type: paymentType
        })),
        customerEmail,
        customerName
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.detail || data.message || 'Payment failed');
    }

    return data;
  };

  // Handle Stripe payment (redirect)
  const handleStripePayment = async () => {
    const response = await fetch(`${API_URL}/api/payments/stripe/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount,
        items: items.map(item => ({
          id: item.id || String(Date.now()),
          name: item.name,
          quantity: item.quantity || 1,
          price: Math.round(item.price * 100),
          type: paymentType
        })),
        paymentType,
        customerEmail,
        customerName,
        originUrl: window.location.origin
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.detail || 'Failed to create Stripe checkout');
    }

    // Redirect to Stripe checkout
    window.location.href = data.url;
    return null; // Will redirect
  };

  // Handle PayPal payment
  const handlePayPalPayment = async () => {
    // Create order on backend
    const response = await fetch(`${API_URL}/api/payments/paypal/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount,
        items: items.map(item => ({
          id: item.id || String(Date.now()),
          name: item.name,
          quantity: item.quantity || 1,
          price: Math.round(item.price * 100),
          type: paymentType
        })),
        paymentType,
        customerEmail,
        customerName,
        originUrl: window.location.origin
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.detail || 'Failed to create PayPal order');
    }

    // For now, show a message that PayPal integration requires their SDK
    // In production, you would load PayPal SDK and show their buttons
    toast.info('PayPal checkout is being set up. Order created: ' + data.orderId);
    
    // Simulate PayPal approval for demo
    const captureResponse = await fetch(`${API_URL}/api/payments/paypal/capture/${data.orderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paypal_order_id: 'DEMO-' + Date.now() }),
    });

    const captureData = await captureResponse.json();
    if (!captureResponse.ok || !captureData.success) {
      throw new Error(captureData.detail || 'PayPal capture failed');
    }

    return captureData;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let result;

      switch (selectedPaymentMethod) {
        case 'square':
          result = await handleSquarePayment();
          break;
        case 'stripe':
          result = await handleStripePayment();
          if (!result) return; // Redirecting to Stripe
          break;
        case 'paypal':
          result = await handlePayPalPayment();
          break;
        default:
          throw new Error('Invalid payment method');
      }

      if (result) {
        setPaymentComplete(true);
        toast.success('Payment successful!');
        if (onSuccess) {
          onSuccess({ ...result, paymentMethod: selectedPaymentMethod });
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'Payment processing failed');
      toast.error(error.message || 'Payment processing failed');
      if (onError) onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading payment form...</span>
        </CardContent>
      </Card>
    );
  }

  if (paymentComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-600 mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground">
            Thank you for your purchase. You will receive a confirmation email shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCardIcon className="h-5 w-5 mr-2" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          Choose your preferred payment method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="text-2xl font-bold text-primary">${amount.toFixed(2)}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Payment Method Selection */}
        <div className="mb-6">
          <Label className="mb-3 block font-medium">Payment Method</Label>
          <RadioGroup 
            value={selectedPaymentMethod} 
            onValueChange={setSelectedPaymentMethod}
            className="grid grid-cols-3 gap-3"
          >
            <div>
              <RadioGroupItem value="square" id="square" className="peer sr-only" />
              <Label
                htmlFor="square"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                data-testid="payment-method-square"
              >
                <SquareIcon />
                <span className="mt-2 text-xs font-medium">Card</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="stripe" id="stripe" className="peer sr-only" />
              <Label
                htmlFor="stripe"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                data-testid="payment-method-stripe"
              >
                <StripeIcon />
                <span className="mt-2 text-xs font-medium">Stripe</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="paypal" id="paypal" className="peer sr-only" />
              <Label
                htmlFor="paypal"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                data-testid="payment-method-paypal"
              >
                <PayPalIcon />
                <span className="mt-2 text-xs font-medium">PayPal</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <form onSubmit={handlePaymentSubmit}>
          {/* Square Card Container - only show when Square is selected */}
          {selectedPaymentMethod === 'square' && (
            <div className="mb-4">
              <Label className="mb-2 block">Card Information</Label>
              <div 
                id="card-container" 
                className="min-h-[100px] border rounded-md p-3 bg-white"
              >
                {!card && (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm min-h-[80px]">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading secure card form...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info text for Stripe */}
          {selectedPaymentMethod === 'stripe' && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              <p>You will be redirected to Stripe&apos;s secure checkout page to complete your payment.</p>
            </div>
          )}

          {/* Info text for PayPal */}
          {selectedPaymentMethod === 'paypal' && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
              <p>Complete your payment securely with PayPal.</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-dark"
            disabled={isProcessing || (selectedPaymentMethod === 'square' && !card)}
            data-testid="pay-button"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                {selectedPaymentMethod === 'stripe' ? 'Continue to Stripe' : `Pay $${amount.toFixed(2)}`}
              </>
            )}
          </Button>
        </form>

        <div className="flex items-center justify-center mt-4 text-xs text-muted-foreground">
          <Lock className="h-3 w-3 mr-1" />
          Secured Payment
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, CreditCard as CreditCardIcon, CheckCircle2, Lock } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

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

  useEffect(() => {
    fetchPaymentConfig();
  }, []);

  const fetchPaymentConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/api/payments/config`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment config');
      }
      const data = await response.json();
      console.log('Payment config loaded:', data);
      setConfig(data);
    } catch (error) {
      console.error('Error fetching payment config:', error);
      setErrorMessage('Failed to load payment configuration.');
      toast.error('Failed to load payment form');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Square Web Payments SDK
  const initializeSquare = useCallback(async () => {
    if (!config || !window.Square) {
      console.log('Square SDK or config not ready');
      return;
    }

    try {
      const paymentsInstance = window.Square.payments(config.applicationId, config.locationId);
      setPayments(paymentsInstance);

      const cardInstance = await paymentsInstance.card();
      await cardInstance.attach('#card-container');
      setCard(cardInstance);
      console.log('Square card form attached');
    } catch (error) {
      console.error('Error initializing Square:', error);
      setErrorMessage('Failed to initialize payment form. Please refresh the page.');
    }
  }, [config]);

  // Load Square SDK script
  useEffect(() => {
    if (!config) return;

    const existingScript = document.querySelector('script[src*="square"]');
    if (existingScript) {
      // Script already loaded, initialize
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
    script.onload = () => {
      console.log('Square SDK loaded');
      initializeSquare();
    };
    script.onerror = () => {
      setErrorMessage('Failed to load Square payment SDK');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup card if it exists
      if (card) {
        card.destroy();
      }
    };
  }, [config, initializeSquare]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!card) {
      toast.error('Payment form not ready. Please wait...');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Tokenize the card
      const tokenResult = await card.tokenize();
      console.log('Tokenization result:', tokenResult);

      if (tokenResult.status !== 'OK') {
        const errors = tokenResult.errors || [];
        const errorMsg = errors.map(e => e.message).join(', ') || 'Card validation failed';
        throw new Error(errorMsg);
      }

      // Process payment with backend
      const response = await fetch(`${API_URL}/api/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.log('Payment response:', data);

      if (response.ok && data.success) {
        setPaymentComplete(true);
        toast.success('Payment successful!');
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        throw new Error(data.detail || data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'Payment processing failed');
      toast.error(error.message || 'Payment processing failed');
      if (onError) {
        onError(error);
      }
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

  if (!config || !config.applicationId) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Unable to load payment form.</p>
          <p className="text-sm mt-2">Please try refreshing the page.</p>
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
          Enter your card details to complete the purchase
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

        <form onSubmit={handlePaymentSubmit}>
          {/* Square Card Container */}
          <div className="mb-4">
            <Label className="mb-2 block">Card Information</Label>
            <div 
              id="card-container" 
              className="min-h-[100px] border rounded-md p-3 bg-white"
              style={{ minHeight: '100px' }}
            >
              {!card && (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading secure card form...
                </div>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-dark"
            disabled={isProcessing || !card}
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
                Pay ${amount.toFixed(2)}
              </>
            )}
          </Button>
        </form>

        <div className="flex items-center justify-center mt-4 text-xs text-muted-foreground">
          <Lock className="h-3 w-3 mr-1" />
          Secured by Square
        </div>
      </CardContent>
    </Card>
  );
};

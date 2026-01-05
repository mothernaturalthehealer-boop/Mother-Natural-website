import React, { useState, useEffect } from 'react';
import { PaymentForm as SquarePaymentForm, CreditCard } from 'react-square-web-payments-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CreditCard as CreditCardIcon, CheckCircle2 } from 'lucide-react';

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

  useEffect(() => {
    fetchPaymentConfig();
  }, []);

  const fetchPaymentConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/api/payments/config`);
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching payment config:', error);
      toast.error('Failed to load payment form');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async (token) => {
    if (!token?.token) {
      toast.error('Payment token not generated');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${API_URL}/api/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId: token.token,
          amount: Math.round(amount * 100), // Convert to cents
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

  if (!config) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-8 text-center text-muted-foreground">
          Unable to load payment form. Please try again later.
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

        <SquarePaymentForm
          applicationId={config.applicationId}
          locationId={config.locationId}
          cardTokenizeResponseReceived={handlePaymentSubmit}
        >
          <CreditCard
            includeInputLabels
            style={{
              input: {
                fontSize: '16px',
                fontFamily: 'inherit',
              },
              'input::placeholder': {
                color: '#9ca3af',
              },
              '.input-container': {
                borderColor: '#e5e7eb',
                borderRadius: '0.5rem',
              },
              '.input-container.is-focus': {
                borderColor: '#a78bfa',
              },
              '.message-icon': {
                color: '#ef4444',
              },
            }}
          />
          
          <Button 
            type="submit" 
            className="w-full mt-6 bg-primary hover:bg-primary-dark"
            disabled={isProcessing}
            data-testid="pay-button"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </Button>
        </SquarePaymentForm>

        <p className="text-xs text-center text-muted-foreground mt-4">
          🔒 Your payment is secured by Square
        </p>
      </CardContent>
    </Card>
  );
};

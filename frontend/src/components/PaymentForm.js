import React, { useState, useEffect } from 'react';
import { PaymentForm as SquarePaymentForm, CreditCard } from 'react-square-web-payments-sdk';
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
  const [errorMessage, setErrorMessage] = useState(null);

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
      setErrorMessage('Failed to load payment form. Please refresh the page.');
      toast.error('Failed to load payment form');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async (token, buyer) => {
    console.log('Payment token received:', token);
    
    if (!token?.token) {
      toast.error('Payment token not generated. Please try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

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

  const handleTokenizeError = (errors) => {
    console.error('Tokenization errors:', errors);
    if (errors && errors.length > 0) {
      const errorMsg = errors.map(e => e.message).join(', ');
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
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

        <SquarePaymentForm
          applicationId={config.applicationId}
          locationId={config.locationId}
          cardTokenizeResponseReceived={handlePaymentSubmit}
          createPaymentRequest={() => ({
            countryCode: 'US',
            currencyCode: 'USD',
            total: {
              amount: amount.toFixed(2),
              label: 'Total',
            },
          })}
        >
          <CreditCard
            buttonProps={{
              css: {
                backgroundColor: '#a78bfa',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
                marginTop: '16px',
                '&:hover': {
                  backgroundColor: '#8b5cf6',
                },
                '&:disabled': {
                  backgroundColor: '#d1d5db',
                  cursor: 'not-allowed',
                },
              },
              isLoading: isProcessing,
            }}
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
          >
            {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </CreditCard>
        </SquarePaymentForm>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Your payment is secured by Square
        </p>
      </CardContent>
    </Card>
  );
};

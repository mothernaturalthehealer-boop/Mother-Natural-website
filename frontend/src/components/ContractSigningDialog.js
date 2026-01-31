import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { FileText, PenTool } from 'lucide-react';

export const ContractSigningDialog = ({ open, onOpenChange, contractType, bookingDetails, onSignComplete }) => {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const [contractText, setContractText] = useState('');

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setAgreed(false);
      setSignature('');
      // Clear canvas if it exists
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [open]);

  useEffect(() => {
    // Load contract template from localStorage
    const contracts = JSON.parse(localStorage.getItem('contractTemplates') || '{}');
    const template = contracts[contractType] || getDefaultContract(contractType);
    setContractText(template);
  }, [contractType]);

  const getDefaultContract = (type) => {
    if (type === 'appointment') {
      return `APPOINTMENT BOOKING AGREEMENT

This agreement is between Mother Natural: The Healing Lab and the client for appointment booking services.

1. CANCELLATION POLICY
- Cancellations must be made at least 24 hours in advance
- Cancellations made less than 24 hours before the scheduled appointment will result in a 50% charge
- No-shows will be charged the full appointment fee

2. RESCHEDULING
- Appointments may be rescheduled up to 24 hours in advance at no charge
- Late arrivals may result in shortened appointment time

3. PAYMENT TERMS
- Payment is due at the time of booking
- Accepted payment methods include credit/debit cards

4. HEALTH & WELLNESS
- Client agrees to disclose any relevant health conditions
- Services are complementary and not a substitute for medical care
- Client releases Mother Natural from liability for any adverse reactions

5. CONDUCT
- Client agrees to maintain respectful behavior during appointments
- Mother Natural reserves the right to refuse service

By signing below, you acknowledge that you have read, understood, and agree to these terms.`;
    } else {
      return `RETREAT BOOKING AGREEMENT

This agreement is between Mother Natural: The Healing Lab and the client for retreat booking services.

1. CANCELLATION & REFUND POLICY
- Cancellations more than 60 days before retreat: Full refund minus $100 processing fee
- Cancellations 30-60 days before retreat: 50% refund
- Cancellations less than 30 days before retreat: No refund
- Deposits are non-refundable

2. PAYMENT TERMS
- Payment plans available as specified during booking
- Final payment must be received 30 days before retreat start date
- Failure to complete payment may result in forfeiture of booking

3. PARTICIPANT RESPONSIBILITIES
- Participants must be in reasonable health to participate
- Special dietary requirements must be communicated at least 14 days in advance
- Participants are responsible for their own travel arrangements and insurance

4. RETREAT POLICIES
- Participants agree to follow retreat schedule and guidelines
- Use of alcohol or illegal substances is prohibited
- Disruptive behavior may result in removal without refund

5. LIABILITY WAIVER
- Client acknowledges physical activities and releases Mother Natural from liability
- Client is responsible for their own health insurance
- Mother Natural is not liable for lost or stolen personal items

6. CHANGES TO RETREAT
- Mother Natural reserves the right to modify retreat schedule due to weather or circumstances
- In case of retreat cancellation by Mother Natural, full refund will be provided

By signing below, you acknowledge that you have read, understood, and agree to these terms.`;
    }
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignature(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  const handleSign = () => {
    if (!agreed) {
      toast.error('Please agree to the terms before signing');
      return;
    }
    if (!signature) {
      toast.error('Please provide your signature');
      return;
    }

    const signedContract = {
      id: Date.now(),
      type: contractType,
      bookingDetails: bookingDetails,
      contractText: contractText,
      signature: signature,
      signedDate: new Date().toISOString(),
      userId: bookingDetails.userId || 'guest'
    };

    // Save to localStorage
    const existingContracts = JSON.parse(localStorage.getItem('signedContracts') || '[]');
    existingContracts.push(signedContract);
    localStorage.setItem('signedContracts', JSON.stringify(existingContracts));

    toast.success('Contract signed successfully!');
    onSignComplete(signedContract);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center">
            <FileText className="h-6 w-6 mr-2 text-primary" />
            {contractType === 'appointment' ? 'Appointment' : 'Retreat'} Booking Agreement
          </DialogTitle>
          <DialogDescription>
            Please review and sign this agreement to complete your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-y-auto">
          {/* Contract Text */}
          <div>
            <Label className="text-base font-semibold mb-2 block">Agreement Terms</Label>
            <ScrollArea className="h-64 w-full border rounded-md p-4 bg-muted/30">
              <pre className="text-sm whitespace-pre-wrap font-body">{contractText}</pre>
            </ScrollArea>
          </div>

          {/* Booking Details Summary */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Booking Details:</h4>
            <div className="text-sm space-y-1">
              {Object.entries(bookingDetails).map(([key, value]) => {
                if (key !== 'userId') {
                  return (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={setAgreed}
            />
            <label
              htmlFor="agree"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I have read and agree to the terms and conditions outlined in this agreement. I understand the cancellation policy and payment terms.
            </label>
          </div>

          {/* Signature Canvas */}
          <div>
            <Label className="text-base font-semibold mb-2 block flex items-center">
              <PenTool className="h-4 w-4 mr-2" />
              Your Signature
            </Label>
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-2 bg-white">
              <canvas
                ref={canvasRef}
                width={600}
                height={150}
                className="w-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">Sign above using your mouse or trackpad</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSignature}
                className="text-destructive hover:text-destructive"
              >
                Clear Signature
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSign}
            disabled={!agreed || !signature}
            className="bg-primary hover:bg-primary-dark"
            data-testid="sign-contract-btn"
          >
            <FileText className="mr-2 h-4 w-4" />
            Sign & Complete Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

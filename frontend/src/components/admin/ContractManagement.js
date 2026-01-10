import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Edit, FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const defaultContractTemplates = {
  appointment: `APPOINTMENT BOOKING AGREEMENT

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

By signing below, you acknowledge that you have read, understood, and agree to these terms.`,
  retreat: `RETREAT BOOKING AGREEMENT

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

By signing below, you acknowledge that you have read, understood, and agree to these terms.`
};

export const ContractManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [contractTemplates, setContractTemplates] = useState(defaultContractTemplates);
  const [signedContracts, setSignedContracts] = useState([]);
  const [editingContract, setEditingContract] = useState(null);
  const [showEditContractDialog, setShowEditContractDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load templates
      const templatesRes = await fetch(`${API_URL}/api/contracts/templates`, {
        headers: getAuthHeaders()
      });
      if (templatesRes.ok) {
        const templates = await templatesRes.json();
        setContractTemplates({ ...defaultContractTemplates, ...templates });
      }

      // Load signed contracts
      const signedRes = await fetch(`${API_URL}/api/contracts/signed`, {
        headers: getAuthHeaders()
      });
      if (signedRes.ok) {
        const signed = await signedRes.json();
        setSignedContracts(signed);
      }
    } catch (error) {
      console.error('Failed to load contracts:', error);
      // Fallback to localStorage
      const savedContracts = localStorage.getItem('contractTemplates');
      if (savedContracts) {
        setContractTemplates(JSON.parse(savedContracts));
      }
    }
    setLoading(false);
  }, [getAuthHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditContract = (type) => {
    setEditingContract({ type, content: contractTemplates[type] });
    setShowEditContractDialog(true);
  };

  const handleSaveContract = async () => {
    try {
      const response = await fetch(`${API_URL}/api/contracts/templates/${editingContract.type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ content: editingContract.content })
      });
      if (response.ok) {
        const updatedTemplates = { ...contractTemplates, [editingContract.type]: editingContract.content };
        setContractTemplates(updatedTemplates);
        toast.success('Contract template updated');
        setShowEditContractDialog(false);
        setEditingContract(null);
      }
    } catch (error) {
      // Fallback to localStorage
      const updatedTemplates = { ...contractTemplates, [editingContract.type]: editingContract.content };
      setContractTemplates(updatedTemplates);
      localStorage.setItem('contractTemplates', JSON.stringify(updatedTemplates));
      toast.success('Contract template updated locally');
      setShowEditContractDialog(false);
      setEditingContract(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl">Contract Management</h2>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Contract Templates</CardTitle>
            <CardDescription>Edit your booking agreement templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Appointment Contract
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleEditContract('appointment')}>
                    <Edit className="h-4 w-4 mr-1" />Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {contractTemplates.appointment?.substring(0, 150)}...
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Retreat Contract
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleEditContract('retreat')}>
                    <Edit className="h-4 w-4 mr-1" />Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {contractTemplates.retreat?.substring(0, 150)}...
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Signed Contracts</CardTitle>
            <CardDescription>View signed booking agreements ({signedContracts.length} total)</CardDescription>
          </CardHeader>
          <CardContent>
            {signedContracts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Signed contracts will appear here after customers complete bookings.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Signed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signedContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.customerName}</TableCell>
                      <TableCell className="capitalize">{contract.contractType}</TableCell>
                      <TableCell>{contract.signedAt ? new Date(contract.signedAt).toLocaleDateString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Contract Dialog */}
      <Dialog open={showEditContractDialog} onOpenChange={setShowEditContractDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Edit {editingContract?.type === 'appointment' ? 'Appointment' : 'Retreat'} Contract
            </DialogTitle>
            <DialogDescription>
              Customize your booking agreement template
            </DialogDescription>
          </DialogHeader>
          {editingContract && (
            <div className="py-4">
              <Textarea
                value={editingContract.content}
                onChange={(e) => setEditingContract({ ...editingContract, content: e.target.value })}
                rows={20}
                className="font-mono text-sm"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditContractDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveContract} className="bg-primary hover:bg-primary-dark">Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

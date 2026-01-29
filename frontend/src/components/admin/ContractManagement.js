import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, FileText, RefreshCw, Copy, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Default contract templates
const defaultTemplates = [
  {
    id: 'appointment',
    name: 'Appointment Contract',
    type: 'appointment',
    description: 'Standard agreement for appointment bookings',
    content: `APPOINTMENT BOOKING AGREEMENT

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
    isDefault: true
  },
  {
    id: 'retreat',
    name: 'Retreat Contract',
    type: 'retreat',
    description: 'Standard agreement for retreat bookings',
    content: `RETREAT BOOKING AGREEMENT

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

By signing below, you acknowledge that you have read, understood, and agree to these terms.`,
    isDefault: true
  },
  {
    id: 'class',
    name: 'Class Enrollment Contract',
    type: 'class',
    description: 'Agreement for class enrollments',
    content: `CLASS ENROLLMENT AGREEMENT

This agreement is between Mother Natural: The Healing Lab and the client for class enrollment.

1. ENROLLMENT TERMS
- Class fees are due at the time of enrollment
- Classes are non-transferable unless approved by management

2. CANCELLATION & REFUND POLICY
- Full refund available up to 7 days before class start date
- 50% refund available 3-7 days before class start date
- No refund less than 3 days before class start date
- Package deals and drop-in classes are non-refundable

3. ATTENDANCE
- Missed classes cannot be made up unless prior arrangements are made
- Excessive absences may result in forfeiture of enrollment

4. HEALTH & SAFETY
- Participants must disclose any health conditions that may affect participation
- Participants agree to follow instructor guidance and safety protocols
- Mother Natural is not liable for injuries resulting from improper technique

5. CONDUCT
- Participants agree to arrive on time and maintain a respectful environment
- Disruptive behavior may result in removal from class without refund

By signing below, you acknowledge that you have read, understood, and agree to these terms.`,
    isDefault: true
  }
];

export const ContractManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [signedContracts, setSignedContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [viewingContract, setViewingContract] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'custom',
    description: '',
    content: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load templates from API
      const templatesRes = await fetch(`${API_URL}/api/contract-templates`, {
        headers: getAuthHeaders()
      });
      if (templatesRes.ok) {
        const data = await templatesRes.json();
        // Merge with defaults if needed
        const mergedTemplates = [...defaultTemplates];
        data.forEach(t => {
          const existingIndex = mergedTemplates.findIndex(dt => dt.id === t.id);
          if (existingIndex >= 0) {
            mergedTemplates[existingIndex] = { ...mergedTemplates[existingIndex], ...t };
          } else {
            mergedTemplates.push(t);
          }
        });
        setTemplates(mergedTemplates);
      } else {
        setTemplates(defaultTemplates);
      }

      // Load signed contracts
      const signedRes = await fetch(`${API_URL}/api/contracts/signed`, {
        headers: getAuthHeaders()
      });
      if (signedRes.ok) {
        setSignedContracts(await signedRes.json());
      }
    } catch (error) {
      console.error('Failed to load contracts:', error);
      setTemplates(defaultTemplates);
    }
    setLoading(false);
  }, [getAuthHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast.error('Please fill in template name and content');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/contract-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...newTemplate,
          id: `custom-${Date.now()}`
        })
      });
      if (response.ok) {
        toast.success('Contract template created!');
        setShowAddDialog(false);
        setNewTemplate({ name: '', type: 'custom', description: '', content: '' });
        loadData();
      } else {
        toast.error('Failed to create template');
      }
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate({ ...template });
    setShowEditDialog(true);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate.name || !editingTemplate.content) {
      toast.error('Please fill in template name and content');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/contract-templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(editingTemplate)
      });
      if (response.ok) {
        toast.success('Contract template updated!');
        setShowEditDialog(false);
        setEditingTemplate(null);
        loadData();
      } else {
        toast.error('Failed to update template');
      }
    } catch (error) {
      toast.error('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (template) => {
    if (template.isDefault) {
      toast.error('Cannot delete default templates');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${template.name}"?`)) return;
    
    try {
      const response = await fetch(`${API_URL}/api/contract-templates/${template.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        toast.success('Contract template deleted');
        loadData();
      } else {
        toast.error('Failed to delete template');
      }
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const handleDuplicateTemplate = (template) => {
    setNewTemplate({
      name: `${template.name} (Copy)`,
      type: 'custom',
      description: template.description,
      content: template.content
    });
    setShowAddDialog(true);
  };

  const handleViewContract = (contract) => {
    setViewingContract(contract);
    setShowViewDialog(true);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-800';
      case 'retreat': return 'bg-green-100 text-green-800';
      case 'class': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl">Contract Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="bg-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />Add Contract Template
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contract Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Contract Templates
            </CardTitle>
            <CardDescription>Manage your booking agreement templates ({templates.length} total)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No contract templates yet.</p>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="border-l-4 border-l-primary/50">
                  <CardHeader className="pb-2 pt-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <Badge className={getTypeColor(template.type)}>{template.type}</Badge>
                          {template.isDefault && <Badge variant="outline" className="text-xs">Default</Badge>}
                        </div>
                        {template.description && (
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicateTemplate(template)} title="Duplicate">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTemplate(template)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!template.isDefault && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteTemplate(template)} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                      {template.content?.substring(0, 120)}...
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Signed Contracts */}
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
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signedContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.customerName}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(contract.contractType)}>{contract.contractType}</Badge>
                      </TableCell>
                      <TableCell>{contract.signedAt ? new Date(contract.signedAt).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewContract(contract)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Template Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Add Contract Template</DialogTitle>
            <DialogDescription>Create a new contract template for your bookings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name *</Label>
                <Input
                  id="templateName"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Wellness Session Agreement"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateType">Contract Type</Label>
                <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="retreat">Retreat</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateDesc">Description</Label>
              <Input
                id="templateDesc"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                placeholder="Brief description of when to use this template"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateContent">Contract Content *</Label>
              <Textarea
                id="templateContent"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                placeholder="Enter the full contract text..."
                rows={15}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTemplate} className="bg-primary hover:bg-primary-dark">Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Contract Template</DialogTitle>
            <DialogDescription>Update your contract template</DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editTemplateName">Template Name *</Label>
                  <Input
                    id="editTemplateName"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editTemplateType">Contract Type</Label>
                  <Select value={editingTemplate.type} onValueChange={(value) => setEditingTemplate({ ...editingTemplate, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="retreat">Retreat</SelectItem>
                      <SelectItem value="class">Class</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTemplateDesc">Description</Label>
                <Input
                  id="editTemplateDesc"
                  value={editingTemplate.description || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTemplateContent">Contract Content *</Label>
                <Textarea
                  id="editTemplateContent"
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate} className="bg-primary hover:bg-primary-dark">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Signed Contract Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Signed Contract</DialogTitle>
            {viewingContract && (
              <DialogDescription>
                Signed by {viewingContract.customerName} on {viewingContract.signedAt ? new Date(viewingContract.signedAt).toLocaleString() : 'N/A'}
              </DialogDescription>
            )}
          </DialogHeader>
          {viewingContract && (
            <div className="py-4">
              <div className="p-4 bg-muted rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono">{viewingContract.content}</pre>
              </div>
              <div className="mt-4 p-4 border rounded-lg">
                <p className="text-sm font-medium">Digital Signature</p>
                <p className="text-lg italic mt-2">{viewingContract.signature || viewingContract.customerName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  IP: {viewingContract.ipAddress || 'N/A'} | Email: {viewingContract.customerEmail || 'N/A'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

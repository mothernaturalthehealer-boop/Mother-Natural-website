import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [showEditServiceDialog, setShowEditServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    name: '', duration: '', price: '', description: '', paymentType: 'full', deposit: '', image: ''
  });

  useEffect(() => {
    const savedServices = localStorage.getItem('adminServices');
    if (savedServices) setServices(JSON.parse(savedServices));
  }, []);

  const handleAddService = () => {
    if (!newService.name || !newService.price || !newService.duration) {
      toast.error('Please fill in all required fields');
      return;
    }
    const service = {
      id: Date.now(),
      ...newService,
      price: parseFloat(newService.price),
      deposit: newService.paymentType === 'deposit' ? parseFloat(newService.deposit) : 0,
      image: newService.image || 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg'
    };
    const updatedServices = [...services, service];
    setServices(updatedServices);
    localStorage.setItem('adminServices', JSON.stringify(updatedServices));
    toast.success('Service added successfully!');
    setShowAddServiceDialog(false);
    setNewService({ name: '', duration: '', price: '', description: '', paymentType: 'full', deposit: '', image: '' });
  };

  const handleEditService = (service) => {
    setEditingService({ ...service });
    setShowEditServiceDialog(true);
  };

  const handleSaveEditedService = () => {
    if (!editingService.name || !editingService.price || !editingService.duration) {
      toast.error('Please fill in all required fields');
      return;
    }
    const updatedServices = services.map(s => {
      if (s.id === editingService.id) {
        return {
          ...editingService,
          price: parseFloat(editingService.price),
          deposit: editingService.paymentType === 'deposit' ? parseFloat(editingService.deposit) : 0
        };
      }
      return s;
    });
    setServices(updatedServices);
    localStorage.setItem('adminServices', JSON.stringify(updatedServices));
    toast.success('Service updated successfully');
    setShowEditServiceDialog(false);
    setEditingService(null);
  };

  const handleDeleteService = (id) => {
    const updatedServices = services.filter(s => s.id !== id);
    setServices(updatedServices);
    localStorage.setItem('adminServices', JSON.stringify(updatedServices));
    toast.success('Service deleted successfully');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-heading text-2xl">Services</CardTitle>
          <CardDescription>Manage appointment services</CardDescription>
        </div>
        <Dialog open={showAddServiceDialog} onOpenChange={setShowAddServiceDialog}>
          <Button onClick={() => setShowAddServiceDialog(true)} className="bg-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />Add Service
          </Button>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Add New Service</DialogTitle>
              <DialogDescription>Create a new appointment service</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input id="serviceName" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} placeholder="e.g., Energy Healing Session" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input id="duration" value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: e.target.value })} placeholder="e.g., 60 min" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servicePrice">Price ($) *</Label>
                  <Input id="servicePrice" type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} placeholder="85" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceDesc">Description</Label>
                <Textarea id="serviceDesc" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} placeholder="Service description..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentType">Payment Type</Label>
                <select id="paymentType" value={newService.paymentType} onChange={(e) => setNewService({ ...newService, paymentType: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                  <option value="full">Full Payment</option>
                  <option value="deposit">Deposit Required</option>
                </select>
              </div>
              {newService.paymentType === 'deposit' && (
                <div className="space-y-2">
                  <Label htmlFor="deposit">Deposit Amount ($)</Label>
                  <Input id="deposit" type="number" value={newService.deposit} onChange={(e) => setNewService({ ...newService, deposit: e.target.value })} placeholder="50" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="serviceImage">Image URL (Optional)</Label>
                <Input id="serviceImage" value={newService.image} onChange={(e) => setNewService({ ...newService, image: e.target.value })} placeholder="https://example.com/image.jpg" />
                <p className="text-xs text-muted-foreground">Paste a URL to an image for this service.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddServiceDialog(false)}>Cancel</Button>
              <Button onClick={handleAddService} className="bg-primary hover:bg-primary-dark">Add Service</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No services yet. Click &quot;Add Service&quot; to get started.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.duration}</TableCell>
                  <TableCell>${service.price}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {service.paymentType === 'deposit' ? `Deposit: $${service.deposit}` : 'Full Payment'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditService(service)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteService(service.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Edit Service Dialog */}
      <Dialog open={showEditServiceDialog} onOpenChange={setShowEditServiceDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Service</DialogTitle>
            <DialogDescription>Update service details</DialogDescription>
          </DialogHeader>
          {editingService && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editServiceName">Service Name *</Label>
                <Input id="editServiceName" value={editingService.name} onChange={(e) => setEditingService({ ...editingService, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editDuration">Duration *</Label>
                  <Input id="editDuration" value={editingService.duration} onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editServicePrice">Price ($) *</Label>
                  <Input id="editServicePrice" type="number" value={editingService.price} onChange={(e) => setEditingService({ ...editingService, price: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editServiceDesc">Description</Label>
                <Textarea id="editServiceDesc" value={editingService.description || ''} onChange={(e) => setEditingService({ ...editingService, description: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPaymentType">Payment Type</Label>
                <select id="editPaymentType" value={editingService.paymentType} onChange={(e) => setEditingService({ ...editingService, paymentType: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                  <option value="full">Full Payment</option>
                  <option value="deposit">Deposit Required</option>
                </select>
              </div>
              {editingService.paymentType === 'deposit' && (
                <div className="space-y-2">
                  <Label htmlFor="editDeposit">Deposit Amount ($)</Label>
                  <Input id="editDeposit" type="number" value={editingService.deposit || ''} onChange={(e) => setEditingService({ ...editingService, deposit: e.target.value })} />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="editServiceImage">Image URL</Label>
                <Input id="editServiceImage" value={editingService.image || ''} onChange={(e) => setEditingService({ ...editingService, image: e.target.value })} placeholder="https://example.com/image.jpg" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditServiceDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEditedService} className="bg-primary hover:bg-primary-dark">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

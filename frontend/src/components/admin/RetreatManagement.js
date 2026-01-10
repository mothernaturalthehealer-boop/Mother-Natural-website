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

export const RetreatManagement = () => {
  const [retreats, setRetreats] = useState([]);
  const [showAddRetreatDialog, setShowAddRetreatDialog] = useState(false);
  const [showEditRetreatDialog, setShowEditRetreatDialog] = useState(false);
  const [editingRetreat, setEditingRetreat] = useState(null);
  const [newRetreat, setNewRetreat] = useState({
    name: '', location: '', duration: '', dates: '', price: '', description: '', capacity: '', image: ''
  });

  useEffect(() => {
    const savedRetreats = localStorage.getItem('adminRetreats');
    if (savedRetreats) setRetreats(JSON.parse(savedRetreats));
  }, []);

  const handleAddRetreat = () => {
    if (!newRetreat.name || !newRetreat.location || !newRetreat.price || !newRetreat.dates) {
      toast.error('Please fill in all required fields');
      return;
    }
    const retreat = {
      id: Date.now(),
      ...newRetreat,
      price: parseFloat(newRetreat.price),
      capacity: parseInt(newRetreat.capacity) || 20,
      spotsLeft: parseInt(newRetreat.capacity) || 20,
      image: newRetreat.image || 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg',
      includes: ['Accommodations', 'All Meals', 'Guided Sessions', 'Activities'],
      paymentOptions: [
        { id: 'full', label: 'Pay in Full', amount: parseFloat(newRetreat.price), description: 'One-time payment' },
        { id: 'deposit', label: 'Deposit', amount: parseFloat(newRetreat.price) * 0.3, description: 'Pay 30% now, rest later' },
        { id: '50-50', label: '50/50 Split', amount: parseFloat(newRetreat.price) / 2, description: 'Pay half now, half later' }
      ]
    };
    const updatedRetreats = [...retreats, retreat];
    setRetreats(updatedRetreats);
    localStorage.setItem('adminRetreats', JSON.stringify(updatedRetreats));
    toast.success('Retreat added successfully!');
    setShowAddRetreatDialog(false);
    setNewRetreat({ name: '', location: '', duration: '', dates: '', price: '', description: '', capacity: '', image: '' });
  };

  const handleEditRetreat = (retreat) => {
    setEditingRetreat({ ...retreat });
    setShowEditRetreatDialog(true);
  };

  const handleSaveEditedRetreat = () => {
    if (!editingRetreat.name || !editingRetreat.location || !editingRetreat.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    const updatedRetreats = retreats.map(r => {
      if (r.id === editingRetreat.id) {
        const price = parseFloat(editingRetreat.price);
        return {
          ...editingRetreat,
          price,
          capacity: parseInt(editingRetreat.capacity) || 20,
          paymentOptions: [
            { id: 'full', label: 'Pay in Full', amount: price, description: 'One-time payment' },
            { id: 'deposit', label: 'Deposit', amount: price * 0.3, description: 'Pay 30% now, rest later' },
            { id: '50-50', label: '50/50 Split', amount: price / 2, description: 'Pay half now, half later' }
          ]
        };
      }
      return r;
    });
    setRetreats(updatedRetreats);
    localStorage.setItem('adminRetreats', JSON.stringify(updatedRetreats));
    toast.success('Retreat updated successfully');
    setShowEditRetreatDialog(false);
    setEditingRetreat(null);
  };

  const handleDeleteRetreat = (id) => {
    const updatedRetreats = retreats.filter(r => r.id !== id);
    setRetreats(updatedRetreats);
    localStorage.setItem('adminRetreats', JSON.stringify(updatedRetreats));
    toast.success('Retreat deleted successfully');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-heading text-2xl">Retreats</CardTitle>
          <CardDescription>Manage wellness retreats</CardDescription>
        </div>
        <Dialog open={showAddRetreatDialog} onOpenChange={setShowAddRetreatDialog}>
          <Button onClick={() => setShowAddRetreatDialog(true)} className="bg-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />Add Retreat
          </Button>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Add New Retreat</DialogTitle>
              <DialogDescription>Create a new wellness retreat</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="retreatName">Retreat Name *</Label>
                <Input id="retreatName" value={newRetreat.name} onChange={(e) => setNewRetreat({ ...newRetreat, name: e.target.value })} placeholder="e.g., Mountain Meditation Retreat" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" value={newRetreat.location} onChange={(e) => setNewRetreat({ ...newRetreat, location: e.target.value })} placeholder="Blue Ridge Mountains" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retreatDuration">Duration</Label>
                  <Input id="retreatDuration" value={newRetreat.duration} onChange={(e) => setNewRetreat({ ...newRetreat, duration: e.target.value })} placeholder="5 days, 4 nights" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dates">Dates *</Label>
                  <Input id="dates" value={newRetreat.dates} onChange={(e) => setNewRetreat({ ...newRetreat, dates: e.target.value })} placeholder="March 15-20, 2026" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retreatPrice">Price ($) *</Label>
                  <Input id="retreatPrice" type="number" value={newRetreat.price} onChange={(e) => setNewRetreat({ ...newRetreat, price: e.target.value })} placeholder="1200" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" value={newRetreat.capacity} onChange={(e) => setNewRetreat({ ...newRetreat, capacity: e.target.value })} placeholder="20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retreatDesc">Description</Label>
                <Textarea id="retreatDesc" value={newRetreat.description} onChange={(e) => setNewRetreat({ ...newRetreat, description: e.target.value })} placeholder="Retreat description..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retreatImage">Image URL (Optional)</Label>
                <Input id="retreatImage" value={newRetreat.image} onChange={(e) => setNewRetreat({ ...newRetreat, image: e.target.value })} placeholder="https://example.com/image.jpg" />
                <p className="text-xs text-muted-foreground">Paste a URL to an image for this retreat.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddRetreatDialog(false)}>Cancel</Button>
              <Button onClick={handleAddRetreat} className="bg-primary hover:bg-primary-dark">Add Retreat</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {retreats.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No retreats yet. Click &quot;Add Retreat&quot; to get started.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Retreat</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retreats.map((retreat) => (
                <TableRow key={retreat.id}>
                  <TableCell className="font-medium">{retreat.name}</TableCell>
                  <TableCell>{retreat.location}</TableCell>
                  <TableCell>{retreat.dates}</TableCell>
                  <TableCell>${retreat.price}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{retreat.spotsLeft || retreat.capacity}/{retreat.capacity} spots</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditRetreat(retreat)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteRetreat(retreat.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Edit Retreat Dialog */}
      <Dialog open={showEditRetreatDialog} onOpenChange={setShowEditRetreatDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Retreat</DialogTitle>
            <DialogDescription>Update retreat details</DialogDescription>
          </DialogHeader>
          {editingRetreat && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editRetreatName">Retreat Name *</Label>
                <Input id="editRetreatName" value={editingRetreat.name} onChange={(e) => setEditingRetreat({ ...editingRetreat, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editLocation">Location *</Label>
                  <Input id="editLocation" value={editingRetreat.location} onChange={(e) => setEditingRetreat({ ...editingRetreat, location: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRetreatDuration">Duration</Label>
                  <Input id="editRetreatDuration" value={editingRetreat.duration || ''} onChange={(e) => setEditingRetreat({ ...editingRetreat, duration: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editDates">Dates</Label>
                  <Input id="editDates" value={editingRetreat.dates || ''} onChange={(e) => setEditingRetreat({ ...editingRetreat, dates: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRetreatPrice">Price ($) *</Label>
                  <Input id="editRetreatPrice" type="number" value={editingRetreat.price} onChange={(e) => setEditingRetreat({ ...editingRetreat, price: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCapacity">Capacity</Label>
                <Input id="editCapacity" type="number" value={editingRetreat.capacity || ''} onChange={(e) => setEditingRetreat({ ...editingRetreat, capacity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRetreatDesc">Description</Label>
                <Textarea id="editRetreatDesc" value={editingRetreat.description || ''} onChange={(e) => setEditingRetreat({ ...editingRetreat, description: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRetreatImage">Image URL</Label>
                <Input id="editRetreatImage" value={editingRetreat.image || ''} onChange={(e) => setEditingRetreat({ ...editingRetreat, image: e.target.value })} placeholder="https://example.com/image.jpg" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRetreatDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEditedRetreat} className="bg-primary hover:bg-primary-dark">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

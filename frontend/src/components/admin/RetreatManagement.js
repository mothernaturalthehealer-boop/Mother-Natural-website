import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, RefreshCw, Eye, EyeOff, Gift } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ImageCropUploader } from '@/components/ImageCropUploader';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const RetreatManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [retreats, setRetreats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddRetreatDialog, setShowAddRetreatDialog] = useState(false);
  const [showEditRetreatDialog, setShowEditRetreatDialog] = useState(false);
  const [editingRetreat, setEditingRetreat] = useState(null);
  const [newRetreat, setNewRetreat] = useState({
    name: '', location: '', duration: '', dates: '', price: '', description: '', capacity: '', image: '', isHidden: false, addOns: []
  });
  const [newAddOn, setNewAddOn] = useState({ name: '', price: '', description: '' });

  const handleAddAddOn = (isNew = true) => {
    if (!newAddOn.name || !newAddOn.price) {
      toast.error('Please fill in add-on name and price');
      return;
    }
    const addon = { name: newAddOn.name, price: parseFloat(newAddOn.price), description: newAddOn.description || '' };
    if (isNew) {
      setNewRetreat({ ...newRetreat, addOns: [...(newRetreat.addOns || []), addon] });
    } else {
      setEditingRetreat({ ...editingRetreat, addOns: [...(editingRetreat.addOns || []), addon] });
    }
    setNewAddOn({ name: '', price: '', description: '' });
  };

  const handleRemoveAddOn = (index, isNew = true) => {
    if (isNew) {
      const addons = [...(newRetreat.addOns || [])]; addons.splice(index, 1);
      setNewRetreat({ ...newRetreat, addOns: addons });
    } else {
      const addons = [...(editingRetreat.addOns || [])]; addons.splice(index, 1);
      setEditingRetreat({ ...editingRetreat, addOns: addons });
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/retreats?include_hidden=true`);
      if (response.ok) setRetreats(await response.json());
    } catch (error) {
      const saved = localStorage.getItem('adminRetreats');
      if (saved) setRetreats(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddRetreat = async () => {
    if (!newRetreat.name || !newRetreat.location || !newRetreat.price || !newRetreat.dates) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/retreats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...newRetreat,
          price: parseFloat(newRetreat.price),
          capacity: parseInt(newRetreat.capacity) || 20,
          spotsLeft: parseInt(newRetreat.capacity) || 20,
          image: newRetreat.image || 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg'
        })
      });
      if (response.ok) {
        toast.success('Retreat added successfully!');
        setShowAddRetreatDialog(false);
        setNewRetreat({ name: '', location: '', duration: '', dates: '', price: '', description: '', capacity: '', image: '' });
        loadData();
      }
    } catch (error) {
      toast.error('Failed to add retreat');
    }
  };

  const handleEditRetreat = (retreat) => {
    setEditingRetreat({ ...retreat });
    setShowEditRetreatDialog(true);
  };

  const handleSaveEditedRetreat = async () => {
    if (!editingRetreat.name || !editingRetreat.location || !editingRetreat.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/retreats/${editingRetreat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...editingRetreat,
          price: parseFloat(editingRetreat.price),
          capacity: parseInt(editingRetreat.capacity) || 20
        })
      });
      if (response.ok) {
        toast.success('Retreat updated successfully');
        setShowEditRetreatDialog(false);
        setEditingRetreat(null);
        loadData();
      }
    } catch (error) {
      toast.error('Failed to update retreat');
    }
  };

  const handleDeleteRetreat = async (id) => {
    try {
      await fetch(`${API_URL}/api/retreats/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      toast.success('Retreat deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete retreat');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-heading text-2xl">Retreats</CardTitle>
          <CardDescription>Manage wellness retreats</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
          </Button>
          <Button onClick={() => setShowAddRetreatDialog(true)} className="bg-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />Add Retreat
          </Button>
        </div>
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

      {/* Add Retreat Dialog */}
      <Dialog open={showAddRetreatDialog} onOpenChange={setShowAddRetreatDialog}>
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
            <ImageCropUploader
              label="Retreat Image"
              currentImage={newRetreat.image}
              onImageUploaded={(url) => setNewRetreat({ ...newRetreat, image: url })}
              aspectRatio={16/9}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRetreatDialog(false)}>Cancel</Button>
            <Button onClick={handleAddRetreat} className="bg-primary hover:bg-primary-dark">Add Retreat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <ImageCropUploader
                label="Retreat Image"
                currentImage={editingRetreat.image || ''}
                onImageUploaded={(url) => setEditingRetreat({ ...editingRetreat, image: url })}
                aspectRatio={16/9}
              />
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

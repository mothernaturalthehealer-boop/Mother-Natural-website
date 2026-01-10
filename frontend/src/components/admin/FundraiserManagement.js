import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Check, X, Trash2, RefreshCw } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const FundraiserManagement = () => {
  const [fundraisers, setFundraisers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddFundraiserDialog, setShowAddFundraiserDialog] = useState(false);
  const [newFundraiser, setNewFundraiser] = useState({
    title: '', beneficiary: '', story: '', goalAmount: '', image: '', endDate: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/fundraisers`);
      if (response.ok) setFundraisers(await response.json());
    } catch (error) {
      const saved = localStorage.getItem('fundraisers');
      if (saved) setFundraisers(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddFundraiser = async () => {
    if (!newFundraiser.title || !newFundraiser.beneficiary || !newFundraiser.goalAmount) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/fundraisers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newFundraiser,
          goalAmount: parseFloat(newFundraiser.goalAmount),
          raisedAmount: 0,
          status: 'active',
          contributors: 0,
          image: newFundraiser.image || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
        })
      });
      if (response.ok) {
        toast.success('Fundraiser created successfully!');
        setShowAddFundraiserDialog(false);
        setNewFundraiser({ title: '', beneficiary: '', story: '', goalAmount: '', image: '', endDate: '' });
        loadData();
      }
    } catch (error) {
      toast.error('Failed to create fundraiser');
    }
  };

  const handleDeleteFundraiser = async (id) => {
    try {
      await fetch(`${API_URL}/api/fundraisers/${id}`, { method: 'DELETE' });
      toast.success('Fundraiser deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete fundraiser');
    }
  };

  const handleApproveFundraiser = async (id) => {
    try {
      await fetch(`${API_URL}/api/fundraisers/${id}/status?status=active`, { method: 'PATCH' });
      toast.success('Fundraiser approved and now active!');
      loadData();
    } catch (error) {
      toast.error('Failed to approve fundraiser');
    }
  };

  const handleRejectFundraiser = async (id) => {
    try {
      await fetch(`${API_URL}/api/fundraisers/${id}/status?status=rejected`, { method: 'PATCH' });
      toast.success('Fundraiser rejected');
      loadData();
    } catch (error) {
      toast.error('Failed to reject fundraiser');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      await fetch(`${API_URL}/api/fundraisers/${id}/status?status=${newStatus}`, { method: 'PATCH' });
      toast.success('Fundraiser status updated');
      loadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-heading text-2xl">Fundraisers</CardTitle>
          <CardDescription>Manage community fundraisers and applications</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
          </Button>
          <Button onClick={() => setShowAddFundraiserDialog(true)} className="bg-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />Create Fundraiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {fundraisers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No fundraisers created yet. Click &quot;Create Fundraiser&quot; to get started.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Raised</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fundraisers.map((fundraiser) => (
                <TableRow key={fundraiser.id}>
                  <TableCell className="font-medium">{fundraiser.title}</TableCell>
                  <TableCell>{fundraiser.beneficiary}</TableCell>
                  <TableCell>${fundraiser.goalAmount?.toLocaleString()}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold">${(fundraiser.raisedAmount || 0).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(((fundraiser.raisedAmount || 0) / fundraiser.goalAmount) * 100)}% funded
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      fundraiser.status === 'active' ? 'default' : 
                      fundraiser.status === 'pending' ? 'secondary' :
                      fundraiser.status === 'rejected' ? 'destructive' : 'outline'
                    }>
                      {fundraiser.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{fundraiser.endDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {fundraiser.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleApproveFundraiser(fundraiser.id)} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                            <Check className="h-4 w-4 mr-1" />Approve
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRejectFundraiser(fundraiser.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <X className="h-4 w-4 mr-1" />Reject
                          </Button>
                        </>
                      )}
                      {fundraiser.status !== 'pending' && (
                        <Badge variant="outline" className="cursor-pointer" onClick={() => handleToggleStatus(fundraiser.id, fundraiser.status)}>
                          {fundraiser.status === 'active' ? 'Close' : 'Reactivate'}
                        </Badge>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteFundraiser(fundraiser.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add Fundraiser Dialog */}
      <Dialog open={showAddFundraiserDialog} onOpenChange={setShowAddFundraiserDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Create New Fundraiser</DialogTitle>
            <DialogDescription>Create a fundraiser for someone in need</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Fundraiser Title *</Label>
              <Input id="title" value={newFundraiser.title} onChange={(e) => setNewFundraiser({ ...newFundraiser, title: e.target.value })} placeholder="e.g., Help Sarah's Healing Journey" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneficiary">Beneficiary Name *</Label>
              <Input id="beneficiary" value={newFundraiser.beneficiary} onChange={(e) => setNewFundraiser({ ...newFundraiser, beneficiary: e.target.value })} placeholder="Who will receive the funds?" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalAmount">Goal Amount ($) *</Label>
                <Input id="goalAmount" type="number" value={newFundraiser.goalAmount} onChange={(e) => setNewFundraiser({ ...newFundraiser, goalAmount: e.target.value })} placeholder="5000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input id="endDate" type="date" value={newFundraiser.endDate} onChange={(e) => setNewFundraiser({ ...newFundraiser, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="story">Story/Description *</Label>
              <Textarea id="story" value={newFundraiser.story} onChange={(e) => setNewFundraiser({ ...newFundraiser, story: e.target.value })} placeholder="Share the beneficiary's story..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input id="imageUrl" value={newFundraiser.image} onChange={(e) => setNewFundraiser({ ...newFundraiser, image: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFundraiserDialog(false)}>Cancel</Button>
            <Button onClick={handleAddFundraiser} className="bg-primary hover:bg-primary-dark">Create Fundraiser</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

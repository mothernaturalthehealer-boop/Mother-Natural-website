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
import { Plus, Check, X, Trash2 } from 'lucide-react';

export const FundraiserManagement = () => {
  const [fundraisers, setFundraisers] = useState([]);
  const [showAddFundraiserDialog, setShowAddFundraiserDialog] = useState(false);
  const [newFundraiser, setNewFundraiser] = useState({
    title: '', beneficiary: '', story: '', goalAmount: '', image: '', endDate: ''
  });

  useEffect(() => {
    const savedFundraisers = localStorage.getItem('fundraisers');
    if (savedFundraisers) setFundraisers(JSON.parse(savedFundraisers));
  }, []);

  const handleAddFundraiser = () => {
    if (!newFundraiser.title || !newFundraiser.beneficiary || !newFundraiser.goalAmount) {
      toast.error('Please fill in all required fields');
      return;
    }
    const fundraiser = {
      id: Date.now(),
      title: newFundraiser.title,
      beneficiary: newFundraiser.beneficiary,
      story: newFundraiser.story,
      goalAmount: parseFloat(newFundraiser.goalAmount),
      raisedAmount: 0,
      image: newFundraiser.image || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      createdDate: new Date().toISOString().split('T')[0],
      endDate: newFundraiser.endDate,
      status: 'active',
      contributors: 0
    };
    const updatedFundraisers = [...fundraisers, fundraiser];
    setFundraisers(updatedFundraisers);
    localStorage.setItem('fundraisers', JSON.stringify(updatedFundraisers));
    toast.success('Fundraiser created successfully!');
    setShowAddFundraiserDialog(false);
    setNewFundraiser({ title: '', beneficiary: '', story: '', goalAmount: '', image: '', endDate: '' });
  };

  const handleDeleteFundraiser = (id) => {
    const updatedFundraisers = fundraisers.filter(f => f.id !== id);
    setFundraisers(updatedFundraisers);
    localStorage.setItem('fundraisers', JSON.stringify(updatedFundraisers));
    toast.success('Fundraiser deleted successfully');
  };

  const handleToggleFundraiserStatus = (id) => {
    const updatedFundraisers = fundraisers.map(f => {
      if (f.id === id) {
        return { ...f, status: f.status === 'active' ? 'closed' : 'active' };
      }
      return f;
    });
    setFundraisers(updatedFundraisers);
    localStorage.setItem('fundraisers', JSON.stringify(updatedFundraisers));
    toast.success('Fundraiser status updated');
  };

  const handleApproveFundraiser = (id) => {
    const updatedFundraisers = fundraisers.map(f => {
      if (f.id === id) {
        return { ...f, status: 'active' };
      }
      return f;
    });
    setFundraisers(updatedFundraisers);
    localStorage.setItem('fundraisers', JSON.stringify(updatedFundraisers));
    toast.success('Fundraiser approved and now active!');
  };

  const handleRejectFundraiser = (id) => {
    const updatedFundraisers = fundraisers.map(f => {
      if (f.id === id) {
        return { ...f, status: 'rejected' };
      }
      return f;
    });
    setFundraisers(updatedFundraisers);
    localStorage.setItem('fundraisers', JSON.stringify(updatedFundraisers));
    toast.success('Fundraiser rejected');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-heading text-2xl">Fundraisers</CardTitle>
          <CardDescription>Manage community fundraisers and applications</CardDescription>
        </div>
        <Dialog open={showAddFundraiserDialog} onOpenChange={setShowAddFundraiserDialog}>
          <Button onClick={() => setShowAddFundraiserDialog(true)} className="bg-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />Create Fundraiser
          </Button>
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
                <Textarea id="story" value={newFundraiser.story} onChange={(e) => setNewFundraiser({ ...newFundraiser, story: e.target.value })} placeholder="Share the beneficiary's story and how funds will help..." rows={4} />
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
                  <TableCell>${fundraiser.goalAmount.toLocaleString()}</TableCell>
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
                        <Badge variant="outline" className="cursor-pointer" onClick={() => handleToggleFundraiserStatus(fundraiser.id)}>
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
    </Card>
  );
};

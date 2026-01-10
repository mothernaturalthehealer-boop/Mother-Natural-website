import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, Trash2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const EmergencyManagement = () => {
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    const savedRequests = localStorage.getItem('emergencyRequests');
    if (savedRequests) setEmergencyRequests(JSON.parse(savedRequests));
  }, []);

  const handleMarkResolved = (id) => {
    const updatedRequests = emergencyRequests.map(req => {
      if (req.id === id) return { ...req, status: 'resolved', resolvedAt: new Date().toISOString() };
      return req;
    });
    setEmergencyRequests(updatedRequests);
    localStorage.setItem('emergencyRequests', JSON.stringify(updatedRequests));
    toast.success('Marked as resolved');
  };

  const handleDeleteRequest = (id) => {
    const updatedRequests = emergencyRequests.filter(req => req.id !== id);
    setEmergencyRequests(updatedRequests);
    localStorage.setItem('emergencyRequests', JSON.stringify(updatedRequests));
    toast.success('Request deleted');
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Emergency Requests</CardTitle>
        <CardDescription>Crisis support requests from community members</CardDescription>
      </CardHeader>
      <CardContent>
        {emergencyRequests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No emergency requests.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emergencyRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.name}</TableCell>
                  <TableCell>{request.crisisType}</TableCell>
                  <TableCell>
                    <Badge variant={
                      request.urgency === 'critical' ? 'destructive' :
                      request.urgency === 'high' ? 'default' : 'secondary'
                    }>
                      {request.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={request.status === 'resolved' ? 'outline' : 'default'}>
                      {request.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => viewDetails(request)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status !== 'resolved' && (
                        <Button variant="ghost" size="icon" onClick={() => handleMarkResolved(request.id)} className="text-green-600 hover:text-green-700">
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest(request.id)} className="text-destructive hover:text-destructive">
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

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Emergency Request Details</DialogTitle>
            <DialogDescription>Full details of the crisis support request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div><strong>Name:</strong> {selectedRequest.name}</div>
              <div><strong>Phone:</strong> {selectedRequest.phone || 'Not provided'}</div>
              <div><strong>Email:</strong> {selectedRequest.email || 'Not provided'}</div>
              <div><strong>Crisis Type:</strong> {selectedRequest.crisisType}</div>
              <div><strong>Urgency:</strong> <Badge>{selectedRequest.urgency}</Badge></div>
              <div><strong>Description:</strong></div>
              <p className="text-sm bg-muted p-3 rounded">{selectedRequest.description}</p>
              <div><strong>Submitted:</strong> {selectedRequest.submittedAt ? new Date(selectedRequest.submittedAt).toLocaleString() : '-'}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

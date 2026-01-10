import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, Trash2, Eye, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const EmergencyManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/emergency-requests`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setEmergencyRequests(data);
      }
    } catch (error) {
      console.error('Failed to load emergency requests:', error);
      // Fallback to localStorage
      const savedRequests = localStorage.getItem('emergencyRequests');
      if (savedRequests) setEmergencyRequests(JSON.parse(savedRequests));
    }
    setLoading(false);
  }, [getAuthHeaders]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleMarkResolved = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/emergency-requests/${id}/resolve`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        toast.success('Marked as resolved');
        loadRequests();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/emergency-requests/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        toast.success('Request deleted');
        loadRequests();
      }
    } catch (error) {
      toast.error('Failed to delete request');
    }
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-heading text-2xl">Emergency Requests</CardTitle>
          <CardDescription>Crisis support requests from community members ({emergencyRequests.length} total)</CardDescription>
        </div>
        <Button variant="outline" onClick={loadRequests} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
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
              {selectedRequest.resolvedAt && (
                <div><strong>Resolved:</strong> {new Date(selectedRequest.resolvedAt).toLocaleString()}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

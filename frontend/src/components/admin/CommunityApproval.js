import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Users, Check, X, RefreshCw, UserPlus, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const CommunityApproval = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [processing, setProcessing] = useState(null);

  const loadPendingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/community/pending`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setPendingUsers(await res.json());
      }
    } catch (error) {
      console.error('Failed to load pending requests:', error);
      toast.error('Failed to load pending requests');
    }
    setLoading(false);
  }, [getAuthHeaders]);

  useEffect(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

  const handleApprove = async (userId, userName) => {
    setProcessing(userId);
    try {
      const res = await fetch(`${API_URL}/api/admin/community/approve/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (res.ok) {
        toast.success(`${userName} has been approved to join the community!`);
        loadPendingRequests();
      } else {
        toast.error('Failed to approve request');
      }
    } catch (error) {
      toast.error('Failed to approve request');
    }
    setProcessing(null);
  };

  const handleReject = async (userId, userName) => {
    if (!confirm(`Are you sure you want to reject ${userName}'s community membership request?`)) {
      return;
    }
    
    setProcessing(userId);
    try {
      const res = await fetch(`${API_URL}/api/admin/community/reject/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (res.ok) {
        toast.success(`${userName}'s request has been rejected`);
        loadPendingRequests();
      } else {
        toast.error('Failed to reject request');
      }
    } catch (error) {
      toast.error('Failed to reject request');
    }
    setProcessing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h2 className="font-heading text-2xl font-bold">Community Approval</h2>
          <p className="text-muted-foreground">Review and approve membership requests for the Community Circle</p>
        </div>
      </div>

      {/* Pending Requests Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-amber-500" />
              <CardTitle>Pending Requests</CardTitle>
            </div>
            {pendingUsers.length > 0 && (
              <Badge variant="secondary" className="text-amber-600 bg-amber-100">
                {pendingUsers.length} pending
              </Badge>
            )}
          </div>
          <CardDescription>
            Users who have requested to join the Community Circle
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No pending requests</p>
              <p className="text-sm">New membership requests will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-medium text-primary">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.membershipTier || user.membershipLevel || 'seed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(user.id, user.name)}
                          disabled={processing === user.id}
                          className="bg-green-600 hover:bg-green-700"
                          data-testid={`approve-${user.id}`}
                        >
                          {processing === user.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(user.id, user.name)}
                          disabled={processing === user.id}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          data-testid={`reject-${user.id}`}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
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
    </div>
  );
};

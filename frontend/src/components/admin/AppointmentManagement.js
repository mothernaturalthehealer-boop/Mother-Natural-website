import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, X, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const AppointmentManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [userAppointments, setUserAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setUserAppointments(data);
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
      // Fallback to localStorage
      const savedAppointments = localStorage.getItem('userAppointments');
      if (savedAppointments) setUserAppointments(JSON.parse(savedAppointments));
    }
    setLoading(false);
  }, [getAuthHeaders]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleApproveAppointment = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${id}/status?status=confirmed`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        toast.success('Appointment approved');
        loadAppointments();
      }
    } catch (error) {
      toast.error('Failed to approve appointment');
    }
  };

  const handleDenyAppointment = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${id}/status?status=denied`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        toast.success('Appointment denied');
        loadAppointments();
      }
    } catch (error) {
      toast.error('Failed to deny appointment');
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        toast.success('Appointment deleted');
        loadAppointments();
      }
    } catch (error) {
      toast.error('Failed to delete appointment');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-heading text-2xl">Appointments</CardTitle>
          <CardDescription>Manage customer appointments ({userAppointments.length} total)</CardDescription>
        </div>
        <Button variant="outline" onClick={loadAppointments} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {userAppointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No appointments scheduled yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userAppointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell className="font-medium">{apt.clientName || 'N/A'}</TableCell>
                  <TableCell>{apt.serviceName}</TableCell>
                  <TableCell>{apt.date}</TableCell>
                  <TableCell>{apt.time}</TableCell>
                  <TableCell>
                    <Badge variant={
                      apt.status === 'confirmed' ? 'default' :
                      apt.status === 'denied' ? 'destructive' :
                      apt.status === 'pending' ? 'secondary' : 'outline'
                    }>
                      {apt.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {(!apt.status || apt.status === 'pending') && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleApproveAppointment(apt.id)} className="text-green-600 hover:text-green-700">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDenyAppointment(apt.id)} className="text-red-600 hover:text-red-700">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAppointment(apt.id)} className="text-destructive hover:text-destructive">
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

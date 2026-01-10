import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, X, Trash2 } from 'lucide-react';

export const AppointmentManagement = () => {
  const [userAppointments, setUserAppointments] = useState([]);

  useEffect(() => {
    const savedAppointments = localStorage.getItem('userAppointments');
    if (savedAppointments) setUserAppointments(JSON.parse(savedAppointments));
  }, []);

  const handleApproveAppointment = (id) => {
    const updatedAppointments = userAppointments.map(apt => {
      if (apt.id === id) return { ...apt, status: 'confirmed' };
      return apt;
    });
    setUserAppointments(updatedAppointments);
    localStorage.setItem('userAppointments', JSON.stringify(updatedAppointments));
    toast.success('Appointment approved');
  };

  const handleDenyAppointment = (id) => {
    const updatedAppointments = userAppointments.map(apt => {
      if (apt.id === id) return { ...apt, status: 'denied' };
      return apt;
    });
    setUserAppointments(updatedAppointments);
    localStorage.setItem('userAppointments', JSON.stringify(updatedAppointments));
    toast.success('Appointment denied');
  };

  const handleDeleteAppointment = (id) => {
    const updatedAppointments = userAppointments.filter(apt => apt.id !== id);
    setUserAppointments(updatedAppointments);
    localStorage.setItem('userAppointments', JSON.stringify(updatedAppointments));
    toast.success('Appointment deleted');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Appointments</CardTitle>
        <CardDescription>Manage customer appointments</CardDescription>
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

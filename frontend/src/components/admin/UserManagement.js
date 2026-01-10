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
import { Mail, Send, RefreshCw } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const UserManagement = () => {
  const [usersList, setUsersList] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState(0);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [bulkEmailSubject, setBulkEmailSubject] = useState('');
  const [bulkEmailMessage, setBulkEmailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const savedUsers = localStorage.getItem('registeredUsers');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      setUsersList(users);
      setRegisteredUsers(users.length);
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !emailMessage) {
      toast.error('Please fill in subject and message');
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch(`${API_URL}/api/email/send-personal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: selectedUser.email,
          to_name: selectedUser.name,
          subject: emailSubject,
          message: emailMessage
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Email sent to ${selectedUser.name}!`);
        setShowEmailDialog(false);
        setEmailSubject('');
        setEmailMessage('');
        setSelectedUser(null);
      } else {
        toast.error(data.detail || 'Failed to send email');
      }
    } catch (error) {
      toast.error('Failed to send email. Please try again.');
    }
    setIsSending(false);
  };

  const handleSendBulkEmail = async () => {
    if (!bulkEmailSubject || !bulkEmailMessage) {
      toast.error('Please fill in subject and message');
      return;
    }
    if (usersList.length === 0) {
      toast.error('No users to send email to');
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch(`${API_URL}/api/email/send-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: usersList.map(u => ({ email: u.email, name: u.name })),
          subject: bulkEmailSubject,
          message: bulkEmailMessage
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Email sent to ${usersList.length} users!`);
        setShowBulkEmailDialog(false);
        setBulkEmailSubject('');
        setBulkEmailMessage('');
      } else {
        toast.error(data.detail || 'Failed to send bulk email');
      }
    } catch (error) {
      toast.error('Failed to send bulk email. Please try again.');
    }
    setIsSending(false);
  };

  const openEmailDialog = (user) => {
    setSelectedUser(user);
    setEmailSubject('');
    setEmailMessage('');
    setShowEmailDialog(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-heading text-2xl">User Management</CardTitle>
          <CardDescription>{registeredUsers} registered users</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </Button>
          <Dialog open={showBulkEmailDialog} onOpenChange={setShowBulkEmailDialog}>
            <Button onClick={() => setShowBulkEmailDialog(true)} className="bg-primary hover:bg-primary-dark">
              <Send className="h-4 w-4 mr-2" />Send Bulk Email
            </Button>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading">Send Bulk Email</DialogTitle>
                <DialogDescription>Send an email to all {registeredUsers} registered users</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="bulkSubject">Subject *</Label>
                  <Input id="bulkSubject" value={bulkEmailSubject} onChange={(e) => setBulkEmailSubject(e.target.value)} placeholder="Email subject..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulkMessage">Message *</Label>
                  <Textarea id="bulkMessage" value={bulkEmailMessage} onChange={(e) => setBulkEmailMessage(e.target.value)} placeholder="Your message..." rows={6} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBulkEmailDialog(false)}>Cancel</Button>
                <Button onClick={handleSendBulkEmail} disabled={isSending} className="bg-primary hover:bg-primary-dark">
                  {isSending ? 'Sending...' : `Send to ${registeredUsers} Users`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {usersList.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No registered users yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList.map((user) => (
                <TableRow key={user.id || user.email}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge variant="outline">{user.role || 'user'}</Badge></TableCell>
                  <TableCell>{user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEmailDialog(user)}>
                      <Mail className="h-4 w-4 mr-1" />Email
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Personal Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Send Email to {selectedUser?.name}</DialogTitle>
            <DialogDescription>Send a personal email to {selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Email subject..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea id="message" value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} placeholder="Your message..." rows={6} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={isSending} className="bg-primary hover:bg-primary-dark">
              {isSending ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

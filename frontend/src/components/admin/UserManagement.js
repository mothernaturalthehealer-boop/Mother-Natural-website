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
import { Mail, Send, RefreshCw, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const UserManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [bulkEmailSubject, setBulkEmailSubject] = useState('');
  const [bulkEmailMessage, setBulkEmailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user', membershipLevel: 'basic' });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const users = await response.json();
        setUsersList(users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      // Fallback to localStorage
      const savedUsers = localStorage.getItem('registeredUsers');
      if (savedUsers) setUsersList(JSON.parse(savedUsers));
    }
    setLoading(false);
  }, [getAuthHeaders]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(newUser)
      });
      if (response.ok) {
        toast.success('User created successfully!');
        setShowAddUserDialog(false);
        setNewUser({ name: '', email: '', password: '', role: 'user', membershipLevel: 'basic' });
        loadUsers();
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to create user');
      }
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        toast.success('User deleted');
        loadUsers();
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !emailMessage) {
      toast.error('Please fill in subject and message');
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch(`${API_URL}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          recipient_email: selectedUser.email,
          subject: emailSubject,
          html_content: `<div style="font-family: Arial, sans-serif;"><p>Dear ${selectedUser.name},</p><p>${emailMessage.replace(/\n/g, '<br>')}</p><p>Best regards,<br>Mother Natural: The Healing Lab</p></div>`
        })
      });
      if (response.ok) {
        toast.success(`Email sent to ${selectedUser.name}!`);
        setShowEmailDialog(false);
        setEmailSubject('');
        setEmailMessage('');
        setSelectedUser(null);
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to send email');
      }
    } catch (error) {
      toast.error('Failed to send email');
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
      const response = await fetch(`${API_URL}/api/email/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          recipient_emails: usersList.map(u => u.email),
          subject: bulkEmailSubject,
          html_content: `<div style="font-family: Arial, sans-serif;"><p>${bulkEmailMessage.replace(/\n/g, '<br>')}</p><p>Best regards,<br>Mother Natural: The Healing Lab</p></div>`
        })
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`Email sent to ${data.sent_count} users!`);
        setShowBulkEmailDialog(false);
        setBulkEmailSubject('');
        setBulkEmailMessage('');
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to send bulk email');
      }
    } catch (error) {
      toast.error('Failed to send bulk email');
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
          <CardDescription>{usersList.length} registered users</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
          </Button>
          <Button variant="outline" onClick={() => setShowAddUserDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />Add User
          </Button>
          <Button onClick={() => setShowBulkEmailDialog(true)} className="bg-primary hover:bg-primary-dark">
            <Send className="h-4 w-4 mr-2" />Send Bulk Email
          </Button>
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
                <TableHead>Membership</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList.map((user) => (
                <TableRow key={user.id || user.email}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>{user.role || 'user'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.membershipLevel || 'basic'}</Badge>
                  </TableCell>
                  <TableCell>{user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEmailDialog(user)}>
                        <Mail className="h-4 w-4 mr-1" />Email
                      </Button>
                      {user.role !== 'admin' && (
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Name *</Label>
              <Input id="userName" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email *</Label>
              <Input id="userEmail" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userPassword">Password *</Label>
              <Input id="userPassword" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userRole">Role</Label>
                <select id="userRole" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="userMembership">Membership</Label>
                <select id="userMembership" value={newUser.membershipLevel} onChange={(e) => setNewUser({ ...newUser, membershipLevel: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="platinum">Platinum</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>Cancel</Button>
            <Button onClick={handleAddUser} className="bg-primary hover:bg-primary-dark">Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Email Dialog */}
      <Dialog open={showBulkEmailDialog} onOpenChange={setShowBulkEmailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Send Bulk Email</DialogTitle>
            <DialogDescription>Send an email to all {usersList.length} registered users</DialogDescription>
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
              {isSending ? 'Sending...' : `Send to ${usersList.length} Users`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

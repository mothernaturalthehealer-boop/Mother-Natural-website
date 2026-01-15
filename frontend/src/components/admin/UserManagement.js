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
import { Mail, Send, RefreshCw, Plus, Trash2, Edit, Key } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const UserManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [bulkEmailSubject, setBulkEmailSubject] = useState('');
  const [bulkEmailMessage, setBulkEmailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user', membershipLevel: 'basic' });
  const [newPassword, setNewPassword] = useState('');

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

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditUserDialog(true);
  };

  const handleSaveEditedUser = async () => {
    if (!editingUser.name) {
      toast.error('Please enter a name');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          name: editingUser.name,
          role: editingUser.role,
          membershipLevel: editingUser.membershipLevel,
          is_active: editingUser.is_active !== false
        })
      });
      if (response.ok) {
        toast.success('User updated successfully!');
        setShowEditUserDialog(false);
        setEditingUser(null);
        loadUsers();
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to update user');
      }
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowResetPasswordDialog(true);
  };

  const handleSaveNewPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ new_password: newPassword })
      });
      if (response.ok) {
        toast.success('Password reset successfully!');
        setShowResetPasswordDialog(false);
        setSelectedUser(null);
        setNewPassword('');
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('Failed to reset password');
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
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} title="Edit User">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleResetPassword(user)} title="Reset Password">
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEmailDialog(user)} title="Send Email">
                        <Mail className="h-4 w-4" />
                      </Button>
                      {user.role !== 'admin' && (
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} className="text-destructive hover:text-destructive" title="Delete User">
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

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editUserName">Name *</Label>
                <Input id="editUserName" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editUserEmail">Email</Label>
                <Input id="editUserEmail" type="email" value={editingUser.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editUserRole">Role</Label>
                  <select id="editUserRole" value={editingUser.role || 'user'} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUserMembership">Membership</Label>
                  <select id="editUserMembership" value={editingUser.membershipLevel || 'basic'} onChange={(e) => setEditingUser({ ...editingUser, membershipLevel: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="editUserActive" 
                    checked={editingUser.is_active !== false} 
                    onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="editUserActive" className="font-normal">Account is active</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEditedUser} className="bg-primary hover:bg-primary-dark">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Reset Password</DialogTitle>
            <DialogDescription>Set a new password for {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password *</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
              <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveNewPassword} className="bg-primary hover:bg-primary-dark">Reset Password</Button>
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

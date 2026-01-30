import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Ticket, Plus, Pencil, Trash2, RefreshCw, Percent, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const DiscountCodes = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [codes, setCodes] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [newCode, setNewCode] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    maxUses: null,
    validFrom: '',
    validUntil: '',
    isActive: true,
    appliesTo: 'all',
    description: ''
  });

  const loadCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/discount-codes`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setCodes(await res.json());
      }
    } catch (error) {
      console.error('Failed to load discount codes:', error);
      toast.error('Failed to load discount codes');
    }
    setLoading(false);
  }, [getAuthHeaders]);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  const handleSave = async () => {
    const codeData = editingCode || newCode;
    
    if (!codeData.code.trim()) {
      toast.error('Please enter a discount code');
      return;
    }
    if (codeData.discountValue <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }

    setSaving(true);
    try {
      const isEdit = !!editingCode;
      const url = isEdit 
        ? `${API_URL}/api/discount-codes/${editingCode.id}`
        : `${API_URL}/api/discount-codes`;
      
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...codeData,
          maxUses: codeData.maxUses ? parseInt(codeData.maxUses) : null,
          validFrom: codeData.validFrom || null,
          validUntil: codeData.validUntil || null
        })
      });

      if (res.ok) {
        toast.success(isEdit ? 'Discount code updated!' : 'Discount code created!');
        setShowDialog(false);
        setEditingCode(null);
        setNewCode({
          code: '',
          discountType: 'percentage',
          discountValue: 10,
          minOrderAmount: 0,
          maxUses: null,
          validFrom: '',
          validUntil: '',
          isActive: true,
          appliesTo: 'all',
          description: ''
        });
        loadCodes();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (codeId) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/discount-codes/${codeId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (res.ok) {
        toast.success('Discount code deleted');
        loadCodes();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (code) => {
    setEditingCode({ ...code });
    setShowDialog(true);
  };

  const currentCode = editingCode || newCode;
  const setCurrentCode = editingCode ? setEditingCode : setNewCode;

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ticket className="h-8 w-8 text-primary" />
          <div>
            <h2 className="font-heading text-2xl font-bold">Discount Codes</h2>
            <p className="text-muted-foreground">Create and manage discount codes for checkout</p>
          </div>
        </div>
        <Button onClick={() => { setEditingCode(null); setShowDialog(true); }} data-testid="add-discount-btn">
          <Plus className="h-4 w-4 mr-2" />
          Add Discount Code
        </Button>
      </div>

      {/* Codes Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-primary">{code.code}</span>
                    {code.description && (
                      <p className="text-xs text-muted-foreground mt-1">{code.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {code.discountType === 'percentage' ? (
                        <>
                          <Percent className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{code.discountValue}%</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">${code.discountValue}</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {code.minOrderAmount > 0 ? `$${code.minOrderAmount}` : '-'}
                  </TableCell>
                  <TableCell>
                    {code.maxUses ? `${code.usedCount || 0}/${code.maxUses}` : `${code.usedCount || 0}/∞`}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{code.appliesTo}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={code.isActive ? 'default' : 'secondary'}>
                      {code.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(code)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(code.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {codes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No discount codes yet. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              {editingCode ? 'Edit Discount Code' : 'Create Discount Code'}
            </DialogTitle>
            <DialogDescription>
              Create a discount code that customers can use at checkout
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., WELCOME10"
                  value={currentCode.code}
                  onChange={(e) => setCurrentCode({ ...currentCode, code: e.target.value.toUpperCase() })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select 
                  value={currentCode.discountType} 
                  onValueChange={(v) => setCurrentCode({ ...currentCode, discountType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  {currentCode.discountType === 'percentage' ? 'Discount %' : 'Discount $'}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  step={currentCode.discountType === 'percentage' ? '1' : '0.01'}
                  value={currentCode.discountValue}
                  onChange={(e) => setCurrentCode({ ...currentCode, discountValue: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrder">Min Order ($)</Label>
                <Input
                  id="minOrder"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentCode.minOrderAmount}
                  onChange={(e) => setCurrentCode({ ...currentCode, minOrderAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Uses (leave empty for unlimited)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={currentCode.maxUses || ''}
                  onChange={(e) => setCurrentCode({ ...currentCode, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appliesTo">Applies To</Label>
                <Select 
                  value={currentCode.appliesTo} 
                  onValueChange={(v) => setCurrentCode({ ...currentCode, appliesTo: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="products">Products Only</SelectItem>
                    <SelectItem value="classes">Classes Only</SelectItem>
                    <SelectItem value="services">Services Only</SelectItem>
                    <SelectItem value="retreats">Retreats Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From (optional)</Label>
                <Input
                  id="validFrom"
                  type="datetime-local"
                  value={currentCode.validFrom ? currentCode.validFrom.slice(0, 16) : ''}
                  onChange={(e) => setCurrentCode({ ...currentCode, validFrom: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until (optional)</Label>
                <Input
                  id="validUntil"
                  type="datetime-local"
                  value={currentCode.validUntil ? currentCode.validUntil.slice(0, 16) : ''}
                  onChange={(e) => setCurrentCode({ ...currentCode, validUntil: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="e.g., Welcome discount for new customers"
                value={currentCode.description}
                onChange={(e) => setCurrentCode({ ...currentCode, description: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <Label htmlFor="isActive">Active</Label>
                <p className="text-xs text-muted-foreground">Enable or disable this discount code</p>
              </div>
              <Switch
                id="isActive"
                checked={currentCode.isActive}
                onCheckedChange={(checked) => setCurrentCode({ ...currentCode, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !currentCode.code.trim()}>
              {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              {editingCode ? 'Update' : 'Create'} Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

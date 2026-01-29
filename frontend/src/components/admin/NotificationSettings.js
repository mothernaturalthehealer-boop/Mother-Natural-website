import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Bell, Save, RefreshCw, Download, FileSpreadsheet, Package, Users, Calendar, Mountain, Heart, ShoppingCart, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const NotificationSettings = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [settings, setSettings] = useState({
    enabled: true,
    email: 'admin@mothernatural.com'
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/settings/low-stock`);
      if (response.ok) {
        const data = await response.json();
        setSettings({
          enabled: data.enabled ?? true,
          email: data.email || 'admin@mothernatural.com'
        });
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/settings/low-stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        toast.success('Notification settings saved!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const response = await fetch(`${API_URL}/api/export/${type}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} data exported!`);
      } else {
        toast.error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
    setExporting(null);
  };

  const exportOptions = [
    { type: 'revenue', label: 'Revenue', icon: DollarSign, color: 'text-green-600' },
    { type: 'orders', label: 'Orders', icon: ShoppingCart, color: 'text-blue-600' },
    { type: 'products', label: 'Products', icon: Package, color: 'text-purple-600' },
    { type: 'users', label: 'Users', icon: Users, color: 'text-orange-600' },
    { type: 'appointments', label: 'Appointments', icon: Calendar, color: 'text-pink-600' },
    { type: 'classes', label: 'Classes', icon: FileSpreadsheet, color: 'text-cyan-600' },
    { type: 'retreats', label: 'Retreats', icon: Mountain, color: 'text-emerald-600' },
    { type: 'fundraisers', label: 'Fundraisers', icon: Heart, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Low Stock Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="font-heading text-2xl">Low Stock Notifications</CardTitle>
                <CardDescription>Get notified when products are running low</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={loadSettings} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Enable Low Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications when product stock falls below threshold
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
            />
          </div>

          {/* Notification Email */}
          <div className="space-y-2">
            <Label htmlFor="notificationEmail">Notification Email</Label>
            <Input
              id="notificationEmail"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="admin@example.com"
              className="max-w-md"
              disabled={!settings.enabled}
            />
            <p className="text-xs text-muted-foreground">
              Email address to receive low stock notifications
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-2">How it works</h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>Set a low stock threshold for each product in Product Management</li>
              <li>When a purchase reduces stock below the threshold, you&apos;ll get an email</li>
              <li>Default threshold is 5 units if not specified per product</li>
            </ul>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary-dark">
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Download className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="font-heading text-2xl">Export Reports</CardTitle>
              <CardDescription>Download your data as CSV files for reporting and analysis</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {exportOptions.map(({ type, label, icon: Icon, color }) => (
              <Button
                key={type}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-muted/50"
                onClick={() => handleExport(type)}
                disabled={exporting === type}
                data-testid={`export-${type}-btn`}
              >
                {exporting === type ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <Icon className={`h-6 w-6 ${color}`} />
                )}
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">Export CSV</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

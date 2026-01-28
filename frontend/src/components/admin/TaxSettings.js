import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Receipt, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const TaxSettings = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    taxEnabled: true,
    taxRate: 8,
    taxLabel: 'Sales Tax'
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/settings/tax`);
      if (response.ok) {
        const data = await response.json();
        setSettings({
          taxEnabled: data.taxEnabled,
          taxRate: data.taxRate * 100, // Convert to percentage for display
          taxLabel: data.taxLabel || 'Sales Tax'
        });
      }
    } catch (error) {
      console.error('Failed to load tax settings:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/settings/tax`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          taxEnabled: settings.taxEnabled,
          taxRate: settings.taxRate / 100, // Convert percentage to decimal
          taxLabel: settings.taxLabel
        })
      });
      
      if (response.ok) {
        toast.success('Tax settings saved successfully!');
      } else {
        toast.error('Failed to save tax settings');
      }
    } catch (error) {
      console.error('Error saving tax settings:', error);
      toast.error('Failed to save tax settings');
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="font-heading text-2xl">Tax Settings</CardTitle>
              <CardDescription>Configure sales tax for your orders</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadSettings} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tax Enabled Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div className="space-y-0.5">
            <Label className="text-base font-semibold">Enable Tax Collection</Label>
            <p className="text-sm text-muted-foreground">
              When enabled, tax will be calculated and added to all orders
            </p>
          </div>
          <Switch
            checked={settings.taxEnabled}
            onCheckedChange={(checked) => setSettings({ ...settings, taxEnabled: checked })}
          />
        </div>

        {/* Tax Rate */}
        <div className="space-y-2">
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={settings.taxRate}
              onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
              className="max-w-32"
              disabled={!settings.taxEnabled}
            />
            <span className="text-muted-foreground">%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter your state's sales tax rate (e.g., 8 for 8%)
          </p>
        </div>

        {/* Tax Label */}
        <div className="space-y-2">
          <Label htmlFor="taxLabel">Tax Label</Label>
          <Input
            id="taxLabel"
            value={settings.taxLabel}
            onChange={(e) => setSettings({ ...settings, taxLabel: e.target.value })}
            placeholder="Sales Tax"
            className="max-w-xs"
            disabled={!settings.taxEnabled}
          />
          <p className="text-xs text-muted-foreground">
            How the tax appears on receipts (e.g., "Sales Tax", "State Tax")
          </p>
        </div>

        {/* Preview */}
        {settings.taxEnabled && (
          <div className="p-4 border rounded-lg bg-muted/10">
            <h4 className="font-semibold mb-3">Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>$100.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{settings.taxLabel} ({settings.taxRate}%)</span>
                <span>${(100 * settings.taxRate / 100).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>${(100 + 100 * settings.taxRate / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

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
              Save Tax Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

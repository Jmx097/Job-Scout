'use client';

import { useEffect, useState } from 'react';
import {
  User,
  Clock,
  Trash2,
  Download,
  Key,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { settingsApi, openaiApi, profileApi } from '@/lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [apiKeyActive, setApiKeyActive] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, profilesRes, keyStatus] = await Promise.all([
        settingsApi.get(),
        profileApi.list(),
        openaiApi.status(),
      ]);

      // API returns { data: ... } - request() throws on error, so no success check needed
      if (settingsRes?.data) setSettings(settingsRes.data);
      if (profilesRes?.data) setProfiles((profilesRes.data as any[]) || []);
      // openaiApi.status returns { active: boolean } directly
      setApiKeyActive(keyStatus?.active || false);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await settingsApi.update(settings);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidateKey = async () => {
    if (!newApiKey.trim()) return;
    setIsValidating(true);
    setMessage(null);
    try {
      // openaiApi.validate returns { valid: boolean, message?: string } directly
      const res = await openaiApi.validate(newApiKey);
      if (res.valid) {
        setApiKeyActive(true);
        setNewApiKey('');
        setMessage({ type: 'success', text: 'API key validated and saved to session!' });
      } else {
        setMessage({ type: 'error', text: res.message || 'Invalid key' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Validation failed' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearKey = async () => {
    try {
      await openaiApi.clear();
      setApiKeyActive(false);
      setMessage({ type: 'success', text: 'API key cleared from session' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to clear key' });
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await settingsApi.export(format);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `job_scout_export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setMessage({ type: 'error', text: 'Export failed' });
    }
  };

  const handlePurge = async () => {
    setIsPurging(true);
    try {
      await settingsApi.purge();
      setMessage({ type: 'success', text: 'All data purged successfully' });
      setShowPurgeConfirm(false);
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Purge failed' });
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'
              : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* OpenAI API Key */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              OpenAI API Key
            </CardTitle>
            <CardDescription>
              Your key is stored in session only, never in our database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Keys are never stored permanently
              </span>
            </div>

            {apiKeyActive ? (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-4 w-4" />
                  <span>API key is active</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleClearKey}>
                  Clear Key
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  className="font-mono"
                />
                <Button
                  onClick={handleValidateKey}
                  disabled={isValidating || !newApiKey.trim()}
                  className="w-full"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    'Validate & Save'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Search Schedule
            </CardTitle>
            <CardDescription>How often to automatically search for new jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['manual', '1h', '3h', '6h', '12h', '24h'].map((interval) => (
                <label
                  key={interval}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    profiles[0]?.schedule_interval === interval
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="schedule"
                    value={interval}
                    checked={profiles[0]?.schedule_interval === interval}
                    onChange={async (e) => {
                      if (profiles[0]?.id) {
                        await profileApi.update(profiles[0].id, {
                          schedule_interval: e.target.value,
                        });
                        await loadData();
                      }
                    }}
                    className="sr-only"
                  />
                  <span className="font-medium">
                    {interval === 'manual' ? 'Manual Only' : `Every ${interval.replace('h', ' hour(s)')}`}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Export
            </CardTitle>
            <CardDescription>Download your data in various formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full" onClick={() => handleExport('json')}>
              Export as JSON
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleExport('csv')}>
              Export as CSV
            </Button>
          </CardContent>
        </Card>

        {/* Auto Purge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Data Retention
            </CardTitle>
            <CardDescription>Automatically delete old job data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Auto-purge after (days)</Label>
              <select
                value={settings?.auto_purge_days || 30}
                onChange={(e) =>
                  setSettings({ ...settings, auto_purge_days: parseInt(e.target.value) })
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value={0}>Never (keep all data)</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="md:col-span-2 border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            {!showPurgeConfirm ? (
              <Button variant="destructive" onClick={() => setShowPurgeConfirm(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Purge All Data
              </Button>
            ) : (
              <div className="p-4 bg-destructive/10 rounded-lg space-y-4">
                <p className="text-destructive font-medium">
                  Are you sure? This will permanently delete all your jobs, profiles, and search
                  history. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handlePurge}
                    disabled={isPurging}
                  >
                    {isPurging ? 'Purging...' : 'Yes, Delete Everything'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowPurgeConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

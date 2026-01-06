'use client';

import { useEffect, useState } from 'react';
import { 
  Clock, Trash2, Download, Shield, AlertTriangle, Key, 
  CheckCircle, Loader2, Calendar 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { settingsApi, openaiApi, profileApi, metricsApi } from '@/lib/api';

const SCHEDULE_OPTIONS = [
  { value: 'manual', label: 'Manual only' },
  { value: '1h', label: 'Every hour' },
  { value: '3h', label: 'Every 3 hours' },
  { value: '6h', label: 'Every 6 hours' },
  { value: '12h', label: 'Every 12 hours' },
  { value: '24h', label: 'Daily' },
];

interface Settings {
  auto_purge_days: number;
  privacy_mode: boolean;
  export_format: string;
}

interface Health {
  api_key_active: boolean;
  next_scheduled_run: string | null;
  data_freshness_days: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [schedule, setSchedule] = useState('manual');
  const [apiKey, setApiKey] = useState('');
  const [isKeyActive, setIsKeyActive] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, healthRes, profilesRes] = await Promise.all([
        settingsApi.get(),
        metricsApi.health(),
        profileApi.list(),
      ]);

      // API returns { data: ... } - request() throws on error, so no success check needed
      if (settingsRes?.data) {
        setSettings(settingsRes.data as Settings);
      }

      if (healthRes?.data) {
        const h = healthRes.data as Health;
        setHealth(h);
        setIsKeyActive(h.api_key_active);
      }

      if (profilesRes?.data && (profilesRes.data as any[])[0]) {
        setSchedule((profilesRes.data as any[])[0].schedule_interval || 'manual');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleValidateKey = async () => {
    if (!apiKey.trim()) return;

    setIsValidating(true);
    setMessage(null);

    try {
      // openaiApi.validate returns { valid: boolean, message?: string } directly
      const response = await openaiApi.validate(apiKey);
      if (response.valid) {
        setIsKeyActive(true);
        setApiKey('');
        setMessage({ type: 'success', text: 'API key validated and saved to session' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Invalid API key' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to validate key' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearKey = async () => {
    try {
      await openaiApi.clear();
      setIsKeyActive(false);
      setMessage({ type: 'success', text: 'API key cleared from session' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to clear key' });
    }
  };

  const handleScheduleChange = async (value: string) => {
    setSchedule(value);
    try {
      // API returns { data: ... } - access data property
      const profilesRes = await profileApi.list();
      if (profilesRes?.data && (profilesRes.data as any[])[0]) {
        await profileApi.update((profilesRes.data as any[])[0].id, { schedule_interval: value });
        setMessage({ type: 'success', text: 'Schedule updated' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update schedule' });
    }
  };

  const handleUpdateSettings = async (updates: Partial<Settings>) => {
    setIsSaving(true);
    try {
      await settingsApi.update(updates);
      setSettings((prev) => (prev ? { ...prev, ...updates } : null));
      setMessage({ type: 'success', text: 'Settings saved' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePurge = async () => {
    if (!confirm('Are you sure? This will delete ALL your jobs, profiles, and search history.')) {
      return;
    }

    setIsPurging(true);
    try {
      await settingsApi.purge();
      setMessage({ type: 'success', text: 'All data purged successfully' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to purge data' });
    } finally {
      setIsPurging(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await settingsApi.export(format);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `job_scout_export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to export data' });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300' 
            : 'bg-destructive/10 text-destructive'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenAI API Key
          </CardTitle>
          <CardDescription>
            Your key is stored only in your browser session (24h) - never saved to database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isKeyActive ? (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                <span>API key is active</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleClearKey}>
                Clear Key
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono"
              />
              <Button onClick={handleValidateKey} disabled={isValidating || !apiKey.trim()}>
                {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Validate'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Search Schedule
          </CardTitle>
          <CardDescription>How often to automatically search for new jobs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SCHEDULE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleScheduleChange(option.value)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  schedule === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {health?.next_scheduled_run && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Next run: {new Date(health.next_scheduled_run).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Export your data or configure auto-cleanup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Purge */}
          <div className="space-y-2">
            <Label>Auto-purge jobs older than</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={settings?.auto_purge_days || 30}
                onChange={(e) => handleUpdateSettings({ auto_purge_days: parseInt(e.target.value) || 30 })}
                className="w-20"
              />
              <span className="text-muted-foreground">days</span>
            </div>
          </div>

          {/* Export */}
          <div className="space-y-2">
            <Label>Export Data</Label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport('json')}>
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Purge */}
          <div className="pt-4 border-t">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-destructive">Danger Zone</p>
                <p className="text-sm text-muted-foreground">Delete all your data permanently</p>
              </div>
              <Button variant="destructive" onClick={handlePurge} disabled={isPurging}>
                {isPurging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Purge All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

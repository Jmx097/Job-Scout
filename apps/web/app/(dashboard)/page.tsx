'use client';

import { useEffect, useState } from 'react';
import { Briefcase, CheckCircle, Bookmark, EyeOff, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatsOverview from '@/components/dashboard/StatsOverview';
import JobFeed from '@/components/dashboard/JobFeed';
import FilterBar from '@/components/dashboard/FilterBar';
import { metricsApi, jobsApi, openaiApi } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [apiKeyActive, setApiKeyActive] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    tier: '',
    source: '',
    sortBy: 'score',
    sortOrder: 'desc',
    search: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, keyStatus] = await Promise.all([
        metricsApi.overview(),
        openaiApi.status(),
      ]);

      // API returns { data: ... } - request() throws on error, so no success check needed
      if (statsRes?.data) {
        setStats(statsRes.data);
      }
      // openaiApi.status returns { active: boolean } directly
      setApiKeyActive(keyStatus?.active || false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const handleRefresh = async () => {
    if (!apiKeyActive) {
      alert('Please enter your OpenAI API key in settings first.');
      return;
    }

    setIsRefreshing(true);
    try {
      await jobsApi.search();
      await loadData();
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Job Dashboard</h1>
          <p className="text-muted-foreground">
            Your personalized job matches, scored and ranked by AI
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Searching...' : 'Search for Jobs'}
        </Button>
      </div>

      {/* API Key Warning */}
      {!apiKeyActive && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200">
            <strong>API Key Required:</strong> Please enter your OpenAI API key in{' '}
            <a href="/dashboard/settings" className="underline">
              Settings
            </a>{' '}
            to enable job scoring.
          </p>
        </div>
      )}

      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Filter Bar */}
      <FilterBar filters={filters} onFiltersChange={setFilters} />

      {/* Job Feed */}
      <JobFeed filters={filters} onStatsUpdate={loadData} />
    </div>
  );
}

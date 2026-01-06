'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsOverview from '@/components/dashboard/StatsOverview';
import FilterBar from '@/components/dashboard/FilterBar';
import JobFeed from '@/components/dashboard/JobFeed';
import { metricsApi, openaiApi, jobsApi } from '@/lib/api';

interface Stats {
  total_jobs: number;
  applied_count: number;
  saved_count: number;
  hidden_count: number;
  new_count: number;
  average_score: number;
  interview_likelihood: number;
  tier_distribution: Record<string, number>;
}

interface Filters {
  status: string;
  tier: string;
  source: string;
  search: string;
  sortBy: string;
  sortOrder: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [apiKeyActive, setApiKeyActive] = useState<boolean | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    tier: '',
    source: '',
    search: '',
    sortBy: 'score',
    sortOrder: 'desc',
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, keyRes] = await Promise.all([
        metricsApi.overview(),
        openaiApi.status(),
      ]);

      // API returns { data: ... } - request() throws on error, so no success check needed
      if (statsRes?.data) {
        setStats(statsRes.data as Stats);
      }
      // openaiApi.status returns { active: boolean } directly
      setApiKeyActive(keyRes?.active || false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchError(null);

    try {
      // jobsApi.search() throws on error, no success check needed
      await jobsApi.search();
      // Refresh stats and job feed
      await loadData();
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      setSearchError(err.message || 'Failed to search for jobs');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Job Dashboard</h1>
          <p className="text-muted-foreground">
            Your personalized job matches, scored by AI
          </p>
        </div>

        <Button
          onClick={handleSearch}
          disabled={isSearching || !apiKeyActive}
          className="min-w-[160px]"
        >
          {isSearching ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search for Jobs
            </>
          )}
        </Button>
      </div>

      {/* API Key Warning */}
      {apiKeyActive === false && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div className="flex-1">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              OpenAI API key required
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Add your API key in Settings to search for and score jobs.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/app/settings'}
          >
            Add Key
          </Button>
        </div>
      )}

      {/* Search Error */}
      {searchError && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>{searchError}</p>
        </div>
      )}

      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Filter Bar */}
      <FilterBar filters={filters} onFiltersChange={handleFilterChange} />

      {/* Job Feed */}
      <JobFeed key={refreshKey} filters={filters} onStatsUpdate={loadData} />
    </div>
  );
}

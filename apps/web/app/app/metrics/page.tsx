'use client';

import { useEffect, useState } from 'react';
import { BarChart3, PieChart, Building2, Zap, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { metricsApi, jobsApi } from '@/lib/api';

interface ScoringFormula {
  weights: Record<string, { weight: number; description: string }>;
  tiers: Record<string, { min_score: number; label: string; description: string }>;
}

interface Stats {
  tier_distribution: Record<string, number>;
  total_jobs: number;
}

export default function MetricsPage() {
  const [formula, setFormula] = useState<ScoringFormula | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [topCompanies, setTopCompanies] = useState<{ company: string; count: number }[]>([]);
  const [sourceStats, setSourceStats] = useState<{ source: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [formulaRes, statsRes, jobsRes] = await Promise.all([
        metricsApi.scoring(),
        metricsApi.overview(),
        jobsApi.list({ page_size: 100 }),
      ]);

      // API returns { data: ... } - request() throws on error, so no success check needed
      if (formulaRes?.data) setFormula(formulaRes.data as ScoringFormula);
      if (statsRes?.data) setStats(statsRes.data as Stats);

      // Calculate company and source stats from jobs
      if (jobsRes?.data) {
        const companies: Record<string, number> = {};
        const sources: Record<string, number> = {};

        (jobsRes.data as any[]).forEach((job: any) => {
          if (job.company) {
            companies[job.company] = (companies[job.company] || 0) + 1;
          }
          if (job.source) {
            sources[job.source] = (sources[job.source] || 0) + 1;
          }
        });

        setTopCompanies(
          Object.entries(companies)
            .map(([company, count]) => ({ company, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        );

        setSourceStats(
          Object.entries(sources)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count)
        );
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const tierColors: Record<string, string> = {
    A: 'bg-green-500',
    B: 'bg-blue-500',
    C: 'bg-yellow-500',
    D: 'bg-gray-400',
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Metrics</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-48" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Metrics & Analytics</h1>
        <button
          onClick={loadData}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scoring Formula */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Scoring Formula
            </CardTitle>
            <CardDescription>How jobs are scored against your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {formula?.weights &&
              Object.entries(formula.weights).map(([key, data]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{key.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{data.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${data.weight * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono w-10">{Math.round(data.weight * 100)}%</span>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Tier Distribution
            </CardTitle>
            <CardDescription>Job quality breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['A', 'B', 'C', 'D'].map((tier) => {
                const count = stats?.tier_distribution?.[tier] || 0;
                const total = stats?.total_jobs || 1;
                const percentage = Math.round((count / total) * 100) || 0;

                return (
                  <div key={tier} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${tierColors[tier]} flex items-center justify-center text-white font-bold`}>
                      {tier}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{formula?.tiers?.[tier]?.label || `Tier ${tier}`}</span>
                        <span>{count} jobs</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${tierColors[tier]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Source Effectiveness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Source Effectiveness
            </CardTitle>
            <CardDescription>Jobs found by source</CardDescription>
          </CardHeader>
          <CardContent>
            {sourceStats.length > 0 ? (
              <div className="space-y-3">
                {sourceStats.map(({ source, count }) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="capitalize">{source}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(count / (sourceStats[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-mono w-10">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Top Companies
            </CardTitle>
            <CardDescription>Most common employers in your search</CardDescription>
          </CardHeader>
          <CardContent>
            {topCompanies.length > 0 ? (
              <div className="space-y-2">
                {topCompanies.slice(0, 8).map(({ company, count }, index) => (
                  <div key={company} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm w-4">{index + 1}.</span>
                      <span className="truncate max-w-[200px]">{company}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{count} jobs</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

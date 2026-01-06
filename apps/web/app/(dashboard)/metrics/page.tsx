'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Target, Activity, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { metricsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface ScoringFormula {
  weights: Record<string, { weight: number; description: string }>;
  tiers: Record<string, { min_score: number; label: string; description: string }>;
}

interface SystemHealth {
  last_search_run: {
    started_at: string;
    completed_at: string | null;
    status: string;
    jobs_found: number;
    jobs_scored: number;
    api_tokens_used: number;
  } | null;
  api_key_active: boolean;
  estimated_api_usage: number;
  data_freshness_days: number;
}

export default function MetricsPage() {
  const [scoringFormula, setScoringFormula] = useState<ScoringFormula | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [formulaRes, healthRes, statsRes] = await Promise.all([
        metricsApi.scoring(),
        metricsApi.health(),
        metricsApi.overview(),
      ]);

      // API returns { data: ... } - request() throws on error, so no success check needed
      if (formulaRes?.data) setScoringFormula(formulaRes.data as ScoringFormula);
      if (healthRes?.data) setHealth(healthRes.data as SystemHealth);
      if (statsRes?.data) setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Metrics & Transparency</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-32 mb-4" />
                <div className="h-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Metrics & Transparency</h1>
        <p className="text-muted-foreground">
          Understand how we score and match jobs to your profile
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scoring Formula */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Scoring Formula
            </CardTitle>
            <CardDescription>
              Each job is scored based on these weighted factors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scoringFormula?.weights &&
                Object.entries(scoringFormula.weights).map(([key, { weight, description }]) => (
                  <div key={key} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <Badge variant="secondary">{Math.round(weight * 100)}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tier Distribution
            </CardTitle>
            <CardDescription>Jobs by match quality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.tier_distribution &&
                Object.entries(stats.tier_distribution).map(([tier, count]) => {
                  const total = Object.values(stats.tier_distribution as Record<string, number>).reduce(
                    (a: number, b: number) => a + b,
                    0
                  );
                  const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
                  const tierInfo = scoringFormula?.tiers?.[tier];

                  return (
                    <div key={tier}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">
                          Tier {tier}
                          {tierInfo && (
                            <span className="text-muted-foreground ml-2">
                              {tierInfo.label}
                            </span>
                          )}
                        </span>
                        <span>
                          {count as number} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            tier === 'A'
                              ? 'bg-green-500'
                              : tier === 'B'
                              ? 'bg-blue-500'
                              : tier === 'C'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Tier Definitions */}
        <Card>
          <CardHeader>
            <CardTitle>Tier Definitions</CardTitle>
            <CardDescription>What each tier means for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scoringFormula?.tiers &&
                Object.entries(scoringFormula.tiers).map(([tier, { min_score, label, description }]) => (
                  <div key={tier} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge
                      variant={
                        tier === 'A'
                          ? 'tierA'
                          : tier === 'B'
                          ? 'tierB'
                          : tier === 'C'
                          ? 'tierC'
                          : 'tierD'
                      }
                      className="h-fit"
                    >
                      {tier}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {label}{' '}
                        <span className="text-muted-foreground font-normal">
                          (≥{Math.round(min_score * 100)}%)
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Current status and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {/* API Key Status */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">API Key</p>
                <div className="flex items-center gap-2">
                  {health?.api_key_active ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-yellow-600">Not Set</span>
                    </>
                  )}
                </div>
              </div>

              {/* Last Search */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Last Search</p>
                <p className="font-medium">
                  {health?.last_search_run
                    ? formatDate(health.last_search_run.started_at)
                    : 'Never'}
                </p>
                {health?.last_search_run && (
                  <p className="text-xs text-muted-foreground">
                    Found {health.last_search_run.jobs_found} jobs
                  </p>
                )}
              </div>

              {/* Data Freshness */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Data Freshness</p>
                <p className="font-medium">
                  {health?.data_freshness_days === -1
                    ? 'No data'
                    : health?.data_freshness_days === 0
                    ? 'Today'
                    : `${health?.data_freshness_days} days old`}
                </p>
              </div>

              {/* API Usage (24h) */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">API Usage (24h)</p>
                <p className="font-medium">
                  {health?.estimated_api_usage?.toLocaleString() || 0} tokens
                </p>
                <p className="text-xs text-muted-foreground">
                  ~${((health?.estimated_api_usage || 0) * 0.00015).toFixed(4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { Briefcase, CheckCircle, Bookmark, EyeOff, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatScore } from '@/lib/utils';

interface StatsOverviewProps {
  stats: {
    total_jobs: number;
    applied_count: number;
    saved_count: number;
    hidden_count: number;
    new_count: number;
    average_score: number;
    interview_likelihood: number;
    tier_distribution: Record<string, number>;
  } | null;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-16 mb-2" />
              <div className="h-8 bg-muted rounded w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Jobs',
      value: stats.total_jobs,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Applied',
      value: stats.applied_count,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      label: 'Saved',
      value: stats.saved_count,
      icon: Bookmark,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    },
    {
      label: 'Hidden',
      value: stats.hidden_count,
      icon: EyeOff,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
    },
    {
      label: 'Avg Score',
      value: formatScore(stats.average_score),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      label: 'Interview Rate',
      value: `${stats.interview_likelihood}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label} className="job-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

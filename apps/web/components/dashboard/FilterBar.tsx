'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterBarProps {
  filters: {
    status: string;
    tier: string;
    source: string;
    sortBy: string;
    sortOrder: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
}

const STATUSES = [
  { value: '', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'applied', label: 'Applied' },
  { value: 'saved', label: 'Saved' },
  { value: 'hidden', label: 'Hidden' },
];

const TIERS = [
  { value: '', label: 'All Tiers' },
  { value: 'A', label: 'Tier A' },
  { value: 'B', label: 'Tier B' },
  { value: 'C', label: 'Tier C' },
  { value: 'D', label: 'Tier D' },
];

const SOURCES = [
  { value: '', label: 'All Sources' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'glassdoor', label: 'Glassdoor' },
  { value: 'ziprecruiter', label: 'ZipRecruiter' },
];

export default function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={filters.tier}
          onChange={(e) => updateFilter('tier', e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          {TIERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={filters.source}
          onChange={(e) => updateFilter('source', e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            onFiltersChange({ ...filters, sortBy, sortOrder });
          }}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="score-desc">Highest Score</option>
          <option value="score-asc">Lowest Score</option>
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="salary_max-desc">Highest Salary</option>
        </select>
      </div>
    </div>
  );
}

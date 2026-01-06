'use client';

import { MapPin, Building2, DollarSign, ExternalLink, Check, Bookmark, EyeOff } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatSalary, formatDate, formatScore, getScoreColor } from '@/lib/utils';

interface JobCardProps {
  job: {
    id: number;
    title: string;
    company: string | null;
    location: string | null;
    salary_min: number | null;
    salary_max: number | null;
    score: number | null;
    tier: string | null;
    matched_skills: string[] | null;
    status: string;
    source: string | null;
    url: string | null;
    created_at: string;
  };
  onSelect: () => void;
  onStatusChange: (id: number, status: string) => void;
}

const tierVariants: Record<string, 'tierA' | 'tierB' | 'tierC' | 'tierD'> = {
  A: 'tierA',
  B: 'tierB',
  C: 'tierC',
  D: 'tierD',
};

export default function JobCard({ job, onSelect, onStatusChange }: JobCardProps) {
  const isApplied = job.status === 'applied';
  const isSaved = job.status === 'saved';
  const isHidden = job.status === 'hidden';

  return (
    <Card
      className={`job-card cursor-pointer ${isHidden ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with tier badge */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{job.title}</h3>
            {job.company && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Building2 className="h-3.5 w-3.5" />
                <span className="truncate">{job.company}</span>
              </div>
            )}
          </div>
          {job.tier && (
            <Badge variant={tierVariants[job.tier] || 'secondary'} className="flex-shrink-0">
              Tier {job.tier}
            </Badge>
          )}
        </div>

        {/* Location & Salary */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{job.location}</span>
            </div>
          )}
          {(job.salary_min || job.salary_max) && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              <span>{formatSalary(job.salary_min, job.salary_max)}</span>
            </div>
          )}
        </div>

        {/* Score */}
        {job.score !== null && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                style={{ width: `${job.score * 100}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${getScoreColor(job.score)}`}>
              {formatScore(job.score)}
            </span>
          </div>
        )}

        {/* Matched Skills */}
        {job.matched_skills && job.matched_skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.matched_skills.slice(0, 4).map((skill, i) => (
              <span key={i} className="skill-pill skill-pill-matched">
                {skill}
              </span>
            ))}
            {job.matched_skills.length > 4 && (
              <span className="skill-pill">+{job.matched_skills.length - 4}</span>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(job.created_at)}</span>
          {job.source && (
            <>
              <span>•</span>
              <span className="capitalize">{job.source}</span>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2" onClick={(e) => e.stopPropagation()}>
        <Button
          size="sm"
          variant={isApplied ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => onStatusChange(job.id, isApplied ? 'new' : 'applied')}
        >
          <Check className="h-4 w-4 mr-1" />
          {isApplied ? 'Applied' : 'Apply'}
        </Button>
        <Button
          size="sm"
          variant={isSaved ? 'secondary' : 'ghost'}
          onClick={() => onStatusChange(job.id, isSaved ? 'new' : 'saved')}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onStatusChange(job.id, isHidden ? 'new' : 'hidden')}
        >
          <EyeOff className="h-4 w-4" />
        </Button>
        {job.url && (
          <Button size="sm" variant="ghost" asChild>
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

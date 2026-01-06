'use client';

import { MapPin, Building2, DollarSign, ExternalLink, Check, Bookmark, EyeOff, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatSalary, formatScore, getScoreColor } from '@/lib/utils';

interface JobDetailModalProps {
  job: {
    id: number;
    title: string;
    company: string | null;
    location: string | null;
    salary_min: number | null;
    salary_max: number | null;
    description: string | null;
    score: number | null;
    tier: string | null;
    matched_skills: string[] | null;
    scoring_breakdown: {
      skill_match: number;
      experience_level: number;
      location_match: number;
      salary_fit: number;
      company_signals: number;
      recency: number;
      matched_skills: string[];
      missing_skills: string[];
      explanation: string;
    } | null;
    status: string;
    source: string | null;
    url: string | null;
  } | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
}

const tierVariants: Record<string, 'tierA' | 'tierB' | 'tierC' | 'tierD'> = {
  A: 'tierA',
  B: 'tierB',
  C: 'tierC',
  D: 'tierD',
};

const SCORE_LABELS: Record<string, { label: string; weight: string }> = {
  skill_match: { label: 'Skill Match', weight: '35%' },
  experience_level: { label: 'Experience Level', weight: '20%' },
  location_match: { label: 'Location Match', weight: '15%' },
  salary_fit: { label: 'Salary Fit', weight: '15%' },
  company_signals: { label: 'Company Signals', weight: '10%' },
  recency: { label: 'Posting Recency', weight: '5%' },
};

export default function JobDetailModal({
  job,
  open,
  onClose,
  onStatusChange,
}: JobDetailModalProps) {
  if (!job) return null;

  const isApplied = job.status === 'applied';
  const isSaved = job.status === 'saved';
  const breakdown = job.scoring_breakdown;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <DialogTitle className="text-xl">{job.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-3 mt-2">
                {job.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {job.company}
                  </span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                )}
                {(job.salary_min || job.salary_max) && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatSalary(job.salary_min, job.salary_max)}
                  </span>
                )}
              </DialogDescription>
            </div>
            {job.tier && (
              <Badge variant={tierVariants[job.tier] || 'secondary'} className="text-base px-3 py-1">
                Tier {job.tier}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Score */}
          {job.score !== null && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Overall Match Score
                </span>
                <span className={`text-2xl font-bold ${getScoreColor(job.score)}`}>
                  {formatScore(job.score)}
                </span>
              </div>
              <div className="h-3 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                  style={{ width: `${job.score * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Scoring Breakdown */}
          {breakdown && (
            <div className="space-y-3">
              <h4 className="font-medium">Scoring Breakdown</h4>
              <div className="grid gap-2">
                {Object.entries(SCORE_LABELS).map(([key, { label, weight }]) => {
                  const value = breakdown[key as keyof typeof breakdown] as number;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-32">{label}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {Math.round(value * 100)}%
                      </span>
                      <span className="text-xs text-muted-foreground w-10">({weight})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skills Analysis */}
          {breakdown && (
            <div className="space-y-3">
              <h4 className="font-medium">Skills Analysis</h4>
              <div className="space-y-2">
                {breakdown.matched_skills?.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Matched Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {breakdown.matched_skills.map((skill, i) => (
                        <span key={i} className="skill-pill skill-pill-matched">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {breakdown.missing_skills?.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Skills to Develop</p>
                    <div className="flex flex-wrap gap-1.5">
                      {breakdown.missing_skills.map((skill, i) => (
                        <span key={i} className="skill-pill skill-pill-missing">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Explanation */}
          {breakdown?.explanation && (
            <div className="space-y-2">
              <h4 className="font-medium">AI Match Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {breakdown.explanation}
              </p>
            </div>
          )}

          {/* Job Description */}
          {job.description && (
            <div className="space-y-2">
              <h4 className="font-medium">Job Description</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                {job.description}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant={isSaved ? 'secondary' : 'outline'}
            onClick={() => onStatusChange(job.id, isSaved ? 'new' : 'saved')}
          >
            <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save for Later'}
          </Button>
          <Button
            variant={isApplied ? 'secondary' : 'default'}
            onClick={() => onStatusChange(job.id, isApplied ? 'new' : 'applied')}
          >
            <Check className="h-4 w-4 mr-2" />
            {isApplied ? 'Mark Unapplied' : 'Mark Applied'}
          </Button>
          {job.url && (
            <Button asChild>
              <a href={job.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply on {job.source || 'Site'}
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

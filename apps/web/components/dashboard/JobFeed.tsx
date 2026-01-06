'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JobCard from '@/components/jobs/JobCard';
import JobDetailModal from '@/components/jobs/JobDetailModal';
import { jobsApi } from '@/lib/api';

interface JobFeedProps {
  filters: {
    status: string;
    tier: string;
    source: string;
    sortBy: string;
    sortOrder: string;
    search: string;
  };
  onStatsUpdate: () => void;
}

export default function JobFeed({ filters, onStatsUpdate }: JobFeedProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        page_size: 20,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      };

      if (filters.status) params.status = filters.status;
      if (filters.tier) params.tier = filters.tier;
      if (filters.source) params.source = filters.source;
      if (filters.search) params.search = filters.search;

      // API returns { data, total } - request() throws on error
      const response = await jobsApi.list(params);

      setJobs((response.data as any[]) || []);
      setTotalPages(Math.ceil((response.total || 0) / 20));
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (jobId: number, status: string) => {
    try {
      await jobsApi.updateStatus(jobId, status);
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, status } : job))
      );
      onStatsUpdate();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (isLoading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No jobs found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or run a new search.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onSelect={() => setSelectedJob(job)}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

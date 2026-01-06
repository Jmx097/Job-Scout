'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, MapPin, DollarSign, Building2, Search, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { profileApi } from '@/lib/api';

const JOB_SOURCES = [
  { id: 'indeed', name: 'Indeed', icon: '🔍' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'glassdoor', name: 'Glassdoor', icon: '🚪' },
  { id: 'zip_recruiter', name: 'ZipRecruiter', icon: '📬' },
  { id: 'google', name: 'Google Jobs', icon: '🌐' },
];

export default function SearchConfigPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfig] = useState({
    sources: ['indeed', 'linkedin'],
    searchTerms: [''],
    locations: [''],
    remoteOnly: false,
    salaryMin: '',
    salaryMax: '',
    excludeKeywords: [''],
    excludeSenior: false,
    excludeInternational: false,
  });

  const toggleSource = (sourceId: string) => {
    setConfig((prev) => ({
      ...prev,
      sources: prev.sources.includes(sourceId)
        ? prev.sources.filter((s) => s !== sourceId)
        : [...prev.sources, sourceId],
    }));
  };

  const updateArrayField = (
    field: 'searchTerms' | 'locations' | 'excludeKeywords',
    index: number,
    value: string
  ) => {
    setConfig((prev) => {
      const newArr = [...prev[field]];
      newArr[index] = value;
      return { ...prev, [field]: newArr };
    });
  };

  const addArrayItem = (field: 'searchTerms' | 'locations' | 'excludeKeywords') => {
    setConfig((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'searchTerms' | 'locations' | 'excludeKeywords', index: number) => {
    if (config[field].length <= 1) return;
    setConfig((prev) => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (config.sources.length === 0) {
      setError('Please select at least one job source');
      return;
    }
    if (!config.searchTerms.some((t) => t.trim())) {
      setError('Please enter at least one job title or keyword');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const searchConfig = {
        sources: config.sources,
        search_terms: config.searchTerms.filter((t) => t.trim()),
        locations: config.locations.filter((l) => l.trim()),
        remote_only: config.remoteOnly,
        salary_min: config.salaryMin ? parseInt(config.salaryMin) * 1000 : null,
        salary_max: config.salaryMax ? parseInt(config.salaryMax) * 1000 : null,
        exclude_keywords: config.excludeKeywords.filter((k) => k.trim()),
        exclude_senior: config.excludeSenior,
        exclude_international: config.excludeInternational,
      };

      // Get first profile and update with search config
      const profilesRes = await profileApi.list();
      if (profilesRes.success && profilesRes.data?.length > 0) {
        const profiles = profilesRes.data as { id: number }[];
        await profileApi.update(profiles[0].id, { search_config: searchConfig });
      }

      router.push('/app/onboarding/api-key');
    } catch (err) {
      setError('Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex justify-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">✓</div>
        <div className="w-16 h-1 bg-primary self-center" />
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
        <div className="w-16 h-1 bg-muted self-center" />
        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">3</div>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Configure Your Search</CardTitle>
          <CardDescription>
            Tell us what you&apos;re looking for and we&apos;ll find the best matches
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Job Sources */}
          <div className="space-y-3">
            <Label className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Job Sources
            </Label>
            <div className="flex flex-wrap gap-2">
              {JOB_SOURCES.map((source) => (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    config.sources.includes(source.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <span>{source.icon}</span>
                  <span>{source.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Terms */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" />
                Job Titles / Keywords
              </Label>
              <Button variant="ghost" size="sm" onClick={() => addArrayItem('searchTerms')}>
                + Add
              </Button>
            </div>
            <div className="space-y-2">
              {config.searchTerms.map((term, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="e.g., Software Engineer, Frontend Developer"
                    value={term}
                    onChange={(e) => updateArrayField('searchTerms', index, e.target.value)}
                  />
                  {config.searchTerms.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('searchTerms', index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Locations
              </Label>
              <Button variant="ghost" size="sm" onClick={() => addArrayItem('locations')}>
                + Add
              </Button>
            </div>
            <div className="space-y-2">
              {config.locations.map((location, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="e.g., San Francisco, CA or Remote"
                    value={location}
                    onChange={(e) => updateArrayField('locations', index, e.target.value)}
                  />
                  {config.locations.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('locations', index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.remoteOnly}
                onChange={(e) => setConfig((prev) => ({ ...prev, remoteOnly: e.target.checked }))}
                className="rounded"
              />
              Remote positions only
            </label>
          </div>

          {/* Salary Range */}
          <div className="space-y-3">
            <Label className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Salary Range (Annual, in $K)
            </Label>
            <div className="flex gap-4 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={config.salaryMin}
                onChange={(e) => setConfig((prev) => ({ ...prev, salaryMin: e.target.value }))}
                className="w-28"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={config.salaryMax}
                onChange={(e) => setConfig((prev) => ({ ...prev, salaryMax: e.target.value }))}
                className="w-28"
              />
            </div>
          </div>

          {/* Exclusions */}
          <div className="space-y-3">
            <Label className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Exclusions
            </Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.excludeSenior}
                  onChange={(e) => setConfig((prev) => ({ ...prev, excludeSenior: e.target.checked }))}
                  className="rounded"
                />
                Exclude senior/leadership roles (Staff, Principal, Director, etc.)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.excludeInternational}
                  onChange={(e) => setConfig((prev) => ({ ...prev, excludeInternational: e.target.checked }))}
                  className="rounded"
                />
                Exclude international positions
              </label>
            </div>
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Exclude keywords</span>
                <Button variant="ghost" size="sm" onClick={() => addArrayItem('excludeKeywords')}>
                  + Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.excludeKeywords.map((keyword, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      placeholder="e.g., intern"
                      value={keyword}
                      onChange={(e) => updateArrayField('excludeKeywords', index, e.target.value)}
                      className="w-28 h-8"
                    />
                    {config.excludeKeywords.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('excludeKeywords', index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => router.push('/app/onboarding/resume')}>
              Back
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue to API Key'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

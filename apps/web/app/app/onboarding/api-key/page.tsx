'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Key, CheckCircle, AlertTriangle, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { openaiApi, jobsApi } from '@/lib/api';

export default function ApiKeyPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [searchProgress, setSearchProgress] = useState({ status: '', found: 0 });
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your OpenAI API key');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // openaiApi.validate returns { valid: boolean, message?: string } directly
      const response = await openaiApi.validate(apiKey);
      if (response.valid) {
        setIsValidated(true);
      } else {
        setError(response.message || 'Invalid API key');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate key');
    } finally {
      setIsValidating(false);
    }
  };

  const handleStartSearch = async () => {
    setIsSearching(true);
    setError(null);
    setSearchProgress({ status: 'Scraping jobs from sources...', found: 0 });

    try {
      // jobsApi.search() throws on error, returns { data } on success
      const response = await jobsApi.search();
      
      setSearchProgress({ 
        status: 'Complete!', 
        found: (response.data as any)?.jobs_found || 0 
      });
      
      // Short delay to show completion
      setTimeout(() => {
        router.push('/app/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to start search');
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex justify-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">✓</div>
        <div className="w-16 h-1 bg-green-500 self-center" />
        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">✓</div>
        <div className="w-16 h-1 bg-primary self-center" />
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Connect Your OpenAI Key</CardTitle>
          <CardDescription>
            We use AI to intelligently score and match jobs to your profile
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200">Your key is secure</p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                Your API key is stored only in your browser session (24h TTL). 
                It&apos;s <strong>never saved to our database</strong>.
              </p>
            </div>
          </div>

          {!isSearching ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setIsValidated(false);
                      }}
                      disabled={isValidated}
                      className="font-mono"
                    />
                    {!isValidated && (
                      <Button onClick={handleValidate} disabled={isValidating || !apiKey.trim()}>
                        {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Validate'}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your key from{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      platform.openai.com/api-keys
                    </a>
                  </p>
                </div>

                {isValidated && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-green-700 dark:text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">API key validated!</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Usage Estimate */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Estimated Usage
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• ~$0.01 per job scored (GPT-4o Mini)</li>
                  <li>• First search: ~50 jobs = ~$0.50</li>
                  <li>• Typical daily usage: under $5/month</li>
                </ul>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => router.push('/app/onboarding/config')}>
                  Back
                </Button>
                <Button
                  onClick={handleStartSearch}
                  disabled={!isValidated}
                  className="min-w-[180px]"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Start First Search
                </Button>
              </div>
            </>
          ) : (
            /* Search Progress UI */
            <div className="text-center py-8 space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Finding Your Jobs</h3>
                <p className="text-muted-foreground">{searchProgress.status}</p>
                {searchProgress.found > 0 && (
                  <p className="text-2xl font-bold text-primary mt-4">
                    {searchProgress.found} jobs found!
                  </p>
                )}
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

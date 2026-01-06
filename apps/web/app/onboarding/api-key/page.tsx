'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Key, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { openaiApi, jobsApi } from '@/lib/api';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';

export default function ApiKeyPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your OpenAI API key');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
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

    try {
      await jobsApi.search();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to start search');
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <OnboardingProgress currentStep={3} />

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Connect Your OpenAI Key</CardTitle>
          <CardDescription>
            We use OpenAI to intelligently score and match jobs to your profile
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200">Your key is secure</p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                Your API key is stored only in your browser session. It&apos;s never saved to our database.
                If you close your browser, you&apos;ll need to enter it again.
              </p>
            </div>
          </div>

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
                    {isValidating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Validate'
                    )}
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
                <span className="font-medium">API key validated successfully!</span>
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
            <h4 className="font-medium mb-2">Estimated Usage</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• ~$0.01 per job scored (using GPT-4o Mini)</li>
              <li>• First search: approximately 50 jobs = ~$0.50</li>
              <li>• Daily searches stay well under $5/month typical usage</li>
            </ul>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => router.push('/onboarding/config')}>
              Back
            </Button>
            <Button
              onClick={handleStartSearch}
              disabled={!isValidated || isSearching}
              className="min-w-[160px]"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Jobs...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Start First Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

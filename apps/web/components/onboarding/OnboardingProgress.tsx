'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { number: 1, title: 'Resume', description: 'Upload & verify' },
  { number: 2, title: 'Search Config', description: 'Set preferences' },
  { number: 3, title: 'API Key', description: 'Enable AI scoring' },
];

export default function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-4 md:gap-8">
        {steps.map((step, index) => {
          const isComplete = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div key={step.number} className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'step-indicator',
                    isComplete && 'step-indicator-complete',
                    isCurrent && 'step-indicator-active',
                    !isComplete && !isCurrent && 'step-indicator-pending'
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <div className="text-center hidden md:block">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      (isComplete || isCurrent) && 'text-foreground',
                      !isComplete && !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 md:w-20 h-0.5',
                    isComplete ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

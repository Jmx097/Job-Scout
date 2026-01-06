import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { ArrowRight, Search, Target, BarChart3, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-grid-white/10" />
        <nav className="relative z-10 container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Search className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">Job Scout</span>
          </div>
          <div className="flex gap-4">
            <SignedOut>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-white hover:text-blue-200 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Dashboard
              </Link>
            </SignedIn>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
            Find Your Perfect Job Match
            <br />
            <span className="text-blue-200">Powered by AI</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Upload your resume, set your preferences, and let our AI score and rank job opportunities
            based on your unique skills and experience.
          </p>
          <SignedOut>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
            >
              Start Your Job Search
              <ArrowRight className="h-5 w-5" />
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          </SignedIn>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Target className="h-10 w-10 text-blue-600" />}
            title="AI-Powered Matching"
            description="Our AI analyzes your resume and matches it against job listings, scoring each opportunity based on skill fit, experience level, and preferences."
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-blue-600" />}
            title="Transparent Scoring"
            description="See exactly why each job received its score with detailed breakdowns of skill matches, salary fit, location preferences, and more."
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10 text-blue-600" />}
            title="Privacy First"
            description="Your resume data is encrypted at rest. Your OpenAI key is never stored permanently. Export or delete your data anytime."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Job?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Sign up in seconds, upload your resume, and get AI-powered job recommendations tailored just for you.
          </p>
          <SignedOut>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </SignedOut>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t bg-background">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Job Scout. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

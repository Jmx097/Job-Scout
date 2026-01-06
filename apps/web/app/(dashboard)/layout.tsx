import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Search, BarChart3, Settings, LogOut, User } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Job Scout</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Search className="h-4 w-4" />
              Jobs
            </Link>
            <Link
              href="/dashboard/metrics"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Metrics
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Job Scout - AI-Powered Job Search',
  description: 'Find your perfect job match with AI-powered scoring and recommendations',
  keywords: ['job search', 'AI', 'resume', 'career', 'job matching'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}

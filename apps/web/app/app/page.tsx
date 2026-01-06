import { redirect } from 'next/navigation';

export default function AppIndexPage() {
  // Redirect /app to /app/dashboard
  redirect('/app/dashboard');
}

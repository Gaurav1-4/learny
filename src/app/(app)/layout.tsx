import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { auth } from '@/lib/auth';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar user={session.user} />
      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}

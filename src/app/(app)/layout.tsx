import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
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
    <div className="flex min-h-screen flex-col md:flex-row bg-zinc-950 text-zinc-100 antialiased overflow-x-hidden w-full max-w-full">
      {/* Mobile Top Header & Bottom Tab Bar */}
      <MobileNav user={session.user} />

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex">
        <Sidebar user={session.user} />
      </div>

      {/* Responsive Main Content Area */}
      <main className="ml-0 md:ml-64 flex-1 p-3.5 sm:p-6 md:p-8 pb-28 md:pb-8 min-w-0 max-w-full overflow-x-hidden">
        <div className="mx-auto max-w-6xl w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

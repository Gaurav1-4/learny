import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GAHA 2.0 | Life Manager',
  description: 'Your 24x7 autonomous life and schedule manager',
};

export default function GahaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

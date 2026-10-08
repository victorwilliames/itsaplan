import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import BrandPanel from '@/components/common/page/BrandPanel';
import AuthLegalNotice from './AuthLegalNotice';
import VantaHaloBackground from './VantaHaloBackground';

// The card shared by every logged-out screen. The forms read the URL (an invite
// parameter, a reset token, a "just confirmed" flag), so they render inside a
// Suspense boundary — useSearchParams needs one for these pages to prerender.
// FORK (APPLANO): animated VANTA.HALO background behind the card (fork-only).
export default function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-black p-6 md:p-10">
      <VantaHaloBackground />
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-4 md:max-w-4xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <Suspense fallback={null}>{children}</Suspense>
            <BrandPanel />
          </CardContent>
        </Card>
        <AuthLegalNotice />
      </div>
    </div>
  );
}

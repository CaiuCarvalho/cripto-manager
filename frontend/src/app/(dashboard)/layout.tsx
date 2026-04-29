'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/top-bar';

function pathnameToScreen(pathname: string): string {
  if (pathname.startsWith('/wallets'))       return 'holdings';
  if (pathname.startsWith('/transactions'))  return 'transactions';
  if (pathname.startsWith('/alerts'))        return 'alerts';
  if (pathname.startsWith('/market'))        return 'market';
  if (pathname.startsWith('/private-keys'))  return 'private-keys';
  return 'dashboard';
}

const SCREEN_ROUTES: Record<string, string> = {
  dashboard:      '/dashboard',
  holdings:       '/wallets',
  transactions:   '/transactions',
  market:         '/market',
  alerts:         '/alerts',
  'private-keys': '/private-keys',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hideValues, setHideValues] = useState(false);

  const screen = pathnameToScreen(pathname);

  function handleNav(id: string) {
    const route = SCREEN_ROUTES[id];
    if (route) router.push(route);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar
        current={screen}
        onNav={handleNav}
        onAddTx={() => {}}
        hideValues={hideValues}
        onTogglePrivacy={() => setHideValues(v => !v)}
        userName="Caio Carvalho"
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar screen={screen} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

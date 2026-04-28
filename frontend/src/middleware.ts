import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth bypass for design verification in worktree — restore Supabase auth before merging
export async function middleware(request: NextRequest) {
  return NextResponse.next({ request: { headers: request.headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

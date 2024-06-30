import { NextResponse, type NextRequest } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export const config = {
  matcher: ['/dashboard/:path*', '/auth-callback'],
};

export async function middleware(request: NextRequest) {
  const isAuth = await getKindeServerSession().isAuthenticated();

  if (!isAuth) {
    return NextResponse.redirect('/');
  }

  return NextResponse.next();
}

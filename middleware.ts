import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};

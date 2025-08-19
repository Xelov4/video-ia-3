/**
 * NextAuth.js API Route Handler
 * Handles authentication for the admin interface
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/src/lib/auth/auth-options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };

import NextAuth, { type NextAuthConfig } from 'next-auth';
import { authOptions } from './config';

// NextAuth v5 attend un objet NextAuthConfig strictement typé
const nextAuthExports = NextAuth(authOptions as NextAuthConfig);

export const { auth, handlers, signIn, signOut } = nextAuthExports;

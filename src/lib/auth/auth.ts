import NextAuth from 'next-auth';
import { authOptions } from './config';

const nextAuthExports = NextAuth(authOptions);
console.log('auth export:', typeof nextAuthExports.auth); // doit afficher 'function'

export const { auth, handlers, signIn, signOut } = nextAuthExports;

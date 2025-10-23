// NextAuth v5 config pour App Router uniquement
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import type { Account, User as NextAuthUser, Session } from 'next-auth';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';

// (TypeScript infère le type automatiquement, pas besoin d'annotation explicite)
export const authOptions = {
    trustHost: true, 
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(
        credentials: Partial<Record<'email' | 'password', unknown>>,
        req: Request
      ) {
        const email = String(credentials?.email ?? '');
        const password = String(credentials?.password ?? '');
        if (!email || !password) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({
          email: email.toLowerCase().trim(),
        }).select('+password firstName lastName companyName');

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          image: undefined,
        } as any;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
  async jwt({ token, user, account }: { token: any; user?: NextAuthUser; account?: Account }) {
      // Add user id on first sign in
      if (user) {
        (token as any).id = (user as any).id;
      }

      // Handle Google sign-in: create or link user
      if (account?.provider === 'google' && token.email) {
        await dbConnect();
        const email = String(token.email).toLowerCase().trim();
        let dbUser = await User.findOne({
          $or: [{ email }, { googleId: account.providerAccountId }],
        });

        if (!dbUser) {
          dbUser = await User.create({
            email,
            firstName: (token.name as string)?.split(' ')[0] || 'Utilisateur',
            lastName: (token.name as string)?.split(' ').slice(1).join(' ') || '',
            companyName: 'Mon Entreprise',
            legalForm: 'Auto-entrepreneur',
            address: {
              street: 'Adresse',
              city: 'Ville',
              zipCode: '00000',
              country: 'France',
            },
            defaultCurrency: 'EUR',
            defaultTaxRate: 20,
            invoiceNumbering: {},
            iban: '',
            googleId: account.providerAccountId,
            emailVerified: new Date(),
          });
        } else if (!dbUser.googleId) {
          dbUser.googleId = account.providerAccountId;
          dbUser.emailVerified = new Date();
          await dbUser.save();
        }
        (token as any).id = dbUser._id.toString();
      }

      return token;
    },
  async session({ session, token }: { session: Session; token: any }) {
      if ((token as any)?.id && session.user) {
        (session.user as any).id = (token as any).id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
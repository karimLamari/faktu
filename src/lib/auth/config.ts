import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';

export const authOptions: NextAuthOptions = {
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({
          email: credentials.email.toLowerCase().trim(),
        }).select('+password firstName lastName companyName');

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
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
    async jwt({ token, user, account }) {
      // Add user id on first sign in
      if (user) {
        token.id = (user as any).id;
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
        token.id = dbUser._id.toString();
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
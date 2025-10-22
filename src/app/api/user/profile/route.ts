
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
  // On ne retourne pas le mot de passe si présent
  const { password, ...userData } = user as any;
  return NextResponse.json({ user: userData });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const data = await req.json();
  let validatedData;
  try {
    // Autoriser la mise à jour partielle
    validatedData = require('@/lib/validations').userSchema.partial().parse(data);
  } catch (zodErr) {
    const { ZodError } = require('zod');
    if (zodErr instanceof ZodError) {
      return NextResponse.json({
        error: 'Données invalides',
        errors: (zodErr as import('zod').ZodError).issues.map((issue: any) => issue.message),
        details: (zodErr as import('zod').ZodError).issues
      }, { status: 400 });
    }
    throw zodErr;
  }
  await dbConnect();
  await User.findByIdAndUpdate(session.user.id, validatedData);
  return NextResponse.json({ success: true });
}

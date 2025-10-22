import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { userSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
  const { password, ...userData } = user as any;
  return NextResponse.json({ user: userData });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const data = await req.json();
  let validatedData;
  try {
    validatedData = userSchema.partial().parse(data);
  } catch (zodErr) {
    if (zodErr instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Données invalides',
        errors: zodErr.issues.map((issue: any) => issue.message),
        details: zodErr.issues
      }, { status: 400 });
    }
    throw zodErr;
  }
  await dbConnect();
  await User.findByIdAndUpdate(session.user.id, validatedData);
  return NextResponse.json({ success: true });
}

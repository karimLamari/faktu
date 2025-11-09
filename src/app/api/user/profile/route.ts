import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { userProfileUpdateSchema } from '@/lib/validations';
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
  console.log('📝 Données reçues pour PATCH /api/user/profile:', JSON.stringify(data, null, 2));
  
  // Nettoyer les chaînes vides pour les champs optionnels
  const cleanedData = {
    ...data,
    siret: data.siret?.trim() || undefined,
    phone: data.phone?.trim() || undefined,
    logo: data.logo?.trim() || undefined,
    iban: data.iban?.trim() || undefined,
  };
  
  let validatedData;
  try {
    validatedData = userProfileUpdateSchema.parse(cleanedData);
    console.log('✅ Données validées:', JSON.stringify(validatedData, null, 2));
  } catch (zodErr) {
    if (zodErr instanceof z.ZodError) {
      console.error('❌ Erreur de validation Zod:', JSON.stringify(zodErr.issues, null, 2));
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
  console.log('✅ Profil mis à jour avec succès');
  return NextResponse.json({ success: true });
}

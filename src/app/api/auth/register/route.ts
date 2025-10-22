import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { userSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Nettoyer les chaînes vides pour les champs optionnels
    const cleanedBody = {
      ...body,
      siret: body.siret?.trim() || undefined,
      phone: body.phone?.trim() || undefined,
      logo: body.logo?.trim() || undefined,
    };
    
    // Validation des données
    const validatedData = userSchema.parse(cleanedBody);
    
    await dbConnect();
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    // Créer l'utilisateur
    const user = await User.create({
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      companyName: validatedData.companyName,
      legalForm: validatedData.legalForm,
      siret: validatedData.siret,
      address: validatedData.address,
      phone: validatedData.phone,
      logo: validatedData.logo,
      iban: validatedData.iban,
      defaultCurrency: validatedData.defaultCurrency ?? 'EUR',
      defaultTaxRate: validatedData.defaultTaxRate ?? 20,
      invoiceNumbering: validatedData.invoiceNumbering ?? undefined,
    });
    
    // Retourner l'utilisateur sans le mot de passe
  const { password, ...userWithoutPassword } = user.toObject();
    
    return NextResponse.json({
      message: 'Utilisateur créé avec succès',
      user: userWithoutPassword,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          errors: error.issues.map((issue: any) => issue.message),
          details: error.issues
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
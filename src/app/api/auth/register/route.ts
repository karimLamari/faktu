import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { z } from 'zod';

// Schéma minimal pour l'inscription
const registerSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données minimales
    const validatedData = registerSchema.parse(body);
    
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
    
    // Créer l'utilisateur avec uniquement les champs requis
    const user = await User.create({
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      // Les valeurs par défaut seront appliquées par le modèle
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
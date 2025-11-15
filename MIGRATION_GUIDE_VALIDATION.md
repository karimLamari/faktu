# 🎯 GUIDE DE MIGRATION : Validation Temps Réel avec Zod

## 📋 Résumé de l'Audit

### ✅ Ce qui a été fait

1. **Audit complet des 10 formulaires** → `FORMS_AUDIT_COMPLETE.ts`
2. **Hook de validation créé** → `src/hooks/useZodForm.tsx` (300+ lignes)
3. **Composant ValidatedInput** → Inclus dans useZodForm.tsx
4. **2 schémas Zod manquants créés** :
   - `src/lib/validations/services.ts` (prestations)
   - `src/lib/validations/email.ts` (envoi emails)
5. **Exemple de refactoring** → `EXAMPLE_ExpenseFormModal_Refactored.tsx`

### ⚠️ Problèmes détectés

- **0/10 formulaires** ont une validation côté client
- **3 schémas Zod manquants** (services, email, contracts)
- **Enums incohérents** : `paymentMethod` différent entre Invoice et Expense
- **Pas de validation cross-field** (dates, montants)
- **File uploads sans validation mime type** côté client

---

## 🔧 Comment migrer un formulaire

### Étape 1 : Vérifier le schéma Zod existe

```typescript
// Dans src/lib/validations/
export const myFormSchema = z.object({
  field1: z.string().min(1, 'Requis'),
  field2: z.number().min(0),
  // ...
});
```

### Étape 2 : Remplacer useState par useZodForm

**AVANT :**
```typescript
const [formData, setFormData] = useState({
  field1: '',
  field2: 0,
});

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};
```

**APRÈS :**
```typescript
const {
  formData,
  errors,
  touched,
  isValid,
  handleChange,
  handleBlur,
  handleSubmit,
  setFieldValue,
} = useZodForm(myFormSchema, initialData, {
  mode: 'onChange', // Validation en temps réel
});
```

### Étape 3 : Utiliser ValidatedInput

**AVANT :**
```tsx
<Input
  name="vendor"
  value={formData.vendor}
  onChange={handleChange}
/>
```

**APRÈS :**
```tsx
<ValidatedInput
  label="Fournisseur"
  name="vendor"
  value={formData.vendor}
  onChange={handleChange}
  onBlur={() => handleBlur('vendor')}
  error={errors.vendor}
  touched={touched.vendor}
  required
/>
```

### Étape 4 : Adapter le submit

**AVANT :**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await onSubmit(formData);
};
```

**APRÈS :**
```typescript
const onSubmit = handleSubmit(async (validatedData) => {
  // validatedData est déjà validé par Zod !
  await onSubmitProp(validatedData);
});
```

### Étape 5 : Ajouter feedback visuel

```tsx
<div className="p-6 border-t border-gray-700/50 flex justify-between">
  <div className="text-sm">
    {!isValid && Object.keys(errors).length > 0 && (
      <span className="text-red-400">
        ⚠️ {Object.keys(errors).length} erreur(s) à corriger
      </span>
    )}
    {isValid && (
      <span className="text-green-400">✓ Formulaire valide</span>
    )}
  </div>
  
  <Button disabled={!isValid || isLoading}>
    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
  </Button>
</div>
```

---

## 📝 Plan de Migration par Priorité

### 🔴 PRIORITÉ 1 : Formulaires critiques (3-4h)

1. **ExpenseFormModal** (574 lignes)
   - Schema ✅ (expenses.ts)
   - Exemple ✅ (EXAMPLE_ExpenseFormModal_Refactored.tsx)
   - Action : Remplacer le fichier actuel

2. **ClientForm** (323 lignes)
   - Schema ✅ (clients.ts)
   - Complexité : Logique business vs individual
   - Action : Ajouter validation conditionnelle

3. **ServiceFormModal** (216 lignes)
   - Schema ✅ (services.ts - CRÉÉ)
   - Action : Ajouter useZodForm

### 🟡 PRIORITÉ 2 : Formulaires transactionnels (2-3h)

4. **InvoiceFormModal** (complexe avec items array)
   - Schema ✅ (invoices.ts)
   - Complexité : Validation array d'items
   - Action : Valider items[] avec Zod

5. **QuoteFormModal** (structure similaire à Invoice)
   - Schema ✅ (quotes.ts)
   - Action : Réutiliser logique Invoice

6. **ConvertQuoteModal** (simple)
   - Schema ✅ (convertQuoteSchema)
   - Action : Quick win, 1h max

### 🟢 PRIORITÉ 3 : Formulaires secondaires (1-2h)

7. **ProfileForm** (401 lignes)
   - Schema ✅ (userProfileUpdateSchema)
   - Action : Validation SIRET, IBAN

8. **ProfileWizard** (multi-step)
   - Schema ✅
   - Complexité : Validation par step
   - Action : Valider à chaque step

9. **SendEmailModal** (2 fichiers)
   - Schema ✅ (email.ts - CRÉÉ)
   - Action : Validation email format + CC

10. **ContractUpload**
    - Schema ❌ (à créer)
    - Simple : juste file validation
    - Action : Créer schema minimal

---

## 🎯 Exemple Complet : ExpenseFormModal

Voir `EXAMPLE_ExpenseFormModal_Refactored.tsx` pour :
- ✅ Validation temps réel avec `useZodForm`
- ✅ Affichage erreurs inline avec `ValidatedInput`
- ✅ Indicateurs visuels (rouge/vert)
- ✅ Validation image (type, taille)
- ✅ Désactivation du bouton submit si invalide
- ✅ Compteur d'erreurs dans le footer
- ✅ OCR integration avec `setFieldValue`

---

## 🔍 Cas Spéciaux

### 1. Validation conditionnelle (ClientForm)

```typescript
const clientSchema = z.object({
  type: z.enum(['business', 'individual']),
  companyName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === 'business') {
      return !!data.companyName;
    }
    return !!data.firstName && !!data.lastName;
  },
  {
    message: 'Champs requis selon le type de client',
    path: ['type'], // Où afficher l'erreur
  }
);
```

### 2. Validation cross-field (Dates)

```typescript
const invoiceSchema = z.object({
  issueDate: z.string(),
  dueDate: z.string(),
}).refine(
  (data) => new Date(data.dueDate) >= new Date(data.issueDate),
  {
    message: 'La date d\'échéance doit être après la date d\'émission',
    path: ['dueDate'],
  }
);
```

### 3. Validation array (InvoiceItems)

```typescript
const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
});

const invoiceSchema = z.object({
  items: z.array(invoiceItemSchema).min(1, 'Au moins 1 ligne requise'),
});

// Dans le composant :
items.forEach((item, index) => {
  const itemError = errors[`items.${index}.description`];
  // Afficher erreur pour cet item
});
```

### 4. File upload validation

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!ACCEPTED_TYPES.includes(file.type)) {
    setFileError('Format non supporté');
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    setFileError('Fichier trop volumineux (max 10MB)');
    return;
  }

  setFileError('');
  setFile(file);
};
```

---

## 🧪 Tests Recommandés

### Tests unitaires pour useZodForm

```typescript
describe('useZodForm', () => {
  it('should validate on change', () => {
    // ...
  });

  it('should show error for invalid field', () => {
    // ...
  });

  it('should disable submit if invalid', () => {
    // ...
  });
});
```

### Tests E2E pour formulaires

```typescript
describe('ExpenseForm', () => {
  it('should show error for empty vendor', async () => {
    const { getByLabelText, getByText } = render(<ExpenseFormModal />);
    
    const input = getByLabelText('Fournisseur');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    
    expect(getByText('Le fournisseur est requis')).toBeInTheDocument();
  });
});
```

---

## 📊 Impact Estimé

### Temps de développement
- **Setup infrastructure** : ✅ FAIT (4h)
- **Migration Priorité 1** : 3-4h
- **Migration Priorité 2** : 2-3h
- **Migration Priorité 3** : 1-2h
- **Tests et ajustements** : 2-3h
- **TOTAL** : 12-16h restantes

### Amélioration UX
- ✅ Feedback immédiat (pas besoin d'attendre submit)
- ✅ Indicateurs visuels clairs
- ✅ Moins d'erreurs serveur (validation côté client)
- ✅ Meilleure accessibilité (aria-invalid, etc.)

### Amélioration DX
- ✅ Code réutilisable (hook + composants)
- ✅ Type-safe (TypeScript + Zod)
- ✅ Moins de bugs (validation centralisée)
- ✅ Maintenance facilitée

---

## 🚀 Prochaines Étapes

1. **Décider si on migre tout ou progressivement**
   - Option A : Migrer tous les formulaires maintenant (12-16h)
   - Option B : Migrer au fur et à mesure des bugs/features

2. **Commencer par ExpenseFormModal**
   - Utiliser `EXAMPLE_ExpenseFormModal_Refactored.tsx`
   - Tester en production
   - Ajuster si besoin

3. **Documenter les patterns**
   - Créer des snippets VS Code
   - Former l'équipe sur useZodForm

4. **Ajouter tests**
   - Unit tests pour useZodForm
   - E2E tests pour formulaires critiques

---

## 📚 Ressources

- **Hook principal** : `src/hooks/useZodForm.tsx`
- **Schémas Zod** : `src/lib/validations/*.ts`
- **Exemple complet** : `EXAMPLE_ExpenseFormModal_Refactored.tsx`
- **Audit détaillé** : `FORMS_AUDIT_COMPLETE.ts`
- **Zod docs** : https://zod.dev

---

**Créé le** : 14 novembre 2025  
**Prochaine révision** : Après migration Priorité 1

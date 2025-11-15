/**
 * 🎯 Hook de validation temps réel avec Zod
 * 
 * Permet de valider un formulaire avec un schéma Zod
 * et d'afficher les erreurs en temps réel à chaque changement.
 * 
 * Usage:
 * ```tsx
 * const { formData, errors, handleChange, handleSubmit, isValid } = 
 *   useZodForm(createExpenseSchema, initialData);
 * 
 * <form onSubmit={handleSubmit(onSubmit)}>
 *   <Input 
 *     name="vendor" 
 *     value={formData.vendor} 
 *     onChange={handleChange}
 *   />
 *   {errors.vendor && <span className="text-red-500">{errors.vendor}</span>}
 * </form>
 * ```
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { z } from 'zod';

export interface UseZodFormOptions<T> {
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
  validateOnMount?: boolean;
  resetOnSuccess?: boolean;
}

export interface UseZodFormReturn<T> {
  formData: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isValidating: boolean;
  isDirty: boolean;
  setFormData: (data: T | ((prev: T) => T)) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (onSubmit: (data: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
  reset: (data?: T) => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  clearErrors: () => void;
  clearError: (field: keyof T) => void;
}

export function useZodForm<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialData: T,
  options: UseZodFormOptions<T> = {}
): UseZodFormReturn<T> {
  const {
    mode = 'onChange',
    validateOnMount = false,
    resetOnSuccess = false,
  } = options;

  // Stocker initialData dans une ref pour éviter les re-renders
  const initialDataRef = useRef<T>(initialData);
  
  // Mettre à jour la ref seulement si les données changent vraiment
  useEffect(() => {
    if (JSON.stringify(initialData) !== JSON.stringify(initialDataRef.current)) {
      initialDataRef.current = initialData;
      setFormData(initialData);
    }
  }, [initialData]);

  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Validation d'un champ unique
  const validateField = useCallback(async (field: keyof T): Promise<boolean> => {
    try {
      // Valider tout le formulaire et extraire l'erreur pour ce champ
      const result = await schema.safeParseAsync(formData);
      if (result.success) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return true;
      } else {
        const fieldError = result.error.issues.find((err: any) => err.path[0] === field);
        if (fieldError) {
          setErrors(prev => ({ ...prev, [field]: fieldError.message }));
          return false;
        }
        // Pas d'erreur pour ce champ spécifique
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return true;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.issues[0].message }));
      }
      return false;
    }
  }, [formData, schema]);

  // Validation du formulaire complet
  const validateForm = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    try {
      await schema.parseAsync(formData);
      setErrors({});
      setIsValidating(false);
      return false;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof T, string>> = {};
        error.issues.forEach((err: any) => {
          const field = err.path[0] as keyof T;
          if (field && !newErrors[field]) {
            newErrors[field] = err.message;
          }
        });
        setErrors(newErrors);
      }
      setIsValidating(false);
      return false;
    }
  }, [formData, schema]);

  // Handle change avec validation selon mode
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const field = name as keyof T;

    // Gérer les différents types d'inputs
    let parsedValue: any = value;
    
    if (type === 'number') {
      parsedValue = value === '' ? '' : parseFloat(value);
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'date') {
      parsedValue = value;
    }

    setFormData(prev => ({ ...prev, [field]: parsedValue }));
    setTouched(prev => ({ ...prev, [field]: true }));

    // Valider si mode onChange
    if (mode === 'onChange' && touched[field]) {
      validateField(field);
    }
  }, [mode, touched, validateField]);

  // Handle blur
  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (mode === 'onBlur' || mode === 'onChange') {
      validateField(field);
    }
  }, [mode, validateField]);

  // Set field value programmatically
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (mode === 'onChange') {
      validateField(field);
    }
  }, [mode, validateField]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Reset form
  const reset = useCallback((data?: T) => {
    const resetData = data || initialDataRef.current;
    setFormData(resetData);
    setErrors({});
    setTouched({});
  }, []);

  // Handle submit
  const handleSubmit = useCallback((
    onSubmit: (data: T) => void | Promise<void>
  ) => {
    return async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Marquer tous les champs comme touched
      const allTouched = Object.keys(formData).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Partial<Record<keyof T, boolean>>);
      setTouched(allTouched);

      // Valider tout le formulaire
      const isValid = await validateForm();

      if (isValid) {
        try {
          await onSubmit(formData);
          if (resetOnSuccess) {
            reset();
          }
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }
    };
  }, [formData, validateForm, resetOnSuccess, reset]);

  // Computed values
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);
  const isDirty = useMemo(() => 
    JSON.stringify(formData) !== JSON.stringify(initialDataRef.current),
    [formData]
  );

  // Validate on mount if requested
  useEffect(() => {
    if (validateOnMount) {
      validateForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    formData,
    errors,
    touched,
    isValid,
    isValidating,
    isDirty,
    setFormData,
    setFieldValue,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validateField,
    validateForm,
    clearErrors,
    clearError,
  };
}

/**
 * 🎨 Composant Input avec validation intégrée
 * 
 * Usage:
 * ```tsx
 * <ValidatedInput
 *   label="Vendeur"
 *   name="vendor"
 *   value={formData.vendor}
 *   onChange={handleChange}
 *   onBlur={() => handleBlur('vendor')}
 *   error={errors.vendor}
 *   touched={touched.vendor}
 *   required
 * />
 * ```
 */
export interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  onBlur?: () => void;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  error,
  touched,
  helperText,
  required,
  className = '',
  onBlur,
  ...props
}) => {
  const showError = touched && error;
  const showSuccess = touched && !error && props.value;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          className={`
            w-full px-3 py-2 bg-gray-800/50 border rounded-lg text-white
            transition-colors focus:outline-none focus:ring-2
            ${showError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : showSuccess
              ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
              : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
            }
            ${className}
          `}
          onBlur={onBlur}
          aria-invalid={showError ? 'true' : undefined}
          aria-describedby={showError ? `${props.name}-error` : undefined}
          {...props}
        />
        {showSuccess && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      {showError && (
        <p id={`${props.name}-error`} className="text-sm text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !showError && (
        <p className="text-sm text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

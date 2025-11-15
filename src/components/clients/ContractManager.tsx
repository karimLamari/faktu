'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Trash2, File, AlertCircle, Loader2 } from 'lucide-react';
import { useZodForm, ValidatedInput } from '@/hooks/useZodForm';
import { contractUploadSchema } from '@/lib/validations/contracts';

interface Contract {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  description?: string;
}

interface ContractManagerProps {
  clientId: string;
}

export default function ContractManager({ clientId }: ContractManagerProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Form state with useZodForm
  const {
    formData,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    reset,
  } = useZodForm(contractUploadSchema, {
    file: null as any, // Will be set by file input
    description: '',
  }, {
    mode: 'onChange',
  });

  // États supplémentaires pour gérer le submit et les erreurs serveur
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Charger les contrats
  useEffect(() => {
    fetchContracts();
  }, [clientId]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/clients/${clientId}/contracts`);
      if (!res.ok) throw new Error('Erreur chargement contrats');
      const data = await res.json();
      setContracts(data.contracts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Upload un contrat
  const onSubmit = handleSubmit(async (validatedData) => {
    setIsSubmitting(true);
    setServerError(null);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', validatedData.file);
      if (validatedData.description) {
        formDataToSend.append('description', validatedData.description);
      }

      const res = await fetch(`/api/clients/${clientId}/contracts`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur upload');
      }

      const data = await res.json();
      setContracts(prev => [...prev, data.contract]);
      setSuccess('Contrat uploadé avec succès');
      setShowUploadForm(false);
      reset();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setServerError(err.message);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  });

  // Supprimer un contrat
  const handleDelete = async (contractId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) return;

    try {
      const res = await fetch(`/api/clients/${clientId}/contracts/${contractId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erreur suppression');

      setContracts(prev => prev.filter(c => c._id !== contractId));
      setSuccess('Contrat supprimé avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Icône selon le type de fichier
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <Card className="overflow-hidden bg-gray-900/80 backdrop-blur-lg border-gray-700/50">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-700/50 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-900/50 rounded-lg">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Contrats</h2>
              <p className="text-sm text-gray-400">
                {contracts.length} contrat{contracts.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/20"
          >
            <Upload className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mx-4 mt-4 sm:mx-6 sm:mt-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">{error}</p>
          </div>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="mx-4 mt-4 sm:mx-6 sm:mt-6 p-4 bg-green-900/30 border border-green-700/50 rounded-lg flex items-start gap-3">
          <FileText className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-300">{success}</p>
        </div>
      )}

      {/* Formulaire d'upload */}
      {showUploadForm && (
        <form onSubmit={onSubmit} className="p-4 sm:p-6 bg-purple-900/20 border-b border-purple-700/50">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fichier <span className="text-red-400">*</span>
              </label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFieldValue('file', file);
                  }
                }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white ${
                  errors.file && touched.file
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-700'
                }`}
              />
              {formData.file && formData.file instanceof File && (
                <p className="mt-2 text-sm text-gray-400">
                  {formData.file.name} ({formatFileSize(formData.file.size)})
                </p>
              )}
              {errors.file && touched.file && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.file}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Formats acceptés : PDF, Word, JPG, PNG (max 10MB)
              </p>
            </div>

            <ValidatedInput
              label="Description (optionnel)"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              onBlur={() => handleBlur('description')}
              error={errors.description}
              touched={touched.description}
              placeholder="Ex: Contrat de prestation 2025"
            />

            {serverError && (
              <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                <p className="text-sm text-red-300">{serverError}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upload...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Uploader
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowUploadForm(false);
                  reset();
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Liste des contrats */}
      <div className="divide-y divide-gray-700/50">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-purple-500" />
            <p className="text-gray-400 mt-2">Chargement...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-400 mb-2">Aucun contrat enregistré</p>
            <p className="text-sm text-gray-500">Cliquez sur "Ajouter" pour uploader un contrat</p>
          </div>
        ) : (
          contracts.map((contract) => (
            <div
              key={contract._id}
              className="p-4 sm:p-5 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Icône */}
                <div className="w-12 h-12 rounded-xl bg-purple-900/50 border border-purple-700/50 flex items-center justify-center text-2xl flex-shrink-0">
                  {getFileIcon(contract.fileType)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {contract.fileName}
                      </p>
                      {contract.description && (
                        <p className="text-sm text-gray-400 mt-1">{contract.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="whitespace-nowrap bg-gray-800/50 border-gray-700 text-gray-300">
                      {formatFileSize(contract.fileSize)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Uploadé le {new Date(contract.uploadedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <a
                    href={`/api/contracts/${contract._id}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-blue-900/30 hover:border-blue-700 hover:text-blue-400">
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(contract._id)}
                    className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-red-900/30 hover:border-red-700 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

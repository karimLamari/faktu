"use client";

import { useRouter } from "next/navigation";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingFields: string[];
  completionPercentage: number;
}

export function ProfileCompletionModal({
  isOpen,
  onClose,
  missingFields,
  completionPercentage,
}: ProfileCompletionModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToSettings = () => {
    router.push("/dashboard/settings");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 max-w-md w-full mx-4 animate-slide-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Profil professionnel requis
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">
                Progression
              </span>
              <span className="text-sm font-bold text-indigo-400">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Missing fields */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">
              Informations requises :
            </h3>
            <ul className="space-y-2">
              {missingFields.map((field, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>{field}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-indigo-700/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-2">
              Factures professionnelles conformes
            </h3>
            <p className="text-sm text-gray-300">
              PDF légaux • Envoi par email • Rappels de paiement
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-700/50 bg-gray-800/50">
          <Button
            onClick={onClose}
            className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300"
          >
            Plus tard
          </Button>
          <Button
            onClick={handleGoToSettings}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20"
          >
            Compléter maintenant
          </Button>
        </div>
      </div>
    </div>
  );
}

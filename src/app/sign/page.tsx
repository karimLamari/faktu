'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SpaceBackground from '@/components/ui/SpaceBackground';

function SignPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState('');
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Charger le devis
  useEffect(() => {
    if (!token) {
      setError('Lien de signature invalide');
      setLoading(false);
      return;
    }

    fetch(`/api/sign?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setQuote(data.quote);
          if (data.quote.client?.name) {
            setSignerName(data.quote.client.name);
          }
          if (data.quote.client?.email) {
            setSignerEmail(data.quote.client.email);
          }
          if (data.quote.signedAt) {
            setSigned(true);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Erreur de chargement');
        setLoading(false);
      });
  }, [token]);

  // Canvas signature
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = async () => {
    if (!signerName.trim()) {
      alert('Veuillez entrer votre nom');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Vérifier que la signature n'est pas vide
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const isEmpty = !imageData.data.some((channel) => channel !== 0);

    if (isEmpty) {
      alert('Veuillez signer dans le cadre');
      return;
    }

    setSigning(true);

    try {
      const signatureData = canvas.toDataURL('image/png');

      const response = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          signatureData,
          signerName,
          signerEmail,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
      } else {
        setSigned(true);
      }
    } catch (error) {
      alert('Erreur lors de la signature');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <SpaceBackground />
        <div className="text-center z-10">
          <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-white">Chargement du devis...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <SpaceBackground />
        <div className="max-w-md w-full mx-4 z-10">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-red-500/50 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Lien invalide</h1>
            <p className="text-gray-400">{error || 'Ce lien de signature est invalide ou a expiré.'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <SpaceBackground />
        <div className="max-w-md w-full mx-4 z-10">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-green-500/50 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Devis signé !</h1>
            <p className="text-gray-400 mb-4">
              Le devis <strong className="text-white">{quote.quoteNumber}</strong> a été signé avec succès.
            </p>
            <p className="text-sm text-gray-500">
              {quote.company.name} vous recontactera prochainement.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <SpaceBackground />
      
      <div className="max-w-4xl mx-auto z-10 relative">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🔐 Signature électronique
          </h1>
          <p className="text-gray-400">
            {quote.company.name}
          </p>
        </div>

        {/* Quote details */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Devis {quote.quoteNumber}</h2>
              <p className="text-sm text-gray-400">
                Émis le {new Date(quote.issueDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">
                {quote.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </p>
              <p className="text-sm text-gray-400">TTC</p>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-gray-700 pt-4 space-y-2">
            {quote.items.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">
                  {item.description} <span className="text-gray-500">× {item.quantity}</span>
                </span>
                <span className="text-white font-medium">
                  {(item.quantity * item.unitPrice).toLocaleString('fr-FR')} €
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Signature form */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Signer ce devis</h3>

          <div className="space-y-4 mb-6">
            <div>
              <Label>Nom complet *</Label>
              <Input
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="jean@example.com"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label>Signature *</Label>
              <button
                onClick={clearSignature}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Effacer
              </button>
            </div>
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full border-2 border-dashed border-gray-600 rounded-lg bg-white cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <p className="text-xs text-gray-500 mt-2">
              Signez dans le cadre ci-dessus avec votre souris ou votre doigt
            </p>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-300">
              ✅ En signant ce devis, vous acceptez les conditions et le montant indiqués ci-dessus.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={signing}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
            >
              {signing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signature en cours...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Signer le devis
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Signature sécurisée • Propulsé par BLINK
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <SpaceBackground />
        <div className="text-center z-10">
          <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    }>
      <SignPageContent />
    </Suspense>
  );
}

import React, { useState, useEffect } from 'react';
import { useProforma } from '../context/ProformaContext';
import { Proforma } from '../types/proforma';
import { formatCurrency } from '../utils/formatters';
import { X, DollarSign, CheckCircle2, CreditCard } from 'lucide-react';

export const RecordPaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  proforma: Proforma | null;
}> = ({ isOpen, onClose, proforma }) => {
  const { recordPayment } = useProforma();

  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Virement bancaire');
  const [note, setNote] = useState<string>('');
  const [autoMarkEncaisse, setAutoMarkEncaisse] = useState<boolean>(true);

  const remaining = proforma ? Math.max(0, proforma.totalTTC - (proforma.paidAmount || 0)) : 0;

  useEffect(() => {
    if (proforma) {
      setAmount(remaining);
      setNote(`Paiement reçu (${paymentMethod})`);
    }
  }, [proforma, remaining]);

  if (!isOpen || !proforma) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Veuillez renseigner un montant valide supérieur à 0.');
      return;
    }

    const fullNote = `${paymentMethod} - ${note || 'Encaissement validé'}`;
    recordPayment(proforma.id, amount, fullNote, autoMarkEncaisse);
    onClose();
  };

  const handleSetPreset = (presetFraction: number) => {
    const calculated = Math.round(proforma.totalTTC * presetFraction * 100) / 100;
    setAmount(Math.min(remaining, calculated));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enregistrer un Encaissement</h3>
              <p className="text-[11px] text-slate-500 font-mono">{proforma.proformaNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Proforma Status Overview */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Client :</span>
              <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                {proforma.client.company || proforma.client.name}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Montant Total TTC :</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatCurrency(proforma.totalTTC, proforma.currency)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Déjà Encaissé :</span>
              <span className="font-mono font-semibold text-emerald-600 tabular-nums">
                {formatCurrency(proforma.paidAmount || 0, proforma.currency)}
              </span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-slate-200 text-slate-900 font-bold">
              <span>Solde Restant Dû :</span>
              <span className="font-mono text-emerald-700 tabular-nums">
                {formatCurrency(remaining, proforma.currency)}
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Raccourcis de Montant
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAmount(remaining)}
                className="py-1.5 px-2 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                100% Solde ({formatCurrency(remaining, proforma.currency)})
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset(0.5)}
                className="py-1.5 px-2 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
              >
                50% Acompte
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset(0.3)}
                className="py-1.5 px-2 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
              >
                30% Acompte
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Montant à Encaisser ({proforma.currency})
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={proforma.totalTTC}
                required
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full pl-3 pr-12 py-2 text-sm font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400 font-bold">
                {proforma.currency}
              </span>
            </div>
          </div>

          {/* Mode de Règlement */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mode de Règlement
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setNote(`Paiement reçu (${e.target.value})`);
              }}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="Virement bancaire">Virement bancaire</option>
              <option value="Chèque">Chèque bancaire</option>
              <option value="Espèces / Caisse">Espèces / Caisse</option>
              <option value="Carte bancaire / TPE">Carte bancaire / TPE</option>
              <option value="Mobile Money (Orange / Wave / MTN / MonCash)">Mobile Money</option>
              <option value="Autre">Autre modalité</option>
            </select>
          </div>

          {/* Note / Référence */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Commentaire ou Référence de transaction
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Réf virement VIR-89218 du 23/09"
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Option: Passer en statut encaissé */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoEncaisse"
              checked={autoMarkEncaisse}
              onChange={(e) => setAutoMarkEncaisse(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="autoEncaisse" className="text-slate-700 cursor-pointer select-none">
              Marquer automatiquement le statut de la proforma comme <strong className="text-emerald-700">Encaissée</strong> si le solde est atteint.
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider l'Encaissement</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

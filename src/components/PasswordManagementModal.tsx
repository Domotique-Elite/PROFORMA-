import React, { useState, useEffect } from 'react';
import { EnterpriseAccount } from '../types/auth';
import { 
  KeyRound, 
  RefreshCw, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Mail, 
  MessageSquare, 
  Send, 
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface PasswordManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  enterprise: EnterpriseAccount | null;
  onSavePassword: (enterpriseId: string, newPassword: string) => void;
  generateRandomPassword: () => string;
}

export const PasswordManagementModal: React.FC<PasswordManagementModalProps> = ({
  isOpen,
  onClose,
  enterprise,
  onSavePassword,
  generateRandomPassword,
}) => {
  if (!isOpen || !enterprise) return null;

  const [passwordValue, setPasswordValue] = useState(enterprise.tempPassword);
  const [copiedField, setCopiedField] = useState<'pass' | 'message' | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setPasswordValue(enterprise.tempPassword);
    setSaveSuccess(false);
  }, [enterprise]);

  const handleGenerateNew = () => {
    const fresh = generateRandomPassword();
    setPasswordValue(fresh);
    setSaveSuccess(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValue.trim()) return;
    onSavePassword(enterprise.id, passwordValue.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopy = (text: string, type: 'pass' | 'message') => {
    navigator.clipboard.writeText(text);
    setCopiedField(type);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Pre-formatted message ready for email / WhatsApp
  const appUrl = window.location.origin;
  const clientMessage = `Bonjour ${enterprise.contactPerson || enterprise.companyName},

Voici vos identifiants d'accès sécurisés à votre plateforme ProformaPulse pour gérer vos devis proformas et votre facturation :

🌐 Lien de connexion : ${appUrl}
📧 Email de connexion : ${enterprise.email}
🔑 Mot de passe temporaire : ${passwordValue}

Adresse de votre établissement : ${enterprise.address}, ${enterprise.city}
Devise configurée : ${enterprise.currency || 'USD'}

Conseil de sécurité : Veuillez conserver ces identifiants confidentiellement. Dès votre première connexion, vous pouvez commencer à créer vos devis personnalisés.

L'équipe ProformaPulse Enterprise`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Super Admin
                </span>
                <span className="text-xs text-slate-400">Sécurité & Accès</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Mot de Passe Temporaire & Identifiants
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Target Company Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">{enterprise.companyName}</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{enterprise.email}</span>
                <span>·</span>
                <span>Contact : {enterprise.contactPerson}</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              enterprise.status === 'active' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-rose-100 text-rose-800'
            }`}>
              {enterprise.status === 'active' ? 'Compte Actif' : 'Compte Bloqué'}
            </span>
          </div>

          {/* Form: Password editing & generation */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Mot de Passe Temporaire Attribué</span>
                <span className="text-[11px] font-normal text-slate-400">
                  Modifiable ou auto-généré
                </span>
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={passwordValue}
                    onChange={(e) => {
                      setPasswordValue(e.target.value);
                      setSaveSuccess(false);
                    }}
                    required
                    className="w-full font-mono text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-900"
                    placeholder="Ex: Pass#2026Client!"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(passwordValue, 'pass')}
                    title="Copier le mot de passe"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  >
                    {copiedField === 'pass' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateNew}
                  title="Générer un mot de passe sécurisé aléatoire"
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Régénérer</span>
                </button>
              </div>

              {enterprise.passwordUpdatedAt && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5">
                  <Clock className="w-3 h-3" />
                  <span>Dernière mise à jour du mot de passe : {enterprise.passwordUpdatedAt}</span>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-1">
              {saveSuccess ? (
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>Mot de passe mis à jour avec succès !</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500">
                  Cliquez sur enregistrer pour valider le changement.
                </div>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                Enregistrer la Modification
              </button>
            </div>
          </form>

          <hr className="border-slate-200" />

          {/* Formatted Message Ready to Send to Client */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>Message d'Accès Prêt pour WhatsApp & Email</span>
              </label>

              <button
                type="button"
                onClick={() => handleCopy(clientMessage, 'message')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors border border-indigo-200"
              >
                {copiedField === 'message' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Message Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le Message Complet</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <textarea
                readOnly
                rows={5}
                value={clientMessage}
                className="w-full font-mono text-[11px] leading-relaxed p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 resize-none select-all focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Copiez ce texte et envoyez-le directement par courriel ou message instantané à l'entreprise pour lui fournir ses accès d'administration.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

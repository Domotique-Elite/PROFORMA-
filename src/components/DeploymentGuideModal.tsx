import React, { useState } from 'react';
import { 
  Database, 
  Cloud, 
  Check, 
  Copy, 
  ExternalLink, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Radio, 
  Terminal,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const { isSupabaseConnected } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'supabase' | 'vercel'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envSample = `VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  Prêt pour Production
                </span>
                <span className="text-xs text-slate-400">Architecture Vercel + Supabase</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Guide d'Hébergement & Base de Données
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Status Strip */}
        <div className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
          isSupabaseConnected
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-900 border-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 animate-pulse ${isSupabaseConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
            <span>
              {isSupabaseConnected
                ? 'Base Supabase PostgreSQL active et synchronisée en temps réel !'
                : 'Mode Démo local actif (prêt à être branché sur votre base Supabase).'}
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/70 border border-current">
            {isSupabaseConnected ? 'En Ligne (PostgreSQL)' : 'Stockage Local'}
          </span>
        </div>

        {/* Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Vue d'Ensemble & Choix</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'supabase'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>1. Configuration Supabase</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'vercel'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>2. Déploiement Vercel</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-indigo-900 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Pourquoi Vercel + Supabase est le meilleur choix ?
                </h4>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  Contrairement à Netlify, **Vercel** offre une intégration native clé en main avec **Supabase**, une vitesse de déploiement en moins de 30 secondes, et une gestion parfaite des routes React SPA via le fichier <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-950 font-mono">vercel.json</code> déjà configuré à la racine de votre application.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-2">
                    <Database className="w-4 h-4" />
                    <span>Supabase (PostgreSQL & Realtime)</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>Remplace le stockage local du navigateur.</li>
                    <li>Synchronise les devis et les statuts en direct sur tous les appareils.</li>
                    <li>Détection en direct de la présence des entreprises connectées.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 hover:border-slate-400 transition-colors">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-2">
                    <Cloud className="w-4 h-4" />
                    <span>Vercel (Hébergement Web Global)</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>Hébergement CDN ultra-rapide avec certificats HTTPS gratuits.</li>
                    <li>Déploiement continu automatique à chaque <code className="font-mono text-[11px] bg-slate-100 px-1">git push</code>.</li>
                    <li>Possibilité d'ajouter votre propre nom de domaine personnalisé.</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Fichiers de configuration inclus dans ce projet :</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    • <code className="font-mono font-bold text-slate-700">supabase-schema.sql</code> (Tables SQL & Realtime) <br />
                    • <code className="font-mono font-bold text-slate-700">vercel.json</code> (Règles de routage SPA) <br />
                    • <code className="font-mono font-bold text-slate-700">src/lib/supabase.ts</code> (Connecteur automatique)
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('supabase')}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  Commencer l'étape 1 →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SUPABASE */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Créez votre projet gratuit sur Supabase</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Rendez-vous sur <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a> et créez une nouvelle base de données (sélectionnez la région la plus proche, ex: US East).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-slate-900">Exécutez le script SQL préparé</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Dans votre projet Supabase, cliquez sur **SQL Editor** dans la barre latérale gauche, puis sur **New query**. Copiez et collez le contenu du fichier <code className="font-mono font-bold bg-slate-100 px-1">supabase-schema.sql</code> présent à la racine de votre application, puis cliquez sur **Run**.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-slate-900">Récupérez vos identifiants API</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Allez dans <strong>Project Settings → API</strong> et copiez les deux valeurs ci-dessous dans votre fichier <code className="font-mono bg-slate-100 px-1">.env</code> :
                    </p>

                    <div className="mt-2 bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] relative">
                      <pre>{envSample}</pre>
                      <button
                        onClick={() => handleCopy(envSample, 'env')}
                        className="absolute right-2 top-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
                        title="Copier les variables"
                      >
                        {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('vercel')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Passer au Déploiement Vercel →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: VERCEL */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Déposez votre code sur GitHub</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Poussez l'intégralité du dossier sur votre compte GitHub (public ou privé).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Importez le projet sur Vercel</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Connectez-vous sur <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline inline-flex items-center gap-1">vercel.com <ExternalLink className="w-3 h-3" /></a> avec votre GitHub, cliquez sur <strong>Add New... → Project</strong> et sélectionnez votre dépôt.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Configurez les Variables d'Environnement</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Dans la section **Environment Variables** de Vercel, ajoutez :
                    </p>
                    <div className="mt-1.5 space-y-1 text-xs font-mono">
                      <div className="bg-slate-100 p-2 rounded border border-slate-200">
                        <span className="font-bold text-indigo-700">VITE_SUPABASE_URL</span> = votre URL Supabase
                      </div>
                      <div className="bg-slate-100 p-2 rounded border border-slate-200">
                        <span className="font-bold text-indigo-700">VITE_SUPABASE_ANON_KEY</span> = votre clé publique anon
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Cliquez sur « Deploy »</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Vercel compile automatiquement le projet React Vite avec <code className="font-mono bg-slate-100 px-1">npm run build</code>. Votre application sera disponible en direct sur une URL sécurisée HTTPS en moins de 60 secondes !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tous les fichiers <code className="font-mono text-slate-700 font-bold">vercel.json</code> et <code className="font-mono text-slate-700 font-bold">supabase-schema.sql</code> sont prêts.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Database, 
  Sparkles,
  DollarSign,
  FileText,
  User,
  KeyRound,
  X,
  CheckCircle2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isSupabaseConnected, isTestAdminActive, setupInitialSuperAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'enterprise' | 'superadmin'>('enterprise');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initial Super Admin Setup Modal state
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupShowPassword, setSetupShowPassword] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Veuillez renseigner votre adresse email.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Veuillez renseigner votre mot de passe.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Identifiants invalides. Veuillez vérifier votre email et mot de passe.');
      }
    }, 250);
  };

  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');

    if (!setupEmail.trim()) {
      setSetupError('Veuillez saisir votre adresse email.');
      return;
    }
    if (!setupPassword.trim() || setupPassword.length < 6) {
      setSetupError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setIsSettingUp(true);
    try {
      const res = await setupInitialSuperAdmin({
        name: setupName.trim() || 'Super Administrateur',
        email: setupEmail.trim().toLowerCase(),
        password: setupPassword.trim(),
      });

      setIsSettingUp(false);
      if (res.success) {
        setIsSetupModalOpen(false);
      } else {
        setSetupError(res.error || 'Erreur lors de la configuration du compte.');
      }
    } catch (err) {
      setIsSettingUp(false);
      setSetupError('Une erreur est survenue lors de la synchronisation.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-between text-slate-100 p-4 sm:p-6 lg:p-8">
      
      {/* Top Bar / Branding */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Proforma<span className="text-indigo-400">Pulse</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
              SaaS B2B Multi-Entreprises
            </span>
          </div>
        </div>

        {/* Database connectivity badge */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isSupabaseConnected 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {isSupabaseConnected ? 'PostgreSQL Supabase' : 'Mode Local'}
            </span>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
          </div>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="max-w-5xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6 sm:py-10">
        
        {/* Left Column: Platform Presentation */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gestion de Devis Proforma & Encaissements</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Accédez à votre espace <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">professionnel</span>.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Identifiez-vous pour gérer vos devis proforma, suivre vos paiements d'acomptes, personnaliser vos documents légaux et superviser votre activité.
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Devis & Proformas</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Modèles personnalisés, TVA et conversion facture.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Suivi Financier</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Enregistrement des encaissements et soldes dus.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-500/20 text-sky-300 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Espace Entreprise</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Données et devis isolés par entreprise cliente.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Portail Super Admin</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Supervision globale et création des comptes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Login Card */}
        <div className="lg:col-span-6">
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 backdrop-blur-md">
            
            {/* Header / Tabs */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Connexion
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sélectionnez votre type d'accès pour vous identifier
              </p>

              {/* Account Type Tabs */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mt-4 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('enterprise');
                    setEmail('');
                    setPassword('');
                    setErrorMessage('');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'enterprise'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Entreprise</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('superadmin');
                    setEmail('');
                    setPassword('');
                    setErrorMessage('');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'superadmin'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Super Admin</span>
                </button>
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Erreur : </span>
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {activeTab === 'enterprise' ? 'Email Entreprise' : 'Email Super Administrateur'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === 'enterprise' ? 'contact@entreprise.com' : 'admin@domaine.com'}
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mot de passe
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Direct Super Admin Personal Setup link (only visible if test admin is still active and in superadmin tab) */}
            {activeTab === 'superadmin' && isTestAdminActive && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-900">
                    <KeyRound className="w-4 h-4 text-indigo-600" />
                    <span>Créer mon propre compte Super Admin</span>
                  </div>
                  <p className="text-[11px] text-indigo-700 leading-relaxed">
                    Vous êtes le propriétaire ? Vous pouvez supprimer le compte test et enregistrer immédiatement vos identifiants personnels :
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSetupError('');
                      setIsSetupModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Configurer mon Super Admin & Supprimer le test</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-4 text-center text-xs text-slate-400 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 ProformaPulse · Plateforme Sécurisée Multi-Entreprises</span>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Gestion des Devis</span>
          <span>•</span>
          <span>Encaissements</span>
          <span>•</span>
          <span>Supervision Globale</span>
        </div>
      </footer>

      {/* Initial Super Admin Setup Modal */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Créer mon Compte Super Admin</h3>
                  <p className="text-[11px] text-slate-300">Suppression définitive du compte de test</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSuperAdmin} className="p-6 space-y-4">
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Suppression du compte test :</span> En définissant vos coordonnées ci-dessous, le compte de test temporaire sera définitivement supprimé. Vous serez l'unique Super Administrateur de la plateforme.
                </div>
              </div>

              {setupError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{setupError}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Votre Nom ou Titre
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    placeholder="ex: Wilky Valcin"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Votre Adresse Email Personnelle
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    placeholder="votre-email@exemple.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Votre Mot de Passe Sécurisé
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={setupShowPassword ? 'text' : 'password'}
                    required
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setSetupShowPassword(!setupShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    title={setupShowPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {setupShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSetupModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSettingUp}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {isSettingUp ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Configuration...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Activer mon Super Admin & Supprimer le test</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

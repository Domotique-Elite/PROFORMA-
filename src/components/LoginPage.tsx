import React, { useState } from 'react';
import { useAuth, SUPER_ADMIN_CREDENTIALS } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Database, 
  Sparkles,
  Zap,
  DollarSign,
  FileText
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, enterprises, isSupabaseConnected } = useAuth();

  const [activeTab, setActiveTab] = useState<'enterprise' | 'superadmin'>('enterprise');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

    // Simulate snappy network feedback
    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Identifiants invalides. Veuillez réessayer.');
      }
    }, 250);
  };

  const handleSelectQuickAccount = (entEmail: string, entPass: string) => {
    setActiveTab('enterprise');
    setEmail(entEmail);
    setPassword(entPass);
    setErrorMessage('');
  };

  const handleSelectSuperAdmin = () => {
    setActiveTab('superadmin');
    setEmail(SUPER_ADMIN_CREDENTIALS.email);
    setPassword(SUPER_ADMIN_CREDENTIALS.password);
    setErrorMessage('');
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
              {isSupabaseConnected ? 'Supabase PostgreSQL Connecté' : 'Mode Local / Démo'}
            </span>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
          </div>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="max-w-5xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6 sm:py-10">
        
        {/* Left Column: Platform Presentation & Features */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gestion de Devis Proforma & Encaissements</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Accédez à votre espace <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">professionnel</span>.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Identifiez-vous pour gérer vos devis proforma, suivre le pipeline financier, enregistrer les acomptes clients et exporter vos documents officiels.
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Devis & Proformas</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Modèles personnalisés, TVA, acomptes et validité légale.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Suivi Financier</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Enregistrement des encaissements partiels et conversion en facture.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-500/20 text-sky-300 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Espace Multi-Entreprises</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Chaque entreprise dispose de son profil et de sa numérotation.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Portail Super Admin</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Supervision globale, gestion des accès et réinitialisation.</p>
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
                Choisissez votre type de compte pour vous identifier
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
                    setEmail(SUPER_ADMIN_CREDENTIALS.email);
                    setPassword(SUPER_ADMIN_CREDENTIALS.password);
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
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Échec de connexion : </span>
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Adresse Email Professionnelle
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === 'enterprise' ? 'ex: contact@domoelite.com' : 'admin@proformapulse.com'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mot de passe
                  </label>
                  {activeTab === 'enterprise' && (
                    <span className="text-[11px] text-slate-400">
                      Fourni par le Super Admin
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
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

            {/* Quick Demo Access Bar */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Comptes de test (Connexion en 1 clic)</span>
                </span>
              </div>

              <div className="space-y-2">
                {/* Super Admin Quick Button */}
                <button
                  type="button"
                  onClick={handleSelectSuperAdmin}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                    activeTab === 'superadmin'
                      ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-bold">Super Administrateur</div>
                      <div className="text-[10px] text-slate-500 font-mono">admin@proformapulse.com</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                    admin2026
                  </span>
                </button>

                {/* Enterprises Quick Buttons */}
                {enterprises.slice(0, 2).map((ent) => (
                  <button
                    key={ent.id}
                    type="button"
                    onClick={() => handleSelectQuickAccount(ent.email, ent.tempPassword)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                      activeTab === 'enterprise' && email === ent.email
                        ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <div className="font-bold truncate">{ent.companyName}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{ent.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono shrink-0 ml-2">
                      {ent.tempPassword}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-4 text-center text-xs text-slate-400 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 ProformaPulse · Plateforme de Facturation Proforma & Encaissements</span>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Multi-Entreprises</span>
          <span>•</span>
          <span>Supervision Globale</span>
          <span>•</span>
          <span>PostgreSQL Supabase</span>
        </div>
      </footer>

    </div>
  );
};

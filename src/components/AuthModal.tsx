import React, { useState } from 'react';
import { useAuth, SUPER_ADMIN_CREDENTIALS } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Building2, 
  Lock, 
  Mail, 
  X, 
  AlertCircle, 
  ArrowRight,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { login, enterprises } = useAuth();

  const [activeTab, setActiveTab] = useState<'enterprise' | 'superadmin'>('enterprise');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = login(email, password);
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Erreur de connexion');
    }
  };

  const handleSelectQuickAccount = (entEmail: string, entPass: string) => {
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Espace de Connexion</h3>
            <p className="text-xs text-slate-500">Accédez à votre compte entreprise ou au Super Admin</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('enterprise');
              setEmail('');
              setPassword('');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'enterprise'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Compte Entreprise</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('superadmin');
              setEmail(SUPER_ADMIN_CREDENTIALS.email);
              setPassword(SUPER_ADMIN_CREDENTIALS.password);
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'superadmin'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Super Admin</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email de connexion
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="nom@entreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {activeTab === 'enterprise' ? 'Mot de passe temporaire' : 'Mot de passe Super Admin'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Se Connecter</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Shortcuts for Testing / Evaluation */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Accès Rapide de Démonstration :
            </div>
            
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={handleSelectSuperAdmin}
                className="w-full p-2 bg-slate-900 text-white rounded-lg text-left flex items-center justify-between text-[11px] hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-bold">Super Administrateur</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">{SUPER_ADMIN_CREDENTIALS.email}</span>
              </button>

              {enterprises.slice(0, 3).map((ent) => (
                <button
                  key={ent.id}
                  type="button"
                  onClick={() => {
                    setActiveTab('enterprise');
                    handleSelectQuickAccount(ent.email, ent.tempPassword);
                  }}
                  className={`w-full p-2 rounded-lg text-left flex items-center justify-between text-[11px] border transition-colors ${
                    ent.status === 'blocked'
                      ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-semibold truncate">{ent.companyName}</span>
                    {ent.status === 'blocked' && (
                      <span className="text-[9px] bg-rose-200 text-rose-800 font-bold px-1 rounded">Bloqué</span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-1">
                    Remplir
                  </span>
                </button>
              ))}
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useProforma } from '../context/ProformaContext';
import { useAuth } from '../context/AuthContext';
import { exportProformasToCSV } from '../utils/formatters';
import { DeploymentGuideModal } from './DeploymentGuideModal';
import { 
  FileText, 
  BarChart3, 
  Plus, 
  Settings, 
  Download, 
  RotateCcw,
  Building2,
  ShieldCheck,
  LogOut,
  UserCheck,
  User,
  ArrowLeft,
  Database,
  Cloud
} from 'lucide-react';

export const Navbar: React.FC<{ 
  onOpenNewProforma: () => void;
  onOpenAuthModal: () => void;
  isSuperAdminView: boolean;
  setIsSuperAdminView: (v: boolean) => void;
}> = ({ onOpenNewProforma, onOpenAuthModal, isSuperAdminView, setIsSuperAdminView }) => {
  const [isDeploymentGuideOpen, setIsDeploymentGuideOpen] = useState(false);
  const {
    currentView,
    setCurrentView,
    setSettingsModalOpen,
    proformas,
    company,
    resetToDemoData,
  } = useProforma();

  const {
    currentUser,
    enterprises,
    activeEnterprise,
    impersonatingEnterpriseId,
    impersonateEnterprise,
    stopImpersonation,
    logout,
    isAccountOnline,
    isSupabaseConnected,
  } = useAuth();

  const handleExportCSV = () => {
    exportProformasToCSV(proformas, company.currency);
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <>
      {/* Impersonation Banner if Super Admin is inspecting an enterprise */}
      {impersonatingEnterpriseId && (
        <div className="no-print bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-bold shadow-md border-b border-amber-600">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-1.5 bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                MODE INSPECTION SUPER ADMIN
              </span>
              <span>
                Vous contrôlez l'espace de :
              </span>

              {/* Quick Enterprise Switcher */}
              <select
                value={impersonatingEnterpriseId || ''}
                onChange={(e) => impersonateEnterprise(e.target.value)}
                className="bg-amber-600/40 hover:bg-amber-600/60 text-slate-950 font-bold px-2 py-1 rounded-md border border-amber-700/50 text-xs focus:outline-none cursor-pointer"
                title="Changer d'entreprise à inspecter"
              >
                {enterprises.map((ent) => (
                  <option key={ent.id} value={ent.id} className="bg-white text-slate-900 font-semibold">
                    {ent.companyName} ({ent.currency || 'USD'}) {ent.status === 'blocked' ? '[BLOQUÉ]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenNewProforma}
                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold rounded-lg transition-colors text-[11px] shadow-xs"
              >
                <Plus className="w-3 h-3" />
                <span>Créer Devis pour cette Entreprise</span>
              </button>

              <button
                onClick={() => {
                  stopImpersonation();
                  setIsSuperAdminView(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-white rounded-lg hover:bg-slate-800 transition-all text-[11px] font-bold shadow-xs active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>Quitter l'Inspection (Retour Super Admin)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      <header className="no-print sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Zone 1: Company Logo / Brand Title */}
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-9 h-9 object-contain rounded-lg border border-slate-200 bg-white p-0.5 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            )}

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setIsSuperAdminView(false);
                    setCurrentView('dashboard');
                  }} 
                  className="text-left group flex items-center gap-1.5"
                >
                  <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[180px] sm:max-w-none">
                    {company.name || 'ProformaPulse'}
                  </span>
                </button>

                {/* Online indicator */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Online</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-[300px]">
                {company.city || company.address ? `${company.address}, ${company.city}` : 'Gestion & Suivi des Devis'}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            
            {/* Super Admin Dashboard Toggle Button (if role is super_admin) */}
            {isSuperAdmin && (
              <button
                onClick={() => setIsSuperAdminView(!isSuperAdminView)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${
                  isSuperAdminView
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Super Admin</span>
              </button>
            )}

            {!isSuperAdminView && (
              <>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentView === 'dashboard'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  <span>Tableau de Bord</span>
                </button>
                
                <button
                  onClick={() => setCurrentView('proformas')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentView === 'proformas'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Devis & Proformas</span>
                  <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                    {proformas.length}
                  </span>
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Primary Actions & User Auth */}
          <div className="flex items-center gap-2">
            
            {/* Currency indicator */}
            <div className="hidden lg:inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono font-bold text-xs">
              {company.currency === 'USD' ? '$ USD' : company.currency}
            </div>

            {!isSuperAdminView && (
              <>
                <button
                  onClick={handleExportCSV}
                  title="Exporter les proformas en CSV"
                  className="hidden xl:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>CSV</span>
                </button>

                {/* Company Profile Settings Button */}
                <button
                  onClick={() => setSettingsModalOpen(true)}
                  title="Modifier profil entreprise & coordonnées"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden md:inline">Profil Entreprise</span>
                </button>

                {/* New Quote button */}
                <button
                  onClick={onOpenNewProforma}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-sm active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nouveau Devis</span>
                </button>
              </>
            )}

            {/* Cloud & Supabase Deployment Button */}
            <button
              onClick={() => setIsDeploymentGuideOpen(true)}
              title="Guide d'hébergement Vercel & Base de données Supabase"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                isSupabaseConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseConnected ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span className="hidden xl:inline">
                {isSupabaseConnected ? 'Supabase Connecté' : 'Vercel & Supabase'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </button>

            {/* Auth Account / Switch Portal button */}
            <button
              onClick={onOpenAuthModal}
              title="Connexion / Changer de compte"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              {isSuperAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Super Admin</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-slate-300" />
                  <span className="hidden sm:inline">Connexion</span>
                </>
              )}
            </button>

          </div>

        </div>
      </header>

      {/* Guide Vercel & Supabase */}
      <DeploymentGuideModal
        isOpen={isDeploymentGuideOpen}
        onClose={() => setIsDeploymentGuideOpen(false)}
      />
    </>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProforma } from '../context/ProformaContext';
import { EnterpriseAccount } from '../types/auth';
import { PasswordManagementModal } from './PasswordManagementModal';
import { SuperAdminSettingsModal } from './SuperAdminSettingsModal';
import { 
  ShieldCheck, 
  Building2, 
  UserPlus, 
  KeyRound, 
  Lock, 
  Unlock, 
  Eye, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  Globe2, 
  Clock, 
  AlertTriangle, 
  ExternalLink,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  X,
  Receipt,
  DollarSign,
  UserCheck,
  Sparkles
} from 'lucide-react';

export const SuperAdminDashboard: React.FC<{
  onOpenCompanyApp: (enterpriseId: string) => void;
}> = ({ onOpenCompanyApp }) => {
  const {
    enterprises,
    superAdminConfig,
    clearAllDemoEnterprises,
    createEnterprise,
    toggleAccountStatus,
    resetTemporaryPassword,
    deleteEnterprise,
    impersonateEnterprise,
    isAccountOnline,
    generateRandomPassword,
  } = useAuth();

  const { getEnterpriseMetrics } = useProforma();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'active' | 'blocked'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSuperAdminSettingsOpen, setIsSuperAdminSettingsOpen] = useState(false);
  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false);
  const [passwordModalEnterprise, setPasswordModalEnterprise] = useState<EnterpriseAccount | null>(null);
  
  // Selected account for password view / modal
  const [revealedPasswordId, setRevealedPasswordId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Enterprise Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Haïti');
  const [newContact, setNewContact] = useState('');
  const [newCurrency, setNewCurrency] = useState('USD');
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; pass: string; name: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle open create modal
  const handleOpenCreateModal = () => {
    setNewName('');
    setNewEmail('');
    setNewPassword(generateRandomPassword());
    setNewPhone('');
    setNewAddress('');
    setNewCity('Haïti');
    setNewContact('');
    setNewCurrency('USD');
    setCreatedCredentials(null);
    setErrorMessage('');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newName.trim() || !newEmail.trim()) {
      setErrorMessage('Veuillez renseigner au moins le nom et l\'email de l\'entreprise.');
      return;
    }

    const res = createEnterprise({
      companyName: newName,
      email: newEmail,
      tempPassword: newPassword,
      phone: newPhone,
      address: newAddress,
      city: newCity,
      contactPerson: newContact || newName,
      currency: newCurrency,
    });

    if (res.success && res.account) {
      setCreatedCredentials({
        name: res.account.companyName,
        email: res.account.email,
        pass: res.account.tempPassword,
      });
    } else {
      setErrorMessage(res.error || 'Erreur lors de la création du compte.');
    }
  };

  const handleCopyCredentials = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [enterpriseToDelete, setEnterpriseToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const handleToggleBlock = (account: EnterpriseAccount) => {
    const isBlocking = account.status === 'active';
    toggleAccountStatus(account.id, isBlocking ? 'Suspendu par le Super Administrateur' : undefined);
    setStatusFeedback(isBlocking ? `Le compte "${account.companyName}" a été suspendu.` : `Le compte "${account.companyName}" a été réactivé.`);
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  const handleResetPassword = (id: string, name: string) => {
    const newPwd = resetTemporaryPassword(id);
    setStatusFeedback(`Nouveau mot de passe généré pour ${name} : ${newPwd}`);
  };

  const handleDelete = (id: string, name: string) => {
    setEnterpriseToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!enterpriseToDelete) return;
    setIsDeleting(true);
    await deleteEnterprise(enterpriseToDelete.id);
    setIsDeleting(false);
    setStatusFeedback(`Entreprise "${enterpriseToDelete.name}" supprimée avec succès.`);
    setEnterpriseToDelete(null);
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  const handleConfirmPurge = async () => {
    setIsPurging(true);
    await clearAllDemoEnterprises();
    setIsPurging(false);
    setIsPurgeConfirmOpen(false);
    setStatusFeedback('Toutes les entreprises de démonstration ont été purgées avec succès de Supabase.');
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  // Metrics
  const totalEnterprises = enterprises.length;
  const onlineCount = enterprises.filter((e) => isAccountOnline(e)).length;
  const activeCount = enterprises.filter((e) => e.status === 'active').length;
  const blockedCount = enterprises.filter((e) => e.status === 'blocked').length;

  const globalFinancials = enterprises.reduce(
    (acc, ent) => {
      const m = getEnterpriseMetrics(ent.id);
      return {
        count: acc.count + m.count,
        totalCollected: acc.totalCollected + m.totalCollected,
        totalVolume: acc.totalVolume + m.totalVolume,
      };
    },
    { count: 0, totalCollected: 0, totalVolume: 0 }
  );

  // Filtered List
  const filteredEnterprises = enterprises.filter((ent) => {
    const matchesSearch = 
      ent.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ent.phone.includes(searchQuery) ||
      ent.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'online') return isAccountOnline(ent);
    if (statusFilter === 'active') return ent.status === 'active';
    if (statusFilter === 'blocked') return ent.status === 'blocked';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Super Admin Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-indigo-500 text-white flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              ESPACE SUPER ADMIN
            </span>
            <span className="text-xs text-slate-400">Contrôle Global Multi-Entreprises</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard Super Administrateur
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Créez les comptes des entreprises clientes, attribuez des mots de passe temporaires, suivez leur statut de connexion (Online/Offline) en temps réel et gérez les blocages d'accès.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-start md:self-auto">
          {/* Mon Compte Super Admin */}
          <button
            onClick={() => setIsSuperAdminSettingsOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-all active:scale-95 shadow-xs"
            title="Modifier l'email et le mot de passe de connexion Super Admin"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Mon Compte Admin</span>
          </button>

          {/* Purger les comptes de test (si entreprises existantes) */}
          {enterprises.length > 0 && (
            <button
              onClick={() => setIsPurgeConfirmOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all active:scale-95 shadow-xs"
              title="Supprimer les entreprises de démonstration pour vider la liste"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Purger démo ({enterprises.length})</span>
            </button>
          )}

          {/* Créer une entreprise */}
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Nouvelle Entreprise</span>
          </button>
        </div>
      </div>

      {/* Personalized Super Admin Account Prompt (if using default credentials) */}
      {superAdminConfig.email === 'admin@proformapulse.com' && (
        <div className="bg-gradient-to-r from-indigo-900/90 via-slate-900 to-indigo-950 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white shadow-md">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-1.5">
                <span>Personnalisez votre compte Super Administrateur</span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Important
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Vous êtes connecté avec l'email générique <strong>({superAdminConfig.email})</strong>. Cliquez ici pour enregistrer votre propre email personnel et votre mot de passe confidentiel.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSuperAdminSettingsOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-md active:scale-95 whitespace-nowrap"
          >
            Configurer mon compte personnel
          </button>
        </div>
      )}

      {/* KPI Cards: Online, Total, Active, Blocked + Global Financials */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Enterprises */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Entreprises Inscrites</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{totalEnterprises}</div>
          <div className="text-[11px] text-slate-400 mt-1">Comptes configurés</div>
        </div>

        {/* Online Now */}
        <div className="bg-white border border-emerald-200/80 rounded-xl p-4 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">En Ligne (Online)</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">{onlineCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Actuellement connectées</div>
        </div>

        {/* Active Accounts */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Comptes Actifs</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Accès autorisé</div>
        </div>

        {/* Blocked Accounts */}
        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs bg-rose-50/20">
          <div className="text-xs font-semibold text-rose-800">Comptes Bloqués</div>
          <div className="text-2xl font-bold text-rose-700 mt-1 font-mono">{blockedCount}</div>
          <div className="text-[11px] text-rose-600 mt-1">Accès suspendu</div>
        </div>

      </div>

      {/* Global Financial Oversight (Super Admin Overview) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-linear-to-br from-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-xl shadow-md border border-indigo-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-indigo-400" />
              <span>Volume Global Devis Réseau</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {globalFinancials.totalVolume.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} $
            </div>
            <div className="text-[11px] text-indigo-200 mt-0.5">
              {globalFinancials.count} devis émis au total par l'ensemble des entreprises
            </div>
          </div>
          <div className="p-3 bg-indigo-800/40 rounded-xl border border-indigo-700/50">
            <Receipt className="w-6 h-6 text-indigo-300" />
          </div>
        </div>

        <div className="bg-linear-to-br from-emerald-900 to-slate-900 text-white p-4 sm:p-5 rounded-xl shadow-md border border-emerald-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Total Encaissé Réseau ($ USD)</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
              {globalFinancials.totalCollected.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} $
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5">
              Montant réel perçu et enregistré via les paiements
            </div>
          </div>
          <div className="p-3 bg-emerald-800/40 rounded-xl border border-emerald-700/50">
            <DollarSign className="w-6 h-6 text-emerald-300" />
          </div>
        </div>
      </div>

      {/* Main Filter & Search Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher entreprise, email, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Toutes ({totalEnterprises})
          </button>
          <button
            onClick={() => setStatusFilter('online')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'online'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>En Ligne ({onlineCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Actifs ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('blocked')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'blocked'
                ? 'bg-rose-600 text-white'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Bloqués ({blockedCount})
          </button>
        </div>

      </div>

      {/* Enterprises Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Entreprise & Contact</th>
                <th className="py-3 px-4">Identifiants de Connexion</th>
                <th className="py-3 px-3 text-center">Activité & Devis</th>
                <th className="py-3 px-3 text-center">Statut Connexion</th>
                <th className="py-3 px-3 text-center">Accès Compte</th>
                <th className="py-3 px-4 text-right">Actions Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {enterprises.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                        <Building2 className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800">
                        Votre plateforme est prête & propre !
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Toutes les entreprises de test ont été supprimées. Vous pouvez maintenant ajouter votre première vraie entreprise cliente pour lui donner accès à son espace.
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleOpenCreateModal}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>+ Créer la Première Entreprise</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredEnterprises.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-700">Aucune entreprise ne correspond à ce filtre</p>
                    <p className="text-[11px]">Modifiez votre recherche ou réinitialisez les filtres.</p>
                  </td>
                </tr>
              ) : (
                filteredEnterprises.map((account) => {
                  const online = isAccountOnline(account);
                  const isBlocked = account.status === 'blocked';
                  const showPass = revealedPasswordId === account.id;
                  const stats = getEnterpriseMetrics(account.id);

                  return (
                    <tr
                      key={account.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isBlocked ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Enterprise Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 overflow-hidden shadow-xs border border-slate-200">
                            {account.logoUrl ? (
                              <img src={account.logoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              account.companyName.slice(0, 2)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{account.companyName}</span>
                              {account.currency && (
                                <span className="font-mono text-[10px] px-1 py-0.2 bg-slate-100 text-slate-600 rounded">
                                  {account.currency}
                                </span>
                              )}
                            </div>
                            <div className="text-slate-600 text-xs font-medium mt-0.5">
                              Contact : {account.contactPerson}
                            </div>
                            <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                              <span>{account.city}</span>
                              {account.phone && <span>· {account.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Credentials (Email & Temp Password) */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 font-mono text-slate-800 text-xs">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[190px]">{account.email}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <div className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 select-all">
                              {showPass ? account.tempPassword : '••••••••••••'}
                            </div>

                            <button
                              type="button"
                              onClick={() => setRevealedPasswordId(showPass ? null : account.id)}
                              className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 px-1"
                              title="Afficher/masquer le mot de passe"
                            >
                              {showPass ? 'Masquer' : 'Voir'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyCredentials(`Email: ${account.email}\nMot de passe temporaire: ${account.tempPassword}`, account.id)}
                              className="text-slate-400 hover:text-slate-700 p-1"
                              title="Copier les identifiants"
                            >
                              {copiedId === account.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Activité & Métriques Financières */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-xs text-slate-800 flex items-center gap-1 font-mono">
                            <Receipt className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{stats.count} devis</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1 font-mono">
                            {stats.totalCollected.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {account.currency || 'USD'}
                          </span>
                        </div>
                      </td>

                      {/* Online / Offline Status */}
                      <td className="py-3.5 px-3 text-center">
                        {online ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>Online</span>
                          </span>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>Offline</span>
                            </span>
                            {account.lastLoginAt && (
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                {account.lastLoginAt.slice(5)}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Account Status: Active or Blocked */}
                      <td className="py-3.5 px-3 text-center">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <Lock className="w-3 h-3 text-rose-600" />
                            <span>Bloqué</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Actif</span>
                          </span>
                        )}
                      </td>

                      {/* Super Admin Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          
                          {/* Impersonate / Mode Inspection */}
                          <button
                            type="button"
                            onClick={() => {
                              impersonateEnterprise(account.id);
                              onOpenCompanyApp(account.id);
                            }}
                            title="Se connecter en tant que cette entreprise (Mode Inspection)"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-lg transition-all shadow-xs active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspecter</span>
                          </button>

                          {/* Advanced Temp Password Management Modal */}
                          <button
                            type="button"
                            onClick={() => setPasswordModalEnterprise(account)}
                            title="Gérer ou modifier le mot de passe temporaire et copier le message d'invitation"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="hidden xl:inline">Mot de passe</span>
                          </button>

                          {/* Toggle Block / Unblock */}
                          <button
                            type="button"
                            onClick={() => handleToggleBlock(account)}
                            title={isBlocked ? 'Débloquer le compte de l\'entreprise' : 'Bloquer et suspendre l\'accès'}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                              isBlocked
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
                            }`}
                          >
                            {isBlocked ? (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Débloquer</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Bloquer</span>
                              </>
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(account.id, account.companyName)}
                            title="Supprimer définitivement ce compte entreprise"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: CRÉATION D'UNE ENTREPRISE PAR LE SUPER ADMIN       */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Créer un Compte Entreprise</h3>
                  <p className="text-xs text-slate-300">Génération d'accès avec email et mot de passe temporaire</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content or Success Card */}
            {createdCredentials ? (
              <div className="p-6 space-y-5">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span>Compte entreprise créé avec succès !</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Voici les identifiants d'accès configurés pour le client. Vous pouvez les copier en un clic pour les lui envoyer par email ou WhatsApp.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 font-sans font-semibold">Entreprise :</span>
                    <div className="text-slate-900 font-bold text-sm mt-0.5">{createdCredentials.name}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans font-semibold">Email de Connexion :</span>
                    <div className="text-indigo-700 font-bold mt-0.5">{createdCredentials.email}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans font-semibold">Mot de Passe Temporaire :</span>
                    <div className="text-emerald-700 font-bold mt-0.5 bg-white p-2 rounded border border-slate-200 text-sm select-all">
                      {createdCredentials.pass}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(`Bonjour,\n\nVoici vos identifiants d'accès pour votre espace de Facturation & Proformas (${createdCredentials.name}) :\n\n- Lien d'accès : ${window.location.origin}\n- Email : ${createdCredentials.email}\n- Mot de passe temporaire : ${createdCredentials.pass}\n\nCordialement,\nL'administration`, 'modal-copy')}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copiedId === 'modal-copy' ? 'Identifiants Copiés !' : 'Copier le Message pour le Client'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nom de l'Entreprise *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Smart Living Elite Solutions"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email Professionnel de Connexion *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: contact@domoelite.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">
                        Mot de Passe Temporaire *
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewPassword(generateRandomPassword())}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Régénérer mot de passe</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold text-indigo-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: +509 3700-1234"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Contact Principal
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Domotique Elite"
                      value={newContact}
                      onChange={(e) => setNewContact(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Delmas 75"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Ville & Pays
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Cassagnol 13, Haïti"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Devise Principale
                    </label>
                    <select
                      value={newCurrency}
                      onChange={(e) => setNewCurrency(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold text-indigo-700"
                    >
                      <option value="USD">USD ($) - Dollars US (Par défaut)</option>
                      <option value="HTG">HTG - Gourde Haïtienne</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="FCFA">FCFA - Franc CFA</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Créer le Compte Entreprise</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* MODAL AVANCÉ : GESTION DU MOT DE PASSE TEMPORAIRE CLIENT   */}
      {/* ========================================================= */}
      <PasswordManagementModal
        isOpen={!!passwordModalEnterprise}
        onClose={() => setPasswordModalEnterprise(null)}
        enterprise={passwordModalEnterprise}
        onSavePassword={(entId, newPass) => {
          resetTemporaryPassword(entId, newPass);
          if (passwordModalEnterprise && passwordModalEnterprise.id === entId) {
            setPasswordModalEnterprise({
              ...passwordModalEnterprise,
              tempPassword: newPass,
              passwordUpdatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
            });
          }
        }}
        generateRandomPassword={generateRandomPassword}
      />

      {/* ========================================================= */}
      {/* MODAL : PARAMÈTRES DU COMPTE SUPER ADMIN                  */}
      {/* ========================================================= */}
      <SuperAdminSettingsModal
        isOpen={isSuperAdminSettingsOpen}
        onClose={() => setIsSuperAdminSettingsOpen(false)}
      />

      {/* ========================================================= */}
      {/* MODAL : CONFIRMATION DE PURGE DES COMPTES DE TEST         */}
      {/* ========================================================= */}
      {isPurgeConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Supprimer les entreprises de test ?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cette action supprimera définitivement les {enterprises.length} compte(s) d'entreprises de démonstration pour vous laisser un espace 100% vierge et prêt pour vos vrais clients.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
              <strong>Note :</strong> Votre compte Super Admin ainsi que vos paramètres restent inchangés. Vous pourrez créer de nouvelles entreprises immédiatement après.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isPurging}
                onClick={() => setIsPurgeConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isPurging}
                onClick={handleConfirmPurge}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                {isPurging ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Suppression en cours...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Oui, purger les comptes test</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : CONFIRMATION DE SUPPRESSION D'UNE ENTREPRISE      */}
      {/* ========================================================= */}
      {enterpriseToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Supprimer "{enterpriseToDelete.name}" ?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cette action supprimera définitivement le compte de cette entreprise ainsi que l'ensemble de ses devis et historiques de règlements enregistrés dans Supabase.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setEnterpriseToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer définitivement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NOTIFICATION FLOTTANTE DE STATUT / TOAST                   */}
      {/* ========================================================= */}
      {statusFeedback && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusFeedback}</span>
        </div>
      )}

    </div>
  );
};

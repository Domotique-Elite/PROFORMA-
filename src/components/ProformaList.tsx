import React, { useState } from 'react';
import { useProforma } from '../context/ProformaContext';
import { Proforma, ProformaStatus } from '../types/proforma';
import { formatCurrency, formatDate, STATUS_CONFIG } from '../utils/formatters';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  Plus, 
  DollarSign, 
  FileCheck2, 
  ChevronDown,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export const ProformaList: React.FC<{
  onOpenNewProforma: () => void;
  onEditProforma: (p: Proforma) => void;
  onViewProforma: (id: string) => void;
  onRecordPayment: (id: string) => void;
}> = ({ onOpenNewProforma, onEditProforma, onViewProforma, onRecordPayment }) => {
  const {
    filteredProformas,
    proformas,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    company,
    updateStatus,
    deleteProforma,
    duplicateProforma,
    convertToInvoice,
  } = useProforma();

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const statuses: Array<{ key: string; label: string }> = [
    { key: 'all', label: 'Toutes' },
    { key: 'en_attente', label: 'En attente' },
    { key: 'valide', label: 'Validées' },
    { key: 'encaisse', label: 'Encaissées' },
    { key: 'facture', label: 'Facturées' },
    { key: 'brouillon', label: 'Brouillons' },
    { key: 'rejete', label: 'Rejetées' },
    { key: 'expire', label: 'Expirées' },
  ];

  const handleStatusChange = (id: string, newStatus: ProformaStatus) => {
    updateStatus(id, newStatus, `Changement de statut rapide depuis la liste : ${STATUS_CONFIG[newStatus].label}`);
    setActiveDropdownId(null);
  };

  const handleConvert = (id: string, proformaNumber: string) => {
    if (window.confirm(`Convertir la proforma ${proformaNumber} en Facture de vente définitive ?`)) {
      const invoiceNumber = convertToInvoice(id);
      alert(`La proforma a été convertie avec succès en Facture N° ${invoiceNumber}`);
    }
  };

  const handleDelete = (id: string, num: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la proforma ${num} ?`)) {
      deleteProforma(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Suivi des Proformas en Temps Réel
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filteredProformas.length} document(s) affiché(s) sur {proformas.length} au total.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher (N°, client, titre)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>

          {/* New Proforma Button */}
          <button
            onClick={onOpenNewProforma}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer Proforma</span>
          </button>
        </div>
      </div>

      {/* Segmented Status Filters */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto no-scrollbar">
        {statuses.map((s) => {
          const count = s.key === 'all' 
            ? proformas.length 
            : proformas.filter(p => p.status === s.key).length;

          return (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                statusFilter === s.key
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{s.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-600 font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Proformas Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredProformas.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900">Aucune proforma trouvée</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Aucun document ne correspond à vos critères de recherche ou de filtre.'
                : 'Commencez par créer votre première proforma pour suivre vos devis et encaissements.'}
            </p>
            <button
              onClick={onOpenNewProforma}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une Proforma</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">N° / Objet</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4 text-right">Montant TTC</th>
                  <th className="py-3 px-4 text-right">Encaissé</th>
                  <th className="py-3 px-4 text-center">Statut Temps Réel</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredProformas.map((p) => {
                  const statusInfo = STATUS_CONFIG[p.status];
                  const resteAPayer = Math.max(0, p.totalTTC - (p.paidAmount || 0));
                  const isPaid = (p.paidAmount || 0) >= p.totalTTC;

                  return (
                    <tr 
                      key={p.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* N° / Objet */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{p.proformaNumber}</span>
                          {p.convertedInvoiceNumber && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-sans font-medium">
                              {p.convertedInvoiceNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-slate-600 font-medium truncate max-w-xs mt-0.5">
                          {p.title}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 truncate max-w-[180px]">
                          {p.client.company || p.client.name}
                        </div>
                        {p.client.company && (
                          <div className="text-slate-500 text-[11px] truncate max-w-[180px]">
                            {p.client.name}
                          </div>
                        )}
                        <div className="text-slate-400 text-[11px] truncate max-w-[180px]">
                          {p.client.email}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-700">
                          Émise: <span className="font-mono">{formatDate(p.issueDate)}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Valide au: <span className="font-mono">{formatDate(p.validityDate)}</span>
                        </div>
                      </td>

                      {/* Montant TTC */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 tabular-nums text-sm">
                          {formatCurrency(p.totalTTC, p.currency)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          HT: {formatCurrency(p.subtotalHT, p.currency)}
                        </div>
                      </td>

                      {/* Encaissé */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className={`font-mono font-semibold tabular-nums ${
                          isPaid ? 'text-emerald-600' : p.paidAmount > 0 ? 'text-blue-600' : 'text-slate-400'
                        }`}>
                          {formatCurrency(p.paidAmount || 0, p.currency)}
                        </div>
                        {resteAPayer > 0 ? (
                          <div className="text-[10px] text-amber-700 font-mono">
                            Reste: {formatCurrency(resteAPayer, p.currency)}
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-600 font-medium">
                            Solde réglé
                          </div>
                        )}
                      </td>

                      {/* Statut en Temps Réel with Interactive Dropdown */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap relative">
                        <div className="inline-block text-left">
                          <button
                            onClick={() => setActiveDropdownId(activeDropdownId === p.id ? null : p.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${statusInfo.badgeBg} ${statusInfo.badgeText} ${statusInfo.border} hover:opacity-90 transition-all`}
                            title="Cliquer pour changer le statut en direct"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                            <span>{statusInfo.label}</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>

                          {/* Quick Change Status Dropdown */}
                          {activeDropdownId === p.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveDropdownId(null)}
                              />
                              <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-20 text-left">
                                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-100">
                                  Changer de statut
                                </div>
                                {(Object.keys(STATUS_CONFIG) as ProformaStatus[]).map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => handleStatusChange(p.id, st)}
                                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                                      p.status === st ? 'font-bold bg-slate-50 text-indigo-600' : 'text-slate-700'
                                    }`}
                                  >
                                    <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[st].dotColor}`} />
                                    <span>{STATUS_CONFIG[st].label}</span>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Voir / Imprimer le document officiel */}
                          <button
                            onClick={() => onViewProforma(p.id)}
                            title="Consulter et Imprimer le document officiel"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Encaisser paiement */}
                          <button
                            onClick={() => onRecordPayment(p.id)}
                            title="Enregistrer un encaissement (acompte ou solde)"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>

                          {/* Convertir en Facture */}
                          {p.status !== 'facture' && (
                            <button
                              onClick={() => handleConvert(p.id, p.proformaNumber)}
                              title="Convertir en Facture officielle définitive"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <FileCheck2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Dupliquer */}
                          <button
                            onClick={() => duplicateProforma(p.id)}
                            title="Dupliquer cette proforma"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Modifier */}
                          <button
                            onClick={() => onEditProforma(p)}
                            title="Modifier la proforma"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Supprimer */}
                          <button
                            onClick={() => handleDelete(p.id, p.proformaNumber)}
                            title="Supprimer la proforma"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

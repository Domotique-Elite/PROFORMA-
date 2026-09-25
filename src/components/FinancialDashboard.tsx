import React from 'react';
import { useProforma } from '../context/ProformaContext';
import { formatCurrency, STATUS_CONFIG } from '../utils/formatters';
import { ProformaStatus, TimeFilter } from '../types/proforma';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Banknote, 
  ArrowUpRight, 
  Eye, 
  DollarSign,
  AlertCircle
} from 'lucide-react';

export const FinancialDashboard: React.FC<{
  onOpenNewProforma: () => void;
  onViewProforma: (id: string) => void;
  onRecordPayment: (id: string) => void;
}> = ({ onOpenNewProforma, onViewProforma, onRecordPayment }) => {
  const {
    metrics,
    company,
    timeFilter,
    setTimeFilter,
    proformas,
    setCurrentView,
    setStatusFilter,
  } = useProforma();

  // Filter proformas needing follow-up
  const pendingProformas = proformas.filter(p => p.status === 'en_attente').slice(0, 4);
  const validatedAwaitingCash = proformas
    .filter(p => (p.status === 'valide' || p.status === 'facture') && (p.paidAmount || 0) < p.totalTTC)
    .slice(0, 4);

  const filterLabels: Record<TimeFilter, string> = {
    all: 'Tout l\'historique',
    this_month: 'Ce mois-ci',
    this_quarter: 'Ce trimestre',
    this_year: 'Cette année',
  };

  // Calculate percentages for visual distribution bar
  const totalVolume = metrics.totalEmis || 1;
  const pctEncaisse = Math.min(100, Math.round((metrics.totalEncaisse / totalVolume) * 100));
  const pctValide = Math.min(100, Math.round((metrics.totalValideEngage / totalVolume) * 100));
  const pctPipeline = Math.min(100, Math.round((metrics.totalPipeline / totalVolume) * 100));
  const pctPerdu = Math.min(100, Math.round((metrics.totalRejeteOuExpire / totalVolume) * 100));

  return (
    <div className="space-y-6">
      
      {/* Top Section: Title & Time Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Suivi Financier & Statuts des Proformas
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Surveillance en temps réel des encaissements, du chiffre d'affaires engagé et du pipeline commercial.
          </p>
        </div>

        {/* Time Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          {(['all', 'this_month', 'this_quarter', 'this_year'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                timeFilter === f
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Core Financial KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Encaissé / Réalisé */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Trésorerie Perçue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatCurrency(metrics.totalEncaisse, company.currency)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Argent effectivement entré en caisse grâce aux proformas
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{metrics.counts.encaisse} proforma(s) clôturée(s)</span>
            <span className="font-semibold text-emerald-600 font-mono">{pctEncaisse}% du volume</span>
          </div>
        </div>

        {/* Metric 2: Total Validé & Engagé (Devis signés / bons pour accord) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Chiffre Engagé (Signé)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatCurrency(metrics.totalValideEngage, company.currency)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Proformas validées par les clients (en attente de solde)
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{metrics.counts.valide} validée(s) + {metrics.counts.facture} facturée(s)</span>
            <span className="font-semibold text-blue-600 font-mono">{pctValide}% engagé</span>
          </div>
        </div>

        {/* Metric 3: Pipeline en Attente */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              Pipeline en Négociation
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatCurrency(metrics.totalPipeline, company.currency)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Montant total des proformas soumises en attente de réponse
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{metrics.counts.en_attente} dossier(s) en cours</span>
            <span className="font-semibold text-amber-600 font-mono">{pctPipeline}% en cours</span>
          </div>
        </div>

        {/* Metric 4: Taux de Succès & Total Actif */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Taux de Conversion
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.tauxConversion}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ratio de proformas validées ou encaissées
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total émis : {formatCurrency(metrics.totalEmis, company.currency)}</span>
            <span className="text-slate-400 font-mono">{metrics.nombreTotal} docs</span>
          </div>
        </div>

      </div>

      {/* Financial Distribution Bar: Visualizing "l'ensemble d'argent effectué grâce au statut" */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Répartition Financière par Statut de Proforma
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisation globale de l'argent : encaissé, validé/engagé, en attente de décision, et annulé.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Volume Total : <strong className="text-slate-900">{formatCurrency(metrics.totalEmis, company.currency)}</strong>
          </div>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            title={`Encaissé : ${formatCurrency(metrics.totalEncaisse, company.currency)} (${pctEncaisse}%)`}
            style={{ width: `${pctEncaisse}%` }}
            className="bg-emerald-500 hover:bg-emerald-600 transition-all cursor-pointer"
          />
          <div
            title={`Validé / Engagé : ${formatCurrency(metrics.totalValideEngage, company.currency)} (${pctValide}%)`}
            style={{ width: `${pctValide}%` }}
            className="bg-blue-500 hover:bg-blue-600 transition-all cursor-pointer"
          />
          <div
            title={`En attente : ${formatCurrency(metrics.totalPipeline, company.currency)} (${pctPipeline}% )`}
            style={{ width: `${pctPipeline}%` }}
            className="bg-amber-400 hover:bg-amber-500 transition-all cursor-pointer"
          />
          <div
            title={`Rejeté / Expiré : ${formatCurrency(metrics.totalRejeteOuExpire, company.currency)} (${pctPerdu}%)`}
            style={{ width: `${pctPerdu}%` }}
            className="bg-rose-400 hover:bg-rose-500 transition-all cursor-pointer"
          />
        </div>

        {/* Legend with interactive buttons to view proformas by status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100">
          
          <button 
            onClick={() => {
              setStatusFilter('encaisse');
              setCurrentView('proformas');
            }}
            className="text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Encaissé (Effectué)</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {formatCurrency(metrics.totalEncaisse, company.currency)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
              <span>{metrics.counts.encaisse} doc(s)</span>
              <span className="group-hover:translate-x-0.5 transition-transform text-slate-400">→</span>
            </div>
          </button>

          <button 
            onClick={() => {
              setStatusFilter('valide');
              setCurrentView('proformas');
            }}
            className="text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-800">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Validé (Engagé)</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {formatCurrency(metrics.totalValideEngage, company.currency)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
              <span>{metrics.counts.valide + metrics.counts.facture} doc(s)</span>
              <span className="group-hover:translate-x-0.5 transition-transform text-slate-400">→</span>
            </div>
          </button>

          <button 
            onClick={() => {
              setStatusFilter('en_attente');
              setCurrentView('proformas');
            }}
            className="text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>En attente (Pipeline)</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {formatCurrency(metrics.totalPipeline, company.currency)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
              <span>{metrics.counts.en_attente} doc(s)</span>
              <span className="group-hover:translate-x-0.5 transition-transform text-slate-400">→</span>
            </div>
          </button>

          <button 
            onClick={() => {
              setStatusFilter('rejete');
              setCurrentView('proformas');
            }}
            className="text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-800">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>Non retenu / Expiré</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {formatCurrency(metrics.totalRejeteOuExpire, company.currency)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
              <span>{metrics.counts.rejete + metrics.counts.expire} doc(s)</span>
              <span className="group-hover:translate-x-0.5 transition-transform text-slate-400">→</span>
            </div>
          </button>

        </div>
      </div>

      {/* Two Action Panels: Proformas en attente de relance & Validées en attente d'encaissement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel 1: Validées & Facturées avec encaissement à finaliser */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Encaissements à Réceptionner (Validées)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {validatedAwaitingCash.length} en attente de solde
            </span>
          </div>

          {validatedAwaitingCash.length === 0 ? (
            <div className="text-center py-8 px-4 text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              Toutes les proformas validées sont intégralement encaissées !
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {validatedAwaitingCash.map((p) => {
                const reste = p.totalTTC - (p.paidAmount || 0);
                return (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-900">
                          {p.proformaNumber}
                        </span>
                        <span className="text-xs text-slate-500 truncate">
                          · {p.client.company || p.client.name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 truncate mt-0.5">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">
                        Déjà perçu : {formatCurrency(p.paidAmount || 0, p.currency)} / {formatCurrency(p.totalTTC, p.currency)}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold font-mono text-emerald-700">
                        Reste : {formatCurrency(reste, p.currency)}
                      </div>
                      <button
                        onClick={() => onRecordPayment(p.id)}
                        className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Encaisser</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel 2: En attente de validation client (Relances prioritaires) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Proformas Émises en Attente de Décision
              </h3>
            </div>
            <button
              onClick={() => {
                setStatusFilter('en_attente');
                setCurrentView('proformas');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Voir tout ({metrics.counts.en_attente})
            </button>
          </div>

          {pendingProformas.length === 0 ? (
            <div className="text-center py-8 px-4 text-slate-500 text-xs">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-80" />
              Aucune proforma en attente. Toutes ont été validées ou traitées.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingProformas.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-900">
                        {p.proformaNumber}
                      </span>
                      <span className="text-xs text-slate-500 truncate">
                        · {p.client.company || p.client.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 truncate mt-0.5">
                      {p.title}
                    </div>
                    <div className="text-[11px] text-amber-700 font-medium mt-1">
                      Validité jusqu'au : {p.validityDate}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold font-mono text-slate-900">
                      {formatCurrency(p.totalTTC, p.currency)}
                    </div>
                    <button
                      onClick={() => onViewProforma(p.id)}
                      className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Examiner</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Quick Launch Banner */}
      <div className="bg-slate-900 rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold">
            Besoin d'émettre une nouvelle offre proforma ?
          </h4>
          <p className="text-xs text-slate-300 mt-1">
            Générez un document complet avec calcul automatique de TVA, remises, et partagez-le directement avec votre client.
          </p>
        </div>
        <button
          onClick={onOpenNewProforma}
          className="shrink-0 px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-all active:scale-95"
        >
          Créer une Proforma
        </button>
      </div>

    </div>
  );
};

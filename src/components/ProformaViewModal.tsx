import React, { useState } from 'react';
import { useProforma } from '../context/ProformaContext';
import { Proforma, ProformaStatus, ProformaTemplate } from '../types/proforma';
import { formatCurrency, formatDate, STATUS_CONFIG, TEMPLATES_CONFIG } from '../utils/formatters';
import { 
  Printer, 
  X, 
  DollarSign, 
  FileCheck, 
  LayoutTemplate,
  History,
  Building,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Edit
} from 'lucide-react';

export const ProformaViewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  proforma: Proforma | null;
  onOpenRecordPayment: (id: string) => void;
  onEdit: (p: Proforma) => void;
}> = ({ isOpen, onClose, proforma, onOpenRecordPayment, onEdit }) => {
  const { company, updateStatus, convertToInvoice } = useProforma();

  // Template chosen for display (defaults to proforma template or company default template or 'wave')
  const [activeTemplate, setActiveTemplate] = useState<ProformaTemplate>(() => {
    return proforma?.template || company.defaultTemplate || 'wave';
  });

  if (!isOpen || !proforma) return null;

  const statusInfo = STATUS_CONFIG[proforma.status];
  const resteAPayer = Math.max(0, proforma.totalTTC - (proforma.paidAmount || 0));

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = (newStatus: ProformaStatus) => {
    updateStatus(proforma.id, newStatus, `Mise à jour du statut en : ${STATUS_CONFIG[newStatus].label}`);
  };

  const handleConvertInvoice = () => {
    if (window.confirm(`Voulez-vous convertir la proforma ${proforma.proformaNumber} en Facture de vente définitive ?`)) {
      const inv = convertToInvoice(proforma.id);
      alert(`La facture définitive N° ${inv} a été créée avec succès.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static">
      
      {/* Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print border-b border-slate-200 bg-slate-50">
          
          {/* Row 1: Primary Controls */}
          <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-900">
                {proforma.proformaNumber}
              </span>
              <div className="relative inline-block">
                <select
                  value={proforma.status}
                  onChange={(e) => handleStatusChange(e.target.value as ProformaStatus)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${statusInfo.badgeBg} ${statusInfo.badgeText} ${statusInfo.border} focus:outline-none cursor-pointer`}
                >
                  {(Object.keys(STATUS_CONFIG) as ProformaStatus[]).map((st) => (
                    <option key={st} value={st}>
                      {STATUS_CONFIG[st].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Record Payment */}
              <button
                onClick={() => onOpenRecordPayment(proforma.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Encaisser</span>
              </button>

              {/* Edit */}
              <button
                onClick={() => onEdit(proforma)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <Edit className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Modifier</span>
              </button>

              {/* Convert to invoice */}
              {proforma.status !== 'facture' && (
                <button
                  onClick={handleConvertInvoice}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Convertir Facture</span>
                </button>
              )}

              {/* Print / Save PDF */}
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer / PDF</span>
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Row 2: Live Model / Template Switcher Bar */}
          <div className="px-4 sm:px-6 py-2 bg-slate-100/70 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <LayoutTemplate className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Choisir le Modèle de Devis :
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {(Object.keys(TEMPLATES_CONFIG) as ProformaTemplate[]).map((tKey) => {
                const isCurrent = activeTemplate === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => setActiveTemplate(tKey)}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                      isCurrent
                        ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    {TEMPLATES_CONFIG[tKey].name}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* DOCUMENT VIEWPORT (PRINTABLE A4 SHEET)                       */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible printable-document flex-1 bg-slate-100/30">
          
          <div className="bg-white mx-auto shadow-sm print:shadow-none border border-slate-200/80 print:border-none min-h-[900px] flex flex-col justify-between relative overflow-hidden">
            
            {/* ------------------------------------------------------------- */}
            {/* TEMPLATE 1: ELITE WAVE (EXACT MATCH WITH USER'S IMAGE)       */}
            {/* ------------------------------------------------------------- */}
            {activeTemplate === 'wave' && (
              <div className="flex flex-col justify-between flex-1 relative text-slate-900">
                
                {/* Gentle Wave Decorative Header Background */}
                <div className="relative w-full overflow-hidden">
                  <svg className="w-full h-16 text-slate-100/80 preserve-3d" viewBox="0 0 1200 120" fill="currentColor">
                    <path d="M0,0 L1200,0 L1200,60 C900,110 600,20 300,70 C150,90 50,40 0,60 Z" />
                  </svg>
                </div>

                <div className="px-8 sm:px-12 pt-2 pb-6 space-y-6 flex-1">
                  
                  {/* Top Header: Logo on left, Company Address on right */}
                  <div className="flex justify-between items-start gap-4">
                    {/* Left: Logo & Company Name */}
                    <div className="space-y-2">
                      <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center overflow-hidden border border-slate-200 shadow-xs">
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl}
                            alt={company.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center font-bold text-xs tracking-wider uppercase leading-none px-1">
                            {company.name.split(' ').map(w => w[0]).slice(0, 3).join('') || 'DOMO'}
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-medium text-slate-600">
                        {company.name}
                      </div>
                    </div>

                    {/* Right: Company Address */}
                    <div className="text-right text-xs font-semibold text-slate-800 leading-tight">
                      <div>{company.address}</div>
                      <div>{company.city}</div>
                      {company.phone && <div className="text-slate-500 font-normal mt-0.5">{company.phone}</div>}
                    </div>
                  </div>

                  {/* Client Name & Reference */}
                  <div className="pt-2">
                    <div className="text-sm font-bold text-slate-900">
                      {proforma.client.name}
                      {proforma.client.company && `, ${proforma.client.company}`}
                    </div>
                  </div>

                  {/* Large Title: Devis # [number] */}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#5c7f92] tracking-tight font-sans">
                      {proforma.proformaNumber}
                    </h2>
                  </div>

                  {/* 3-Column Metadata Row (Date du devis | Échéance | Contact) */}
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Date du devis</div>
                      <div className="text-slate-800 font-mono mt-0.5">{formatDate(proforma.issueDate, 'numeric')}</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Échéance</div>
                      <div className="text-slate-800 font-mono mt-0.5">{formatDate(proforma.validityDate, 'numeric')}</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Contact</div>
                      <div className="text-slate-800 font-medium mt-0.5">
                        {company.contactPerson || company.name}
                      </div>
                    </div>
                  </div>

                  {/* Items Table with Clean Solid Top & Bottom Lines */}
                  <div className="pt-4">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-900 text-xs font-bold text-slate-900">
                          <th className="py-2 pr-4">Description</th>
                          <th className="py-2 px-2 text-right w-24">Quantité</th>
                          <th className="py-2 px-2 text-right w-28">Prix unitaire</th>
                          <th className="py-2 pl-2 text-right w-28">Montant</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {proforma.items.map((it, idx) => (
                          <tr key={it.id || idx} className="align-top">
                            <td className="py-3.5 pr-4">
                              <div className="font-bold text-slate-900 uppercase">
                                {it.designation}
                              </div>
                              {it.description && (
                                <div className="text-[11px] text-slate-700 uppercase mt-0.5 leading-relaxed">
                                  {it.description}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-2 text-right font-mono tabular-nums whitespace-nowrap text-slate-900">
                              {Number(it.quantity).toFixed(2).replace('.', ',')} Unité(s)
                            </td>
                            <td className="py-3.5 px-2 text-right font-mono tabular-nums whitespace-nowrap text-slate-900">
                              {Number(it.unitPrice).toFixed(2).replace('.', ',')}
                            </td>
                            <td className="py-3.5 pl-2 text-right font-mono font-bold tabular-nums whitespace-nowrap text-slate-900">
                              {formatCurrency(it.totalHT, proforma.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Total Line with Top Underline */}
                    <div className="mt-4 pt-3 border-t border-slate-900 flex justify-end">
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-500 mr-4">Total</span>
                        <span className="text-base font-bold font-mono text-[#5c7f92] tabular-nums">
                          {formatCurrency(proforma.totalTTC, proforma.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Terms / Notice (Like in user's image: ANNUAL FEE: ...) */}
                  <div className="pt-4 text-xs font-bold text-slate-900 uppercase leading-relaxed">
                    {proforma.paymentTerms || company.defaultTerms}
                  </div>

                  {/* Optional notes if any */}
                  {proforma.notes && (
                    <div className="text-[11px] text-slate-600 italic">
                      {proforma.notes}
                    </div>
                  )}

                </div>

                {/* Gentle Wave Bottom Footer with Contact Email & Page Count */}
                <div className="relative mt-12">
                  <div className="w-full overflow-hidden leading-none">
                    <svg className="w-full h-16 text-slate-100/90" viewBox="0 0 1200 120" fill="currentColor">
                      <path d="M0,60 C300,10 600,100 900,50 C1050,20 1150,80 1200,60 L1200,120 L0,120 Z" />
                    </svg>
                  </div>
                  <div className="bg-slate-100/90 py-3 text-center text-xs text-slate-800 space-y-0.5">
                    <div className="font-semibold text-slate-900">
                      {company.email}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Page 1 / 1
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TEMPLATE 2: CORPORATE MODERNE                                */}
            {/* ------------------------------------------------------------- */}
            {activeTemplate === 'corporate' && (
              <div className="p-8 sm:p-12 space-y-6 flex-1 flex flex-col justify-between text-slate-900">
                
                {/* Header with Top Colored Bar & Issuer Box */}
                <div>
                  <div className="h-2 w-full bg-indigo-600 rounded-full mb-6" />
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
                    <div className="flex items-start gap-4">
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="w-16 h-16 object-contain rounded-lg border border-slate-200 p-1 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                          {company.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="space-y-1 text-xs text-slate-600">
                        <h1 className="text-xl font-bold text-slate-900">{company.name}</h1>
                        {company.tagline && <p className="text-indigo-600 font-medium">{company.tagline}</p>}
                        <p>{company.address}, {company.city}</p>
                        <p>Tél : {company.phone} · Email : {company.email}</p>
                        {company.taxId && <p className="font-mono text-[11px]">{company.taxId}</p>}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded font-bold text-xs uppercase tracking-wider">
                        Facture Proforma / Devis
                      </div>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-2">
                        {proforma.proformaNumber}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Émis le : <span className="font-mono font-semibold text-slate-800">{formatDate(proforma.issueDate)}</span>
                      </div>
                      <div className="text-xs text-amber-700">
                        Échéance : <span className="font-mono font-semibold">{formatDate(proforma.validityDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Client Box */}
                  <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Client Destinataire
                      </div>
                      <div className="font-bold text-slate-900 text-sm">
                        {proforma.client.company || proforma.client.name}
                      </div>
                      {proforma.client.company && proforma.client.name && (
                        <div className="text-slate-600 mt-0.5">Contact : {proforma.client.name}</div>
                      )}
                      <div className="text-slate-600 mt-1">{proforma.client.address} {proforma.client.city}</div>
                      <div className="text-slate-500 mt-0.5">{proforma.client.email} · {proforma.client.phone}</div>
                    </div>

                    <div className="space-y-1 sm:text-right">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Modalités & Statut
                      </div>
                      <div className="flex sm:justify-end gap-2 items-center">
                        <span className="text-slate-500">Statut :</span>
                        <span className={`px-2 py-0.5 rounded font-semibold text-xs ${statusInfo.badgeBg} ${statusInfo.badgeText}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-slate-500">Devise : <strong className="text-slate-800">{proforma.currency}</strong></div>
                      <div className="text-slate-500">Objet : <span className="text-slate-800 font-medium">{proforma.title}</span></div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                          <th className="py-2.5 px-3">Désignation</th>
                          <th className="py-2.5 px-3 text-center w-16">Qté</th>
                          <th className="py-2.5 px-3 text-right w-24">Prix Unit.</th>
                          <th className="py-2.5 px-3 text-right w-28">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {proforma.items.map((it, idx) => (
                          <tr key={it.id || idx}>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{it.designation}</div>
                              {it.description && <div className="text-[11px] text-slate-500 mt-0.5">{it.description}</div>}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono">{it.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(it.unitPrice, proforma.currency)}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">{formatCurrency(it.totalHT, proforma.currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals & Bank */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-800">Conditions & Coordonnées Bancaires</div>
                      <p className="text-slate-600 text-[11px]">{proforma.paymentTerms || company.defaultTerms}</p>
                      <p className="font-mono text-slate-700 text-[11px]">{company.bankDetails}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                        <span>Total Net TTC :</span>
                        <span className="font-mono text-indigo-700 text-base">{formatCurrency(proforma.totalTTC, proforma.currency)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Encaissé :</span>
                        <span className="font-mono">{formatCurrency(proforma.paidAmount || 0, proforma.currency)}</span>
                      </div>
                      <div className="flex justify-between text-slate-800 font-bold">
                        <span>Reste à payer :</span>
                        <span className="font-mono">{formatCurrency(resteAPayer, proforma.currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs mt-8">
                  <div className="border border-dashed border-slate-300 rounded-lg p-4 h-24 flex flex-col justify-between">
                    <span className="font-semibold text-slate-600">Bon pour accord client</span>
                    <span className="text-[10px] text-slate-400">Date et signature</span>
                  </div>
                  <div className="border border-dashed border-slate-300 rounded-lg p-4 h-24 flex flex-col justify-between text-right">
                    <span className="font-semibold text-slate-600">Signature & Cachet</span>
                    <span className="text-[10px] text-slate-400">{company.name}</span>
                  </div>
                </div>

              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TEMPLATE 3: MINIMALISTE ÉPURÉ (SWISS STYLE)                  */}
            {/* ------------------------------------------------------------- */}
            {activeTemplate === 'minimal' && (
              <div className="p-8 sm:p-14 space-y-8 flex-1 flex flex-col justify-between text-slate-900 font-sans">
                <div>
                  <div className="flex justify-between items-baseline border-b-2 border-slate-900 pb-4">
                    <div>
                      <div className="text-2xl font-bold tracking-tight text-slate-900">{company.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{company.address} · {company.city} · {company.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-widest text-slate-400">Proforma</div>
                      <div className="text-xl font-mono font-bold text-slate-900">{proforma.proformaNumber}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-6 text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Client</div>
                      <div className="font-bold text-slate-900 text-sm mt-1">{proforma.client.name}</div>
                      {proforma.client.company && <div className="text-slate-600">{proforma.client.company}</div>}
                      <div className="text-slate-500 mt-0.5">{proforma.client.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dates & Devise</div>
                      <div className="mt-1">Émis : <strong className="font-mono">{formatDate(proforma.issueDate, 'numeric')}</strong></div>
                      <div>Échéance : <strong className="font-mono">{formatDate(proforma.validityDate, 'numeric')}</strong></div>
                      <div>Devise : <strong className="font-mono">{proforma.currency}</strong></div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="py-2">Prestation / Description</th>
                          <th className="py-2 text-center w-20">Qté</th>
                          <th className="py-2 text-right w-28">Prix</th>
                          <th className="py-2 text-right w-28">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {proforma.items.map((it, idx) => (
                          <tr key={it.id || idx}>
                            <td className="py-3">
                              <div className="font-bold text-slate-900">{it.designation}</div>
                              {it.description && <div className="text-slate-500 text-[11px] mt-0.5">{it.description}</div>}
                            </td>
                            <td className="py-3 text-center font-mono">{it.quantity}</td>
                            <td className="py-3 text-right font-mono">{formatCurrency(it.unitPrice, proforma.currency)}</td>
                            <td className="py-3 text-right font-mono font-bold">{formatCurrency(it.totalHT, proforma.currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-6 flex justify-end">
                      <div className="w-64 space-y-1.5 text-xs pt-3 border-t-2 border-slate-900">
                        <div className="flex justify-between font-bold text-base text-slate-900">
                          <span>Total</span>
                          <span className="font-mono">{formatCurrency(proforma.totalTTC, proforma.currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 text-xs text-slate-600 leading-relaxed">
                    {proforma.paymentTerms || company.defaultTerms}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-400 text-center">
                  {company.name} · {company.email} · {company.bankDetails}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TEMPLATE 4: B2B CLASSIQUE                                    */}
            {/* ------------------------------------------------------------- */}
            {activeTemplate === 'classic' && (
              <div className="p-8 sm:p-12 space-y-6 flex-1 flex flex-col justify-between text-slate-900">
                <div>
                  <div className="border-4 border-slate-900 p-4 flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-xl font-black uppercase tracking-wider">{company.name}</h1>
                      <p className="text-xs text-slate-600">{company.address}, {company.city} · Tél: {company.phone}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black uppercase">Facture Proforma</div>
                      <div className="text-lg font-mono font-bold">{proforma.proformaNumber}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 p-3 mb-6">
                    <div>
                      <strong>Client :</strong> {proforma.client.company || proforma.client.name}<br />
                      <strong>Contact :</strong> {proforma.client.name}<br />
                      <strong>Adresse :</strong> {proforma.client.address}
                    </div>
                    <div className="text-right">
                      <strong>Date émission :</strong> {formatDate(proforma.issueDate)}<br />
                      <strong>Date validité :</strong> {formatDate(proforma.validityDate)}<br />
                      <strong>Devise :</strong> {proforma.currency}
                    </div>
                  </div>

                  <table className="w-full border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-200 border-b border-slate-300 font-bold">
                        <th className="p-2 text-left">Désignation</th>
                        <th className="p-2 text-center w-16">Qté</th>
                        <th className="p-2 text-right w-24">P.U.</th>
                        <th className="p-2 text-right w-28">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {proforma.items.map((it, idx) => (
                        <tr key={it.id || idx}>
                          <td className="p-2">
                            <div className="font-bold">{it.designation}</div>
                            {it.description && <div className="text-[10px] text-slate-600">{it.description}</div>}
                          </td>
                          <td className="p-2 text-center font-mono">{it.quantity}</td>
                          <td className="p-2 text-right font-mono">{formatCurrency(it.unitPrice, proforma.currency)}</td>
                          <td className="p-2 text-right font-mono font-bold">{formatCurrency(it.totalHT, proforma.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4 flex justify-end text-xs">
                    <div className="border border-slate-300 p-3 w-60 space-y-1">
                      <div className="flex justify-between font-bold text-sm">
                        <span>Total :</span>
                        <span className="font-mono">{formatCurrency(proforma.totalTTC, proforma.currency)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 text-xs">
                    <strong>Conditions :</strong> {proforma.paymentTerms || company.defaultTerms}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-300 grid grid-cols-2 gap-4 text-xs text-center">
                  <div className="border border-slate-300 p-4 h-24">Pour le Client</div>
                  <div className="border border-slate-300 p-4 h-24">Pour l'Entreprise</div>
                </div>
              </div>
            )}

          </div>

          {/* Audit Trail (Interactive on screen, hidden on print) */}
          <div className="no-print max-w-4xl mx-auto mt-6 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-indigo-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Suivi du Statut en Temps Réel & Historique d'Encaissements
              </h4>
            </div>

            <div className="space-y-2">
              {proforma.statusHistory.map((item, i) => (
                <div key={item.id || i} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {STATUS_CONFIG[item.status]?.label || item.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.date}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-slate-600 text-[11px] mt-0.5">{item.note}</p>
                    )}
                  </div>
                  {item.amountCollected && item.amountCollected > 0 && (
                    <span className="font-mono font-semibold text-emerald-600 text-xs">
                      +{formatCurrency(item.amountCollected, proforma.currency)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

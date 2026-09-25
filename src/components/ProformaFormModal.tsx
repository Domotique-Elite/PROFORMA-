import React, { useState, useEffect } from 'react';
import { useProforma } from '../context/ProformaContext';
import { Proforma, ProformaItem, ProformaStatus, ProformaTemplate } from '../types/proforma';
import { calculateItemTotals, calculateProformaTotals, formatCurrency, TEMPLATES_CONFIG } from '../utils/formatters';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Building2, 
  User, 
  Calendar, 
  FileText,
  Percent,
  Check,
  LayoutTemplate
} from 'lucide-react';

export const ProformaFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialData?: Proforma | null;
}> = ({ isOpen, onClose, initialData }) => {
  const { company, saveProforma, generateNextProformaNumber } = useProforma();

  const [proformaNumber, setProformaNumber] = useState('');
  const [title, setTitle] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [validityDate, setValidityDate] = useState('');
  const [status, setStatus] = useState<ProformaStatus>('en_attente');
  const [template, setTemplate] = useState<ProformaTemplate>('wave');
  
  // Client details
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientTaxId, setClientTaxId] = useState('');

  // Payment & Terms
  const [currency, setCurrency] = useState('USD');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [notes, setNotes] = useState('');

  // Items
  const [items, setItems] = useState<ProformaItem[]>([
    {
      id: 'item-1',
      designation: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxRate: 0,
      totalHT: 0,
      totalTTC: 0,
    },
  ]);

  useEffect(() => {
    if (initialData) {
      setProformaNumber(initialData.proformaNumber);
      setTitle(initialData.title);
      setIssueDate(initialData.issueDate);
      setValidityDate(initialData.validityDate);
      setStatus(initialData.status);
      setTemplate(initialData.template || company.defaultTemplate || 'wave');
      setClientName(initialData.client.name);
      setClientCompany(initialData.client.company || '');
      setClientEmail(initialData.client.email || '');
      setClientPhone(initialData.client.phone || '');
      setClientAddress(initialData.client.address || '');
      setClientCity(initialData.client.city || '');
      setClientTaxId(initialData.client.taxId || '');
      setCurrency(initialData.currency || company.currency || 'USD');
      setPaymentTerms(initialData.paymentTerms || company.defaultTerms);
      setNotes(initialData.notes || '');
      setItems(initialData.items.length > 0 ? initialData.items : [
        {
          id: 'item-1',
          designation: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          discountPercent: 0,
          taxRate: 0,
          totalHT: 0,
          totalTTC: 0,
        },
      ]);
    } else {
      const today = new Date().toISOString().slice(0, 10);
      const validUntil = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
      
      setProformaNumber(generateNextProformaNumber());
      setTitle('Services & Équipements Numériques');
      setIssueDate(today);
      setValidityDate(validUntil);
      setStatus('en_attente');
      setTemplate(company.defaultTemplate || 'wave');
      setClientName('');
      setClientCompany('');
      setClientEmail('');
      setClientPhone('');
      setClientAddress('');
      setClientCity('');
      setClientTaxId('');
      setCurrency(company.currency || 'USD');
      setPaymentTerms(company.defaultTerms);
      setNotes('Devis soumis au client. Offre valable 30 jours.');
      setItems([
        {
          id: `item-${Date.now()}`,
          designation: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          discountPercent: 0,
          taxRate: 0,
          totalHT: 0,
          totalTTC: 0,
        },
      ]);
    }
  }, [initialData, isOpen, company]);

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: keyof ProformaItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    
    // Recalculate totals for this item
    const calculated = calculateItemTotals({
      quantity: current.quantity,
      unitPrice: current.unitPrice,
      discountPercent: current.discountPercent,
      taxRate: current.taxRate,
    });

    updated[index] = {
      ...current,
      totalHT: calculated.totalHT,
      totalTTC: calculated.totalTTC,
    };

    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        designation: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        taxRate: 20,
        totalHT: 0,
        totalTTC: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totals = calculateProformaTotals(items);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim() && !clientCompany.trim()) {
      alert('Veuillez renseigner le nom du client ou le nom de l\'entreprise.');
      return;
    }

    if (items.every((it) => !it.designation.trim())) {
      alert('Veuillez renseigner au moins une ligne d\'article ou prestation.');
      return;
    }

    const payload: Partial<Proforma> = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      proformaNumber: proformaNumber.trim() || generateNextProformaNumber(),
      title: title.trim() || 'Facture Proforma',
      issueDate,
      validityDate,
      status,
      template,
      client: {
        name: clientName.trim(),
        company: clientCompany.trim(),
        email: clientEmail.trim(),
        phone: clientPhone.trim(),
        address: clientAddress.trim(),
        city: clientCity.trim(),
        taxId: clientTaxId.trim(),
      },
      items,
      subtotalHT: totals.subtotalHT,
      totalDiscount: totals.totalDiscount,
      totalTax: totals.totalTax,
      totalTTC: totals.totalTTC,
      paidAmount: initialData ? initialData.paidAmount : (status === 'encaisse' ? totals.totalTTC : 0),
      currency,
      paymentTerms,
      notes,
    };

    saveProforma(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialData ? `Modifier la Proforma ${initialData.proformaNumber}` : 'Nouvelle Facture Proforma'}
            </h2>
            <p className="text-xs text-slate-500">
              Saisissez les informations de facturation, les prestations et conditions de l'offre.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Section 1: Informations Générales de la Proforma */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                N° de Proforma
              </label>
              <input
                type="text"
                required
                value={proformaNumber}
                onChange={(e) => setProformaNumber(e.target.value)}
                className="w-full px-3 py-1.5 font-mono text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date d'Émission
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date de Validité
              </label>
              <input
                type="date"
                required
                value={validityDate}
                onChange={(e) => setValidityDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Statut Initial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProformaStatus)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="en_attente">En attente (Envoyée)</option>
                <option value="valide">Validée (Acceptée)</option>
                <option value="encaisse">Encaissée (Payée)</option>
                <option value="brouillon">Brouillon</option>
                <option value="facture">Facturée</option>
                <option value="rejete">Rejetée</option>
                <option value="expire">Expirée</option>
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Objet / Intitulé de la Proforma
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Fourniture d'équipements informatiques & Déploiement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Devise Monétaire
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold text-indigo-700"
              >
                <option value="USD">USD ($) - Dollar US</option>
                <option value="HTG">HTG - Gourde Haïtienne</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="FCFA">FCFA - Franc CFA</option>
                <option value="CAD">CAD ($) - Dollar Canadien</option>
                <option value="MAD">MAD - Dirham Marocain</option>
                <option value="GBP">GBP (£) - Livre Sterling</option>
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-4 pt-2 border-t border-slate-200">
              <label className="block font-semibold text-slate-700 mb-1.5">
                Modèle de Document / Style Visuel pour ce Devis
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(TEMPLATES_CONFIG) as ProformaTemplate[]).map((tKey) => {
                  const isSel = template === tKey;
                  return (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setTemplate(tKey)}
                      className={`p-2 rounded-lg border text-left text-[11px] transition-all ${
                        isSel
                          ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-900 ring-1 ring-indigo-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{TEMPLATES_CONFIG[tKey].name}</span>
                        {isSel && <Check className="w-3 h-3 text-indigo-600" />}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                        {TEMPLATES_CONFIG[tKey].tagline}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Informations du Client */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Informations du Client / Destinataire</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Société / Entreprise</label>
                <input
                  type="text"
                  placeholder="Ex: Acme Corporation SARL"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Nom du Contact</label>
                <input
                  type="text"
                  placeholder="Ex: Jean Dupont"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">E-mail</label>
                <input
                  type="email"
                  placeholder="contact@client.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Téléphone</label>
                <input
                  type="tel"
                  placeholder="+33 1 23 45 67 89"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Adresse & Ville</label>
                <input
                  type="text"
                  placeholder="123 Rue de la République, Paris"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">NIF / SIRET / TVA Client</label>
                <input
                  type="text"
                  placeholder="FR 12 345 678 901"
                  value={clientTaxId}
                  onChange={(e) => setClientTaxId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Articles & Prestations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Lignes d'Articles & Prestations</h3>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une ligne</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 px-3 w-5/12">Désignation / Description</th>
                    <th className="py-2.5 px-3 w-20 text-center">Qté</th>
                    <th className="py-2.5 px-3 w-28 text-right">Prix Unit. HT</th>
                    <th className="py-2.5 px-3 w-20 text-center">Remise %</th>
                    <th className="py-2.5 px-3 w-24 text-center">TVA %</th>
                    <th className="py-2.5 px-3 w-28 text-right">Total HT</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="align-top">
                      {/* Designation & Description */}
                      <td className="p-2.5">
                        <input
                          type="text"
                          required
                          placeholder="Désignation du produit ou service"
                          value={item.designation}
                          onChange={(e) => handleItemChange(idx, 'designation', e.target.value)}
                          className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                        />
                        <input
                          type="text"
                          placeholder="Description détaillée (facultative)"
                          value={item.description || ''}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1 mt-1 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Quantity */}
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs text-center font-mono bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Unit Price */}
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs text-right font-mono bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Discount % */}
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent}
                          onChange={(e) => handleItemChange(idx, 'discountPercent', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs text-center font-mono bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Tax Rate */}
                      <td className="p-2.5">
                        <select
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(idx, 'taxRate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs text-center font-mono bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="20">20%</option>
                          <option value="18">18%</option>
                          <option value="10">10%</option>
                          <option value="5.5">5.5%</option>
                          <option value="0">0%</option>
                        </select>
                      </td>

                      {/* Line Total HT */}
                      <td className="p-2.5 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(item.totalHT, currency)}
                      </td>

                      {/* Delete */}
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          disabled={items.length <= 1}
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Totaux & Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Conditions & Notes */}
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Conditions de règlement & Modalités
                </label>
                <textarea
                  rows={2}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="Ex: Acompte de 40% à la commande, solde à la livraison."
                  className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Notes & Remarques (Affichées sur le document)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informations supplémentaires, délais de livraison..."
                  className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 self-start">
              <div className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-200">
                Récapitulatif Financier Calculé
              </div>
              
              <div className="flex justify-between text-slate-600">
                <span>Total Brut / Sous-total HT</span>
                <span className="font-mono font-medium tabular-nums">
                  {formatCurrency(totals.subtotalHT + totals.totalDiscount, currency)}
                </span>
              </div>

              {totals.totalDiscount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Remise accordée</span>
                  <span className="font-mono font-medium tabular-nums">
                    - {formatCurrency(totals.totalDiscount, currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-800 font-medium">
                <span>Net Commercial HT</span>
                <span className="font-mono font-bold tabular-nums">
                  {formatCurrency(totals.subtotalHT, currency)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Montant total de la TVA</span>
                <span className="font-mono font-medium tabular-nums">
                  {formatCurrency(totals.totalTax, currency)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Net TTC</span>
                <span className="text-lg font-bold font-mono text-indigo-600 tabular-nums">
                  {formatCurrency(totals.totalTTC, currency)}
                </span>
              </div>
            </div>

          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Enregistrer les modifications' : 'Émettre la Proforma'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useProforma } from '../context/ProformaContext';
import { CompanyInfo, ProformaTemplate } from '../types/proforma';
import { TEMPLATES_CONFIG } from '../utils/formatters';
import { 
  X, 
  Building2, 
  Save, 
  RotateCcw, 
  Upload, 
  Trash2, 
  Image as ImageIcon,
  DollarSign,
  LayoutTemplate,
  Check
} from 'lucide-react';

export const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { company, updateCompany, resetToDemoData } = useProforma();

  const [formData, setFormData] = useState<CompanyInfo>(company);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(company);
  }, [company, isOpen]);

  if (!isOpen) return null;

  // Handle Logo Upload (converts to Base64 for persistent offline storage & printing)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Veuillez sélectionner une image de logo de moins de 2 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({ ...prev, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany(formData);
    alert('Les informations et le modèle de l\'entreprise ont été enregistrés avec succès !');
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('Voulez-vous réinitialiser toutes les données aux valeurs de démonstration ?')) {
      resetToDemoData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Profil & Informations de l'Entreprise</h3>
              <p className="text-xs text-slate-500">
                Ces informations apparaîtront sur l'en-tête, le pied de page et les devis émis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          
          {/* Logo Upload Section */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block font-bold text-slate-800 mb-2">
              Logo de l'Entreprise (si vous en avez un)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Logo Preview Box */}
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative group">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Logo entreprise"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-60" />
                    <span className="text-[10px] block leading-tight">Aucun logo</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload-input"
                  />
                  <label
                    htmlFor="logo-upload-input"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Choisir une image...</span>
                  </label>

                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Retirer le logo</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Format recommandé : PNG, JPG ou SVG carré ou transparent (max 2 Mo). Enregistré automatiquement sur vos devis.
                </p>
              </div>
            </div>
          </div>

          {/* Modèle de Devis par Défaut */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LayoutTemplate className="w-4 h-4 text-indigo-600" />
              <label className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Modèle de Devis / Proforma par Défaut
              </label>
            </div>
            <p className="text-slate-500 text-[11px] mb-3">
              Choisissez le style visuel appliqué par défaut à vos devis. Vous pouvez aussi basculer d'un modèle à l'autre à tout moment lors de l'impression.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(TEMPLATES_CONFIG) as ProformaTemplate[]).map((tmplKey) => {
                const tmpl = TEMPLATES_CONFIG[tmplKey];
                const isSelected = formData.defaultTemplate === tmplKey;
                return (
                  <button
                    key={tmplKey}
                    type="button"
                    onClick={() => setFormData({ ...formData, defaultTemplate: tmplKey })}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-xs">{tmpl.name}</span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-medium text-indigo-700 mb-0.5">
                      {tmpl.tagline}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      {tmpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coordonnées de l'entreprise */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Nom de l'Entreprise / Raison Sociale *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Smart Living Elite Solutions"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Numéro de Téléphone *
              </label>
              <input
                type="tel"
                required
                placeholder="Ex: +509 3700-1234"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email de l'Entreprise *
              </label>
              <input
                type="email"
                required
                placeholder="Ex: contact@domoelite.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Adresse *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Delmas 75"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ville & Pays *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Cassagnol 13, Haïti"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nom du Contact Commercial (affiché sur le devis)
              </label>
              <input
                type="text"
                placeholder="Ex: Domotique Elite"
                value={formData.contactPerson || ''}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Devise Monétaire Principale *
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold text-indigo-700 text-xs"
              >
                <option value="USD">USD ($) - Dollars US (Par défaut)</option>
                <option value="HTG">HTG - Gourde Haïtienne</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="FCFA">FCFA - Franc CFA (XOF/XAF)</option>
                <option value="CAD">CAD ($) - Dollar Canadien</option>
                <option value="MAD">MAD - Dirham Marocain</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Numéro NIF / SIRET / Identification Fiscale
              </label>
              <input
                type="text"
                placeholder="Ex: NIF: 004-982-123-0"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Coordonnées de Règlement (Compte bancaire, MonCash, etc.)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Sogebank Compte USD: 230-1029-8812903 / MonCash: +509 3700-1234"
                value={formData.bankDetails}
                onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-[11px]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Conditions de Règlement & Mentions Légales par Défaut
              </label>
              <textarea
                rows={2}
                placeholder="Ex: ANNUAL FEE: THE TOTAL AMOUNT OF USD 160.00 MUST BE PAID EVERY YEAR TO KEEP THE SERVICES ACTIVE."
                value={formData.defaultTerms}
                onChange={(e) => setFormData({ ...formData, defaultTerms: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
              />
            </div>

          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-800 text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser Données Démo</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les Informations</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

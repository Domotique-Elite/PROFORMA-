import { ProformaStatus, ProformaItem, ProformaTemplate } from '../types/proforma';

export const STATUS_CONFIG: Record<
  ProformaStatus,
  {
    label: string;
    description: string;
    badgeBg: string;
    badgeText: string;
    dotColor: string;
    border: string;
  }
> = {
  brouillon: {
    label: 'Brouillon',
    description: 'En cours de préparation interne',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    dotColor: 'bg-slate-400',
    border: 'border-slate-200',
  },
  en_attente: {
    label: 'En attente',
    description: 'Transmise au client, attente de décision',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    dotColor: 'bg-amber-500',
    border: 'border-amber-200',
  },
  valide: {
    label: 'Validée',
    description: 'Acceptée par le client / Accord commercial',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    dotColor: 'bg-blue-500',
    border: 'border-blue-200',
  },
  encaisse: {
    label: 'Encaissée',
    description: 'Paiement perçu (fonds entrés en trésorerie)',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    dotColor: 'bg-emerald-600',
    border: 'border-emerald-200',
  },
  facture: {
    label: 'Facturée',
    description: 'Convertie en facture de vente définitive',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    dotColor: 'bg-indigo-600',
    border: 'border-indigo-200',
  },
  rejete: {
    label: 'Rejetée',
    description: 'Offre déclinée ou annulée',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    dotColor: 'bg-rose-500',
    border: 'border-rose-200',
  },
  expire: {
    label: 'Expirée',
    description: 'Date de validité échue sans validation',
    badgeBg: 'bg-zinc-100',
    badgeText: 'text-zinc-600',
    dotColor: 'bg-zinc-400',
    border: 'border-zinc-200',
  },
};

export const TEMPLATES_CONFIG: Record<
  ProformaTemplate,
  {
    name: string;
    tagline: string;
    description: string;
  }
> = {
  wave: {
    name: 'Modèle Elite Wave',
    tagline: 'Comme sur votre modèle (Image)',
    description: 'En-tête épuré avec adresse en haut à droite, lignes ondulées douces, contact dédié et total proéminent.',
  },
  corporate: {
    name: 'Modèle Corporate Moderne',
    tagline: 'Entreprise & Services',
    description: 'Design contemporain avec encadrés structurés, récapitulatif fiscal complet et bloc bancaire.',
  },
  minimal: {
    name: 'Modèle Minimaliste Épuré',
    tagline: 'Style Suisse Monochrome',
    description: 'Lignes ultrafines, typographie aérée, idéal pour consultants, tech et design.',
  },
  classic: {
    name: 'Modèle B2B Classique',
    tagline: 'Format Formel Standard',
    description: 'Bordures traditionnelles, mentions légales complètes, double encadré de signature et cachet.',
  },
};

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  
  if (currency === 'USD' || currency === '$') {
    return '$ ' + safeAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (currency === 'FCFA' || currency === 'XOF' || currency === 'XAF') {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(safeAmount) + ' FCFA';
  }
  
  if (currency === 'HTG') {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 2,
    }).format(safeAmount) + ' HTG';
  }

  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return safeAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency;
  }
}

export function formatDate(dateString: string, style: 'french' | 'numeric' = 'numeric'): string {
  if (!dateString) return '—';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);

      if (style === 'numeric') {
        // DD/MM/YYYY like in user's image (16/09/2026)
        const dd = String(day).padStart(2, '0');
        const mm = String(month + 1).padStart(2, '0');
        return `${dd}/${mm}/${year}`;
      }

      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(d);
    }
    const d = new Date(dateString);
    if (style === 'numeric') {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${dd}/${mm}/${d.getFullYear()}`;
    }
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function calculateItemTotals(item: {
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
}): { totalHT: number; totalTTC: number } {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  const discount = Math.min(100, Math.max(0, Number(item.discountPercent) || 0));
  const tax = Math.max(0, Number(item.taxRate) || 0);

  const rawHT = qty * price;
  const discountedHT = rawHT * (1 - discount / 100);
  const totalTTC = discountedHT * (1 + tax / 100);

  return {
    totalHT: Math.round(discountedHT * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100,
  };
}

export function calculateProformaTotals(items: ProformaItem[]): {
  subtotalHT: number;
  totalDiscount: number;
  totalTax: number;
  totalTTC: number;
} {
  let subtotalHT = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let totalTTC = 0;

  for (const item of items) {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const discount = Math.min(100, Math.max(0, Number(item.discountPercent) || 0));
    const tax = Math.max(0, Number(item.taxRate) || 0);

    const baseAmount = qty * price;
    const discountAmount = baseAmount * (discount / 100);
    const lineHT = baseAmount - discountAmount;
    const taxAmount = lineHT * (tax / 100);
    const lineTTC = lineHT + taxAmount;

    subtotalHT += lineHT;
    totalDiscount += discountAmount;
    totalTax += taxAmount;
    totalTTC += lineTTC;
  }

  return {
    subtotalHT: Math.round(subtotalHT * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100,
  };
}

export function exportProformasToCSV(proformas: any[], currency: string) {
  const headers = [
    'N° Proforma',
    'Date Emission',
    'Date Echeance',
    'Statut',
    'Client',
    'Societe',
    'Email Client',
    'Telephone',
    'Objet',
    'Total HT',
    'Total TVA',
    'Total TTC',
    'Montant Encaisse',
    'Reste a Encaisser',
    'Devise',
    'N° Facture Definitive'
  ];

  const rows = proformas.map((p) => {
    const reste = Math.max(0, p.totalTTC - (p.paidAmount || 0));
    return [
      `"${p.proformaNumber}"`,
      `"${p.issueDate}"`,
      `"${p.validityDate}"`,
      `"${STATUS_CONFIG[p.status as ProformaStatus]?.label || p.status}"`,
      `"${p.client.name.replace(/"/g, '""')}"`,
      `"${(p.client.company || '').replace(/"/g, '""')}"`,
      `"${p.client.email || ''}"`,
      `"${p.client.phone || ''}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      p.subtotalHT.toFixed(2),
      p.totalTax.toFixed(2),
      p.totalTTC.toFixed(2),
      (p.paidAmount || 0).toFixed(2),
      reste.toFixed(2),
      `"${p.currency || currency}"`,
      `"${p.convertedInvoiceNumber || ''}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `proformas_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

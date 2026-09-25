export type ProformaStatus = 
  | 'brouillon'   // Brouillon - en cours de rédaction
  | 'en_attente'  // Émise et envoyée - en attente de décision client
  | 'valide'      // Validée par le client (bon pour accord / accord de principe)
  | 'encaisse'    // Encaissée (acompte ou solde payé, argent effectif reçu)
  | 'facture'     // Convertie en facture définitive
  | 'rejete'      // Rejetée / Non retenue par le client
  | 'expire';     // Expirée (dépassement de date de validité)

export type ProformaTemplate = 'wave' | 'corporate' | 'minimal' | 'classic';

export interface ProformaItem {
  id: string;
  designation: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number; // 0 to 100
  taxRate: number;         // percentage, e.g. 0, 5.5, 10, 18, 20
  totalHT: number;
  totalTTC: number;
}

export interface ClientInfo {
  name: string;
  company?: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  taxId?: string; // NIF, SIRET ou ID fiscal
}

export interface CompanyInfo {
  name: string;
  tagline?: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  taxId: string;         // NIF / SIRET / Identifiant d'entreprise
  bankDetails: string;   // Informations bancaires / MonCash / Virement
  currency: string;      // USD, EUR, FCFA, HTG, etc.
  defaultTerms: string;
  logoUrl?: string;      // Base64 Data URL or HTTP URL
  defaultTemplate: ProformaTemplate;
}

export interface StatusHistoryEntry {
  id: string;
  status: ProformaStatus;
  date: string;
  note?: string;
  amountCollected?: number;
}

export interface Proforma {
  id: string;
  enterpriseId?: string; // ID of the enterprise owning this proforma
  proformaNumber: string;
  title: string;
  issueDate: string;        // YYYY-MM-DD
  validityDate: string;     // YYYY-MM-DD
  status: ProformaStatus;
  template?: ProformaTemplate;
  client: ClientInfo;
  items: ProformaItem[];
  subtotalHT: number;
  totalDiscount: number;
  totalTax: number;
  totalTTC: number;
  paidAmount: number;       // Argent effectivement perçu (acompte ou total)
  currency: string;
  paymentTerms: string;
  notes?: string;
  statusHistory: StatusHistoryEntry[];
  convertedInvoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type TimeFilter = 'all' | 'this_month' | 'this_quarter' | 'this_year';

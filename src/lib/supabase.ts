import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnterpriseAccount } from '../types/auth';
import { Proforma } from '../types/proforma';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-public-key'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Service pour la synchronisation Supabase
 */
export const SupabaseService = {
  // Récupérer toutes les entreprises
  async fetchEnterprises(): Promise<EnterpriseAccount[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('enterprises')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Erreur Supabase fetchEnterprises:', error.message);
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      companyName: row.company_name,
      email: row.email,
      tempPassword: row.temp_password,
      phone: row.phone || '',
      address: row.address || '',
      city: row.city || '',
      contactPerson: row.contact_person || '',
      currency: row.currency || 'USD',
      defaultTemplate: row.default_template || 'wave',
      status: row.status as 'active' | 'blocked',
      lastHeartbeat: Number(row.last_heartbeat) || Date.now(),
      lastLoginAt: row.last_login_at || undefined,
      createdAt: row.created_at || new Date().toISOString(),
      passwordUpdatedAt: row.password_updated_at || undefined,
      blockReason: row.block_reason || undefined,
      notes: row.notes || undefined,
    }));
  },

  // Créer ou mettre à jour une entreprise
  async upsertEnterprise(ent: EnterpriseAccount): Promise<boolean> {
    if (!supabase) return false;
    const payload = {
      id: ent.id,
      company_name: ent.companyName,
      email: ent.email,
      temp_password: ent.tempPassword,
      phone: ent.phone,
      address: ent.address,
      city: ent.city,
      contact_person: ent.contactPerson,
      currency: ent.currency,
      default_template: ent.defaultTemplate,
      status: ent.status,
      last_heartbeat: ent.lastHeartbeat,
      last_login_at: ent.lastLoginAt,
      password_updated_at: ent.passwordUpdatedAt,
      block_reason: ent.blockReason,
      notes: ent.notes,
    };

    const { error } = await supabase.from('enterprises').upsert(payload);
    if (error) {
      console.warn('Erreur Supabase upsertEnterprise:', error.message);
      return false;
    }
    return true;
  },

  // Supprimer une entreprise
  async deleteEnterprise(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('enterprises').delete().eq('id', id);
    return !error;
  },

  // Mettre à jour le heartbeat pour statut en ligne
  async updateHeartbeat(id: string): Promise<void> {
    if (!supabase) return;
    await supabase.from('enterprises').update({
      last_heartbeat: Date.now(),
    }).eq('id', id);
  },

  // Récupérer les proformas
  async fetchProformas(): Promise<Proforma[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('proformas')
      .select('*, proforma_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erreur Supabase fetchProformas:', error.message);
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      enterpriseId: row.enterprise_id,
      proformaNumber: row.proforma_number,
      title: row.title,
      issueDate: row.issue_date,
      validityDate: row.validity_date,
      client: {
        name: row.client_name,
        company: row.client_company,
        email: row.client_email,
        phone: row.client_phone,
        address: row.client_address,
      },
      items: (row.proforma_items || []).map((item: any) => ({
        id: item.id,
        designation: item.description,
        description: item.description,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unit_price) || 0,
        discountPercent: 0,
        taxRate: 10,
        totalHT: Number(item.total) || 0,
        totalTTC: Number(item.total) * 1.1 || 0,
      })),
      subtotalHT: Number(row.total_ht) || 0,
      totalDiscount: 0,
      totalTax: Number(row.total_tax) || 0,
      totalTTC: Number(row.total_ttc) || 0,
      paidAmount: Number(row.paid_amount) || 0,
      currency: row.currency || 'USD',
      status: row.status,
      paymentTerms: row.payment_terms || '',
      notes: row.notes || '',
      template: row.template || 'wave',
      statusHistory: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  // Sauvegarder ou créer une proforma
  async upsertProforma(proforma: Proforma): Promise<boolean> {
    if (!supabase) return false;

    const payload = {
      id: proforma.id,
      enterprise_id: proforma.enterpriseId || 'ent-1',
      proforma_number: proforma.proformaNumber,
      title: proforma.title,
      issue_date: proforma.issueDate,
      validity_date: proforma.validityDate,
      client_name: proforma.client.name,
      client_company: proforma.client.company || '',
      client_email: proforma.client.email || '',
      client_phone: proforma.client.phone || '',
      client_address: proforma.client.address || '',
      total_ht: proforma.subtotalHT || 0,
      tax_rate: 10,
      total_tax: proforma.totalTax || 0,
      total_ttc: proforma.totalTTC || 0,
      paid_amount: proforma.paidAmount || 0,
      currency: proforma.currency,
      status: proforma.status,
      payment_terms: proforma.paymentTerms || '',
      notes: proforma.notes || '',
      template: proforma.template || 'wave',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('proformas').upsert(payload);
    if (error) {
      console.warn('Erreur Supabase upsertProforma:', error.message);
      return false;
    }

    // Upsert items
    if (proforma.items && proforma.items.length > 0) {
      // Supprimer anciens items pour réinsérer
      await supabase.from('proforma_items').delete().eq('proforma_id', proforma.id);
      const itemsPayload = proforma.items.map((it) => ({
        proforma_id: proforma.id,
        description: it.designation || it.description || '',
        quantity: it.quantity,
        unit_price: it.unitPrice,
        total: it.totalHT || (it.quantity * it.unitPrice),
      }));
      await supabase.from('proforma_items').insert(itemsPayload);
    }

    return true;
  },

  // Supprimer une proforma
  async deleteProforma(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('proformas').delete().eq('id', id);
    return !error;
  },
};

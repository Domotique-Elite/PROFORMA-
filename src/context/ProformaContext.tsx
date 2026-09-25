import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CompanyInfo, Proforma, ProformaStatus, TimeFilter } from '../types/proforma';
import { DEFAULT_COMPANY, INITIAL_PROFORMAS } from '../utils/initialData';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured, SupabaseService, supabase } from '../lib/supabase';

interface FinancialMetrics {
  totalEncaisse: number;     // Cash actually received (status 'encaisse' or paidAmount)
  totalValideEngage: number; // Accepted by clients, not yet fully collected
  totalPipeline: number;     // In negotiation / sent to client
  totalEmis: number;         // Total active volume
  totalRejeteOuExpire: number;
  tauxConversion: number;    // % of validated/paid vs total actionable
  nombreTotal: number;
  counts: Record<ProformaStatus, number>;
  montantsParStatut: Record<ProformaStatus, number>;
}

interface ProformaContextType {
  proformas: Proforma[];
  company: CompanyInfo;
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Navigation & Modals
  currentView: 'dashboard' | 'proformas';
  setCurrentView: (view: 'dashboard' | 'proformas') => void;
  selectedProforma: Proforma | null;
  setSelectedProforma: (p: Proforma | null) => void;
  viewModalOpen: boolean;
  setViewModalOpen: (open: boolean) => void;
  editingProforma: Proforma | null;
  isCreating: boolean;
  setIsCreating: (creating: boolean) => void;
  paymentModalProforma: Proforma | null;
  setPaymentModalProforma: (p: Proforma | null) => void;
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;

  // Actions
  saveProforma: (proformaData: Partial<Proforma>) => void;
  deleteProforma: (id: string) => void;
  duplicateProforma: (id: string) => void;
  updateStatus: (id: string, newStatus: ProformaStatus, note?: string) => void;
  recordPayment: (id: string, amount: number, note?: string, autoSetEncaisse?: boolean) => void;
  convertToInvoice: (id: string) => string;
  updateCompany: (info: Partial<CompanyInfo>) => void;
  resetToDemoData: () => void;
  generateNextProformaNumber: () => string;
  getEnterpriseMetrics: (enterpriseId: string) => { count: number; totalCollected: number; totalVolume: number };

  // Computed
  filteredProformas: Proforma[];
  metrics: FinancialMetrics;
}

const ProformaContext = createContext<ProformaContextType | undefined>(undefined);

const STORAGE_PROFORMAS_KEY = 'proformapulse_records_v2';
const STORAGE_COMPANY_KEY = 'proformapulse_company_v2';

export const ProformaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeEnterprise } = useAuth();

  const [proformas, setProformas] = useState<Proforma[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFORMAS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading proformas from localStorage', e);
    }
    return INITIAL_PROFORMAS;
  });

  const [company, setCompany] = useState<CompanyInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COMPANY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading company from localStorage', e);
    }
    return DEFAULT_COMPANY;
  });

  // Whenever activeEnterprise changes, sync company state to match the enterprise
  useEffect(() => {
    if (activeEnterprise) {
      setCompany((prev) => ({
        ...prev,
        name: activeEnterprise.companyName,
        email: activeEnterprise.email,
        phone: activeEnterprise.phone || prev.phone,
        address: activeEnterprise.address || prev.address,
        city: activeEnterprise.city || prev.city,
        contactPerson: activeEnterprise.contactPerson || prev.contactPerson,
        currency: activeEnterprise.currency || prev.currency || 'USD',
        logoUrl: activeEnterprise.logoUrl || prev.logoUrl,
        defaultTemplate: activeEnterprise.defaultTemplate || prev.defaultTemplate || 'wave',
      }));
    }
  }, [activeEnterprise]);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [currentView, setCurrentView] = useState<'dashboard' | 'proformas'>('dashboard');
  const [selectedProforma, setSelectedProforma] = useState<Proforma | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [editingProforma, setEditingProforma] = useState<Proforma | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [paymentModalProforma, setPaymentModalProforma] = useState<Proforma | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  // Supabase initial fetch & realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;
    const initSupabaseProformas = async () => {
      try {
        const remoteList = await SupabaseService.fetchProformas();
        if (remoteList && remoteList.length > 0 && isMounted) {
          setProformas(remoteList);
        } else if (remoteList && remoteList.length === 0) {
          // First time initialization: seed initial demo proformas to Supabase
          for (const p of INITIAL_PROFORMAS) {
            await SupabaseService.upsertProforma(p);
          }
        }
      } catch (err) {
        console.warn('Erreur chargement Supabase Proformas:', err);
      }
    };

    initSupabaseProformas();

    if (supabase) {
      const channel = supabase
        .channel('realtime:proformas')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'proformas' },
          async () => {
            const updated = await SupabaseService.fetchProformas();
            if (updated && isMounted) {
              setProformas(updated);
            }
          }
        )
        .subscribe();

      return () => {
        isMounted = false;
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROFORMAS_KEY, JSON.stringify(proformas));
    } catch (e) {
      console.error('Failed to save proformas to localStorage', e);
    }
  }, [proformas]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COMPANY_KEY, JSON.stringify(company));
    } catch (e) {
      console.error('Failed to save company to localStorage', e);
    }
  }, [company]);

  // Keep selectedProforma up-to-date if proformas change
  useEffect(() => {
    if (selectedProforma) {
      const updated = proformas.find((p) => p.id === selectedProforma.id);
      if (updated) setSelectedProforma(updated);
    }
  }, [proformas]);

  const generateNextProformaNumber = () => {
    const currentYear = new Date().getFullYear();
    const currentYearPrefix = `PF-${currentYear}-`;
    let highestNum = 0;
    
    proformas.forEach((p) => {
      if (p.proformaNumber && p.proformaNumber.startsWith(currentYearPrefix)) {
        const numPart = parseInt(p.proformaNumber.replace(currentYearPrefix, ''), 10);
        if (!isNaN(numPart) && numPart > highestNum) {
          highestNum = numPart;
        }
      }
    });

    const nextIndex = highestNum + 1;
    return `PF-${currentYear}-${String(nextIndex).padStart(4, '0')}`;
  };

  const saveProforma = (data: Partial<Proforma>) => {
    const now = new Date().toISOString();
    const currentEnterpriseId = activeEnterprise?.id || 'ent-1';
    
    if (data.id) {
      // Update existing
      let updatedProforma: Proforma | null = null;
      setProformas((prev) =>
        prev.map((item) => {
          if (item.id === data.id) {
            updatedProforma = {
              ...item,
              ...data,
              enterpriseId: data.enterpriseId || item.enterpriseId || currentEnterpriseId,
              updatedAt: now,
            } as Proforma;
            return updatedProforma;
          }
          return item;
        })
      );
      if (updatedProforma && isSupabaseConfigured) {
        SupabaseService.upsertProforma(updatedProforma);
      }
    } else {
      // Create new
      const newId = `pf-${Date.now()}`;
      const newProforma: Proforma = {
        id: newId,
        enterpriseId: data.enterpriseId || currentEnterpriseId,
        proformaNumber: data.proformaNumber || generateNextProformaNumber(),
        title: data.title || 'Facture Proforma',
        issueDate: data.issueDate || new Date().toISOString().slice(0, 10),
        validityDate: data.validityDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        status: data.status || 'en_attente',
        client: data.client || {
          name: '',
          company: '',
          email: '',
          phone: '',
          address: '',
        },
        items: data.items || [],
        subtotalHT: data.subtotalHT || 0,
        totalDiscount: data.totalDiscount || 0,
        totalTax: data.totalTax || 0,
        totalTTC: data.totalTTC || 0,
        paidAmount: data.paidAmount || 0,
        currency: data.currency || company.currency || 'USD',
        paymentTerms: data.paymentTerms || company.defaultTerms,
        notes: data.notes || '',
        statusHistory: [
          {
            id: `sh-${Date.now()}`,
            status: data.status || 'en_attente',
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            note: 'Création de la proforma',
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      setProformas((prev) => [newProforma, ...prev]);

      if (isSupabaseConfigured) {
        SupabaseService.upsertProforma(newProforma);
      }
    }

    setIsCreating(false);
    setEditingProforma(null);
  };

  const deleteProforma = (id: string) => {
    setProformas((prev) => prev.filter((p) => p.id !== id));
    if (selectedProforma?.id === id) {
      setSelectedProforma(null);
      setViewModalOpen(false);
    }
    if (isSupabaseConfigured) {
      SupabaseService.deleteProforma(id);
    }
  };

  const duplicateProforma = (id: string) => {
    const target = proformas.find((p) => p.id === id);
    if (!target) return;

    const nextNum = generateNextProformaNumber();
    const now = new Date().toISOString();
    const duplicated: Proforma = {
      ...target,
      id: `pf-${Date.now()}`,
      proformaNumber: nextNum,
      title: `${target.title} (Copie)`,
      issueDate: new Date().toISOString().slice(0, 10),
      validityDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: 'brouillon',
      paidAmount: 0,
      convertedInvoiceNumber: undefined,
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          status: 'brouillon',
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          note: `Duplication depuis la proforma ${target.proformaNumber}`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    setProformas((prev) => [duplicated, ...prev]);
    setSelectedProforma(duplicated);
    setViewModalOpen(true);
  };

  const updateStatus = (id: string, newStatus: ProformaStatus, note?: string) => {
    const now = new Date().toISOString();
    const timestampStr = now.replace('T', ' ').slice(0, 16);

    let updatedTarget: Proforma | null = null;
    setProformas((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newHistory = [
            ...item.statusHistory,
            {
              id: `sh-${Date.now()}`,
              status: newStatus,
              date: timestampStr,
              note: note || `Statut mis à jour vers: ${newStatus}`,
            },
          ];

          // If changing to 'encaisse' and paidAmount is 0, auto-fill with totalTTC
          let paidAmount = item.paidAmount;
          if (newStatus === 'encaisse' && paidAmount < item.totalTTC) {
            paidAmount = item.totalTTC;
          }

          updatedTarget = {
            ...item,
            status: newStatus,
            paidAmount,
            statusHistory: newHistory,
            updatedAt: now,
          };
          return updatedTarget;
        }
        return item;
      })
    );

    if (updatedTarget && isSupabaseConfigured) {
      SupabaseService.upsertProforma(updatedTarget);
    }
  };

  const recordPayment = (
    id: string,
    amount: number,
    note?: string,
    autoSetEncaisse: boolean = false
  ) => {
    const now = new Date().toISOString();
    const timestampStr = now.replace('T', ' ').slice(0, 16);

    let updatedTarget: Proforma | null = null;
    setProformas((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newPaidAmount = Math.min(item.totalTTC, (item.paidAmount || 0) + amount);
          const isFullyPaid = newPaidAmount >= item.totalTTC;
          
          let newStatus = item.status;
          if (autoSetEncaisse || isFullyPaid) {
            newStatus = 'encaisse';
          } else if (item.status === 'en_attente' || item.status === 'brouillon') {
            newStatus = 'valide';
          }

          const newHistory = [
            ...item.statusHistory,
            {
              id: `sh-${Date.now()}`,
              status: newStatus,
              date: timestampStr,
              note: note || `Encaissement de ${amount.toLocaleString('fr-FR')} ${item.currency}`,
              amountCollected: amount,
            },
          ];

          updatedTarget = {
            ...item,
            paidAmount: newPaidAmount,
            status: newStatus,
            statusHistory: newHistory,
            updatedAt: now,
          };
          return updatedTarget;
        }
        return item;
      })
    );

    if (updatedTarget && isSupabaseConfigured) {
      SupabaseService.upsertProforma(updatedTarget);
    }
  };

  const convertToInvoice = (id: string): string => {
    const target = proformas.find((p) => p.id === id);
    if (!target) return '';

    const invoiceNum = `FACT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const timestampStr = now.replace('T', ' ').slice(0, 16);

    let updatedTarget: Proforma | null = null;
    setProformas((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedTarget = {
            ...item,
            status: 'facture',
            convertedInvoiceNumber: invoiceNum,
            statusHistory: [
              ...item.statusHistory,
              {
                id: `sh-${Date.now()}`,
                status: 'facture',
                date: timestampStr,
                note: `Convertie en facture définitive officielle N° ${invoiceNum}`,
              },
            ],
            updatedAt: now,
          };
          return updatedTarget;
        }
        return item;
      })
    );

    if (updatedTarget && isSupabaseConfigured) {
      SupabaseService.upsertProforma(updatedTarget);
    }

    return invoiceNum;
  };

  const updateCompany = (info: Partial<CompanyInfo>) => {
    setCompany((prev) => ({ ...prev, ...info }));
  };

  const resetToDemoData = () => {
    setProformas(INITIAL_PROFORMAS);
    setCompany(DEFAULT_COMPANY);
    localStorage.removeItem(STORAGE_PROFORMAS_KEY);
    localStorage.removeItem(STORAGE_COMPANY_KEY);
  };

  // Proformas belonging to the current active enterprise (or all if not scoped)
  const scopedProformas = useMemo(() => {
    if (!activeEnterprise) return proformas;
    return proformas.filter((p) => {
      if (p.enterpriseId) {
        return p.enterpriseId === activeEnterprise.id;
      }
      return activeEnterprise.id === 'ent-1';
    });
  }, [proformas, activeEnterprise]);

  // Filter proformas based on timeFilter, statusFilter, and searchQuery
  const filteredProformas = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return scopedProformas.filter((p) => {
      // Time filter based on issueDate
      if (timeFilter !== 'all' && p.issueDate) {
        const pDate = new Date(p.issueDate);
        if (!isNaN(pDate.getTime())) {
          if (timeFilter === 'this_month') {
            if (pDate.getFullYear() !== currentYear || pDate.getMonth() !== currentMonth) {
              return false;
            }
          } else if (timeFilter === 'this_quarter') {
            const currentQuarter = Math.floor(currentMonth / 3);
            const pQuarter = Math.floor(pDate.getMonth() / 3);
            if (pDate.getFullYear() !== currentYear || pQuarter !== currentQuarter) {
              return false;
            }
          } else if (timeFilter === 'this_year') {
            if (pDate.getFullYear() !== currentYear) {
              return false;
            }
          }
        }
      }

      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const numMatch = p.proformaNumber.toLowerCase().includes(q);
        const titleMatch = p.title.toLowerCase().includes(q);
        const clientNameMatch = p.client.name.toLowerCase().includes(q);
        const clientCompanyMatch = (p.client.company || '').toLowerCase().includes(q);
        const clientEmailMatch = (p.client.email || '').toLowerCase().includes(q);
        if (!numMatch && !titleMatch && !clientNameMatch && !clientCompanyMatch && !clientEmailMatch) {
          return false;
        }
      }

      return true;
    });
  }, [scopedProformas, timeFilter, statusFilter, searchQuery]);

  // Compute live Financial Metrics
  const metrics = useMemo(() => {
    const counts: Record<ProformaStatus, number> = {
      brouillon: 0,
      en_attente: 0,
      valide: 0,
      encaisse: 0,
      facture: 0,
      rejete: 0,
      expire: 0,
    };

    const montantsParStatut: Record<ProformaStatus, number> = {
      brouillon: 0,
      en_attente: 0,
      valide: 0,
      encaisse: 0,
      facture: 0,
      rejete: 0,
      expire: 0,
    };

    let totalEncaisse = 0;
    let totalValideEngage = 0;
    let totalPipeline = 0;
    let totalEmis = 0;
    let totalRejeteOuExpire = 0;

    // We calculate metrics on the time-filtered dataset
    const baseProformas = scopedProformas.filter((p) => {
      if (timeFilter === 'all') return true;
      if (!p.issueDate) return true;
      const pDate = new Date(p.issueDate);
      const now = new Date();
      if (isNaN(pDate.getTime())) return true;
      if (timeFilter === 'this_month') {
        return pDate.getFullYear() === now.getFullYear() && pDate.getMonth() === now.getMonth();
      }
      if (timeFilter === 'this_quarter') {
        const curQ = Math.floor(now.getMonth() / 3);
        const pQ = Math.floor(pDate.getMonth() / 3);
        return pDate.getFullYear() === now.getFullYear() && curQ === pQ;
      }
      if (timeFilter === 'this_year') {
        return pDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    baseProformas.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
      montantsParStatut[p.status] = (montantsParStatut[p.status] || 0) + p.totalTTC;

      // Sum collected money
      totalEncaisse += p.paidAmount || 0;

      // Proforma status specific aggregation
      if (p.status === 'encaisse' || p.status === 'facture') {
        // Remaining uncollected on invoiced/collected
        const remaining = Math.max(0, p.totalTTC - (p.paidAmount || 0));
        totalValideEngage += remaining;
      } else if (p.status === 'valide') {
        // Validated by client: remaining uncollected is engaged money
        const remaining = Math.max(0, p.totalTTC - (p.paidAmount || 0));
        totalValideEngage += remaining;
      } else if (p.status === 'en_attente') {
        // Pipeline: awaiting client approval
        totalPipeline += p.totalTTC;
      } else if (p.status === 'rejete' || p.status === 'expire') {
        totalRejeteOuExpire += p.totalTTC;
      }

      if (p.status !== 'brouillon') {
        totalEmis += p.totalTTC;
      }
    });

    // Conversion rate: (validés + encaissés + facturés) / (tous ceux ayant eu une décision ou en cours, excluant brouillons)
    const successCount = counts.valide + counts.encaisse + counts.facture;
    const actionableTotal = counts.valide + counts.encaisse + counts.facture + counts.rejete + counts.expire + counts.en_attente;
    const tauxConversion = actionableTotal > 0 ? Math.round((successCount / actionableTotal) * 100) : 0;

    return {
      totalEncaisse: Math.round(totalEncaisse * 100) / 100,
      totalValideEngage: Math.round(totalValideEngage * 100) / 100,
      totalPipeline: Math.round(totalPipeline * 100) / 100,
      totalEmis: Math.round(totalEmis * 100) / 100,
      totalRejeteOuExpire: Math.round(totalRejeteOuExpire * 100) / 100,
      tauxConversion,
      nombreTotal: baseProformas.length,
      counts,
      montantsParStatut,
    };
  }, [scopedProformas, timeFilter]);

  const getEnterpriseMetrics = (enterpriseId: string) => {
    const list = proformas.filter((p) => (p.enterpriseId ? p.enterpriseId === enterpriseId : enterpriseId === 'ent-1'));
    const totalCollected = list.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    const totalVolume = list.filter((p) => p.status !== 'brouillon').reduce((sum, p) => sum + p.totalTTC, 0);
    return {
      count: list.length,
      totalCollected: Math.round(totalCollected * 100) / 100,
      totalVolume: Math.round(totalVolume * 100) / 100,
    };
  };

  return (
    <ProformaContext.Provider
      value={{
        proformas,
        company,
        timeFilter,
        setTimeFilter,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        currentView,
        setCurrentView,
        selectedProforma,
        setSelectedProforma,
        viewModalOpen,
        setViewModalOpen,
        editingProforma,
        isCreating,
        setIsCreating,
        paymentModalProforma,
        setPaymentModalProforma,
        settingsModalOpen,
        setSettingsModalOpen,
        saveProforma,
        deleteProforma,
        duplicateProforma,
        updateStatus,
        recordPayment,
        convertToInvoice,
        updateCompany,
        resetToDemoData,
        generateNextProformaNumber,
        getEnterpriseMetrics,
        filteredProformas,
        metrics,
      }}
    >
      {children}
    </ProformaContext.Provider>
  );
};

export const useProforma = () => {
  const context = useContext(ProformaContext);
  if (!context) {
    throw new Error('useProforma must be used within a ProformaProvider');
  }
  return context;
};

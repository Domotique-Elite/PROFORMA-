import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, EnterpriseAccount, AccountStatus } from '../types/auth';
import { supabase, isSupabaseConfigured, SupabaseService } from '../lib/supabase';

interface AuthContextType {
  currentUser: AuthUser | null;
  enterprises: EnterpriseAccount[];
  impersonatingEnterpriseId: string | null;
  activeEnterprise: EnterpriseAccount | null;
  isSupabaseConnected: boolean;
  
  // Super Admin Credentials & Config
  superAdminConfig: SuperAdminConfig;
  updateSuperAdminConfig: (data: { email?: string; password?: string; name?: string }) => Promise<{ success: boolean; error?: string }>;
  setupInitialSuperAdmin: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  clearAllDemoEnterprises: () => Promise<void>;
  isTestAdminActive: boolean;

  // Auth methods
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  
  // Super Admin Management
  createEnterprise: (data: {
    companyName: string;
    email: string;
    tempPassword?: string;
    phone: string;
    address: string;
    city: string;
    contactPerson: string;
    currency?: string;
    logoUrl?: string;
  }) => { success: boolean; account?: EnterpriseAccount; error?: string };
  
  toggleAccountStatus: (id: string, reason?: string) => void;
  resetTemporaryPassword: (id: string, newPassword?: string) => string;
  updateEnterprise: (id: string, data: Partial<EnterpriseAccount>) => void;
  deleteEnterprise: (id: string) => Promise<void>;
  impersonateEnterprise: (id: string) => void;
  stopImpersonation: () => void;
  
  // Helpers
  isAccountOnline: (account: EnterpriseAccount) => boolean;
  generateRandomPassword: () => string;
}

export interface SuperAdminConfig {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'super_admin';
  status: 'active';
  isCustomized?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USERS_KEY = 'proformapulse_enterprises_v1';
const STORAGE_CURRENT_USER_KEY = 'proformapulse_current_user_v1';
const STORAGE_SUPER_ADMIN_KEY = 'proformapulse_super_admin_v1';
const STORAGE_PURGED_FLAG = 'proformapulse_purged_demo_v1';

const DEFAULT_ENTERPRISES: EnterpriseAccount[] = [
  {
    id: 'ent-1',
    companyName: 'Smart Living Elite Solutions',
    email: 'contact@domoelite.com',
    tempPassword: 'Domo#2026!Elite',
    phone: '+509 3700-1234',
    address: 'Delmas 75',
    city: 'Cassagnol 13, Haïti',
    contactPerson: 'Domotique Elite',
    currency: 'USD',
    defaultTemplate: 'wave',
    status: 'active',
    lastHeartbeat: Date.now(), // Online right now
    lastLoginAt: '2026-09-23 20:30',
    createdAt: '2026-09-15 08:00',
  },
  {
    id: 'ent-2',
    companyName: 'Caraïbes Technologies SARL',
    email: 'direction@caraibes-tech.ht',
    tempPassword: 'Caraibes#Pass99',
    phone: '+509 3100-7890',
    address: 'Boulevard Toussaint Louverture',
    city: 'Port-au-Prince, Haïti',
    contactPerson: 'Nathalie Cadet',
    currency: 'USD',
    defaultTemplate: 'corporate',
    status: 'active',
    lastHeartbeat: Date.now() - 3600000 * 5, // Offline (5 hours ago)
    lastLoginAt: '2026-09-23 15:10',
    createdAt: '2026-09-16 11:20',
  },
  {
    id: 'ent-3',
    companyName: 'Haïti Logistique Express',
    email: 'contact@haitilogistique.com',
    tempPassword: 'Temp#Logi2026',
    phone: '+509 3445-9012',
    address: 'Route Nationale 1',
    city: 'Saint-Marc, Haïti',
    contactPerson: 'Junior Pierre',
    currency: 'USD',
    defaultTemplate: 'classic',
    status: 'blocked',
    blockReason: 'Non-paiement de l\'abonnement annuel plateforme',
    lastHeartbeat: Date.now() - 86400000 * 2, // 2 days ago
    lastLoginAt: '2026-09-21 09:40',
    createdAt: '2026-09-10 14:00',
  },
];

export const SUPER_ADMIN_CREDENTIALS = {
  id: 'super-admin-01',
  email: 'admin@proformapulse.com',
  password: 'admin2026',
  name: 'Super Administrateur',
  role: 'super_admin' as const,
  status: 'active' as const,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [superAdminConfig, setSuperAdminConfig] = useState<SuperAdminConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SUPER_ADMIN_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const isCustom = parsed.isCustomized || (parsed.email && parsed.email.toLowerCase() !== SUPER_ADMIN_CREDENTIALS.email.toLowerCase());
        return {
          ...parsed,
          isCustomized: isCustom,
        };
      }
    } catch (e) {
      console.error('Error loading super admin config', e);
    }
    return {
      id: SUPER_ADMIN_CREDENTIALS.id,
      email: SUPER_ADMIN_CREDENTIALS.email,
      password: SUPER_ADMIN_CREDENTIALS.password,
      name: SUPER_ADMIN_CREDENTIALS.name,
      role: 'super_admin',
      status: 'active',
      isCustomized: false,
    };
  });

  const isTestAdminActive = !(
    superAdminConfig.isCustomized ||
    superAdminConfig.email.toLowerCase() !== SUPER_ADMIN_CREDENTIALS.email.toLowerCase()
  );

  const [enterprises, setEnterprises] = useState<EnterpriseAccount[]>(() => {
    try {
      const isPurged = localStorage.getItem(STORAGE_PURGED_FLAG) === 'true';
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      if (saved) return JSON.parse(saved);
      if (isPurged) return [];
    } catch (e) {
      console.error('Error loading enterprises', e);
    }
    return DEFAULT_ENTERPRISES;
  });

  // Current logged in user (defaults to null so Login Page is shown first)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading current user', e);
    }
    return null;
  });

  const [impersonatingEnterpriseId, setImpersonatingEnterpriseId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_SUPER_ADMIN_KEY, JSON.stringify(superAdminConfig));
  }, [superAdminConfig]);

  const updateSuperAdminConfig = async (data: { email?: string; password?: string; name?: string }) => {
    const updated: SuperAdminConfig = {
      ...superAdminConfig,
      id: 'super-admin-master',
      email: data.email?.trim().toLowerCase() || superAdminConfig.email,
      password: data.password?.trim() || superAdminConfig.password,
      name: data.name?.trim() || superAdminConfig.name,
      isCustomized: true,
    };
    setSuperAdminConfig(updated);
    localStorage.setItem(STORAGE_SUPER_ADMIN_KEY, JSON.stringify(updated));

    if (currentUser?.role === 'super_admin') {
      setCurrentUser((prev) => prev ? {
        ...prev,
        email: updated.email,
        name: updated.name,
      } : null);
    }

    // Persist to Supabase so it works on Vercel and across all devices
    if (isSupabaseConfigured) {
      await SupabaseService.upsertSuperAdmin(updated);
    }

    return { success: true };
  };

  const setupInitialSuperAdmin = async (data: { name: string; email: string; password: string }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPassword = data.password.trim();
    const cleanName = data.name.trim() || 'Super Administrateur';

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Email et mot de passe requis.' };
    }

    const updated: SuperAdminConfig = {
      id: 'super-admin-master',
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: 'super_admin',
      status: 'active',
      isCustomized: true,
    };

    setSuperAdminConfig(updated);
    localStorage.setItem(STORAGE_SUPER_ADMIN_KEY, JSON.stringify(updated));

    const adminUser: AuthUser = {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: 'super_admin',
      status: 'active',
    };
    setCurrentUser(adminUser);
    setImpersonatingEnterpriseId(null);

    if (isSupabaseConfigured) {
      await SupabaseService.upsertSuperAdmin(updated);
    }

    return { success: true };
  };

  const clearAllDemoEnterprises = async () => {
    setEnterprises([]);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify([]));
    localStorage.setItem(STORAGE_PURGED_FLAG, 'true');
    if (impersonatingEnterpriseId) {
      setImpersonatingEnterpriseId(null);
    }
    if (isSupabaseConfigured) {
      await SupabaseService.clearAllEnterprises();
    }
  };

  // Load from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;
    const initSupabase = async () => {
      try {
        // 1. Load remote Super Admin credentials if configured in Supabase
        const remoteAdmin = await SupabaseService.fetchSuperAdmin();
        if (remoteAdmin && isMounted) {
          const isCustom = remoteAdmin.email.toLowerCase() !== SUPER_ADMIN_CREDENTIALS.email.toLowerCase();
          const loadedAdmin: SuperAdminConfig = {
            id: 'super-admin-master',
            name: remoteAdmin.name,
            email: remoteAdmin.email,
            password: remoteAdmin.password,
            role: 'super_admin',
            status: 'active',
            isCustomized: isCustom,
          };
          setSuperAdminConfig(loadedAdmin);
          localStorage.setItem(STORAGE_SUPER_ADMIN_KEY, JSON.stringify(loadedAdmin));
        }

        // 2. Load remote enterprises
        const remoteEnterprises = await SupabaseService.fetchEnterprises();
        if (remoteEnterprises !== null && isMounted) {
          setEnterprises(remoteEnterprises);
        }
      } catch (err) {
        console.warn('Erreur initialisation Supabase Auth:', err);
      }
    };

    initSupabase();

    // Setup Supabase Realtime Subscription for live updates across all devices
    if (supabase) {
      const channel = supabase
        .channel('realtime:enterprises')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'enterprises' },
          async () => {
            const remoteAdmin = await SupabaseService.fetchSuperAdmin();
            if (remoteAdmin && isMounted) {
              setSuperAdminConfig((prev) => ({
                ...prev,
                name: remoteAdmin.name,
                email: remoteAdmin.email,
                password: remoteAdmin.password,
              }));
            }
            const updated = await SupabaseService.fetchEnterprises();
            if (updated !== null && isMounted) {
              setEnterprises(updated);
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

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(enterprises));
  }, [enterprises]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  }, [currentUser]);

  // Online Heartbeat: updates heartbeat for the logged in enterprise
  useEffect(() => {
    const targetEnterpriseId = impersonatingEnterpriseId || (currentUser?.role === 'company_admin' ? currentUser.enterpriseId : null);
    if (!targetEnterpriseId) return;

    const ping = () => {
      setEnterprises((prev) =>
        prev.map((e) => (e.id === targetEnterpriseId ? { ...e, lastHeartbeat: Date.now() } : e))
      );
      if (isSupabaseConfigured) {
        SupabaseService.updateHeartbeat(targetEnterpriseId);
      }
    };

    // Send immediate heartbeat
    ping();

    // Interval every 20 seconds
    const interval = setInterval(ping, 20000);

    return () => clearInterval(interval);
  }, [currentUser, impersonatingEnterpriseId]);

  // Check if account is online: active in the last 2 minutes (120,000 ms)
  const isAccountOnline = (account: EnterpriseAccount): boolean => {
    if (!account.lastHeartbeat) return false;
    const now = Date.now();
    return (now - account.lastHeartbeat) < 120000;
  };

  const generateRandomPassword = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789#@!$';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Pass#${pwd}`;
  };

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const isCustomized = Boolean(
      superAdminConfig.isCustomized ||
      superAdminConfig.email.toLowerCase() !== SUPER_ADMIN_CREDENTIALS.email.toLowerCase()
    );

    const isUsingDefaultTestCreds =
      cleanEmail === SUPER_ADMIN_CREDENTIALS.email.toLowerCase() &&
      cleanPassword === SUPER_ADMIN_CREDENTIALS.password;

    // If the super admin was customized, the test account (admin@proformapulse.com) is permanently removed!
    if (isUsingDefaultTestCreds && isCustomized) {
      return {
        success: false,
        error: 'Le compte Super Admin de test (admin@proformapulse.com) a été définitivement supprimé. Veuillez vous connecter avec votre adresse email Super Admin configurée.',
      };
    }

    const matchesCustomAdmin =
      cleanEmail === superAdminConfig.email.toLowerCase() &&
      cleanPassword === superAdminConfig.password;

    if (matchesCustomAdmin || (!isCustomized && isUsingDefaultTestCreds)) {
      const adminUser: AuthUser = {
        id: superAdminConfig.id,
        email: superAdminConfig.email,
        name: superAdminConfig.name,
        role: 'super_admin',
        status: 'active',
      };
      setCurrentUser(adminUser);
      setImpersonatingEnterpriseId(null);
      return { success: true };
    }

    // Check Enterprise Accounts
    const enterprise = enterprises.find((e) => e.email.toLowerCase() === cleanEmail);
    if (!enterprise) {
      return { success: false, error: 'Aucun compte entreprise ne correspond à cet email.' };
    }

    if (enterprise.tempPassword !== cleanPassword) {
      return { success: false, error: 'Mot de passe temporaire ou d\'accès incorrect.' };
    }

    if (enterprise.status === 'blocked') {
      return { 
        success: false, 
        error: `Ce compte entreprise a été BLOQUÉ par le Super Admin. Raison: ${enterprise.blockReason || 'Veuillez contacter l\'administration.'}` 
      };
    }

    // Update login timestamp and heartbeat
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setEnterprises((prev) =>
      prev.map((e) =>
        e.id === enterprise.id
          ? { ...e, lastLoginAt: nowStr, lastHeartbeat: Date.now() }
          : e
      )
    );

    const compUser: AuthUser = {
      id: `usr-${enterprise.id}`,
      email: enterprise.email,
      name: enterprise.companyName,
      role: 'company_admin',
      enterpriseId: enterprise.id,
      status: enterprise.status,
    };

    setCurrentUser(compUser);
    setImpersonatingEnterpriseId(null);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setImpersonatingEnterpriseId(null);
  };

  const createEnterprise = (data: {
    companyName: string;
    email: string;
    tempPassword?: string;
    phone: string;
    address: string;
    city: string;
    contactPerson: string;
    currency?: string;
    logoUrl?: string;
  }): { success: boolean; account?: EnterpriseAccount; error?: string } => {
    const cleanEmail = data.email.trim().toLowerCase();
    
    // Check if email already exists
    if (enterprises.some((e) => e.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Un compte entreprise existe déjà avec cet email.' };
    }

    const assignedPassword = data.tempPassword?.trim() || generateRandomPassword();

    const newAccount: EnterpriseAccount = {
      id: `ent-${Date.now()}`,
      companyName: data.companyName.trim(),
      email: cleanEmail,
      tempPassword: assignedPassword,
      phone: data.phone.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      contactPerson: data.contactPerson.trim() || data.companyName.trim(),
      currency: data.currency || 'USD',
      logoUrl: data.logoUrl || '',
      defaultTemplate: 'wave',
      status: 'active',
      lastHeartbeat: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setEnterprises((prev) => [newAccount, ...prev]);

    if (isSupabaseConfigured) {
      SupabaseService.upsertEnterprise(newAccount);
    }

    return { success: true, account: newAccount };
  };

  const toggleAccountStatus = (id: string, reason?: string) => {
    setEnterprises((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const newStatus: AccountStatus = e.status === 'active' ? 'blocked' : 'active';
          const updated: EnterpriseAccount = {
            ...e,
            status: newStatus,
            blockReason: newStatus === 'blocked' ? (reason || 'Compte suspendu par l\'administrateur.') : undefined,
          };
          if (isSupabaseConfigured) {
            SupabaseService.upsertEnterprise(updated);
          }
          return updated;
        }
        return e;
      })
    );
  };

  const resetTemporaryPassword = (id: string, newPassword?: string): string => {
    const pass = newPassword?.trim() || generateRandomPassword();
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setEnterprises((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, tempPassword: pass, passwordUpdatedAt: nowStr };
          if (isSupabaseConfigured) {
            SupabaseService.upsertEnterprise(updated);
          }
          return updated;
        }
        return e;
      })
    );
    return pass;
  };

  const updateEnterprise = (id: string, data: Partial<EnterpriseAccount>) => {
    setEnterprises((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...data };
          if (isSupabaseConfigured) {
            SupabaseService.upsertEnterprise(updated);
          }
          return updated;
        }
        return e;
      })
    );
  };

  const deleteEnterprise = async (id: string) => {
    setEnterprises((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(filtered));
      return filtered;
    });
    if (impersonatingEnterpriseId === id) {
      setImpersonatingEnterpriseId(null);
    }
    if (isSupabaseConfigured) {
      await SupabaseService.deleteEnterprise(id);
    }
  };

  const impersonateEnterprise = (id: string) => {
    setImpersonatingEnterpriseId(id);
  };

  const stopImpersonation = () => {
    setImpersonatingEnterpriseId(null);
  };

  // Determine active enterprise
  const activeEnterpriseId = impersonatingEnterpriseId || (currentUser?.role === 'company_admin' ? currentUser.enterpriseId : null);
  const activeEnterprise = enterprises.find((e) => e.id === activeEnterpriseId) || null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        enterprises,
        superAdminConfig,
        impersonatingEnterpriseId,
        activeEnterprise,
        isSupabaseConnected: isSupabaseConfigured,
        isTestAdminActive,
        login,
        logout,
        updateSuperAdminConfig,
        setupInitialSuperAdmin,
        clearAllDemoEnterprises,
        createEnterprise,
        toggleAccountStatus,
        resetTemporaryPassword,
        updateEnterprise,
        deleteEnterprise,
        impersonateEnterprise,
        stopImpersonation,
        isAccountOnline,
        generateRandomPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

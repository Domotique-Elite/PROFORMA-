import { ProformaTemplate } from './proforma';

export type UserRole = 'super_admin' | 'company_admin';
export type AccountStatus = 'active' | 'blocked';

export interface EnterpriseAccount {
  id: string;
  companyName: string;
  email: string;
  tempPassword: string;
  phone: string;
  address: string;
  city: string;
  contactPerson: string;
  currency: string;
  logoUrl?: string;
  defaultTemplate: ProformaTemplate;
  status: AccountStatus;
  lastHeartbeat: number; // timestamp in ms
  lastLoginAt?: string;
  createdAt: string;
  passwordUpdatedAt?: string;
  blockReason?: string;
  notes?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  enterpriseId?: string;
  status: AccountStatus;
}

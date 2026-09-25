-- ==============================================================================
-- PROFORMAPULSE - SCHEMA SUPABASE COMPLET (POSTGRESQL & REALTIME)
-- Exécutez ce script dans : Supabase > SQL Editor > "New query" > Run
-- ==============================================================================

-- 1. EXTENSIONS REQUISES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE DES ENTREPRISES (GESTION MULTI-ENTREPRISES & SUPER ADMIN)
CREATE TABLE IF NOT EXISTS public.enterprises (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  temp_password TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  contact_person TEXT DEFAULT '',
  currency TEXT DEFAULT 'USD',
  default_template TEXT DEFAULT 'wave',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  last_heartbeat BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  password_updated_at TIMESTAMPTZ,
  block_reason TEXT,
  notes TEXT,
  logo_url TEXT
);

-- 3. TABLE DES FACTURES PROFORMAS
CREATE TABLE IF NOT EXISTS public.proformas (
  id TEXT PRIMARY KEY,
  enterprise_id TEXT REFERENCES public.enterprises(id) ON DELETE CASCADE,
  proforma_number TEXT NOT NULL,
  title TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  validity_date DATE,
  client_name TEXT NOT NULL,
  client_company TEXT DEFAULT '',
  client_email TEXT DEFAULT '',
  client_phone TEXT DEFAULT '',
  client_address TEXT DEFAULT '',
  total_ht NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  total_tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_ttc NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'envoye', 'accepte', 'encaisse', 'partiel', 'expire', 'rejete')),
  payment_terms TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  template TEXT DEFAULT 'wave',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE DES ARTICLES / LIGNES DE DEVIS (ITEMS)
CREATE TABLE IF NOT EXISTS public.proforma_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proforma_id TEXT NOT NULL REFERENCES public.proformas(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE DES HISTORIQUES DE PAIEMENTS
CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proforma_id TEXT NOT NULL REFERENCES public.proformas(id) ON DELETE CASCADE,
  enterprise_id TEXT REFERENCES public.enterprises(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  method TEXT DEFAULT 'moncash',
  reference TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INDEX POUR ACCÉLÉRER LES RECHERCHES
CREATE INDEX IF NOT EXISTS idx_proformas_enterprise ON public.proformas(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_proformas_status ON public.proformas(status);
CREATE INDEX IF NOT EXISTS idx_enterprises_status ON public.enterprises(status);
CREATE INDEX IF NOT EXISTS idx_items_proforma ON public.proforma_items(proforma_id);

-- 7. CONFIGURATION DU TEMPS RÉEL (REALTIME POUR STATUT EN LIGNE & NOTIFICATIONS)
ALTER PUBLICATION supabase_realtime ADD TABLE public.enterprises;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proformas;

-- 8. POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- Active RLS sur les tables
ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proformas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proforma_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Pour l'intégration standard (lecture et écriture avec la clé anon / authenticated)
CREATE POLICY "Permettre l'accès universel aux entreprises" ON public.enterprises
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permettre l'accès aux proformas" ON public.proformas
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permettre l'accès aux items de proforma" ON public.proforma_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permettre l'accès aux paiements" ON public.payment_records
  FOR ALL USING (true) WITH CHECK (true);

-- 9. DONNÉES DE DÉMONSTRATION INITIALES
INSERT INTO public.enterprises (id, company_name, email, temp_password, phone, address, city, contact_person, currency, default_template, status)
VALUES 
  ('ent-1', 'Domo Elite Tech Haïti', 'contact@domoelite.ht', 'Pass#2026Domo!', '+509 3701-2345', 'Delmas 75, Cassagnol 13', 'Port-au-Prince', 'Ing. Wilky Valcin', 'USD', 'wave', 'active'),
  ('ent-2', 'Clinique Santé Plus', 'admin@santeplus.ht', 'Sante#9921', '+509 3612-8899', 'Pétion-Ville, Rue Panaméricaine', 'Pétion-Ville', 'Dr. Marie Joseph', 'USD', 'minimalist', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.proformas (id, enterprise_id, proforma_number, title, client_name, client_company, client_email, total_ht, tax_rate, total_tax, total_ttc, paid_amount, currency, status)
VALUES
  ('pf-1', 'ent-1', 'Devis # S01967', 'Installation Système Domotique & Caméras IP', 'Jean-Marc Télémaque', 'Résidence Privée Morne Calvaire', 'jm.telemaque@gmail.com', 2900.00, 10.00, 290.00, 3190.00, 1500.00, 'USD', 'partiel'),
  ('pf-2', 'ent-2', 'Devis # S01968', 'Développement Portail Web & MonCash', 'Gaston Buteau', 'Groupe TransLog S.A.', 'direction@translog.ht', 4500.00, 10.00, 450.00, 4950.00, 4950.00, 'USD', 'encaisse')
ON CONFLICT (id) DO NOTHING;

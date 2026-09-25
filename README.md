# ProformaPulse - Plateforme SaaS de Gestion de Devis & Proformas

Application moderne de facturation proforma et suivi des encaissements multi-entreprises avec portail Super Admin.

## Fonctionnalités Clés
- **Multi-Entreprises B2B** : Espaces de travail isolés pour chaque entreprise cliente avec modèles de facture personnalisés (Wave, Corporate, Minimalist, Classic).
- **Statut En Ligne / Présence en Temps Réel** : Suivi en direct des entreprises connectées via WebSockets Supabase Realtime.
- **Portail Super Admin** : Supervision globale, gestion des mots de passe temporaires, fiches d'accès WhatsApp, et mode inspection ("Se connecter en tant que").
- **Encaissements & Acomptes** : Suivi des paiements partiels (MonCash, Virement, Chèque, Espèces) et conversion en facture définitive en 1 clic.
- **Export & Impression** : Impression thermique compacte 80mm, PDF pleine page A4, et export CSV.

## Démarrage Rapide

### 1. Installation
```bash
npm install
```

### 2. Lancement en Local
```bash
npm run dev
```
L'application démarre sur `http://localhost:3000`.

## Déploiement Vercel + Supabase

1. Créez un projet sur [Supabase](https://supabase.com).
2. Exécutez le script `supabase-schema.sql` dans le **SQL Editor** de Supabase.
3. Importez ce dépôt sur [Vercel](https://vercel.com).
4. Ajoutez les deux variables d'environnement dans Vercel :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Cliquez sur **Deploy**.

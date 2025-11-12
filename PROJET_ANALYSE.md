# 📊 ANALYSE COMPLÈTE DU PROJET - COUPONS APP

## 🎯 BUT DE L'APPLICATION

**Application de pronostics sportifs avec système d'abonnements**

L'application permet aux utilisateurs de :
- Consulter les matchs du jour
- Accéder à des pronostics sportifs (Standard et VIP)
- S'abonner à des plans payants (Standard ou VIP)
- Demander des codes promo personnalisés pour des bookmakers
- Contacter le support

Les administrateurs peuvent :
- Gérer les matchs
- Créer et gérer les pronostics
- Valider les paiements d'abonnement
- Gérer les utilisateurs
- Répondre aux messages de contact

---

## 🛠️ STACK TECHNIQUE ACTUELLE

### Frontend
- **Framework** : React 18.3.1
- **Build Tool** : Vite 5.2.11
- **Routing** : React Router DOM 6.22.3
- **Styling** : Tailwind CSS 3.4.3
- **UI/UX** : 
  - react-hot-toast (notifications)
  - lucide-react (icônes)
  - recharts (graphiques)
- **HTTP Client** : Axios 1.7.2

### Backend / Base de données
- **BaaS** : Supabase (PostgreSQL + Auth + Storage)
- **Client** : @supabase/supabase-js 2.43.4
- **Authentification** : Supabase Auth (JWT)
- **Base de données** : PostgreSQL (via Supabase)
- **Storage** : Supabase Storage (pour les screenshots de paiement)

### APIs Externes
- **API Football** : v3.football.api-sports.io (matchs)
- **TheSportsDB** : Fallback pour les matchs

---

## 👥 RÔLES UTILISATEURS ET PERMISSIONS

### 1. **Utilisateur Gratuit (free)**
- ✅ Voir les matchs du jour
- ✅ Accès limité aux pronostics
- ❌ Pas d'accès aux pronostics VIP
- ✅ Peut s'abonner (Standard ou VIP)

### 2. **Utilisateur Standard**
- ✅ Tous les matchs du jour
- ✅ Pronostics standard uniquement
- ✅ Statistiques de base
- ✅ Historique 7 jours
- ❌ Pas d'accès aux pronostics VIP

### 3. **Utilisateur VIP**
- ✅ Accès complet illimité
- ✅ Pronostics VIP premium
- ✅ Statistiques avancées
- ✅ Support prioritaire
- ✅ Historique illimité
- ✅ Notifications prioritaires

### 4. **Administrateur (is_admin = true)**
- ✅ Accès à toutes les fonctionnalités VIP
- ✅ Gestion des matchs (CRUD)
- ✅ Gestion des pronostics (CRUD)
- ✅ Validation des paiements
- ✅ Gestion des utilisateurs
- ✅ Réponse aux messages de contact
- ✅ Gestion des codes promo personnalisés

---

## 🗄️ STRUCTURE DE LA BASE DE DONNÉES

### Table `profiles`
```sql
- id (UUID, PK, FK → auth.users)
- full_name (TEXT, NOT NULL)
- phone (TEXT)
- subscription_type (TEXT: 'free' | 'standard' | 'vip', DEFAULT 'free')
- subscription_start (DATE)
- subscription_end (DATE)
- is_annual (BOOLEAN, DEFAULT false)
- promo_code (TEXT)
- is_admin (BOOLEAN, DEFAULT false)
- avatar_url (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Table `matches`
```sql
- id (UUID, PK)
- match_date (TIMESTAMP, NOT NULL)
- home_team (TEXT, NOT NULL)
- away_team (TEXT, NOT NULL)
- league (TEXT)
- country (TEXT)
- stadium (TEXT)
- api_source (TEXT)
- api_match_id (TEXT)
- status (TEXT: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled')
- home_score (INTEGER)
- away_score (INTEGER)
- created_by (UUID, FK → auth.users)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Table `predictions`
```sql
- id (UUID, PK)
- match_id (UUID, FK → matches)
- prediction_type (TEXT, NOT NULL)
- prediction_value (TEXT, NOT NULL)
- odds (DECIMAL(5,2))
- confidence_level (TEXT: 'standard' | 'vip', NOT NULL)
- description (TEXT)
- result (TEXT: 'pending' | 'won' | 'lost', DEFAULT 'pending')
- admin_id (UUID, FK → auth.users, NOT NULL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Table `payment_requests`
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users, NOT NULL)
- plan (TEXT: 'standard' | 'vip', NOT NULL)
- duration (TEXT: 'monthly' | 'annual', NOT NULL)
- amount (INTEGER, NOT NULL)
- payment_method (TEXT: 'orange_money' | 'moov_money', NOT NULL)
- sender_number (TEXT)
- screenshot_url (TEXT, NOT NULL)
- status (TEXT: 'pending' | 'approved' | 'rejected', DEFAULT 'pending')
- admin_note (TEXT)
- admin_id (UUID, FK → auth.users)
- validated_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### Table `custom_promo_codes`
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- requested_code (TEXT, NOT NULL)
- bookmaker (TEXT: '1xbet' | 'betwinner' | 'melbet' | '1win' | '1xbit' | 'autre', NOT NULL)
- reason (TEXT)
- status (TEXT: 'pending' | 'approved' | 'rejected', DEFAULT 'pending')
- approved_code (TEXT)
- admin_note (TEXT)
- admin_id (UUID, FK → auth.users)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Table `contact_messages`
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- email (TEXT, NOT NULL)
- subject (TEXT, NOT NULL)
- message (TEXT, NOT NULL)
- status (TEXT: 'new' | 'read' | 'replied', DEFAULT 'new')
- admin_reply (TEXT)
- admin_id (UUID, FK → auth.users)
- replied_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### Table `prediction_stats`
```sql
- id (UUID, PK)
- date (DATE, NOT NULL)
- total_predictions (INTEGER, DEFAULT 0)
- won_predictions (INTEGER, DEFAULT 0)
- lost_predictions (INTEGER, DEFAULT 0)
- standard_predictions (INTEGER, DEFAULT 0)
- vip_predictions (INTEGER, DEFAULT 0)
- win_rate (DECIMAL(5,2))
- created_at (TIMESTAMP)
```

### Storage Buckets
- `payment-screenshots` : Stockage privé des captures d'écran de paiement

---

## 🔐 SÉCURITÉ (Row Level Security - RLS)

### Policies principales :
1. **Profiles** : Tous peuvent voir, utilisateurs peuvent modifier leur propre profil
2. **Matches** : Tous peuvent voir, seuls les admins peuvent créer/modifier/supprimer
3. **Predictions** : 
   - Standard : visibles par tous
   - VIP : visibles uniquement par les abonnés Standard/VIP valides
   - Seuls les admins peuvent créer/modifier
4. **Payment Requests** : Utilisateurs voient les leurs, admins voient tout
5. **Custom Promo Codes** : Utilisateurs voient les leurs, admins voient tout
6. **Contact Messages** : Utilisateurs voient les leurs, admins voient tout

---

## 📄 PAGES FRONTEND

### Pages Publiques
1. **Home** (`/`) - Page d'accueil avec présentation
2. **Login** (`/login`) - Connexion
3. **Register** (`/register`) - Inscription
4. **ForgotPassword** (`/forgot-password`) - Mot de passe oublié
5. **ResetPassword** (`/reset-password`) - Réinitialisation mot de passe
6. **Subscription** (`/subscription`) - Page des abonnements
7. **Contact** (`/contact`) - Formulaire de contact

### Pages Protégées (Utilisateurs)
8. **Dashboard** (`/dashboard`) - Tableau de bord utilisateur
   - Affiche les matchs du jour
   - Affiche les pronostics selon l'abonnement
   - Statut de l'abonnement
9. **Profile** (`/profile`) - Profil utilisateur
10. **Payment** (`/payment`) - Instructions de paiement

### Pages Admin
11. **AdminHome** (`/admin`) - Dashboard admin
    - Statistiques (paiements en attente, utilisateurs, matchs, pronostics)
    - Paiements récents
12. **AdminMatches** (`/admin/matches`) - Gestion des matchs
13. **AdminPredictions** (`/admin/predictions`) - Gestion des pronostics
14. **AdminUsers** (`/admin/users`) - Gestion des utilisateurs
15. **AdminPayments** (`/admin/payments`) - Validation des paiements

---

## 🔌 ROUTES API NÉCESSAIRES

### Authentification (Supabase Auth)
- `POST /auth/v1/signup` - Inscription
- `POST /auth/v1/token` - Connexion
- `GET /auth/v1/user` - Utilisateur actuel
- `POST /auth/v1/logout` - Déconnexion

### Base de données (Supabase REST)
- `GET /rest/v1/profiles` - Profils utilisateurs
- `PATCH /rest/v1/profiles` - Mise à jour profil
- `GET /rest/v1/matches` - Liste des matchs
- `POST /rest/v1/matches` - Créer un match (admin)
- `PATCH /rest/v1/matches` - Modifier un match (admin)
- `DELETE /rest/v1/matches` - Supprimer un match (admin)
- `GET /rest/v1/predictions` - Liste des pronostics (filtrés par abonnement)
- `POST /rest/v1/predictions` - Créer un pronostic (admin)
- `PATCH /rest/v1/predictions` - Modifier un pronostic (admin)
- `GET /rest/v1/payment_requests` - Demandes de paiement
- `POST /rest/v1/payment_requests` - Créer une demande de paiement
- `PATCH /rest/v1/payment_requests` - Valider/rejeter un paiement (admin)
- `GET /rest/v1/custom_promo_codes` - Codes promo personnalisés
- `POST /rest/v1/custom_promo_codes` - Demander un code promo
- `PATCH /rest/v1/custom_promo_codes` - Approuver/rejeter (admin)
- `GET /rest/v1/contact_messages` - Messages de contact
- `POST /rest/v1/contact_messages` - Envoyer un message
- `PATCH /rest/v1/contact_messages` - Répondre (admin)

### Storage (Supabase Storage)
- `POST /storage/v1/object/payment-screenshots` - Upload screenshot
- `GET /storage/v1/object/payment-screenshots` - Télécharger screenshot

---

## 💰 PLANS D'ABONNEMENT

### Plan Gratuit
- Prix : 0 CFA
- Fonctionnalités :
  - Aperçu des matchs du jour
  - Accès limité aux pronostics
  - Publicité présente

### Plan Standard
- Mensuel : 750 CFA
- Annuel : 7650 CFA (15% de réduction)
- Fonctionnalités :
  - Tous les matchs du jour
  - Pronostics standard
  - Statistiques de base
  - Historique 7 jours
  - Support standard

### Plan VIP
- Mensuel : 1500 CFA
- Annuel : 12600 CFA (30% de réduction)
- Fonctionnalités :
  - Accès complet illimité
  - Pronostics VIP premium
  - Statistiques avancées
  - Support prioritaire
  - Historique illimité
  - Notifications prioritaires
  - Badge VIP exclusif

---

## 💳 MÉTHODES DE PAIEMENT

1. **Orange Money**
   - Numéro : 75 18 56 71
   - Code : `orange_money`

2. **Moov Money**
   - Numéro : 53 59 15 17
   - Code : `moov_money`

Processus :
1. Utilisateur choisit un plan
2. Upload d'un screenshot du paiement
3. Demande créée avec statut `pending`
4. Admin valide ou rejette
5. Si approuvé : mise à jour du profil utilisateur (subscription_type, subscription_start, subscription_end)

---

## 🎰 BOOKMAKERS SUPPORTÉS

1. **1xbet** - Code : Le226
2. **Betwinner** - Code : Le226
3. **Melbet** - Code : Le226
4. **1win** - Code : Le226
5. **1xbit** - Code : Le226

Les utilisateurs peuvent demander des codes promo personnalisés pour ces bookmakers.

---

## 🔄 FLUX PRINCIPAUX

### Flux d'inscription
1. Utilisateur remplit le formulaire (email, password, full_name)
2. Supabase Auth crée l'utilisateur
3. Trigger PostgreSQL crée automatiquement le profil (subscription_type: 'free')
4. Redirection vers `/dashboard` (ou `/admin` si admin)

### Flux de connexion
1. Utilisateur saisit email/password
2. Supabase Auth authentifie
3. Récupération du profil
4. Redirection selon le rôle :
   - Admin → `/admin`
   - User → `/dashboard`

### Flux d'abonnement
1. Utilisateur choisit un plan (Standard ou VIP)
2. Choix de la durée (mensuel ou annuel)
3. Redirection vers `/payment`
4. Upload du screenshot de paiement
5. Création d'une `payment_request` avec statut `pending`
6. Admin valide le paiement
7. Mise à jour du profil utilisateur (subscription_type, dates)

### Flux de pronostics
1. Admin crée un match
2. Admin crée des pronostics (standard ou VIP)
3. Utilisateurs voient les pronostics selon leur abonnement :
   - Gratuit : aucun
   - Standard : pronostics standard uniquement
   - VIP : pronostics standard + VIP
   - Admin : tous les pronostics

---

## 📦 COMPOSANTS PRINCIPAUX

### Composants d'authentification
- `LoginForm` - Formulaire de connexion
- `RegisterForm` - Formulaire d'inscription
- `ProtectedRoute` - Route protégée
- `AdminRoute` - Route admin

### Composants communs
- `Navbar` - Navigation principale
- `Footer` - Pied de page
- `PromoSection` - Section promotionnelle

### Composants d'abonnement
- `PricingCards` - Cartes des plans
- `PaymentInstructions` - Instructions de paiement

### Composants admin
- `PaymentVerification` - Validation des paiements
- `PromoCodeManagement` - Gestion des codes promo

---

## 🔑 VARIABLES D'ENVIRONNEMENT

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_API_FOOTBALL_KEY=xxx (optionnel)
VITE_SITE_URL=https://xxx.vercel.app (pour reset password)
```

---

## 📝 NOTES IMPORTANTES

1. **Authentification** : Utilise Supabase Auth (JWT)
2. **Base de données** : PostgreSQL via Supabase avec RLS
3. **Storage** : Supabase Storage pour les screenshots
4. **Pas de backend Express** : Tout passe par Supabase (Auth + REST + Storage)
5. **Admin par défaut** : `yantoubri@gmail.com` (à créer manuellement)
6. **Trigger automatique** : Création du profil lors de l'inscription
7. **RLS activé** : Sécurité au niveau de la base de données

---

## ✅ FONCTIONNALITÉS À CONSERVER

- ✅ Système d'authentification (inscription, connexion, déconnexion)
- ✅ Gestion des rôles (user/admin)
- ✅ Système d'abonnements (free/standard/vip)
- ✅ Gestion des matchs (CRUD admin)
- ✅ Gestion des pronostics (CRUD admin, affichage filtré)
- ✅ Validation des paiements (admin)
- ✅ Gestion des utilisateurs (admin)
- ✅ Codes promo personnalisés
- ✅ Messages de contact
- ✅ Dashboard utilisateur avec pronostics
- ✅ Dashboard admin avec statistiques
- ✅ Upload de screenshots de paiement
- ✅ Redirections selon le rôle après connexion

---

**Date d'analyse :** $(date)
**Version analysée :** 1.0.0


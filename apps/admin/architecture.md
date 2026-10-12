# 🏗️ Documentation de l'Architecture du Projet

Ce projet est une application e-commerce basée sur **Next.js (App Router)**, **Supabase** (Auth & Database) et **Shadcn UI**, organisée selon les principes de l'**Atomic Design** adaptés aux exigences modernes du web (Server Actions, composants conteneurs, mises à jour optimistes).

---

## 📂 Squelette Général de l'Arborescence

```text
.
├── src/
│   ├── app/                      # NEXT.JS APP ROUTER
│   │   ├── layout.tsx               # Root Layout (HTML, Body, Providers, Fontes)
│   │   ├── globals.css              # Styles globaux (Tailwind CSS, variables CSS Shadcn)
│   │   ├── error.tsx                # Boundary d'erreur globale
│   │   ├── not-found.tsx            # Page 404
│   │   │
│   │   ├── (auth)/               # Route Group : Authentification (sans /auth dans l'URL)
│   │   │   ├── layout.tsx           # Layout centré (fond neutre, pas de Header shop)
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Route /login
│   │   │   ├── register/
│   │   │   │   └── page.tsx         # Route /register
│   │   │   ├── callback/            # En option : Route API d'échange de code OAuth / Magic Link /
│   │   │   │   └── route.ts          
│   │   │   └── reset-password/
│   │   │       └── page.tsx         # Route /reset-password
│   │   │
│   │   ├── (shop)/                     # Route Group : E-Commerce (sans /shop dans l'URL)
│   │   │   ├── layout.tsx              # Layout shop (Persistance : Header + CartDrawer + Footer)
│   │   │   ├── page.tsx                # Route / (Accueil & Catalogue principal)
│   │   │   ├── categories/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx        # Route /categories/epices
│   │   │   ├── product/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Route /product/123
│   │   │   ├── cart/
│   │   │   │   └── page.tsx            # Route /cart (Vue dédiée du panier)
│   │   │   └── checkout/
│   │   │       ├── page.tsx            # Route /checkout (Formulaire d'adresse & Paiement)
│   │   │       └── success/
│   │   │           └── page.tsx        # Route /checkout/success (Confirmation Stripe)
│   │   │
│   │   ├── actions/                    # Server Actions ("use server") sécurisées par Zod
│   │   │   ├── cart.actions.ts         # AddToCart, UpdateQty, RemoveItem, ClearCart
│   │   │   └── auth.actions.ts         # SignIn, SignUp, SignOut, OAuth
│   │   │
│   │   └── api/                        # Endpoints d'intégration externe
│   │       └── webhooks/
│   │           └── stripe/
│   │               └── route.ts        # Reçoit les événements de paiement Stripe
│   │
│   ├── components/                     # ATOMIC DESIGN
│   │   ├── atoms/                      # Atomes (Composants indivisibles)
│   │   │   ├── ui/                     # Atomes génériques Shadcn UI
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   └── dialog.tsx
│   │   │   └── domain/                 # Atomes métiers
│   │   │       ├── price-format.tsx
│   │   │       ├── rating-stars.tsx
│   │   │       └── stock-indicator.tsx
│   │   │
│   │   ├── molecules/                  # Molécules (Combinaisons d'atomes à responsabilité unique)
│   │   │   ├── product-card.tsx
│   │   │   ├── quantity-selector.tsx
│   │   │   ├── search-bar.tsx
│   │   │   └── cart-item.tsx
│   │   │
│   │   ├── organisms/               # Organismes (Blocs complexes avec séparateurs UI / Containers)
│   │   │   ├── header/
│   │   │   │   ├── header-ui.tsx      # UI pure (Boutons, Logo, Liens)
│   │   │   │   └── header-container.tsx# Smart Component (Écoute la session & l'état du panier)
│   │   │   ├── cart-drawer/
│   │   │   │   ├── cart-drawer-ui.tsx  # UI pure (Panier latéral, Liste d'articles, Total)
│   │   │   │   └── cart-drawer-container.tsx # Smart Component (Appelle cart.actions.ts +useOptimistic)
│   │   │   ├── product-grid.tsx
│   │   │   ├── footer.tsx
│   │   │   └── checkout-form.tsx
│   │   │
│   │   ├── templates/                  # 📐 Templates (Squelettes visuels avec slots ReactNode)
│   │   │   ├── catalog-template.tsx
│   │   │   ├── product-detail-template.tsx
│   │   │   └── auth-template.tsx
│   │   │
│   │   └── pages/                      # 📄 Pages visuelles réservées exclusivement à Storybook
│   │
│   ├── lib/                            # 🛠️ Infrastructure, Utilitaires & Sécurité
│   │   ├── safe-action.ts              # Middleware interne pour valider les Server Actions (Z+Session)
│   │   ├── validators/                 # Schémas de validation Zod
│   │   │   ├── cart.schema.ts          # Validation des entrées d'ajout/modification du panier
│   │   │   └── auth.schema.ts          # Validation des formulaires Login / Register
│   │   ├── supabase/                   # Clients Supabase SSR / Browser
│   │   │   ├── client.ts               # Client navigateur (Browser)
│   │   │   ├── server.ts               # Client serveur (Server Components & Server Actions)
│   │   │   └── middleware.ts           # Rafraîchissement automatique des tokens de session Supabase
│   │   └── utils.ts                    # Helper cn() (clsx + tailwind-merge)
│   │
│   ├── providers/                      # ⚛️ Contextes React Client ("use client")
│   │   ├── cart-provider.tsx           # Context d'ouverture du drawer + Mise à jour optimiste
│   │   └── supabase-provider.tsx       # Context de session utilisateur en temps réel
│   │
│   └── types/                          # 🏷️ Typage TypeScript
│       ├── database.types.ts           # Generated via Supabase CLI
│       └── shop.types.ts               # Types custom (Cart, CartItem, Product, UserProfile)
│
├── middleware.ts                   # Middleware Next.js racine (Gère le rafraîchissement Supabase Auth)
├── public/                         # Asset statiques (Images, Favicons, SVGs)
├── .env.local                      # Variables d'environnement
├── components.json                 # Configuration Shadcn UI
├── tailwind.config.ts              # Configuration Tailwind CSS
├── tsconfig.json                   # Configuration TypeScript (Alias `@/*`)
└── package.json

Explication Détaillée des Dossiers Clés
1. src/app/ — Routage & Orchestration (App Router)
Dans cette architecture, src/app/ ne s'occupe que de la logistique (routage, sécurité d'accès, fetching de données serveur et injections dans les templates).

layout.tsx (Root Layout) : Le parent ultime qui contient <html>, <body>, l'importation de globals.css et les Providers React (CartProvider, SupabaseProvider).

(auth)/ & (shop)/ (Route Groups) : Les parenthèses permettent de regrouper des routes sans impacter l'URL publique.

(shop)/layout.tsx embarque le Header, le CartDrawer et le Footer.

(auth)/layout.tsx propose une interface minimaliste centrée sans les éléments du shop.

actions/ : Contient les Server Actions Next.js ("use server"). Ce sont des mutations exécutées directement sur le serveur Node/Edge.

api/ : Réservé aux webhooks externes (ex: confirmations de paiements asynchrones venant de Stripe).

2. src/components/ — Atomic Design Adapté
Pour éviter les conflits entre l'Atomic Design classique et le serveur Next.js, les composants sont strictement découpés en fonction de leur responsabilité visuelle et logique.

atoms/ :

ui/ : Composants graphiques neutres de Shadcn UI (button.tsx, input.tsx).

domain/ : Composants métier atomiques indivisibles (price-format.tsx, stock-indicator.tsx).

molecules/ : Associations d'atomes qui réalisent une tâche unique (product-card.tsx, quantity-selector.tsx).

organisms/ : Assemblages complexes d'interface. Pour les organismes connectés à l'état (ex: cart-drawer), nous appliquons le pattern Smart/Dumb Component :

cart-drawer-ui.tsx : UI pure (reçoit des props, 100% testable sur Storybook).

cart-drawer-container.tsx : Composant intelligent client qui appelle les Server Actions et gère useOptimistic.

templates/ : Définissent la structure et la mise en page d'un écran (catalog-template.tsx). Ils reçoivent leurs éléments sous forme de slots ou children (ReactNode).

pages/ : Optionnel. Réservé aux stories Storybook complètes avec des jeux de données fictifs (mock data).

3. src/lib/ — Sécurité & Infrastructure
C'est le cœur technique de l'application.

supabase/ : Séparation stricte des instances Supabase selon l'environnement d'exécution :

client.ts : Pour les composants clients dans le navigateur ("use client").

server.ts : Pour les Server Components et Server Actions (lecture/écriture sécurisée des cookies HTTP-only).

middleware.ts : Maintient la session valide à chaque requête HTTP.

safe-action.ts & validators/ : Encapsulation des Server Actions dans des schémas de validation Zod. Toute action envoyée par un formulaire client est analysée et validée avant d'interagir avec la base de données Supabase.

4. src/providers/ — Gestion de l'État Client
Les composants serveur (Server Components) gèrent les données statiques et de premier rendu. Les Providers React gèrent l'état dynamique côté client :

cart-provider.tsx : Conserve l'état d'ouverture/fermeture du panier latéral (CartDrawer) et assure la réactivité instantanée (UI Optimiste) lors de l'ajout/suppression d'un article.

supabase-provider.tsx : Rend la session utilisateur et le statut d'authentification accessibles dans toute l'application.

🔄 Flux d'Exécution des Données
Voici comment circule l'information lors d'une action utilisateur (ex: Ajout d'un produit au panier) :
[ 1. Clic Utilisateur ]
       │
       ▼
[ 2. ProductCard (Molecule) ] ── (Déclenche le callback)
       │
       ▼
[ 3. CartDrawerContainer (Organism Client) ]
       │
       ├──► 3a. Met à jour l'UI instantanément via useOptimistic (CartProvider)
       │
       ▼
[ 4. cart.actions.ts (Server Action) ]
       │
       ├──► 4a. Valide la requête avec Zod (lib/validators/cart.schema.ts)
       ├──► 4b. Vérifie la session Supabase (lib/supabase/server.ts)
       ├──► 4c. Exécute la mutation en BDD Supabase
       │
       ▼
[ 5. revalidatePath() ] ──► Rafraîchit les Server Components sans recharger la page
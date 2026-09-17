# Connecter les espaces (admin / enseignants / élèves) à Supabase

Le site public fonctionne déjà sans rien faire. Pour activer la connexion,
les notes, les cours, le calendrier et les annonces, suivez ces étapes une
seule fois.

## 1. Créer le projet Supabase

1. Allez sur https://supabase.com et créez un compte gratuit.
2. "New project" → choisissez un nom (ex: `apof-academie`) et un mot de
   passe de base de données (gardez-le de côté), puis créez le projet.

## 2. Créer les tables et les règles de sécurité

1. Dans le projet Supabase, ouvrez **SQL Editor** → **New query**.
2. Copiez tout le contenu du fichier [`schema.sql`](./schema.sql) de ce
   dossier, collez-le, puis cliquez sur **Run**.

Cela crée toutes les tables (classes, matières, notes, cours, calendrier,
annonces, utilisateurs), les règles de sécurité (un élève ne peut voir que
ses propres notes, un enseignant que ses classes, etc.), et quelques
classes/matières de départ.

## 3. Récupérer les clés du projet

1. Dans Supabase : **Project Settings** → **API**.
2. Notez :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public key** (une longue clé qui commence par `eyJ...`)

Ne prenez jamais la clé `service_role` (secrète) — seule la clé `anon` va
dans le site.

## 4. Connecter le site

Dans le dossier `website`, créez un fichier `.env` (copiez `.env.example`)
et remplissez :

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

En local : relancez `npm run dev`.
Sur Netlify/Vercel : ajoutez ces deux variables dans les paramètres du site
("Environment variables"), puis redéployez.

## 5. Créer votre compte administrateur

1. Dans Supabase : **Authentication** → **Users** → **Add user** →
   **Create new user**. Entrez votre e-mail et un mot de passe.
2. Retournez dans **SQL Editor** et exécutez (avec votre e-mail) :

```sql
update public.profiles set role = 'admin' where email = 'votre-email@exemple.com';
```

3. Allez sur `/connexion` sur le site et connectez-vous : vous arrivez sur
   le tableau de bord Administration.

## 6. Créer les comptes enseignants et élèves

Toujours depuis **Authentication → Add user** dans Supabase, créez un
compte (e-mail + mot de passe) pour chaque enseignant et chaque élève (ou
son parent). Communiquez-leur ensuite ces identifiants.

Un compte est "élève" par défaut. Depuis l'espace **Administration →
Utilisateurs** du site, vous pouvez :
- changer le rôle (admin / enseignant / élève),
- assigner un élève à sa classe,
- assigner un enseignant à ses classes et matières ("Assignations").

Tout le reste (notes, cours, calendrier, annonces) se gère ensuite
directement depuis le site, dans chaque espace.

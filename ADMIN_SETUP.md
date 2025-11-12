# 🔐 Configuration de l'Administrateur

## Création de l'admin yantoubri@gmail.com

Pour créer l'administrateur avec l'email `yantoubri@gmail.com`, suivez ces étapes :

### Option 1 : Via Supabase Dashboard (Recommandé)

1. **Créer l'utilisateur dans Supabase Auth :**
   - Allez dans votre projet Supabase
   - Naviguez vers **Authentication** > **Users**
   - Cliquez sur **Add User** > **Create new user**
   - Email : `yantoubri@gmail.com`
   - Password : (définissez un mot de passe sécurisé)
   - Cliquez sur **Create User**

2. **Rendre l'utilisateur admin :**
   - Exécutez la migration SQL `005_set_admin_yantoubri.sql` dans l'éditeur SQL de Supabase
   - Ou exécutez cette requête directement :
   ```sql
   UPDATE profiles
   SET is_admin = true,
       full_name = COALESCE(full_name, 'Administrateur'),
       updated_at = NOW()
   WHERE id = (
     SELECT id 
     FROM auth.users 
     WHERE email = 'yantoubri@gmail.com'
     LIMIT 1
   );
   ```

### Option 2 : Via l'interface d'inscription

1. **Inscrivez-vous avec yantoubri@gmail.com :**
   - Allez sur la page d'inscription de l'application
   - Créez un compte avec l'email `yantoubri@gmail.com`
   - Confirmez votre email si nécessaire

2. **Rendre l'utilisateur admin :**
   - Exécutez la migration SQL `005_set_admin_yantoubri.sql` dans l'éditeur SQL de Supabase
   - Ou exécutez la requête SQL ci-dessus

### Vérification

Pour vérifier que l'admin a été créé correctement :

```sql
SELECT 
  u.email,
  p.full_name,
  p.is_admin,
  p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'yantoubri@gmail.com';
```

Vous devriez voir `is_admin = true`.

### Connexion

Une fois l'admin créé, vous pouvez vous connecter avec :
- **Email :** `yantoubri@gmail.com`
- **Password :** (le mot de passe que vous avez défini)

Après connexion, vous serez automatiquement redirigé vers `/admin`.

## Notes importantes

- L'utilisateur doit exister dans `auth.users` avant de pouvoir être rendu admin
- Le profil est créé automatiquement par le trigger lors de l'inscription
- Si le profil n'existe pas, il sera créé automatiquement lors de la première connexion


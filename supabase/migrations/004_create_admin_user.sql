-- ============================================
-- Création de l'utilisateur admin initial
-- Email: yantoubri@gmail.com
-- ============================================

-- Fonction pour créer ou mettre à jour un admin par email
CREATE OR REPLACE FUNCTION create_admin_by_email(admin_email TEXT, admin_name TEXT DEFAULT 'Administrateur')
RETURNS UUID AS $$
DECLARE
  user_id UUID;
  existing_user_id UUID;
BEGIN
  -- Vérifier si l'utilisateur existe déjà dans auth.users
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = admin_email
  LIMIT 1;

  IF existing_user_id IS NOT NULL THEN
    -- L'utilisateur existe, mettre à jour le profil pour le rendre admin
    UPDATE profiles
    SET is_admin = true,
        full_name = COALESCE(admin_name, full_name),
        updated_at = NOW()
    WHERE id = existing_user_id;
    
    RETURN existing_user_id;
  ELSE
    -- L'utilisateur n'existe pas encore
    -- Note: La création d'utilisateur dans auth.users doit être faite via Supabase Auth
    -- Cette fonction mettra à jour le profil une fois l'utilisateur créé
    RAISE NOTICE 'L''utilisateur % n''existe pas encore dans auth.users. Créez-le d''abord via Supabase Auth, puis exécutez cette migration.', admin_email;
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour la politique pour permettre aux admins de voir tous les profils
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  true -- Tous les profils sont visibles (déjà le cas)
);

-- Mettre à jour la politique pour permettre aux admins de modifier tous les profils
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (
  auth.uid() = id 
  OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Script pour mettre à jour un utilisateur existant en admin
-- À exécuter manuellement après avoir créé l'utilisateur via Supabase Auth
-- UPDATE profiles SET is_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = 'yantoubri@gmail.com');


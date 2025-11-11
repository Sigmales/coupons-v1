-- ============================================
-- REQUÊTES SQL POUR VÉRIFIER ET GÉRER LES ADMINS
-- ============================================

-- 1. Vérifier si un utilisateur spécifique est admin
-- IMPORTANT: Remplacez '00000000-0000-0000-0000-000000000000' par un vrai UUID
-- Pour obtenir l'UUID d'un utilisateur, utilisez d'abord la requête #7 avec l'email
SELECT 
  p.id,
  p.full_name,
  u.email,
  p.is_admin,
  p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = '00000000-0000-0000-0000-000000000000'::uuid
AND p.is_admin = true;

-- 2. Vérifier si l'utilisateur actuellement connecté est admin
-- (Utilisé dans les politiques RLS)
SELECT EXISTS (
  SELECT 1 
  FROM profiles 
  WHERE id = auth.uid() 
  AND is_admin = true
) AS is_admin;

-- 3. Lister tous les administrateurs
SELECT 
  p.id,
  p.full_name,
  u.email,
  p.is_admin,
  p.created_at,
  p.subscription_type
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.is_admin = true
ORDER BY p.created_at DESC;

-- 4. Compter le nombre d'administrateurs
SELECT COUNT(*) AS total_admins
FROM profiles
WHERE is_admin = true;

-- 5. Promouvoir un utilisateur en admin
-- IMPORTANT: Remplacez '00000000-0000-0000-0000-000000000000' par un vrai UUID
-- Exemple d'UUID valide: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UPDATE profiles
SET 
  is_admin = true,
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000000'::uuid
RETURNING id, full_name, is_admin;

-- 6. Rétrograder un admin en utilisateur normal
-- IMPORTANT: Remplacez '00000000-0000-0000-0000-000000000000' par un vrai UUID
UPDATE profiles
SET 
  is_admin = false,
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000000'::uuid
RETURNING id, full_name, is_admin;

-- 7. Vérifier si un utilisateur est admin par son email (RECOMMANDÉ - Plus facile à utiliser)
-- Remplacez 'email@example.com' par l'email réel de l'utilisateur
SELECT 
  p.id,
  p.full_name,
  u.email,
  p.is_admin,
  p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'email@example.com'
AND p.is_admin = true;

-- Cette requête vous donne aussi l'UUID que vous pouvez utiliser dans les autres requêtes

-- 8. Créer un admin directement par email (MÉTHODE LA PLUS SIMPLE)
-- Remplacez 'email@example.com' par l'email de l'utilisateur à promouvoir
UPDATE profiles
SET 
  is_admin = true,
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'email@example.com'
)
RETURNING id, full_name, is_admin;

-- Alternative: Par UUID (si vous avez déjà l'UUID)
-- UPDATE profiles SET is_admin = true, updated_at = NOW() 
-- WHERE id = '00000000-0000-0000-0000-000000000000'::uuid;

-- 9. Vérifier les permissions admin dans une fonction
-- Exemple de fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = user_id 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Utilisation de la fonction:
-- SELECT is_user_admin('00000000-0000-0000-0000-000000000000'::uuid);
-- SELECT is_user_admin(auth.uid()); -- Pour l'utilisateur actuellement connecté

-- 10. Vérifier les admins avec leurs statistiques
SELECT 
  p.id,
  p.full_name,
  u.email,
  p.is_admin,
  COUNT(DISTINCT m.id) AS matches_created,
  COUNT(DISTINCT pr.id) AS predictions_created,
  COUNT(DISTINCT pay.id) AS payments_validated
FROM profiles p
JOIN auth.users u ON p.id = u.id
LEFT JOIN matches m ON m.created_by = p.id
LEFT JOIN predictions pr ON pr.admin_id = p.id
LEFT JOIN payment_requests pay ON pay.admin_id = p.id
WHERE p.is_admin = true
GROUP BY p.id, p.full_name, u.email, p.is_admin
ORDER BY p.created_at DESC;

-- 11. Requête pour vérifier dans Supabase (via l'interface)
-- Utilisez cette requête dans l'éditeur SQL de Supabase
SELECT 
  p.*,
  u.email,
  u.created_at AS user_created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.is_admin = true;

-- 12. Sécuriser: Empêcher la suppression du dernier admin
CREATE OR REPLACE FUNCTION prevent_last_admin_removal()
RETURNS TRIGGER AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Si on essaie de retirer les droits admin
  IF OLD.is_admin = true AND NEW.is_admin = false THEN
    SELECT COUNT(*) INTO admin_count
    FROM profiles
    WHERE is_admin = true;
    
    -- Si c'est le dernier admin, empêcher la modification
    IF admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger (optionnel, pour sécurité)
-- DROP TRIGGER IF EXISTS check_last_admin ON profiles;
-- CREATE TRIGGER check_last_admin
--   BEFORE UPDATE ON profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION prevent_last_admin_removal();


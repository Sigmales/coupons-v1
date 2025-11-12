-- ============================================
-- Script pour définir yantoubri@gmail.com comme admin
-- ============================================
-- IMPORTANT: Cet utilisateur doit d'abord être créé via Supabase Auth
-- Ensuite, exécutez ce script pour le rendre admin
-- ============================================

-- Mettre à jour le profil pour rendre l'utilisateur admin
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

-- Vérifier que la mise à jour a fonctionné
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE u.email = 'yantoubri@gmail.com' AND p.is_admin = true;
  
  IF admin_count > 0 THEN
    RAISE NOTICE 'Admin créé avec succès pour yantoubri@gmail.com';
  ELSE
    RAISE WARNING 'Aucun utilisateur trouvé avec l''email yantoubri@gmail.com. Créez d''abord l''utilisateur via Supabase Auth.';
  END IF;
END $$;


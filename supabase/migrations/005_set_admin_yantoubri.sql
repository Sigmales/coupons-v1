-- ============================================
-- Script pour définir yantoubri@gmail.com comme admin
-- ============================================
-- IMPORTANT: Cet utilisateur doit d'abord être créé via Supabase Auth
-- Ensuite, exécutez ce script pour le rendre admin
-- ============================================

-- Étape 1: Mettre à jour le profil existant pour rendre l'utilisateur admin
UPDATE public.profiles
SET 
  is_admin = true,
  full_name = COALESCE(full_name, 'Administrateur'),
  updated_at = NOW()
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'yantoubri@gmail.com'
  LIMIT 1
);

-- Étape 2: Si le profil n'existe pas encore, le créer manuellement
-- (normalement le trigger le crée automatiquement, mais au cas où)
INSERT INTO public.profiles (id, full_name, subscription_type, is_admin, created_at, updated_at)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Administrateur'),
  'free',
  true,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'yantoubri@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  )
ON CONFLICT (id) DO UPDATE
SET 
  is_admin = true,
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name, 'Administrateur'),
  updated_at = NOW();

-- Étape 3: Vérification - afficher le résultat
DO $$
DECLARE
  admin_count INTEGER;
  admin_email TEXT;
  admin_name TEXT;
BEGIN
  SELECT COUNT(*), MAX(u.email), MAX(p.full_name)
  INTO admin_count, admin_email, admin_name
  FROM auth.users u
  JOIN public.profiles p ON u.id = p.id
  WHERE u.email = 'yantoubri@gmail.com' AND p.is_admin = true;
  
  IF admin_count > 0 THEN
    RAISE NOTICE '✅ Admin créé avec succès !';
    RAISE NOTICE '   Email: %', admin_email;
    RAISE NOTICE '   Nom: %', admin_name;
  ELSE
    RAISE WARNING '⚠️  Aucun utilisateur trouvé avec l''email yantoubri@gmail.com';
    RAISE NOTICE '   Veuillez d''abord créer l''utilisateur via Supabase Auth Dashboard';
    RAISE NOTICE '   Puis réexécutez ce script.';
  END IF;
END $$;

-- ============================================
-- Script de vérification de la configuration admin
-- ============================================
-- Ce script vérifie que l'admin yantoubri@gmail.com est bien configuré
-- ============================================

-- Vérifier tous les admins
SELECT 
  u.email,
  p.full_name,
  p.is_admin,
  p.subscription_type,
  p.created_at,
  CASE 
    WHEN p.is_admin = true THEN '✅ Admin'
    ELSE '❌ Utilisateur normal'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'yantoubri@gmail.com'
ORDER BY p.created_at DESC;

-- Compter le nombre total d'admins
SELECT 
  COUNT(*) as total_admins,
  COUNT(CASE WHEN u.email = 'yantoubri@gmail.com' THEN 1 END) as yantoubri_is_admin
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE p.is_admin = true;


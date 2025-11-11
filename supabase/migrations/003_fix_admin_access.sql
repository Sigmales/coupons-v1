-- ============================================
-- CORRECTION: Les admins doivent avoir accès VIP automatiquement
-- ============================================

-- 1. Corriger la politique RLS pour les predictions
-- Les admins doivent voir TOUTES les predictions, pas seulement celles selon leur abonnement
DROP POLICY IF EXISTS "Predictions viewable based on subscription" ON predictions;

CREATE POLICY "Predictions viewable based on subscription or admin" ON predictions FOR SELECT USING (
  -- Les admins voient tout
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  OR
  -- Les utilisateurs normaux selon leur abonnement
  (
    confidence_level = 'standard' OR 
    (confidence_level = 'vip' AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND subscription_type IN ('standard', 'vip')
      AND subscription_end >= CURRENT_DATE
    ))
  )
);

-- 2. Créer une fonction helper pour vérifier l'accès VIP (admin ou abonnement valide)
CREATE OR REPLACE FUNCTION has_vip_access(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND (
      is_admin = true 
      OR (
        subscription_type IN ('standard', 'vip')
        AND subscription_end >= CURRENT_DATE
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Permettre aux admins de modifier les profils (pour attribuer abonnements directement)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (
  auth.uid() = id 
  OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 4. Permettre aux admins de voir tous les profils
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  true -- Déjà existant, mais on s'assure qu'il est là
);


-- Fonction utilitaire pour vérifier l'existence et le statut d'un profil utilisateur
-- Elle est déclarée en SECURITY DEFINER pour contourner les politiques RLS côté client.
-- ⚠️ Après avoir ajouté ce fichier, exécutez le SQL sur votre instance Supabase :
--    supabase db push --file sql/check_profile_status_by_email.sql

CREATE OR REPLACE FUNCTION public.check_profile_status_by_email(p_email text)
RETURNS TABLE(email text, is_active boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    email,
    is_active
  FROM public.user_profiles
  WHERE lower(trim(email)) = lower(trim(p_email))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.check_profile_status_by_email(text) TO anon, authenticated;


import { createClient } from '@supabase/supabase-js'

// Configuration Supabase depuis les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Vérifier que les variables sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Variables Supabase manquantes. Créez un fichier .env avec:\n' +
    'VITE_SUPABASE_URL=votre_url\n' +
    'VITE_SUPABASE_ANON_KEY=votre_cle'
  )
}

// Créer le client Supabase
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')


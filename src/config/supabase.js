import { createClient } from '@supabase/supabase-js'

// Configuration Supabase depuis les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Vérifier que les variables sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Variables Supabase manquantes!\n' +
    'Créez un fichier .env à la racine du projet avec:\n' +
    'VITE_SUPABASE_URL=votre_url\n' +
    'VITE_SUPABASE_ANON_KEY=votre_cle'
  )
} else {
  console.log('[Supabase] Configuration trouvée:', {
    url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MANQUANT',
    key: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MANQUANT'
  })
}

// Créer le client Supabase
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)


import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ 
  children, 
  minAccessLevel = null,
  requiredProduct = null,
  requireAuth = true 
}) => {
  const { user, profile, loading, hasAccessLevel, hasProductAccess } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Si l'authentification est requise mais l'utilisateur n'est pas connecté
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />
  }

  // Si le profil n'est pas chargé ou l'utilisateur est inactif
  if (requireAuth && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profil introuvable</h2>
          <p className="text-gray-600 mb-4">
            Votre compte n'a pas de profil dans la base de données.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left text-sm">
            <p className="font-semibold mb-2">Solution :</p>
            <p className="text-gray-700">
              1. Allez dans Supabase SQL Editor
              <br />
              2. Exécutez cette requête (remplacez l'email) :
            </p>
            <pre className="bg-gray-800 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
{`INSERT INTO user_profiles (id, email, access_level, products, is_active)
SELECT 
  id,
  email,
  4,
  '["STFOUR", "GLBNS"]'::jsonb,
  true
FROM auth.users
WHERE email = '` + (user?.email || 'VOTRE_EMAIL') + `'
AND id NOT IN (SELECT id FROM user_profiles);`}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  if (requireAuth && profile && !profile.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès désactivé</h2>
          <p className="text-gray-600 mb-4">
            Votre compte a été désactivé.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-sm">
            <p className="font-semibold mb-2">Solution :</p>
            <p className="text-gray-700">
              Exécutez cette requête SQL dans Supabase :
            </p>
            <pre className="bg-gray-800 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
{`UPDATE user_profiles
SET is_active = true
WHERE email = '` + (user?.email || 'VOTRE_EMAIL') + `';`}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  // Vérifier le niveau d'accès minimum
  if (minAccessLevel && !hasAccessLevel(minAccessLevel)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès insuffisant</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  // Vérifier l'accès à un produit spécifique
  if (requiredProduct && !hasProductAccess(requiredProduct)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit non accessible</h2>
          <p className="text-gray-600">Vous n'avez pas accès à ce produit.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute


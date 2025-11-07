import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DashboardRedirect = () => {
  const { profile } = useAuth()

  // Si le profil n'est pas chargé, attendre
  if (!profile) {
    return null
  }

  // Si le profil n'est pas actif, rediriger vers les paramètres
  if (!profile.is_active) {
    return <Navigate to="/dashboard/settings" replace />
  }

  // Selon le niveau d'accès, rediriger vers le premier pack disponible
  // Niveau 2 et plus: Pack Global Business
  if (profile.access_level >= 2) {
    return <Navigate to="/dashboard/pack-global-business" replace />
  }
  
  // Niveau 1: Pack Global Sourcing
  if (profile.access_level >= 1) {
    return <Navigate to="/dashboard/pack-global-sourcing" replace />
  }

  // Par défaut, rediriger vers les paramètres
  return <Navigate to="/dashboard/settings" replace />
}

export default DashboardRedirect


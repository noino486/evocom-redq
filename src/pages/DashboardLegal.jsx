import React from 'react'
import DashboardLayout from '../components/DashboardLayout'
import LegalEditor from '../components/LegalEditor'
import { useAuth } from '../context/AuthContext'

const DashboardLegal = () => {
  const { profile } = useAuth()

  const isAdmin = profile?.is_active && profile?.access_level === 4

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Accès restreint
          </h2>
          <p className="text-gray-600">
            Seuls les administrateurs peuvent modifier les mentions légales.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Gestion des mentions légales
          </h1>
          <p className="text-gray-600">
            Modifiez ici le contenu affiché sur la page publique des mentions légales.
          </p>
        </div>
        <LegalEditor />
      </div>
    </DashboardLayout>
  )
}

export default React.memo(DashboardLegal)


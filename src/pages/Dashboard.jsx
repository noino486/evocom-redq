import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaUsers, FaBox, FaChartLine, FaArrowUp } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import DashboardLayout from '../components/DashboardLayout'
import StatsCard from '../components/StatsCard'

const Dashboard = () => {
  const { profile, isAdmin, ACCESS_LEVELS } = useAuth()
  const navigate = useNavigate()
  const [quickStats, setQuickStats] = React.useState(null)

  React.useEffect(() => {
    // Charger les stats rapidement en arrière-plan
    if (isAdmin()) {
      loadQuickStats()
    }
  }, [isAdmin])

  const loadQuickStats = async () => {
    try {
      const { count, error } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
      
      if (!error && count !== null) {
        setQuickStats({ totalUsers: count })
      }
    } catch (error) {
      console.error('Erreur stats:', error)
    }
  }

  const statsCards = useMemo(() => {
    const cards = []
    
    // Card Transactions/Utilisateurs
    if (isAdmin() && quickStats) {
      cards.push({
        type: 'stat',
        title: 'Utilisateurs',
        value: quickStats.totalUsers || 0,
        change: '48.5%',
        changeType: 'positive',
        description: 'Croissance ce mois',
        icon: FaUsers,
        iconColor: 'blue'
      })
    }

    // Card Produits accessibles
    const productCount = profile?.products?.length || 0
    cards.push({
      type: 'stat',
      title: 'Produits accessibles',
      value: productCount,
      description: productCount > 0 ? 'Disponibles maintenant' : 'Aucun produit',
      icon: FaBox,
      iconColor: 'purple'
    })

    // Card Performance
    cards.push({
      type: 'stat',
      title: 'Performance',
      value: '45%',
      change: 'meilleure',
      changeType: 'positive',
      description: 'Comparé au mois dernier',
      icon: FaArrowUp,
      iconColor: 'blue'
    })

    return cards
  }, [profile, isAdmin, quickStats])

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <StatsCard
              key={index}
              title={card.title}
              value={card.value}
              change={card.change}
              changeType={card.changeType}
              description={card.description}
              icon={card.icon}
              iconColor={card.iconColor}
            />
          ))}
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/dashboard/products')}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FaBox className="text-2xl text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mes Produits</h3>
                <p className="text-sm text-gray-600">Accéder à vos produits</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {profile.products?.length || 0} produit(s) disponible(s)
            </div>
          </motion.div>

          {isAdmin() && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => navigate('/dashboard/users')}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <FaUsers className="text-2xl text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Utilisateurs</h3>
                    <p className="text-sm text-gray-600">Gérer les utilisateurs</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {quickStats?.totalUsers || 0} utilisateur(s) total
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => navigate('/dashboard/stats')}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <FaChartLine className="text-2xl text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
                    <p className="text-sm text-gray-600">Voir les statistiques</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">Tableau de bord complet</div>
              </motion.div>
            </>
          )}
        </div>

        {/* Weekly Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vue d'ensemble hebdomadaire</h3>
            <button className="text-sm text-primary hover:text-secondary font-medium">
              Détails
            </button>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              45% Votre performance de vente est 45% meilleure par rapport au mois dernier.
            </p>
            <div className="h-32 bg-gray-100 rounded-lg flex items-end gap-2 p-4">
              {/* Simple bar chart */}
              {[30, 50, 40, 70, 60, 80, 45].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

export default React.memo(Dashboard)


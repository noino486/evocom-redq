import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FaUsers, FaUserCheck, FaUserTimes, FaChartLine } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import DashboardLayout from '../components/DashboardLayout'
import StatsCard from '../components/StatsCard'

const DashboardStats = () => {
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAdmin()) {
      loadStats()
    }
  }, [isAdmin])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Charger les stats directement depuis la table
      const [usersResult, activeUsersResult] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true)
      ])

      const totalUsers = usersResult.count || 0
      const activeUsers = activeUsersResult.count || 0
      const inactiveUsers = totalUsers - activeUsers

      // Calculer par niveau
      const { data: allUsers } = await supabase
        .from('user_profiles')
        .select('access_level')

      const byLevel = allUsers?.reduce((acc, user) => {
        acc[user.access_level] = (acc[user.access_level] || 0) + 1
        return acc
      }, {}) || {}

      setStats({
        total_users: totalUsers,
        active_users: activeUsers,
        inactive_users: inactiveUsers,
        by_level: byLevel
      })
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = useMemo(() => {
    if (!stats) return []
    
    return [
      {
        title: 'Total Utilisateurs',
        value: stats.total_users || 0,
        icon: FaUsers,
        iconColor: 'blue'
      },
      {
        title: 'Utilisateurs Actifs',
        value: stats.active_users || 0,
        change: stats.total_users > 0 
          ? `${Math.round((stats.active_users / stats.total_users) * 100)}%`
          : '0%',
        changeType: 'positive',
        icon: FaUserCheck,
        iconColor: 'green'
      },
      {
        title: 'Utilisateurs Inactifs',
        value: stats.inactive_users || 0,
        icon: FaUserTimes,
        iconColor: 'red'
      },
      {
        title: 'Taux d\'Activation',
        value: stats.total_users > 0 
          ? `${Math.round((stats.active_users / stats.total_users) * 100)}%`
          : '0%',
        icon: FaChartLine,
        iconColor: 'purple'
      }
    ]
  }, [stats])

  if (!isAdmin()) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Accès refusé. Administrateur requis.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Statistiques
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Vue d'ensemble de la plateforme
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : stats ? (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {statsCards.map((card, index) => (
                <StatsCard
                  key={index}
                  title={card.title}
                  value={card.value}
                  change={card.change}
                  changeType={card.changeType}
                  icon={card.icon}
                  iconColor={card.iconColor}
                />
              ))}
            </div>

            {/* By Level */}
            {stats.by_level && Object.keys(stats.by_level).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200"
              >
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Répartition par niveau d'accès
                </h2>
                <div className="space-y-3">
                  {Object.entries(stats.by_level).map(([level, count]) => {
                    const levelNames = {
                      '1': 'Produit 1',
                      '2': 'Produits 1 & 2',
                      '3': 'Support',
                      '4': 'Admin'
                    }
                    return (
                      <div key={level} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700 font-medium">
                          {levelNames[level] || `Niveau ${level}`}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
            <p className="text-gray-600">Aucune statistique disponible</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default React.memo(DashboardStats)


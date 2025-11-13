import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaChartLine,
  FaMoneyBillWave,
  FaShoppingCart
} from 'react-icons/fa'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { format, parseISO, startOfDay, startOfWeek, startOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import DashboardLayout from '../components/DashboardLayout'
import StatsCard from '../components/StatsCard'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const SALES_PERIOD_OPTIONS = [
  { value: 'daily', label: 'Jour' },
  { value: 'weekly', label: 'Semaine' },
  { value: 'monthly', label: 'Mois' }
]

const safeNumber = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(
    safeNumber(value)
  )

const groupSalesByPeriod = (rows, period) => {
  const groups = new Map()

  rows.forEach((row) => {
    const date = parseISO(row.created_at)
    if (Number.isNaN(date.getTime())) return

    let bucketStart
    let label

    if (period === 'daily') {
      bucketStart = startOfDay(date)
      label = format(bucketStart, 'dd MMM', { locale: fr })
    } else if (period === 'weekly') {
      bucketStart = startOfWeek(date, { weekStartsOn: 1 })
      label = `Semaine ${format(bucketStart, 'II', { locale: fr })}`
    } else {
      bucketStart = startOfMonth(date)
      label = format(bucketStart, 'MMM yyyy', { locale: fr })
    }

    const key = bucketStart.toISOString()
    if (!groups.has(key)) {
      groups.set(key, { label, revenue: 0, count: 0, orderDate: bucketStart })
    }

    const entry = groups.get(key)
    entry.revenue += safeNumber(row.price)
    entry.count += 1
  })

  return Array.from(groups.values()).sort((a, b) => a.orderDate.getTime() - b.orderDate.getTime())
}

const DashboardStats = () => {
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [salesStats, setSalesStats] = useState(null)
  const [salesPeriod, setSalesPeriod] = useState('monthly')

  useEffect(() => {
    if (isAdmin()) {
      loadStats()
    }
  }, [isAdmin])

  const loadStats = async () => {
    try {
      setLoading(true)

      const [usersResult, activeUsersResult, allUsersResult, salesResult] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('user_profiles').select('access_level'),
        supabase.from('sales').select('price, pack_id, created_at').order('created_at', { ascending: true })
      ])

      if (usersResult.error) throw usersResult.error
      if (activeUsersResult.error) throw activeUsersResult.error
      if (allUsersResult.error) throw allUsersResult.error
      if (salesResult.error && salesResult.error.code !== '42P01') throw salesResult.error

      const totalUsers = usersResult.count || 0
      const activeUsers = activeUsersResult.count || 0
      const inactiveUsers = totalUsers - activeUsers

      const byLevel = allUsersResult.data?.reduce((acc, user) => {
        acc[user.access_level] = (acc[user.access_level] || 0) + 1
        return acc
      }, {}) || {}

      setStats({
        total_users: totalUsers,
        active_users: activeUsers,
        inactive_users: inactiveUsers,
        by_level: byLevel
      })

      if (salesResult.error && salesResult.error.code === '42P01') {
        // Table des ventes non créée
        setSalesStats({
          totalRevenue: 0,
          totalSales: 0,
          grouped: { daily: [], weekly: [], monthly: [] }
        })
      } else {
        const salesRows = salesResult.data || []
        const totalRevenue = salesRows.reduce((sum, sale) => sum + safeNumber(sale.price), 0)
        const totalSales = salesRows.length
        setSalesStats({
          totalRevenue,
          totalSales,
          grouped: {
            daily: groupSalesByPeriod(salesRows, 'daily'),
            weekly: groupSalesByPeriod(salesRows, 'weekly'),
            monthly: groupSalesByPeriod(salesRows, 'monthly')
          }
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = useMemo(() => {
    if (!stats) return []

    const cards = [
      {
        title: 'Total Utilisateurs',
        value: stats.total_users || 0,
        icon: FaUsers,
        iconColor: 'blue'
      },
      {
        title: 'Utilisateurs Actifs',
        value: stats.active_users || 0,
        change:
          stats.total_users > 0
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
        title: "Taux d'Activation",
        value:
          stats.total_users > 0
            ? `${Math.round((stats.active_users / stats.total_users) * 100)}%`
            : '0%',
        icon: FaChartLine,
        iconColor: 'purple'
      }
    ]

    if (salesStats) {
      cards.push({
        title: 'Ventes enregistrées',
        value: salesStats.totalSales || 0,
        icon: FaShoppingCart,
        iconColor: 'indigo'
      })
      cards.push({
        title: 'Revenus cumulés',
        value: formatCurrency(salesStats.totalRevenue),
        icon: FaMoneyBillWave,
        iconColor: 'yellow'
      })
    }

    return cards
  }, [stats, salesStats])

  const salesChartData = useMemo(() => {
    if (!salesStats) return null
    const groups = salesStats.grouped?.[salesPeriod] || []
    if (!groups.length) {
      return { labels: [], datasets: [] }
    }

    return {
      labels: groups.map((group) => group.label),
      datasets: [
        {
          label: 'Revenus',
          data: groups.map((group) => Number(group.revenue.toFixed(2))),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          borderWidth: 2,
          tension: 0.25,
          fill: true
        }
      ]
    }
  }, [salesStats, salesPeriod])

  const salesChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `Revenus : ${formatCurrency(context.raw)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxTicksLimit: 8,
            color: '#475569'
          }
        },
        y: {
          grid: { color: 'rgba(148, 163, 184, 0.2)' },
          ticks: {
            callback: (value) => formatCurrency(value),
            color: '#475569'
          }
        }
      }
    }),
    []
  )

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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
          </div>
        ) : stats ? (
          <>
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
                      <div
                        key={level}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
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

            {salesStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                      Performances des ventes
                    </h2>
                    <p className="text-sm text-gray-500">
                      Analyse des revenus générés par les packs
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full p-1">
                    {SALES_PERIOD_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSalesPeriod(option.value)}
                        className={`px-3 py-1 text-xs sm:text-sm rounded-full transition-colors ${
                          salesPeriod === option.value
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-600 hover:bg-white'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                    <p className="text-xs uppercase tracking-wide text-primary font-semibold">
                      Revenus cumulés
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-primary mt-1">
                      {formatCurrency(salesStats.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/5 border border-secondary/10 rounded-lg">
                    <p className="text-xs uppercase tracking-wide text-secondary font-semibold">
                      Ventes totales
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-secondary mt-1">
                      {salesStats.totalSales || 0}
                    </p>
                  </div>
                </div>

                <div className="mt-6 h-72">
                  {salesChartData && salesChartData.labels.length > 0 ? (
                    <Line data={salesChartData} options={salesChartOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg">
                      Aucune vente enregistrée pour le moment.
                    </div>
                  )}
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

import React, { useState, useMemo, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaBox, 
  FaUsers, 
  FaChartLine,
  FaUserTag,
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaCog,
  FaGlobe,
  FaStar,
  FaSearch,
  FaBuilding,
  FaChevronDown,
  FaChevronRight,
  FaList,
  FaGavel,
  FaFileAlt
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const DashboardLayout = ({ children }) => {
  const { profile, signOut, isAdmin, isSupportOrAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})

  const menuItems = useMemo(() => {
    // S'assurer que isAdmin retourne bien false pour les niveaux 1, 2 et 3
    const adminCheck = profile?.access_level === 4 && profile?.is_active
    const supportCheck = (profile?.access_level === 3 || profile?.access_level === 4) && profile?.is_active
    
    // Pack Global Sourcing: visible pour niveau 1 ou rôles support/admin (>=3)
    const hasPackSourcing = profile?.is_active && (profile?.access_level === 1 || profile?.access_level >= 3)
    // Pack Global Business: visible si niveau >= 2
    const hasPackBusiness = profile?.is_active && profile?.access_level >= 2
    
    return [
      {
        icon: FaGlobe,
        title: 'Pack Global Sourcing',
        path: '/dashboard/pack-global-sourcing',
        visible: hasPackSourcing
      },
      {
        type: 'section',
        icon: FaStar,
        title: 'Pack Global Business',
        visible: hasPackBusiness,
        children: [
          {
            icon: FaFileAlt,
            title: 'PDFs',
            path: '/dashboard/pack-global-business/pdfs',
            visible: true
          },
          {
            icon: FaBuilding,
            title: 'Fournisseurs',
            path: '/dashboard/pack-global-business/suppliers',
            visible: true
          }
        ]
      },
      {
        icon: FaChartLine,
        title: 'Statistiques',
        path: '/dashboard/stats',
        visible: supportCheck
      },
      {
        icon: FaUsers,
        title: 'Utilisateurs',
        path: '/dashboard/users',
        visible: adminCheck // Seulement niveau 4 (Admin)
      },
      {
        icon: FaUserTag,
        title: 'Influenceurs',
        path: '/dashboard/affiliates',
        visible: adminCheck // Seulement niveau 4 (Admin)
      },
      {
        icon: FaList,
        title: 'PDFs par Section',
        path: '/dashboard/pdf-sections',
        visible: adminCheck // Seulement niveau 4 (Admin)
      },
      {
        icon: FaGavel,
        title: 'Mentions légales',
        path: '/dashboard/legal',
        visible: adminCheck
      },
      // Scraper (admin seulement)
      {
        icon: FaSearch,
        title: 'Scraper Fournisseurs',
        path: '/dashboard/scraper',
        visible: adminCheck
      },
      {
        icon: FaCog,
        title: 'Paramètres',
        path: '/dashboard/settings',
        visible: true
      }
    ]
  }, [profile, isAdmin, isSupportOrAdmin])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const activePath = location.pathname

  // Auto-expand les sections avec des enfants actifs
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.type === 'section' && item.children) {
        const hasActiveChild = item.children.some(child => 
          child.path && (activePath === child.path || activePath.startsWith(child.path))
        )
        if (hasActiveChild) {
          setExpandedSections(prev => {
            if (prev[item.title] === undefined) {
              return { ...prev, [item.title]: true }
            }
            return prev
          })
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePath])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur border-r border-slate-200 z-50 shadow-lg
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 sm:px-6 border-b border-slate-200 bg-white/90 backdrop-blur">
          <img 
            src="/logo.-evo-banniere.svg" 
            alt="EvoEcom Logo" 
            className="h-7 sm:h-8 w-auto"
          />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-500 hover:text-slate-900 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5">
          <div className="px-3 sm:px-5 space-y-1.5">
            {menuItems
              .filter(item => item.visible)
              .map((item) => {
                // Si c'est une section avec sous-menus
                if (item.type === 'section' && item.children) {
                  const hasActiveChild = item.children.some(child => 
                    child.path && (activePath === child.path || activePath.startsWith(child.path))
                  )
                  const manualExpansion = expandedSections[item.title]
                  const isExpanded = manualExpansion !== undefined 
                    ? manualExpansion 
                    : hasActiveChild
                  
                  return (
                    <div key={item.title}>
                      <button
                        onClick={() => setExpandedSections(prev => {
                          const current = prev[item.title] ?? hasActiveChild
                          return {
                            ...prev,
                            [item.title]: !current
                          }
                        })}
                        className={`
                          group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border
                          ${hasActiveChild 
                            ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' 
                            : 'text-slate-600 border-transparent hover:border-slate-200 hover:bg-slate-100/60'
                          }
                        `}
                      >
                        <item.icon className={`text-base ${hasActiveChild ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}`} />
                        <span className="flex-1 font-medium text-left text-sm">{item.title}</span>
                        {item.badge && (
                          <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary to-secondary text-white rounded">
                            {item.badge}
                          </span>
                        )}
                        {isExpanded ? (
                          <FaChevronDown className="text-xs text-slate-400" />
                        ) : (
                          <FaChevronRight className="text-xs text-slate-400" />
                        )}
                      </button>
                      
                      {/* Sous-menus */}
                      {isExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.children
                            .filter(child => child.visible)
                            .map((child) => {
                              const isActive = child.path && (activePath === child.path || activePath.startsWith(child.path))
                              
                              return (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  onClick={() => setSidebarOpen(false)}
                                className={`
                                  flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm
                                  ${isActive 
                                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                                    : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-700'
                                  }
                                `}
                                >
                                <child.icon className={`text-sm ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                                <span className="flex-1 font-medium text-sm">{child.title}</span>
                                </Link>
                              )
                            })}
                        </div>
                      )}
                    </div>
                  )
                }
                
                // Item de menu normal
                if (!item.path) return null
                
                const isActive = activePath === item.path || 
                  (item.path !== '/dashboard' && activePath.startsWith(item.path))
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      group flex items-center gap-3 px-4 py-3 rounded-xl transition-all border
                      ${isActive 
                        ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' 
                        : 'text-slate-600 border-transparent hover:border-slate-200 hover:bg-slate-100/60'
                      }
                    `}
                  >
                    <item.icon className={`text-base ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}`} />
                    <span className="flex-1 font-medium text-sm tracking-wide">{item.title}</span>
                  </Link>
                )
              })}
          </div>
        </nav>

        {/* User info & Logout */}
        <div className="border-t border-slate-200 bg-white/90 backdrop-blur p-4 sm:p-5">
          <div className="mb-3 px-2 sm:px-3">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
              {profile?.email || 'Chargement...'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {profile?.access_level === 4 ? 'Administrateur' :
               profile?.access_level === 3 ? 'Support' :
               profile?.access_level === 2 ? 'Produits 1 & 2' :
               'Produit 1'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-200"
          >
            <FaSignOutAlt className="text-slate-500 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-semibold">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-900 transition-colors mr-2 sm:mr-4"
          >
            <FaBars className="text-xl" />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
            {menuItems.find(item => activePath === item.path || 
              (item.path !== '/dashboard' && activePath.startsWith(item.path)))?.title || 'Dashboard'}
          </h1>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default React.memo(DashboardLayout)


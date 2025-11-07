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
  FaList
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
        visible: hasPackSourcing,
        badge: null
      },
      // Pack Global Business
      {
        icon: FaStar,
        title: 'Pack Global Business',
        path: '/dashboard/pack-global-business',
        visible: hasPackBusiness,
        badge: null
      },
      {
        icon: FaChartLine,
        title: 'Statistiques',
        path: '/dashboard/stats',
        visible: supportCheck,
        badge: 'Pro'
      },
      {
        icon: FaUsers,
        title: 'Utilisateurs',
        path: '/dashboard/users',
        visible: adminCheck, // Seulement niveau 4 (Admin)
        badge: 'Admin'
      },
      {
        icon: FaUserTag,
        title: 'Influenceurs',
        path: '/dashboard/affiliates',
        visible: adminCheck, // Seulement niveau 4 (Admin)
        badge: 'Admin'
      },
      {
        icon: FaList,
        title: 'PDFs par Section',
        path: '/dashboard/pdf-sections',
        visible: adminCheck, // Seulement niveau 4 (Admin)
        badge: 'Admin'
      },
      // Scraper (admin seulement)
      {
        icon: FaSearch,
        title: 'Scraper Fournisseurs',
        path: '/dashboard/scraper',
        visible: adminCheck,
        badge: 'Admin'
      },
      {
        icon: FaCog,
        title: 'Paramètres',
        path: '/dashboard/settings',
        visible: true,
        badge: null
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
            if (!prev[item.title]) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200">
          <img 
            src="/logo.-evo-banniere.svg" 
            alt="EvoEcom Logo" 
            className="h-7 sm:h-8 w-auto"
          />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-2 sm:px-4 space-y-1">
            {menuItems
              .filter(item => item.visible)
              .map((item) => {
                // Si c'est une section avec sous-menus
                if (item.type === 'section' && item.children) {
                  const isExpanded = expandedSections[item.title] !== false
                  const hasActiveChild = item.children.some(child => 
                    child.path && (activePath === child.path || activePath.startsWith(child.path))
                  )
                  
                  return (
                    <div key={item.title}>
                      <button
                        onClick={() => setExpandedSections(prev => ({
                          ...prev,
                          [item.title]: !prev[item.title]
                        }))}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                          ${hasActiveChild 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <item.icon className={hasActiveChild ? 'text-primary' : 'text-gray-500'} />
                        <span className="flex-1 font-medium text-left">{item.title}</span>
                        {item.badge && (
                          <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary to-secondary text-white rounded">
                            {item.badge}
                          </span>
                        )}
                        {isExpanded ? (
                          <FaChevronDown className="text-xs text-gray-400" />
                        ) : (
                          <FaChevronRight className="text-xs text-gray-400" />
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
                                    flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm
                                    ${isActive 
                                      ? 'bg-primary/10 text-primary border border-primary/20' 
                                      : 'text-gray-600 hover:bg-gray-50'
                                    }
                                  `}
                                >
                                  <child.icon className={isActive ? 'text-primary' : 'text-gray-400'} />
                                  <span className="flex-1 font-medium">{child.title}</span>
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
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className={isActive ? 'text-primary' : 'text-gray-500'} />
                    <span className="flex-1 font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary to-secondary text-white rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
          </div>
        </nav>

        {/* User info & Logout */}
        <div className="border-t border-gray-200 p-3 sm:p-4">
          <div className="mb-3 px-2 sm:px-4">
            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
              {profile?.email || 'Chargement...'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile?.access_level === 4 ? 'Administrateur' :
               profile?.access_level === 3 ? 'Support' :
               profile?.access_level === 2 ? 'Produits 1 & 2' :
               'Produit 1'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <FaSignOutAlt className="text-gray-500 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900 mr-2 sm:mr-4"
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


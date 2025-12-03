import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaUserTimes, FaUserCheck, FaKey, FaSpinner, FaEdit, FaSave, FaTimes, FaPlus, FaEnvelope, FaBriefcase, FaBriefcaseMedical } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import DashboardLayout from '../components/DashboardLayout'

const DashboardUsers = () => {
  const { isAdmin, user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')
  const [actionLoading, setActionLoading] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({ email: '', access_level: 1 })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({
    email: '',
    access_level: 1,
    products: ['STFOUR']
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [workspaces, setWorkspaces] = useState({}) // Map userId -> workspace status

  useEffect(() => {
    const checkAndLoad = async () => {
      if (isAdmin()) {
        console.log('[DashboardUsers] Utilisateur est admin, chargement des utilisateurs...')
        await loadUsers()
      } else {
        console.warn('[DashboardUsers] Utilisateur n\'est pas admin, accès refusé')
      }
    }
    checkAndLoad()
  }, [isAdmin])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const loadUsers = async () => {
    try {
      setLoading(true)
      console.log('[DashboardUsers] Chargement des utilisateurs...')
      
      // Tentative 1 : Requête normale
      let { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000) // Augmenté pour voir tous les utilisateurs

      if (error) {
        console.error('[DashboardUsers] Erreur RLS:', error)
        console.error('[DashboardUsers] Code:', error.code, 'Message:', error.message)
        console.error('[DashboardUsers] Détails complets:', JSON.stringify(error, null, 2))
        
        // Afficher une erreur claire à l'utilisateur
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('row-level')) {
          console.error('[DashboardUsers] ❌ Problème de permissions RLS détecté')
          console.error('[DashboardUsers] 💡 Exécutez FIX_ADMIN_RLS_SIMPLE.sql dans Supabase')
          throw new Error('Permissions RLS insuffisantes. Exécutez FIX_ADMIN_RLS_SIMPLE.sql dans Supabase Dashboard.')
        }
        
        throw error
      }
      
      console.log('[DashboardUsers] ✅ Utilisateurs chargés:', data?.length || 0, 'utilisateurs')
      console.log('[DashboardUsers] Détails:', data?.map(u => ({ email: u.email, access_level: u.access_level, is_active: u.is_active })))
      
      if (!data || data.length === 0) {
        console.warn('[DashboardUsers] ⚠️ Aucun utilisateur trouvé. Vérifiez les politiques RLS.')
      }
      
      setUsers(data || [])
      
      // Charger les workspaces pour tous les utilisateurs
      await loadWorkspaces(data || [])
    } catch (error) {
      console.error('[DashboardUsers] Erreur lors du chargement des utilisateurs:', error)
      // Afficher un message d'erreur plus détaillé
      if (error.code === '42501' || error.message?.includes('permission')) {
        alert('Erreur de permissions RLS. Vérifiez que vous êtes bien administrateur et exécutez FIX_ADMIN_RLS.sql')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadWorkspaces = async (usersList) => {
    try {
      if (!usersList || usersList.length === 0) return
      
      const userIds = usersList.map(u => u.id)
      const { data, error } = await supabase
        .from('influencer_workspaces')
        .select('influencer_id, is_active')
        .in('influencer_id', userIds)

      if (error) {
        console.error('Erreur lors du chargement des workspaces:', error)
        return
      }

      const workspaceMap = {}
      data?.forEach(ws => {
        workspaceMap[ws.influencer_id] = ws.is_active
      })
      setWorkspaces(workspaceMap)
    } catch (error) {
      console.error('Erreur lors du chargement des workspaces:', error)
    }
  }

  const handleToggleWorkspaceAccess = async (userId) => {
    try {
      setActionLoading(`workspace-${userId}`)
      
      const hasActiveWorkspace = workspaces[userId] === true
      
      if (hasActiveWorkspace) {
        // Désactiver le workspace
        const { error } = await supabase
          .from('influencer_workspaces')
          .update({ is_active: false })
          .eq('influencer_id', userId)

        if (error) throw error
        setMessage({ type: 'success', text: 'Accès organisation retiré avec succès' })
      } else {
        // Créer ou activer le workspace
        const { data: existing, error: checkError } = await supabase
          .from('influencer_workspaces')
          .select('id')
          .eq('influencer_id', userId)
          .single()

        if (checkError && checkError.code === 'PGRST116') {
          // Créer
          const { error: createError } = await supabase
            .from('influencer_workspaces')
            .insert({
              influencer_id: userId,
              created_by: currentUser?.id,
              is_active: true
            })

          if (createError) throw createError
        } else if (!checkError) {
          // Activer
          const { error: updateError } = await supabase
            .from('influencer_workspaces')
            .update({ is_active: true })
            .eq('id', existing.id)

          if (updateError) throw updateError
        } else {
          throw checkError
        }

        setMessage({ type: 'success', text: 'Accès organisation accordé avec succès' })
      }

      // Recharger les workspaces
      await loadWorkspaces(users)
    } catch (error) {
      console.error('Erreur lors de la modification de l\'accès:', error)
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la modification' })
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterLevel === 'all' || user.access_level.toString() === filterLevel
      return matchesSearch && matchesFilter
    })
  }, [users, searchTerm, filterLevel])

  const handleRevokeAccess = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer l\'accès de cet utilisateur ?')) {
      return
    }

    try {
      setActionLoading(userId)
      const { data, error } = await supabase
        .rpc('revoke_user_access', { p_user_id: userId })

      if (error) throw error
      await loadUsers()
      alert('Accès révoqué avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la révocation: ' + error.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRestoreAccess = async (userId) => {
    try {
      setActionLoading(userId)
      const { data, error } = await supabase
        .rpc('restore_user_access', { p_user_id: userId })

      if (error) throw error
      await loadUsers()
      alert('Accès restauré avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la restauration: ' + error.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetPassword = async (userEmail) => {
    try {
      setActionLoading(userEmail)
      
      // Utiliser l'Edge Function pour réinitialiser le mot de passe
      const siteUrl = window.location.origin
      
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: {
          email: userEmail,
          redirectTo: `${siteUrl}/login?recovery=true`
        }
      })

      if (error) {
        console.error('[DashboardUsers] Erreur appel Edge Function:', error)
        throw new Error(error.message || `Erreur: ${error.name || 'Erreur inconnue'}`)
      }

      if (data?.success) {
        alert('Email de réinitialisation de mot de passe envoyé')
      } else {
        throw new Error(data?.error || 'Erreur lors de l\'envoi de l\'email de réinitialisation')
      }
    } catch (error) {
      console.error('Erreur:', error)

      const message = error?.message || ''
      if (typeof message === 'string' && message.toLowerCase().includes('rate limit')) {
        alert('Vous avez déjà envoyé un email de réinitialisation récemment. Patientez une minute avant de réessayer.')
      } else {
        alert('Erreur: ' + (message || 'Erreur inconnue'))
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user.id)
    setEditForm({
      email: user.email,
      access_level: user.access_level
    })
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({ email: '', access_level: 1 })
  }

  const handleSaveEdit = async (userId) => {
    try {
      setActionLoading(userId)
      const user = users.find(u => u.id === userId)
      
      // Mettre à jour l'email dans Supabase Auth (nécessite admin)
      if (editForm.email !== user.email) {
        const { error: emailError } = await supabase.auth.admin.updateUserById(userId, {
          email: editForm.email
        })
        if (emailError) throw emailError
      }

      // Mettre à jour le profil dans user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          email: editForm.email,
          access_level: editForm.access_level,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (profileError) throw profileError

      await loadUsers()
      setEditingUser(null)
      alert('Utilisateur modifié avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la modification: ' + error.message)
    } finally {
      setActionLoading(null)
    }
  }

  const getLevelName = (level) => {
    const levels = {
      1: 'Produit 1',
      2: 'Produits 1 & 2',
      3: 'Support',
      4: 'Admin'
    }
    return levels[level] || 'Inconnu'
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    // Validation
    if (!createForm.email) {
      setMessage({ type: 'error', text: 'L\'email est requis' })
      return
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(createForm.email)) {
      setMessage({ type: 'error', text: 'Format d\'email invalide' })
      return
    }

    // Déterminer les produits selon le niveau d'accès
    let products = []
    if (createForm.access_level === 1) {
      products = ['STFOUR']
    } else if (createForm.access_level === 2) {
      products = ['STFOUR', 'GLBNS']
    } else {
      // Pour les niveaux 3 et 4, utiliser les produits sélectionnés ou tous
      products = createForm.products.length > 0 ? createForm.products : ['STFOUR', 'GLBNS']
    }

    try {
      setActionLoading('create')

      // Récupérer le token d'authentification
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Session expirée, veuillez vous reconnecter')
      }

      // Appeler l'Edge Function pour envoyer l'invitation
      // Inclure l'URL actuelle pour la redirection après invitation
      const siteUrl = window.location.origin
      
      const payload = {
        email: createForm.email,
        access_level: createForm.access_level,
        products: products,
        site_url: siteUrl // Passer l'URL du site pour la redirection
      }

      const { data, error } = await supabase.functions.invoke('create-user', {
        body: payload
      })

      if (error) {
        console.error('[DashboardUsers] Erreur appel Edge Function:', error)
        throw new Error(error.message || `Erreur: ${error.name || 'Erreur inconnue'}`)
      }

      if (data?.success) {
        const messageText = data.invitation_sent
          ? `Invitation envoyée à ${createForm.email} ! L'utilisateur recevra un email pour créer son compte.`
          : data.warning
            ? `Utilisateur créé mais problème lors de l'envoi de l'email: ${data.warning}`
            : `Utilisateur créé/mis à jour pour ${createForm.email}`
        
        setMessage({ 
          type: data.invitation_sent ? 'success' : 'warning', 
          text: messageText
        })
        setCreateForm({
          email: '',
          access_level: 1,
          products: ['STFOUR'],
        })
        setShowCreateForm(false)
        await loadUsers()
      } else {
        const errorMsg = data?.error || 'Erreur lors de l\'envoi de l\'invitation'
        console.error('[DashboardUsers] Erreur dans la réponse:', data)
        throw new Error(errorMsg)
      }
    } catch (error) {
      console.error('[DashboardUsers] Erreur complète:', error)
      console.error('[DashboardUsers] Détails:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
      
      // Afficher un message plus détaillé
      let errorMessage = error.message || 'Erreur lors de l\'envoi de l\'invitation'
      
      if (error.message?.includes('non-2xx')) {
        errorMessage = 'Erreur serveur (500). Consultez les logs Supabase pour plus de détails.'
      } else if (error.message?.includes('401') || error.message?.includes('Non authentifié')) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.'
      } else if (error.message?.includes('403') || error.message?.includes('Accès refusé')) {
        errorMessage = 'Vous n\'avez pas les permissions nécessaires. Contactez un administrateur.'
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage + ' Consultez la console pour plus de détails.' 
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleProductToggle = (product) => {
    setCreateForm(prev => {
      const products = prev.products.includes(product)
        ? prev.products.filter(p => p !== product)
        : [...prev.products, product]
      return { ...prev, products }
    })
  }

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-600">
              Gérez tous les utilisateurs de la plateforme ({users.length} total)
            </p>
          </div>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 shadow-sm"
            >
              <FaPlus />
              Créer un utilisateur
            </button>
          )}
        </div>

        {/* Message de succès/erreur */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-4 py-3 rounded-lg ${
              message.type === 'error' 
                ? 'bg-red-50 border border-red-200 text-red-700' 
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Formulaire de création */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaEnvelope className="text-primary" />
              Inviter un utilisateur
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Un email d'invitation sera envoyé à l'utilisateur pour qu'il crée son compte avec un mot de passe.
            </p>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email *
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value.toLowerCase().trim() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="utilisateur@example.com"
                  required
                  disabled={actionLoading === 'create'}
                />
                <p className="mt-1 text-xs text-gray-500">
                  L'utilisateur recevra un lien par email pour créer son compte
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau d'accès *
                </label>
                <select
                  value={createForm.access_level}
                  onChange={(e) => {
                    const level = parseInt(e.target.value)
                    let products = []
                    if (level === 1) products = ['STFOUR']
                    else if (level === 2) products = ['STFOUR', 'GLBNS']
                    else products = ['STFOUR', 'GLBNS']
                    setCreateForm({ 
                      ...createForm, 
                      access_level: level, 
                      products
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  disabled={actionLoading === 'create'}
                >
                  <option value={1}>Niveau 1 - Produit 1 (STFOUR)</option>
                  <option value={2}>Niveau 2 - Produits 1 & 2 (STFOUR + GLBNS)</option>
                  <option value={3}>Niveau 3 - Support</option>
                  <option value={4}>Niveau 4 - Administrateur</option>
                </select>
              </div>

              {(createForm.access_level === 3 || createForm.access_level === 4) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Produits accessibles
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={createForm.products.includes('STFOUR')}
                        onChange={() => handleProductToggle('STFOUR')}
                        className="mr-2"
                        disabled={actionLoading === 'create'}
                      />
                      <span className="text-sm text-gray-700">STFOUR - Pack Global Sourcing</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={createForm.products.includes('GLBNS')}
                        onChange={() => handleProductToggle('GLBNS')}
                        className="mr-2"
                        disabled={actionLoading === 'create'}
                      />
                      <span className="text-sm text-gray-700">GLBNS - Pack Global Business</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading === 'create' || !createForm.email}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                >
                  {actionLoading === 'create' ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Envoi de l'invitation...
                    </>
                  ) : (
                    <>
                      <FaEnvelope />
                      Envoyer l'invitation
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setCreateForm({
                      email: '',
                      access_level: 1,
                      products: ['STFOUR']
                    })
                    setMessage({ type: '', text: '' })
                  }}
                  disabled={actionLoading === 'create'}
                  className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <FaTimes />
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tous les niveaux</option>
              <option value="1">Produit 1</option>
              <option value="2">Produits 1 & 2</option>
              <option value="3">Support</option>
              <option value="4">Admin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-primary" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Niveau
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organisation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière connexion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={!user.is_active ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user.id ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            {user.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user.id ? (
                          <select
                            value={editForm.access_level}
                            onChange={(e) => setEditForm({ ...editForm, access_level: parseInt(e.target.value) })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value={1}>Produit 1</option>
                            <option value={2}>Produits 1 & 2</option>
                            <option value={3}>Support</option>
                            <option value={4}>Admin</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.access_level === 4 ? 'bg-purple-100 text-purple-800' :
                            user.access_level === 3 ? 'bg-blue-100 text-blue-800' :
                            user.access_level === 2 ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getLevelName(user.access_level)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {actionLoading === `workspace-${user.id}` ? (
                          <FaSpinner className="animate-spin text-primary" />
                        ) : (
                          <button
                            onClick={() => handleToggleWorkspaceAccess(user.id)}
                            disabled={actionLoading === `workspace-${user.id}`}
                            className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                              workspaces[user.id] === true
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={
                              workspaces[user.id] === true
                                ? 'Cliquer pour retirer l\'accès organisation'
                                : 'Cliquer pour accorder l\'accès organisation'
                            }
                          >
                            {workspaces[user.id] === true ? 'Activé' : 'Non activé'}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString('fr-FR')
                          : 'Jamais'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {editingUser === user.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(user.id)}
                              disabled={actionLoading === user.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Sauvegarder"
                            >
                              {actionLoading === user.id ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaSave />
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={actionLoading === user.id}
                              className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                              title="Annuler"
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditUser(user)}
                              disabled={actionLoading || user.id === currentUser?.id}
                              className="text-primary hover:text-secondary disabled:opacity-50"
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            {user.is_active ? (
                              <button
                                onClick={() => handleRevokeAccess(user.id)}
                                disabled={actionLoading === user.id || user.id === currentUser?.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                title="Révoquer l'accès"
                              >
                                {actionLoading === user.id ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaUserTimes />
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestoreAccess(user.id)}
                                disabled={actionLoading === user.id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                title="Restaurer l'accès"
                              >
                                {actionLoading === user.id ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaUserCheck />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleResetPassword(user.email)}
                              disabled={actionLoading === user.email}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              title="Réinitialiser le mot de passe"
                            >
                              {actionLoading === user.email ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaKey />
                              )}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default React.memo(DashboardUsers)


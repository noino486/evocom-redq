import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes, FaEnvelope } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import DashboardLayout from '../components/DashboardLayout'

const DashboardSettings = () => {
  const { user, profile } = useAuth()
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError(null)
    setMessage(null)
  }

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    // Validation
    if (!formData.oldPassword) {
      setError('Veuillez entrer votre mot de passe actuel')
      setLoading(false)
      return
    }

    if (!formData.newPassword) {
      setError('Veuillez entrer un nouveau mot de passe')
      setLoading(false)
      return
    }

    const passwordError = validatePassword(formData.newPassword)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (formData.oldPassword === formData.newPassword) {
      setError('Le nouveau mot de passe doit être différent de l\'ancien')
      setLoading(false)
      return
    }

    try {
      // Vérifier que l'utilisateur existe dans user_profiles et est actif
      if (!profile) {
        setError('Votre profil n\'existe pas dans notre système. Veuillez contacter le support.')
        setLoading(false)
        return
      }

      if (!profile.is_active) {
        setError('Votre compte est désactivé. Veuillez contacter le support.')
        setLoading(false)
        return
      }

      // Vérifier que l'email correspond toujours
      if (user?.email !== profile.email) {
        setError('L\'email de votre compte ne correspond pas. Veuillez vous reconnecter.')
        setLoading(false)
        return
      }

      // Vérifier l'ancien mot de passe en essayant de se connecter
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: formData.oldPassword
      })

      if (signInError) {
        setError('Mot de passe actuel incorrect')
        setLoading(false)
        return
      }

      // Double vérification : s'assurer que le profil existe toujours
      const { data: profileCheck, error: profileCheckError } = await supabase
        .from('user_profiles')
        .select('id, email, is_active')
        .eq('id', user.id)
        .maybeSingle()

      if (profileCheckError || !profileCheck) {
        setError('Erreur : votre profil n\'existe plus. Veuillez contacter le support.')
        setLoading(false)
        return
      }

      if (!profileCheck.is_active) {
        setError('Votre compte a été désactivé. Veuillez contacter le support.')
        setLoading(false)
        return
      }

      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (updateError) {
        setError(updateError.message || 'Erreur lors de la mise à jour du mot de passe')
        setLoading(false)
        return
      }

      // Succès
      setMessage('Mot de passe modifié avec succès !')
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paramètres
          </h1>
          <p className="text-gray-600">
            Gérez vos paramètres de compte
          </p>
        </div>

        {/* Informations du compte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Informations du compte
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user?.email || 'Chargement...'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Niveau d'accès</label>
              <p className="mt-1 text-gray-900">
                {profile?.access_level === 4 ? 'Administrateur' :
                 profile?.access_level === 3 ? 'Support' :
                 profile?.access_level === 2 ? 'Produits 1 & 2' :
                 'Produit 1'}
              </p>
            </div>
            {profile?.products && Array.isArray(profile.products) && profile.products.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700">Produits accessibles</label>
                <p className="mt-1 text-gray-900">{profile.products.join(', ')}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Changement de mot de passe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaLock className="text-primary" />
              Changer le mot de passe
            </h2>
            <button
              type="button"
              onClick={async () => {
                if (!user?.email) {
                  alert('Email non disponible')
                  return
                }
                
                // Vérifier que le profil existe et est actif
                if (!profile) {
                  alert('Erreur : votre profil n\'existe pas dans notre système. Veuillez contacter le support.')
                  return
                }
                
                if (!profile.is_active) {
                  alert('Votre compte est désactivé. Veuillez contacter le support.')
                  return
                }
                
                // Vérifier que l'email correspond
                if (user.email !== profile.email) {
                  alert('Erreur : l\'email ne correspond pas. Veuillez vous reconnecter.')
                  return
                }
                
                if (!confirm(`Envoyer un email de réinitialisation à ${user.email} ?`)) {
                  return
                }
                
                try {
                  // Double vérification avant envoi
                  const { data: profileCheck, error: profileCheckError } = await supabase
                    .from('user_profiles')
                    .select('id, email, is_active')
                    .eq('id', user.id)
                    .maybeSingle()

                  if (profileCheckError || !profileCheck) {
                    alert('Erreur : votre profil n\'existe plus. Veuillez contacter le support.')
                    return
                  }

                  if (!profileCheck.is_active) {
                    alert('Votre compte a été désactivé. Veuillez contacter le support.')
                    return
                  }
                  
                  const siteUrl = window.location.origin
                  const redirectTo = `${siteUrl}/login?recovery=true`
                  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                    redirectTo: redirectTo
                  })
                  if (error) {
                    alert('Erreur: ' + error.message)
                  } else {
                    alert('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.')
                  }
                } catch (err) {
                  alert('Erreur: ' + err.message)
                }
              }}
              className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-1 shadow-sm"
            >
              <FaEnvelope />
              Réinitialiser via email
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ancien mot de passe */}
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  id="oldPassword"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Entrez votre mot de passe actuel"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
                >
                  {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Minimum 6 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formData.newPassword && (
                <p className="mt-1 text-xs text-gray-500">
                  {formData.newPassword.length < 6 ? (
                    <span className="text-orange-600">Minimum 6 caractères requis</span>
                  ) : (
                    <span className="text-green-600">✓ Mot de passe valide</span>
                  )}
                </p>
              )}
            </div>

            {/* Confirmation */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Retapez le nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formData.confirmPassword && (
                <p className="mt-1 text-xs">
                  {formData.newPassword === formData.confirmPassword ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <FaCheck /> Les mots de passe correspondent
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <FaTimes /> Les mots de passe ne correspondent pas
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {message}
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Modification en cours...
                </>
              ) : (
                <>
                  <FaLock />
                  Modifier le mot de passe
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

export default React.memo(DashboardSettings)


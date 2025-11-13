import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
  FaEnvelope,
  FaDiscord,
  FaUndo
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import DashboardLayout from '../components/DashboardLayout'

const DEFAULT_DISCORD_INVITE = 'https://discord.gg/Hhvme4gN'

const DashboardSettings = () => {
  const { user, profile, isAdmin } = useAuth()
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [discordLink, setDiscordLink] = useState(DEFAULT_DISCORD_INVITE)
  const [discordLoading, setDiscordLoading] = useState(false)
  const [discordMessage, setDiscordMessage] = useState(null)

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    let isMounted = true

    const fetchDiscordLink = async () => {
      if (!isAdmin()) return
      try {
        setDiscordLoading(true)
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'discord_link')
          .maybeSingle()

        if (error && error.code !== '42P01') {
          throw error
        }

        if (isMounted) {
          setDiscordLink(data?.value || DEFAULT_DISCORD_INVITE)
        }
      } catch (err) {
        console.error('Erreur chargement lien Discord:', err)
        if (isMounted) {
          setDiscordMessage({
            type: 'error',
            text: err.message || 'Impossible de charger le lien Discord.'
          })
          setDiscordLink(DEFAULT_DISCORD_INVITE)
        }
      } finally {
        if (isMounted) {
          setDiscordLoading(false)
        }
      }
    }

    fetchDiscordLink()

    return () => {
      isMounted = false
    }
  }, [isAdmin])

  useEffect(() => {
    if (discordMessage?.text) {
      const timer = setTimeout(() => setDiscordMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [discordMessage])

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

  const handleSaveDiscordLink = async () => {
    if (!isAdmin()) return

    const trimmed = (discordLink || '').trim()
    if (!trimmed) {
      setDiscordMessage({ type: 'error', text: 'Le lien Discord ne peut pas être vide.' })
      return
    }

    try {
      setDiscordLoading(true)
      setDiscordMessage(null)
      const { error } = await supabase
        .from('settings')
        .upsert(
          {
            key: 'discord_link',
            value: trimmed,
            updated_at: new Date().toISOString(),
            updated_by: user?.id || null
          },
          { onConflict: 'key' }
        )

      if (error) throw error

      setDiscordMessage({ type: 'success', text: 'Lien Discord mis à jour avec succès.' })
      setDiscordLink(trimmed)
    } catch (err) {
      console.error('Erreur mise à jour lien Discord:', err)
      setDiscordMessage({
        type: 'error',
        text: err.message || 'Erreur lors de l\'enregistrement du lien Discord.'
      })
    } finally {
      setDiscordLoading(false)
    }
  }

  const handleResetDiscordLink = () => {
    setDiscordLink(DEFAULT_DISCORD_INVITE)
    setDiscordMessage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

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

      if (user?.email !== profile.email) {
        setError('L\'email de votre compte ne correspond pas. Veuillez vous reconnecter.')
        setLoading(false)
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: formData.oldPassword
      })

      if (signInError) {
        setError('Mot de passe actuel incorrect')
        setLoading(false)
        return
      }

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

      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (updateError) {
        setError(updateError.message || 'Erreur lors de la mise à jour du mot de passe')
        setLoading(false)
        return
      }

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

        {isAdmin() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <FaDiscord className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Configuration de la communauté
                </h2>
                <p className="text-sm text-gray-500">
                  Modifiez le lien d&apos;invitation Discord visible par les utilisateurs.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Lien d&apos;invitation Discord
              </label>
              <input
                type="url"
                value={discordLink}
                onChange={(e) => setDiscordLink(e.target.value)}
                placeholder={DEFAULT_DISCORD_INVITE}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={discordLoading}
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDiscordLink}
                  disabled={discordLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {discordLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Sauvegarder
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleResetDiscordLink}
                  disabled={discordLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <FaUndo />
                  Valeur par défaut
                </button>
              </div>
              {discordMessage && (
                <div
                  className={`px-3 py-2 rounded-lg text-sm ${
                    discordMessage.type === 'error'
                      ? 'bg-red-50 border border-red-200 text-red-700'
                      : 'bg-green-50 border border-green-200 text-green-700'
                  }`}
                >
                  {discordMessage.text}
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
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

                if (!profile) {
                  alert('Erreur : votre profil n\'existe pas dans notre système. Veuillez contacter le support.')
                  return
                }

                if (!profile.is_active) {
                  alert('Votre compte est désactivé. Veuillez contacter le support.')
                  return
                }

                if (user.email !== profile.email) {
                  alert('Erreur : l\'email ne correspond pas. Veuillez vous reconnecter.')
                  return
                }

                if (!confirm(`Envoyer un email de réinitialisation à ${user.email} ?`)) {
                  return
                }

                try {
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
                    redirectTo
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

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
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


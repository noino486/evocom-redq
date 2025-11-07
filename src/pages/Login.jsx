import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaLock, FaEnvelope, FaArrowLeft } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'

const Login = () => {
  const [searchParams] = useSearchParams()
  const isInvited = searchParams.get('invited') === 'true'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [isSettingPassword, setIsSettingPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // États pour "Mot de passe oublié"
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetEmailSent, setResetEmailSent] = useState(false)
  
  // États pour la réinitialisation de mot de passe (après clic sur le lien email)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  const handleInviteToken = async (accessToken, refreshToken) => {
    try {
      console.log('[Login] Échange du token d\'invitation contre une session...')
      
      // Si on a un refresh_token, l'utiliser pour créer une session
      if (refreshToken) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken || '',
          refresh_token: refreshToken
        })
        
        if (sessionError) {
          console.error('[Login] Erreur setSession:', sessionError)
          setError('Le lien d\'invitation est invalide ou a expiré.')
          return
        }
        
        if (sessionData?.user) {
          setEmail(sessionData.user.email || '')
          console.log('[Login] Session créée, email:', sessionData.user.email)
        }
      } else if (accessToken) {
        // Alternative: utiliser exchangeCodeForSession si disponible
        // Ou simplement stocker le token et l'utiliser lors de la définition du mot de passe
        setError('Format de token non supporté. Veuillez utiliser le lien complet depuis l\'email.')
      }
    } catch (err) {
      console.error('[Login] Erreur handleInviteToken:', err)
      setError('Erreur lors du traitement de l\'invitation.')
    }
  }

  // Vérifier si on vient d'une invitation (hash dans l'URL)
  useEffect(() => {
    // Supabase Auth place le token dans l'URL hash après invitation ou réinitialisation
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const type = hashParams.get('type')
    const searchParams = new URLSearchParams(window.location.search)
    const recoveryParam = searchParams.get('recovery')
    
    // Vérifier si c'est une invitation
    if ((accessToken || refreshToken) && type === 'invite') {
      console.log('[Login] Token d\'invitation détecté')
      setIsSettingPassword(true)
      setSuccessMessage('Invitation acceptée ! Définissez maintenant votre mot de passe.')
      
      // Échanger le token contre une session
      handleInviteToken(accessToken, refreshToken)
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname + '?invited=true')
    }
    
    // Vérifier si c'est une réinitialisation de mot de passe
    if ((accessToken || refreshToken) && (type === 'recovery' || recoveryParam === 'true')) {
      console.log('[Login] Token de réinitialisation détecté')
      setIsResettingPassword(true)
      setSuccessMessage('Vous pouvez maintenant définir votre nouveau mot de passe.')
      
      // Échanger le token contre une session
      handleInviteToken(accessToken, refreshToken)
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname + '?recovery=true')
    }
  }, [])

  const handleSetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!password || password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    try {
      console.log('[Login] Définition du mot de passe...')
      
      // Mettre à jour le mot de passe de l'utilisateur
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        console.error('[Login] Erreur updateUser:', updateError)
        setError(updateError.message || 'Erreur lors de la définition du mot de passe')
        setLoading(false)
        return
      }

      console.log('[Login] Mot de passe défini avec succès')
      
      // Récupérer l'utilisateur pour avoir son ID
      const { data: { user }, error: getUserError } = await supabase.auth.getUser()
      
      if (getUserError || !user) {
        console.error('[Login] Erreur récupération utilisateur:', getUserError)
        setError('Erreur lors de la récupération de l\'utilisateur')
        setLoading(false)
        return
      }

      // Activer le profil utilisateur maintenant qu'il a défini son mot de passe
      // Utiliser une fonction RPC pour contourner les restrictions RLS
      console.log('[Login] Activation du profil pour userId:', user.id)
      
      // Méthode 1 : Essayer avec la fonction RPC si elle existe
      const { error: rpcError } = await supabase.rpc('activate_own_profile')
      
      if (rpcError) {
        console.warn('[Login] Fonction activate_own_profile non disponible, tentative directe:', rpcError)
        
        // Méthode 2 : Essayer de mettre à jour directement
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ 
            is_active: true,
            updated_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          })
          .eq('id', user.id)
        
        if (profileError) {
          console.error('[Login] Erreur activation profil (RLS probable):', profileError)
          console.warn('[Login] Le profil sera activé manuellement ou via SQL. L\'utilisateur peut se connecter.')
          
          // Afficher un message informatif si l'erreur est liée aux permissions
          if (profileError.code === '42501' || profileError.message?.includes('permission')) {
            console.warn('[Login] Problème de permissions RLS. Exécutez FIX_ACTIVATE_PROFILE.sql dans Supabase.')
          }
        } else {
          console.log('[Login] Profil activé avec succès (méthode directe)')
        }
      } else {
        console.log('[Login] Profil activé avec succès (via RPC)')
      }
      
      // Attendre que la session soit rafraîchie et que le contexte recharge le profil
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Rediriger vers le dashboard
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('[Login] Exception:', err)
      setError('Une erreur est survenue lors de la définition du mot de passe')
      setLoading(false)
    }
  }

  // Gérer la réinitialisation de mot de passe après clic sur le lien email
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!newPassword || newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    try {
      console.log('[Login] Réinitialisation du mot de passe...')
      
      // Vérifier que l'utilisateur a bien une session valide
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !currentUser) {
        console.error('[Login] Pas de session valide:', userError)
        setError('Votre session a expiré. Veuillez redemander un nouveau lien de réinitialisation.')
        setLoading(false)
        return
      }

      // Vérifier que le profil existe dans user_profiles
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, is_active')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (profileError) {
        console.error('[Login] Erreur vérification profil:', profileError)
        setError('Erreur lors de la vérification de votre compte. Veuillez contacter le support.')
        setLoading(false)
        return
      }

      if (!profileData) {
        console.error('[Login] Profil non trouvé pour:', currentUser.id)
        setError('Votre profil n\'existe pas dans notre système. Veuillez contacter le support.')
        setLoading(false)
        return
      }

      if (!profileData.is_active) {
        console.error('[Login] Profil inactif pour:', currentUser.id)
        setError('Votre compte est désactivé. Veuillez contacter le support.')
        setLoading(false)
        return
      }

      // Vérifier que l'email correspond
      if (currentUser.email !== profileData.email) {
        console.error('[Login] Email mismatch:', currentUser.email, 'vs', profileData.email)
        setError('Erreur : l\'email ne correspond pas. Veuillez contacter le support.')
        setLoading(false)
        return
      }
      
      // Mettre à jour le mot de passe
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        console.error('[Login] Erreur updateUser:', updateError)
        setError(updateError.message || 'Erreur lors de la réinitialisation du mot de passe')
        setLoading(false)
        return
      }

      console.log('[Login] Mot de passe réinitialisé avec succès')
      setSuccessMessage('Mot de passe réinitialisé avec succès ! Redirection...')
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('[Login] Exception:', err)
      setError('Une erreur est survenue lors de la réinitialisation du mot de passe')
      setLoading(false)
    }
  }

  // Envoyer l'email de réinitialisation de mot de passe
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!resetEmail || !resetEmail.includes('@')) {
      setError('Veuillez entrer une adresse email valide')
      setLoading(false)
      return
    }

    try {
      const normalizedEmail = resetEmail.trim().toLowerCase()
      const rawEmail = resetEmail.trim()
      console.log('[Login] Vérification de l\'existence de l\'email dans la DB:', rawEmail)
      
      // Vérifier le statut du profil via une fonction RPC (contourne les politiques RLS)
      let profileStatus = null
      let shouldValidateProfile = true

      const { data: profileRpcData, error: profileRpcError } = await supabase
        .rpc('check_profile_status_by_email', { p_email: normalizedEmail })

      if (profileRpcError) {
        shouldValidateProfile = false
        console.warn('[Login] Impossible de vérifier le profil via RPC:', profileRpcError)
        console.warn('[Login] Fallback: on tente tout de même l\'envoi du lien de réinitialisation.')
      } else {
        profileStatus = Array.isArray(profileRpcData) ? profileRpcData[0] ?? null : profileRpcData ?? null
      }

      if (shouldValidateProfile) {
        // Si l'email n'existe pas dans user_profiles
        if (!profileStatus) {
          console.log('[Login] Email non trouvé via RPC dans user_profiles:', rawEmail)
          // Pour la sécurité, on affiche le même message même si l'email n'existe pas
          setResetEmailSent(true)
          setSuccessMessage('Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.')
          setLoading(false)
          return
        }

        // Si le profil existe mais est inactif
        if (!profileStatus.is_active) {
          console.log('[Login] Profil inactif (RPC) pour:', rawEmail)
          setError('Votre compte n\'est pas actif. Veuillez contacter le support.')
          setLoading(false)
          return
        }
      }

      console.log('[Login] Email trouvé et actif, envoi de l\'email de réinitialisation')
      
      // Déterminer l'URL de redirection
      const siteUrl = window.location.origin
      const redirectTo = `${siteUrl}/login?recovery=true`
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(rawEmail, {
        redirectTo: redirectTo
      })

      if (resetError) {
        console.error('[Login] Erreur resetPasswordForEmail:', resetError)
        // Même message générique pour la sécurité
        setResetEmailSent(true)
        setSuccessMessage('Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.')
        setLoading(false)
        return
      }

      console.log('[Login] Email de réinitialisation envoyé avec succès')
      setResetEmailSent(true)
      setSuccessMessage('Un email de réinitialisation a été envoyé ! Vérifiez votre boîte mail.')
    } catch (err) {
      console.error('[Login] Exception:', err)
      // Message générique pour la sécurité
      setResetEmailSent(true)
      setSuccessMessage('Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Si on est en mode "définition de mot de passe", utiliser handleSetPassword
    if (isSettingPassword) {
      return handleSetPassword(e)
    }
    
    // Si on est en mode "réinitialisation", utiliser handleResetPassword
    if (isResettingPassword) {
      return handleResetPassword(e)
    }
    
    console.log('[Login] handleSubmit appele')
    setLoading(true)
    setError('')

    try {
      console.log('[Login] Appel de signIn...')
      const result = await signIn(email, password)

      if (result.success) {
        console.log('[Login] Connexion reussie, redirection...')
        // Attendre un peu pour que le profil soit chargé
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('[Login] Navigation vers /dashboard')
        // Rediriger vers le dashboard
        navigate('/dashboard', { replace: true })
      } else {
        console.error('[Login] Echec de connexion:', result.error)
        setError(result.error || 'Erreur de connexion')
        setLoading(false)
      }
    } catch (err) {
      console.error('[Login] Exception:', err)
      setError('Une erreur est survenue lors de la connexion')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 max-w-md w-full mx-4 shadow-xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 gradient-text">
            {isResettingPassword ? 'Réinitialiser votre mot de passe' :
             isSettingPassword ? 'Créer votre compte' :
             isForgotPassword ? 'Mot de passe oublié' :
             'Connexion'}
          </h1>
          <p className="text-gray-600">
            {isResettingPassword 
              ? 'Entrez votre nouveau mot de passe' 
              : isSettingPassword 
                ? 'Définissez votre mot de passe pour finaliser votre inscription' 
                : isForgotPassword
                  ? 'Entrez votre email pour recevoir un lien de réinitialisation'
                  : 'Accédez à votre espace client'}
          </p>
        </div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2"
          >
            <FaCheckCircle />
            <span>{successMessage}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}

        {/* Formulaire Mot de passe oublié */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            {resetEmailSent ? (
              <div className="text-center space-y-4">
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                  <FaEnvelope className="mx-auto mb-2 text-2xl" />
                  <p className="font-semibold">Email envoyé !</p>
                  <p className="text-sm mt-1">
                    Un email de réinitialisation a été envoyé à <strong>{resetEmail}</strong>
                  </p>
                  <p className="text-xs mt-2">Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false)
                    setResetEmailSent(false)
                    setResetEmail('')
                    setSuccessMessage('')
                  }}
                  className="text-primary hover:underline text-sm flex items-center justify-center gap-2"
                >
                  <FaArrowLeft />
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="votre@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary via-secondary to-accent text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <FaEnvelope />
                      Envoyer le lien de réinitialisation
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false)
                    setResetEmail('')
                    setError('')
                    setSuccessMessage('')
                  }}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm flex items-center justify-center gap-2"
                >
                  <FaArrowLeft />
                  Retour à la connexion
                </button>
              </>
            )}
          </form>
        ) : isResettingPassword ? (
          /* Formulaire de réinitialisation (après clic sur le lien email) */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                placeholder="votre@email.com"
                disabled={true}
              />
              <p className="mt-1 text-xs text-gray-500">Cet email ne peut pas être modifié</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimum 6 caractères</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {confirmNewPassword && newPassword !== confirmNewPassword && (
                <p className="mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || newPassword !== confirmNewPassword || !newPassword || newPassword.length < 6}
              className="w-full bg-gradient-to-r from-primary via-secondary to-accent text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Réinitialisation en cours...
                </>
              ) : (
                <>
                  <FaLock />
                  Réinitialiser le mot de passe
                </>
              )}
            </button>
          </form>
        ) : (
          /* Formulaire de connexion normal */
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSettingPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                  placeholder="votre@email.com"
                  required
                  disabled={true}
                />
                <p className="mt-1 text-xs text-gray-500">Cet email ne peut pas être modifié</p>
              </div>
            )}

            {!isSettingPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="votre@email.com"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isSettingPassword ? 'Nouveau mot de passe' : 'Mot de passe'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {isSettingPassword && (
                <p className="mt-1 text-xs text-gray-500">Minimum 6 caractères</p>
              )}
            </div>

            {isSettingPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isSettingPassword && password !== confirmPassword)}
              className="w-full bg-gradient-to-r from-primary via-secondary to-accent text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  {isSettingPassword ? 'Création en cours...' : 'Connexion en cours...'}
                </>
              ) : (
                isSettingPassword ? 'Créer mon compte' : 'Se connecter'
              )}
            </button>

            {!isSettingPassword && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            <a href="mailto:support@evoecom.com" className="text-primary hover:underline">
              Besoin d'aide ?
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login


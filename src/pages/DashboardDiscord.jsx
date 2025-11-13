import React from 'react'
import { motion } from 'framer-motion'
import {
  FaDiscord,
  FaUsers,
  FaGraduationCap,
  FaBolt,
  FaShieldAlt
} from 'react-icons/fa'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'

const DISCORD_INVITE_URL = import.meta.env.VITE_DISCORD_INVITE_URL || null
const hasDiscordInvite = Boolean(DISCORD_INVITE_URL)

const featureCards = [
  {
    icon: FaUsers,
    title: 'Réseau privé',
    description: 'Accédez à une communauté d’entrepreneurs engagés autour du Pack Global Business.'
  },
  {
    icon: FaGraduationCap,
    title: 'Sessions live',
    description: 'Participez aux ateliers mensuels, Q&A et retours d’expérience avec l’équipe EvoEcom.'
  },
  {
    icon: FaBolt,
    title: 'Alertes exclusives',
    description: 'Recevez en priorité les nouvelles ressources, deals fournisseurs et mises à jour produit.'
  }
]

const securityHighlights = [
  {
    icon: FaShieldAlt,
    title: 'Accès réservé',
    description: 'Seuls les membres actifs du Pack Global Business peuvent rejoindre le serveur.'
  },
  {
    icon: FaDiscord,
    title: 'Onboarding guidé',
    description: 'Un canal de bienvenue pour configurer votre compte et découvrir toutes les fonctionnalités.'
  }
]

const DashboardDiscord = () => {
  const { profile } = useAuth()
  const hasAccess = profile?.is_active && profile?.access_level >= 2

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Accès réservé au Pack Global Business
          </h2>
          <p className="text-gray-600">
            Cette page est accessible uniquement aux membres avec un accès Pack Global Business actif.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div id="discord" className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl border border-slate-700"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <FaDiscord className="text-2xl text-indigo-300" />
                <span className="text-sm font-semibold tracking-wide uppercase text-indigo-100">
                  Communauté EvoEcom
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                Rejoignez le serveur Discord privé du Pack Global Business
              </h1>
              <p className="text-base sm:text-lg text-slate-200">
                Discutez en direct avec l’équipe, partagez vos réussites, obtenez des retours sur vos projets
                et profitez d’un accompagnement continu pour accélérer votre croissance.
              </p>
            </div>
            {hasDiscordInvite ? (
              <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-4">
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 transition-colors rounded-xl font-semibold text-white shadow-lg shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  Rejoindre le serveur Discord
                </a>
                <p className="text-xs text-slate-300 text-center max-w-xs">
                  L’invitation est strictement réservée aux membres actifs du Pack Global Business.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/20 bg-white/10 px-5 py-4 text-center text-sm text-indigo-100">
                Configurez la variable <code className="font-mono text-indigo-50">VITE_DISCORD_INVITE_URL</code> pour
                activer le bouton d’invitation.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 md:grid-cols-3"
        >
          {featureCards.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
                <Icon className="text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Ce qui vous attend en nous rejoignant
            </h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                Canaux thématiques pour le sourcing, le marketing, la logistique et la finance.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                Débriefs réguliers des nouveaux fournisseurs et ressources ajoutées au pack.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                Support prioritaire via un canal dédié à vos questions business.
              </li>
            </ul>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {securityHighlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <Icon className="text-indigo-500 text-xl mb-3" />
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Comment se passe l’onboarding ?
            </h2>
            <ol className="space-y-3 text-sm text-slate-600 list-decimal list-inside">
              <li>Utilisez le bouton de cette page pour ouvrir l’invitation privée.</li>
              <li>Validez votre accès via le canal <span className="font-medium text-slate-800">#welcome</span>.</li>
              <li>Présentez votre activité dans <span className="font-medium text-slate-800">#introductions</span> afin que l’équipe puisse vous orienter.</li>
              <li>Rejoignez les canaux thématiques qui correspondent à vos objectifs (sourcing, marketing, finance, etc.).</li>
            </ol>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Besoin d’aide ? Ouvrez un ticket dans <span className="font-medium text-slate-800">#support-prioritaire</span>,
              l’équipe vous répond en priorité dans les 24&nbsp;heures.
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

export default React.memo(DashboardDiscord)



import React, { useEffect, useState } from 'react'
import { FaDiscord, FaUsers, FaComments } from 'react-icons/fa'
import { supabase } from '../config/supabase'
import DashboardLayout from '../components/DashboardLayout'

const DEFAULT_DISCORD_INVITE = 'https://discord.gg/Hhvme4gN'

const DashboardCommunity = () => {
  const [discordLink, setDiscordLink] = useState(DEFAULT_DISCORD_INVITE)
  const [loadingLink, setLoadingLink] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchDiscordLink = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'discord_link')
          .maybeSingle()

        if (error && error.code !== '42P01') {
          throw error
        }

        if (data?.value && isMounted) {
          setDiscordLink(data.value)
        }
      } catch (err) {
        console.error('Erreur lors du chargement du lien Discord:', err)
      } finally {
        if (isMounted) {
          setLoadingLink(false)
        }
      }
    }

    fetchDiscordLink()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-2xl shadow">
              <FaDiscord />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Notre Communauté Discord
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Rejoignez les entrepreneurs EvoEcom pour partager vos expériences, poser vos questions et rester informé des dernières nouveautés.
              </p>
            </div>
          </div>
          <a
            href={discordLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow transition-colors ${
              loadingLink ? 'opacity-70 cursor-wait' : 'hover:bg-primary/90'
            }`}
            onClick={(event) => {
              if (loadingLink) {
                event.preventDefault()
              }
            }}
          >
            <FaDiscord className="text-lg" />
            {loadingLink ? 'Chargement...' : 'Rejoindre la communauté'}
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xl">
                <FaUsers />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Un réseau d&apos;experts
              </h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Accédez à une communauté active d&apos;entrepreneurs, de mentors et de spécialistes du e-commerce. Profitez d&apos;un espace convivial pour trouver du support, partager vos réussites et collaborer sur vos projets.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center text-xl">
                <FaComments />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Infos &amp; événements
              </h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Recevez en avant-première les annonces d&apos;EvoEcom, participez aux sessions live, et ne manquez aucune opportunité pour faire évoluer votre business.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default React.memo(DashboardCommunity)



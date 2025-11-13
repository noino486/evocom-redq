import React, { useEffect, useState } from 'react'
import { FaDiscord, FaUsers, FaComments } from 'react-icons/fa'
import { Users, TrendingUp, Sparkles } from 'lucide-react'
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
      <div className="space-y-10">
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl shadow-2xl border border-primary/20 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="bg-gradient-to-br from-primary via-secondary to-accent p-8 lg:p-10 text-white">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
                <FaDiscord className="w-8 h-8" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                Notre Discord
              </h1>
              <p className="text-white/80 text-base lg:text-lg mb-8 max-w-xl">
                Accédez au serveur privé EvoEcom pour échanger avec les membres du Pack Global Business, obtenir des réponses rapides et profiter d&apos;opportunités exclusives.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1">Communauté engagée</p>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Retrouvez des entrepreneurs ambitieux, disponibles pour partager leurs retours d&apos;expérience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1">Accompagnement continu</p>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Recevez des conseils concrets, suivez les tendances et faites évoluer votre business plus vite.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1">Bonus exclusifs</p>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Accédez en priorité aux nouveaux modules, ressources et événements d&apos;EvoEcom.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-10 flex flex-col justify-center items-center text-center bg-gradient-to-br from-white via-blue-50/60 to-purple-50/40">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-3xl mb-6 relative">
                <FaDiscord className="w-12 h-12 text-primary" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Serveur Discord Privé
              </h2>
              <p className="text-gray-600 mb-6">
                Inclus avec votre accès Pack Global Business. Rejoignez-nous et développez votre réseau.
              </p>

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
                {loadingLink ? 'Chargement...' : 'Rejoindre le Discord'}
              </a>

              <div className="mt-8 pt-6 border-t border-gray-200 w-full">
                <p className="text-base text-gray-700 font-medium">
                  ✨ Accès réservé aux membres du Pack Global Business
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/90 backdrop-blur border border-white/60 rounded-2xl p-6 lg:p-7 shadow-lg">
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

          <div className="bg-white/90 backdrop-blur border border-white/60 rounded-2xl p-6 lg:p-7 shadow-lg">
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



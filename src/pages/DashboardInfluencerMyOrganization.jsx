import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaCalendar, FaPhone, FaFileAlt, FaSpinner, FaCheck, FaClock, 
  FaExclamationTriangle, FaEye, FaChevronLeft, FaChevronRight, FaTimes
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import DashboardLayout from '../components/DashboardLayout'

const DashboardInfluencerMyOrganization = () => {
  const { user, profile } = useAuth()
  const [workspace, setWorkspace] = useState(null)
  const [calendarEvents, setCalendarEvents] = useState([])
  const [calls, setCalls] = useState([])
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showDayDetails, setShowDayDetails] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [dayDetailsData, setDayDetailsData] = useState({ events: [], calls: [], content: [] })
  const [expandedText, setExpandedText] = useState(null) // { type: 'event'|'call'|'content', id: string, text: string, title: string }

  useEffect(() => {
    if (user) {
      loadMyWorkspace()
    }
  }, [user])

  const loadMyWorkspace = async () => {
    try {
      setLoading(true)
      
      // Vérifier si l'utilisateur a un workspace actif
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('influencer_workspaces')
        .select('*')
        .eq('influencer_id', user.id)
        .eq('is_active', true)
        .single()

      if (workspaceError && workspaceError.code === 'PGRST116') {
        // Pas de workspace
        setWorkspace(null)
        setLoading(false)
        return
      }

      if (workspaceError) throw workspaceError

      setWorkspace(workspaceData)

      // Charger les données
      await Promise.all([
        loadCalendarEvents(workspaceData.id),
        loadCalls(workspaceData.id),
        loadContent(workspaceData.id)
      ])
    } catch (error) {
      console.error('Erreur lors du chargement du workspace:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCalendarEvents = async (workspaceId) => {
    try {
      const { data, error } = await supabase
        .from('influencer_calendar_events')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('event_date', { ascending: true })
        .order('event_time', { ascending: true })

      if (error) throw error
      setCalendarEvents(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
    }
  }

  const loadCalls = async (workspaceId) => {
    try {
      const { data, error } = await supabase
        .from('influencer_calls')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('call_date', { ascending: true })
        .order('call_time', { ascending: true })

      if (error) throw error
      setCalls(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des appels:', error)
    }
  }

  const loadContent = async (workspaceId) => {
    try {
      const { data, error } = await supabase
        .from('influencer_content')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('deadline', { ascending: true })

      if (error) throw error
      setContent(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement du contenu:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800',
      todo: 'bg-gray-100 text-gray-800',
      review: 'bg-purple-100 text-purple-800',
      validated: 'bg-green-100 text-green-800',
      published: 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const translateStatus = (status) => {
    const translations = {
      pending: 'En attente',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
      scheduled: 'Planifié',
      todo: 'À faire',
      review: 'En révision',
      validated: 'Validé',
      published: 'Publié',
      rescheduled: 'Reporté'
    }
    return translations[status] || status
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  // Fonctions pour le calendrier
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getEventsForDate = (date) => {
    if (!date) return []
    try {
      const dateStr = date.toISOString().split('T')[0]
      return calendarEvents.filter(event => {
        if (!event || !event.event_date) return false
        try {
          const eventDateObj = new Date(event.event_date)
          if (isNaN(eventDateObj.getTime())) return false
          const eventDate = eventDateObj.toISOString().split('T')[0]
          return eventDate === dateStr
        } catch (e) {
          console.error('Error parsing event date:', e, event)
          return false
        }
      })
    } catch (e) {
      console.error('Error in getEventsForDate:', e)
      return []
    }
  }

  const getCallsForDate = (date) => {
    if (!date) return []
    try {
      const dateStr = date.toISOString().split('T')[0]
      return calls.filter(call => {
        if (!call || !call.call_date) return false
        try {
          const callDateObj = new Date(call.call_date)
          if (isNaN(callDateObj.getTime())) return false
          const callDate = callDateObj.toISOString().split('T')[0]
          return callDate === dateStr
        } catch (e) {
          console.error('Error parsing call date:', e, call)
          return false
        }
      })
    } catch (e) {
      console.error('Error in getCallsForDate:', e)
      return []
    }
  }

  const getContentForDate = (date) => {
    if (!date) return []
    try {
      const dateStr = date.toISOString().split('T')[0]
      return content.filter(item => {
        if (!item || !item.deadline) return false
        try {
          const contentDateObj = new Date(item.deadline)
          if (isNaN(contentDateObj.getTime())) return false
          const contentDate = contentDateObj.toISOString().split('T')[0]
          return contentDate === dateStr
        } catch (e) {
          console.error('Error parsing content deadline:', e, item)
          return false
        }
      })
    } catch (e) {
      console.error('Error in getContentForDate:', e)
      return []
    }
  }

  const getAllItemsForDate = (date) => {
    if (!date) {
      console.warn('getAllItemsForDate: date is null or undefined')
      return { events: [], calls: [], content: [] }
    }
    try {
      const events = getEventsForDate(date) || []
      const calls = getCallsForDate(date) || []
      const content = getContentForDate(date) || []
      return {
        events: Array.isArray(events) ? events : [],
        calls: Array.isArray(calls) ? calls : [],
        content: Array.isArray(content) ? content : []
      }
    } catch (error) {
      console.error('Error in getAllItemsForDate:', error)
      return { events: [], calls: [], content: [] }
    }
  }

  const handleDayClick = (date, e) => {
    if (!date) {
      console.warn('handleDayClick: date is null or undefined')
      return
    }
    
    // Empêcher la propagation si on clique directement sur un événement/call/contenu
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    
    try {
      const dayItems = getAllItemsForDate(date)
      if (!dayItems) {
        console.warn('handleDayClick: dayItems is null')
        return
      }
      
      const hasItems = (dayItems.events && dayItems.events.length > 0) || 
                      (dayItems.calls && dayItems.calls.length > 0) || 
                      (dayItems.content && dayItems.content.length > 0)
      
      if (hasItems) {
        // Créer une nouvelle instance de date pour éviter les problèmes de référence
        const newDate = new Date(date.getTime())
        setSelectedDate(newDate)
        setDayDetailsData({
          events: Array.isArray(dayItems.events) ? dayItems.events : [],
          calls: Array.isArray(dayItems.calls) ? dayItems.calls : [],
          content: Array.isArray(dayItems.content) ? dayItems.content : []
        })
        setShowDayDetails(true)
      }
    } catch (error) {
      console.error('Error in handleDayClick:', error, { date })
      // Ne pas planter l'application, juste logger l'erreur
    }
  }

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const getEventColor = (event) => {
    if (!event) return '#3B82F6'
    const color = event.color
    if (!color || typeof color !== 'string') return '#3B82F6'
    // Vérifier que c'est une couleur hex valide
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      return color
    }
    return '#3B82F6'
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  // Fonction pour tronquer le texte
  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return { text, isTruncated: false }
    return {
      text: text.substring(0, maxLength) + '...',
      isTruncated: true,
      fullText: text
    }
  }

  const handleReadMore = (type, id, text, title) => {
    setExpandedText({ type, id, text, title })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <FaSpinner className="animate-spin text-4xl text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!workspace) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun workspace actif
          </h2>
          <p className="text-gray-600">
            Votre workspace n'a pas encore été activé par un administrateur.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mon Organisation
          </h1>
          <p className="text-gray-600">
            Consultez votre calendrier et vos tâches
          </p>
        </motion.div>

        {/* Module 1: Calendrier */}
        <motion.div 
          className="bg-white rounded-lg border border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="p-6 border-b border-gray-200 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <FaCalendar className="text-primary text-xl" />
              <h2 className="text-xl font-semibold text-gray-900">Calendrier</h2>
            </div>
            <span className="text-sm text-gray-500">Cliquez sur un jour pour voir les détails</span>
          </motion.div>
          <div className="p-6">
            {/* Calendrier interactif */}
            <motion.div 
              className="bg-white border border-gray-200 rounded-lg p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {/* En-tête du calendrier avec navigation */}
              <div className="flex items-center justify-between mb-4">
                <motion.button
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Mois précédent"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaChevronLeft />
                </motion.button>
                <motion.h4 
                  className="text-lg font-semibold text-gray-900"
                  key={currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </motion.h4>
                <motion.button
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Mois suivant"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaChevronRight />
                </motion.button>
              </div>

              {/* Jours de la semaine */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille du calendrier */}
              <motion.div 
                className="grid grid-cols-7 gap-1"
                key={currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, staggerChildren: 0.02 }}
              >
                {getDaysInMonth(currentMonth).map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />
                  }
                  
                  try {
                    const dayEvents = getEventsForDate(date) || []
                    const dayCalls = getCallsForDate(date) || []
                    const dayContent = getContentForDate(date) || []
                    const totalItems = (dayEvents?.length || 0) + (dayCalls?.length || 0) + (dayContent?.length || 0)
                    
                    const isSelected = selectedDate && 
                      date.getDate() === selectedDate.getDate() &&
                      date.getMonth() === selectedDate.getMonth() &&
                      date.getFullYear() === selectedDate.getFullYear()
                    const today = isToday(date)
                    
                    return (
                      <motion.button
                        key={`${date.getTime()}-${index}`}
                        onClick={(e) => {
                          try {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDayClick(date, e)
                          } catch (error) {
                            console.error('Error in button onClick:', error)
                          }
                        }}
                        disabled={totalItems === 0}
                        type="button"
                        className={`aspect-square border rounded-lg p-1 transition-colors relative ${
                          today ? 'border-primary border-2' : 'border-gray-200'
                        } ${isSelected ? 'bg-primary/10' : ''} ${
                          totalItems > 0 ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default opacity-50'
                        }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.01 }}
                        whileHover={totalItems > 0 ? { scale: 1.05, zIndex: 10 } : {}}
                        whileTap={totalItems > 0 ? { scale: 0.95 } : {}}
                      >
                      <div className={`text-sm font-medium ${today ? 'text-primary' : 'text-gray-900'}`}>
                        {date.getDate()}
                      </div>
                      {totalItems > 0 && (
                        <motion.div 
                          className="mt-1 space-y-0.5"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* Événements */}
                          {dayEvents.slice(0, 1).map((event) => (
                            <motion.div
                              key={event.id}
                              className="event-item text-xs px-1 py-0.5 rounded truncate pointer-events-none"
                              style={{
                                backgroundColor: getEventColor(event) + '20',
                                color: getEventColor(event),
                                borderLeft: `3px solid ${getEventColor(event)}`
                              }}
                              title={event.title || 'Événement'}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              {event.title || 'Événement'}
                            </motion.div>
                          ))}
                          {/* Calls */}
                          {dayCalls.slice(0, 1).map((call) => {
                            if (!call || !call.id) return null
                            return (
                              <motion.div
                                key={call.id}
                                className="call-item text-xs px-1 py-0.5 rounded truncate bg-blue-100 text-blue-800 border-l-2 border-blue-500 pointer-events-none"
                                title={call.title || 'Appel'}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: 0.05 }}
                                whileHover={{ scale: 1.05 }}
                              >
                                📞 {call.title || 'Appel'}
                              </motion.div>
                            )
                          })}
                          {/* Contenu */}
                          {dayContent.slice(0, 1).map((item) => {
                            if (!item || !item.id) return null
                            return (
                              <motion.div
                                key={item.id}
                                className="content-item text-xs px-1 py-0.5 rounded truncate bg-purple-100 text-purple-800 border-l-2 border-purple-500 pointer-events-none"
                                title={item.title || 'Contenu'}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                whileHover={{ scale: 1.05 }}
                              >
                                📝 {item.title || 'Contenu'}
                              </motion.div>
                            )
                          })}
                          {totalItems > 3 && (
                            <motion.div 
                              className="text-xs text-gray-500"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2, delay: 0.15 }}
                            >
                              +{totalItems - 3}
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </motion.button>
                    )
                  } catch (error) {
                    console.error('Error rendering calendar day:', error, { date, index })
                    return (
                      <div key={`error-${index}`} className="aspect-square border border-red-200 rounded-lg p-1">
                        <div className="text-xs text-red-500">Erreur</div>
                      </div>
                    )
                  }
                })}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Modal vue détaillée d'un jour (lecture seule) */}
        {showDayDetails && selectedDate && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowDayDetails(false)
              setSelectedDate(null)
            }}
          >
            <motion.div 
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div 
                className="flex items-center justify-between mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold">
                  {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <motion.button 
                  onClick={() => {
                    setShowDayDetails(false)
                    setSelectedDate(null)
                  }} 
                  className="text-gray-400 hover:text-gray-600"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes />
                </motion.button>
              </motion.div>

              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Événements */}
                {dayDetailsData.events.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <FaCalendar className="text-primary" />
                      <h4 className="font-semibold text-gray-900">Événements ({dayDetailsData.events.length})</h4>
                    </div>
                    <div className="space-y-2">
                      {dayDetailsData.events.map((event, idx) => (
                        <motion.div 
                          key={event.id} 
                          className="border border-gray-200 rounded-lg p-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + idx * 0.05 }}
                          whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getEventColor(event) }}
                            />
                            <h5 className="font-semibold text-gray-900">{event.title}</h5>
                          </div>
                          {event.description && (() => {
                            const truncated = truncateText(event.description, 100)
                            return (
                              <div className="text-sm text-gray-600">
                                {truncated.isTruncated ? (
                                  <>
                                    {truncated.text}{' '}
                                    <button
                                      onClick={() => handleReadMore('event', event.id, event.description, event.title)}
                                      className="text-primary hover:underline font-medium"
                                    >
                                      lire plus
                                    </button>
                                  </>
                                ) : (
                                  event.description
                                )}
                              </div>
                            )
                          })()}
                          {event.event_time && <p className="text-xs text-gray-500 mt-1">⏰ {event.event_time}</p>}
                          <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                            {translateStatus(event.status)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Calls */}
                {dayDetailsData.calls.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <FaPhone className="text-primary" />
                      <h4 className="font-semibold text-gray-900">Appels ({dayDetailsData.calls.length})</h4>
                    </div>
                    <div className="space-y-2">
                      {dayDetailsData.calls.map((call, idx) => (
                        <motion.div 
                          key={call.id} 
                          className="border border-gray-200 rounded-lg p-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + idx * 0.05 }}
                          whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        >
                          <h5 className="font-semibold text-gray-900 mb-1">{call.title}</h5>
                          {call.description && (() => {
                            const truncated = truncateText(call.description, 100)
                            return (
                              <div className="text-sm text-gray-600 mb-2">
                                {truncated.isTruncated ? (
                                  <>
                                    {truncated.text}{' '}
                                    <button
                                      onClick={() => handleReadMore('call', call.id, call.description, call.title)}
                                      className="text-primary hover:underline font-medium"
                                    >
                                      lire plus
                                    </button>
                                  </>
                                ) : (
                                  call.description
                                )}
                              </div>
                            )
                          })()}
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>⏰ {call.call_time}</span>
                            {call.duration && <span>⏱️ {call.duration} min</span>}
                            {call.platform && <span>📱 {call.platform}</span>}
                          </div>
                          {call.meeting_link && (
                            <a href={call.meeting_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm mt-1 inline-block">
                              Lien de la réunion →
                            </a>
                          )}
                          <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(call.status)}`}>
                            {translateStatus(call.status)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Contenu */}
                {dayDetailsData.content.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <FaFileAlt className="text-primary" />
                      <h4 className="font-semibold text-gray-900">Contenu à faire ({dayDetailsData.content.length})</h4>
                    </div>
                    <div className="space-y-2">
                      {dayDetailsData.content.map((item, idx) => (
                        <motion.div 
                          key={item.id} 
                          className="border border-gray-200 rounded-lg p-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + idx * 0.05 }}
                          whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-gray-900">{item.title}</h5>
                            <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(item.priority)}`}>
                              {translatePriority(item.priority)}
                            </span>
                          </div>
                          {item.description && (() => {
                            const truncated = truncateText(item.description, 100)
                            return (
                              <div className="text-sm text-gray-600 mb-2">
                                {truncated.isTruncated ? (
                                  <>
                                    {truncated.text}{' '}
                                    <button
                                      onClick={() => handleReadMore('content', item.id, item.description, item.title)}
                                      className="text-primary hover:underline font-medium"
                                    >
                                      lire plus
                                    </button>
                                  </>
                                ) : (
                                  item.description
                                )}
                              </div>
                            )
                          })()}
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>Type: {item.content_type}</span>
                            {item.platform && <span>📱 {item.platform}</span>}
                            <span className={`px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                              {translateStatus(item.status)}
                            </span>
                          </div>
                          {item.content_url && (
                            <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm mt-1 inline-block">
                              Voir le contenu →
                            </a>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {dayDetailsData.events.length === 0 && dayDetailsData.calls.length === 0 && dayDetailsData.content.length === 0 && (
                  <motion.p 
                    className="text-gray-500 text-center py-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Aucun élément pour ce jour
                  </motion.p>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal pour lire le texte complet */}
        {expandedText && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedText(null)}
          >
            <motion.div 
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div 
                className="flex items-center justify-between mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900">{expandedText.title}</h3>
                <motion.button 
                  onClick={() => setExpandedText(null)} 
                  className="text-gray-400 hover:text-gray-600"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes />
                </motion.button>
              </motion.div>
              
              <motion.div
                className="text-gray-700 whitespace-pre-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {expandedText.text}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}

export default DashboardInfluencerMyOrganization


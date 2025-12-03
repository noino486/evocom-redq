import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  FaCalendar, FaPhone, FaFileAlt, FaPlus, FaEdit, FaTrash, FaSave, FaTimes,
  FaSpinner, FaUserPlus, FaUserMinus, FaCheck, FaClock, FaExclamationTriangle,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import DashboardLayout from '../components/DashboardLayout'

const DashboardInfluencerOrganization = () => {
  const { isAdmin, user } = useAuth()
  const [influencers, setInfluencers] = useState([]) // Liste de tous les influenceurs avec leurs données
  const [expandedInfluencer, setExpandedInfluencer] = useState(null) // ID de l'influenceur dont les détails sont affichés
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [currentMonth, setCurrentMonth] = useState(new Date()) // Mois actuel du calendrier
  const [selectedDate, setSelectedDate] = useState(null) // Date sélectionnée dans le calendrier
  const [searchTerm, setSearchTerm] = useState('') // Terme de recherche pour filtrer les influenceurs
  
  // États pour les formulaires
  const [showEventForm, setShowEventForm] = useState(false)
  const [showCallForm, setShowCallForm] = useState(false)
  const [showContentForm, setShowContentForm] = useState(false)
  const [showDayMenu, setShowDayMenu] = useState(false) // Menu pour choisir le type d'élément à ajouter
  const [selectedDayForMenu, setSelectedDayForMenu] = useState(null) // Jour sélectionné pour le menu
  const [selectedWorkspaceForMenu, setSelectedWorkspaceForMenu] = useState(null) // Workspace pour le menu
  const [showDayDetails, setShowDayDetails] = useState(false) // Vue détaillée d'un jour
  const [dayDetailsData, setDayDetailsData] = useState({ events: [], calls: [], content: [] }) // Données du jour sélectionné
  const [editingItem, setEditingItem] = useState(null)
  const [expandedText, setExpandedText] = useState(null) // { type: 'event'|'call'|'content', id: string, text: string, title: string }
  const eventDescriptionRef = useRef(null)
  const callDescriptionRef = useRef(null)
  const contentDescriptionRef = useRef(null)
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    event_type: 'task',
    status: 'pending',
    color: '#3B82F6' // Couleur par défaut (bleu)
  })
  
  const [callForm, setCallForm] = useState({
    title: '',
    description: '',
    call_date: '',
    call_time: '',
    duration: 60,
    call_type: 'call',
    platform: '',
    meeting_link: '',
    status: 'scheduled'
  })
  
  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    content_type: 'post',
    platform: '',
    deadline: '',
    status: 'todo',
    priority: 'medium',
    content_url: ''
  })

  useEffect(() => {
    if (isAdmin()) {
      loadAllInfluencers()
    }
  }, [isAdmin])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const loadAllInfluencers = async () => {
    try {
      setLoading(true)
      // Charger tous les utilisateurs avec leurs workspaces actifs
      const { data: workspaces, error: workspaceError } = await supabase
        .from('influencer_workspaces')
        .select('id, influencer_id, is_active')
        .eq('is_active', true)

      if (workspaceError) throw workspaceError

      if (!workspaces || workspaces.length === 0) {
        setInfluencers([])
        setLoading(false)
        return
      }

      const influencerIds = workspaces.map(ws => ws.influencer_id)
      
      // Charger les profils des influenceurs
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, email, access_level')
        .in('id', influencerIds)
        .eq('is_active', true)
        .order('email')

      if (usersError) throw usersError

      // Charger toutes les données pour chaque influenceur
      const influencersData = await Promise.all(
        (users || []).map(async (user) => {
          const workspace = workspaces.find(ws => ws.influencer_id === user.id)
          if (!workspace) return null

          // Charger les événements, appels et contenu
            const [eventsResult, calls, content] = await Promise.all([
              supabase
                .from('influencer_calendar_events')
                .select('*')
                .eq('workspace_id', workspace.id)
                .order('event_date', { ascending: true }),
              supabase
                .from('influencer_calls')
                .select('*')
                .eq('workspace_id', workspace.id)
                .order('call_date', { ascending: true }),
              supabase
                .from('influencer_content')
                .select('*')
                .eq('workspace_id', workspace.id)
                .order('deadline', { ascending: true })
            ])

            // S'assurer que tous les événements ont une couleur
            const events = eventsResult.data?.map(event => ({
              ...event,
              color: event.color || '#3B82F6'
            })) || []

            return {
              ...user,
              workspace: workspace,
              events: events,
              calls: calls.data || [],
              content: content.data || []
            }
        })
      )

      setInfluencers(influencersData.filter(inf => inf !== null))
    } catch (error) {
      console.error('Erreur lors du chargement des influenceurs:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des influenceurs' })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleExpand = async (influencerId) => {
    if (expandedInfluencer === influencerId) {
      setExpandedInfluencer(null)
    } else {
      setExpandedInfluencer(influencerId)
      // Recharger les données de cet influenceur
      await loadInfluencerData(influencerId)
    }
  }

  const loadInfluencerData = async (influencerId) => {
    try {
      const influencer = influencers.find(inf => inf.id === influencerId)
      if (!influencer) return

      const workspace = influencer.workspace

      // Charger les données à jour
      const [eventsResult, calls, content] = await Promise.all([
        supabase
          .from('influencer_calendar_events')
          .select('*')
          .eq('workspace_id', workspace.id)
          .order('event_date', { ascending: true }),
        supabase
          .from('influencer_calls')
          .select('*')
          .eq('workspace_id', workspace.id)
          .order('call_date', { ascending: true }),
        supabase
          .from('influencer_content')
          .select('*')
          .eq('workspace_id', workspace.id)
          .order('deadline', { ascending: true })
      ])

      // S'assurer que tous les événements ont une couleur
      const events = eventsResult.data?.map(event => ({
        ...event,
        color: event.color || '#3B82F6'
      })) || []

      // Mettre à jour les données de l'influenceur
      setInfluencers(prev => prev.map(inf => 
        inf.id === influencerId 
          ? { ...inf, events: events, calls: calls.data || [], content: content.data || [] }
          : inf
      ))
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    }
  }


  // Fonctions CRUD pour les événements
  const handleSaveEvent = async (workspaceId) => {
    console.log('handleSaveEvent appelé avec:', { workspaceId, editingItem, selectedWorkspaceForMenu, eventForm })
    
    // Récupérer le workspaceId depuis editingItem s'il n'est pas fourni en paramètre
    const finalWorkspaceId = workspaceId || editingItem?.workspaceId || selectedWorkspaceForMenu
    
    if (!finalWorkspaceId) {
      console.error('workspaceId manquant:', { workspaceId, editingItem, selectedWorkspaceForMenu })
      setMessage({ type: 'error', text: 'Erreur: impossible de déterminer le workspace. Veuillez réessayer.' })
      return
    }
    
    if (!eventForm.title || !eventForm.event_date) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs requis' })
      return
    }

    try {
      console.log('Tentative de sauvegarde avec workspaceId:', finalWorkspaceId)

      // Préparer les données avec la couleur
      const eventData = {
        title: eventForm.title,
        description: eventForm.description || null,
        event_date: eventForm.event_date,
        event_time: eventForm.event_time || null,
        event_type: eventForm.event_type,
        status: eventForm.status,
        color: eventForm.color || '#3B82F6' // Toujours inclure la couleur
      }

      console.log('Sauvegarde événement avec couleur:', eventData.color)

      if (editingItem && editingItem.id) {
        const { error } = await supabase
          .from('influencer_calendar_events')
          .update({
            ...eventData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id)

        if (error) {
          // Si l'erreur est liée à la colonne color, réessayer sans
          if (error.message && error.message.includes('color')) {
            delete eventData.color
            const { error: retryError } = await supabase
              .from('influencer_calendar_events')
              .update({
                ...eventData,
                updated_at: new Date().toISOString()
              })
              .eq('id', editingItem.id)
            if (retryError) throw retryError
          } else {
            throw error
          }
        }
        setMessage({ type: 'success', text: 'Événement mis à jour avec succès' })
      } else {
        const { error } = await supabase
          .from('influencer_calendar_events')
          .insert({
            ...eventData,
            workspace_id: finalWorkspaceId,
            created_by: user?.id
          })

        if (error) {
          // Si l'erreur est liée à la colonne color, réessayer sans
          if (error.message && error.message.includes('color')) {
            delete eventData.color
            const { error: retryError } = await supabase
              .from('influencer_calendar_events')
              .insert({
                ...eventData,
                workspace_id: finalWorkspaceId,
                created_by: user?.id
              })
            if (retryError) throw retryError
          } else {
            throw error
          }
        }
        setMessage({ type: 'success', text: 'Événement créé avec succès' })
      }

      setShowEventForm(false)
      setEditingItem(null)
      
      // Recharger les données de l'influenceur
      const influencer = influencers.find(inf => inf.workspace.id === finalWorkspaceId)
      if (influencer) {
        await loadInfluencerData(influencer.id)
        // Si le modal de détails est ouvert, mettre à jour les données
        if (showDayDetails && selectedDate) {
          // Attendre que les données soient mises à jour
          setTimeout(() => {
            const updatedInfluencer = influencers.find(inf => inf.workspace.id === finalWorkspaceId)
            if (updatedInfluencer) {
              const updated = getAllItemsForDate(selectedDate, updatedInfluencer)
              setDayDetailsData(updated)
            }
          }, 100)
        }
      }
      
      setSelectedDate(null)
      setEventForm({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        event_type: 'task',
        status: 'pending',
        color: '#3B82F6'
      })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la sauvegarde' })
    }
  }

  const handleDeleteEvent = async (id, workspaceId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return

    try {
      const { error } = await supabase
        .from('influencer_calendar_events')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Événement supprimé avec succès' })
      
      // Recharger les données de l'influenceur
      const influencer = influencers.find(inf => inf.workspace.id === workspaceId)
      if (influencer) {
        await loadInfluencerData(influencer.id)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
    }
  }

  const handleEditEvent = (event, workspaceId) => {
    setEditingItem({ ...event, workspaceId })
    setEventForm({
      title: event.title || '',
      description: event.description || '',
      event_date: event.event_date || '',
      event_time: event.event_time || '',
      event_type: event.event_type || 'task',
      status: event.status || 'pending',
      color: event.color || '#3B82F6'
    })
    setShowEventForm(true)
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
    
    // Ajouter les jours vides du début
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getEventsForDate = (date, events) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => {
      const eventDate = new Date(event.event_date).toISOString().split('T')[0]
      return eventDate === dateStr
    })
  }

  const getCallsForDate = (date, calls) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return calls.filter(call => {
      const callDate = new Date(call.call_date).toISOString().split('T')[0]
      return callDate === dateStr
    })
  }

  const getContentForDate = (date, content) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return content.filter(item => {
      if (!item.deadline) return false
      const contentDate = new Date(item.deadline).toISOString().split('T')[0]
      return contentDate === dateStr
    })
  }

  const getAllItemsForDate = (date, influencer) => {
    if (!date || !influencer) return { events: [], calls: [], content: [] }
    // S'assurer que tous les événements ont une couleur
    const events = getEventsForDate(date, influencer.events || []).map(event => ({
      ...event,
      color: event.color || '#3B82F6'
    }))
    return {
      events: events,
      calls: getCallsForDate(date, influencer.calls || []),
      content: getContentForDate(date, influencer.content || [])
    }
  }

  const handleDayClick = (date, workspaceId) => {
    if (!date) return
    const influencer = influencers.find(inf => inf.workspace.id === workspaceId)
    if (!influencer) return
    
    const dayItems = getAllItemsForDate(date, influencer)
    const hasItems = dayItems.events.length > 0 || dayItems.calls.length > 0 || dayItems.content.length > 0
    
    setSelectedDate(date)
    setSelectedWorkspaceForMenu(workspaceId)
    
    if (hasItems) {
      // Afficher la vue détaillée du jour
      setDayDetailsData(dayItems)
      setShowDayDetails(true)
    } else {
      // Afficher le menu pour choisir le type d'élément à ajouter
      setSelectedDayForMenu(date)
      setShowDayMenu(true)
    }
  }

  const handleAddItemType = (type, date, workspaceId) => {
    if (!date || !workspaceId) {
      console.error('Date ou workspaceId manquant:', { date, workspaceId })
      return
    }
    const dateStr = date.toISOString().split('T')[0]
    setShowDayMenu(false)
    setSelectedDayForMenu(null)
    
    // S'assurer que selectedWorkspaceForMenu est défini
    setSelectedWorkspaceForMenu(workspaceId)
    setEditingItem({ workspaceId })
    
    if (type === 'event') {
      setEventForm({
        title: '',
        description: '',
        event_date: dateStr,
        event_time: '',
        event_type: 'task',
        status: 'pending',
        color: '#3B82F6'
      })
      setShowEventForm(true)
    } else if (type === 'call') {
      setCallForm({
        title: '',
        description: '',
        call_date: dateStr,
        call_time: '',
        duration: 60,
        call_type: 'call',
        platform: '',
        meeting_link: '',
        status: 'scheduled'
      })
      setShowCallForm(true)
    } else if (type === 'content') {
      setContentForm({
        title: '',
        description: '',
        content_type: 'post',
        platform: '',
        deadline: dateStr,
        status: 'todo',
        priority: 'medium',
        content_url: ''
      })
      setShowContentForm(true)
    }
  }

  const handleAddFromDayDetails = () => {
    if (!selectedDate || !selectedWorkspaceForMenu) {
      console.error('selectedDate ou selectedWorkspaceForMenu manquant:', { selectedDate, selectedWorkspaceForMenu })
      return
    }
    setShowDayDetails(false)
    setSelectedDayForMenu(selectedDate)
    setShowDayMenu(true)
  }

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const getEventColor = (event) => {
    // S'assurer que la couleur est toujours valide
    const color = event?.color || '#3B82F6'
    console.log('getEventColor appelé:', { event, color, hasColor: !!event?.color })
    // Vérifier que c'est un format hexadécimal valide
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      console.warn('Couleur invalide, utilisation de la couleur par défaut:', color)
      return '#3B82F6' // Couleur par défaut si invalide
    }
    return color
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

  // Fonction pour calculer le nombre de lignes visuelles dans un textarea
  const calculateVisualLines = (text, textareaRef) => {
    if (!textareaRef || !text) return 1
    
    const textarea = textareaRef.current
    if (!textarea) return 1
    
    // Créer un élément temporaire pour mesurer la largeur du texte
    const measureDiv = document.createElement('div')
    const styles = window.getComputedStyle(textarea)
    measureDiv.style.position = 'absolute'
    measureDiv.style.visibility = 'hidden'
    measureDiv.style.whiteSpace = 'pre-wrap'
    measureDiv.style.wordWrap = 'break-word'
    measureDiv.style.width = styles.width
    measureDiv.style.padding = styles.padding
    measureDiv.style.font = styles.font
    measureDiv.style.fontSize = styles.fontSize
    measureDiv.style.fontFamily = styles.fontFamily
    measureDiv.style.lineHeight = styles.lineHeight
    measureDiv.style.border = styles.border
    measureDiv.style.boxSizing = styles.boxSizing
    measureDiv.textContent = text
    
    document.body.appendChild(measureDiv)
    const height = measureDiv.offsetHeight
    const lineHeight = parseFloat(styles.lineHeight) || parseFloat(styles.fontSize) * 1.2
    const lines = Math.ceil(height / lineHeight)
    document.body.removeChild(measureDiv)
    
    return Math.max(1, lines)
  }

  // Fonction pour calculer le nombre total de caractères incluant les retours automatiques
  const calculateTotalCharacters = (text, textareaRef) => {
    if (!text) return 0
    const baseLength = text.length
    const visualLines = calculateVisualLines(text, textareaRef)
    const manualLineBreaks = (text.match(/\n/g) || []).length
    // Les retours automatiques sont les lignes visuelles moins les retours manuels moins 1
    const autoLineBreaks = Math.max(0, visualLines - manualLineBreaks - 1)
    return baseLength + autoLineBreaks
  }

  // Fonctions CRUD pour les appels
  const handleSaveCall = async (workspaceId) => {
    console.log('handleSaveCall appelé avec:', { workspaceId, editingItem, selectedWorkspaceForMenu, callForm })
    
    // Récupérer le workspaceId depuis editingItem s'il n'est pas fourni en paramètre
    const finalWorkspaceId = workspaceId || editingItem?.workspaceId || selectedWorkspaceForMenu
    
    if (!finalWorkspaceId) {
      console.error('workspaceId manquant:', { workspaceId, editingItem, selectedWorkspaceForMenu })
      setMessage({ type: 'error', text: 'Erreur: impossible de déterminer le workspace. Veuillez réessayer.' })
      return
    }
    
    if (!callForm.title || !callForm.call_date || !callForm.call_time) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs requis' })
      return
    }

    try {
      console.log('Tentative de sauvegarde avec workspaceId:', finalWorkspaceId)

      if (editingItem && editingItem.id) {
        const { error } = await supabase
          .from('influencer_calls')
          .update({
            ...callForm,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'Appel mis à jour avec succès' })
      } else {
        const { error } = await supabase
          .from('influencer_calls')
          .insert({
            ...callForm,
            workspace_id: finalWorkspaceId,
            created_by: user?.id
          })

        if (error) throw error
        setMessage({ type: 'success', text: 'Appel créé avec succès' })
      }

      setShowCallForm(false)
      setEditingItem(null)
      setCallForm({
        title: '',
        description: '',
        call_date: '',
        call_time: '',
        duration: 60,
        call_type: 'call',
        platform: '',
        meeting_link: '',
        status: 'scheduled'
      })
      
      // Recharger les données de l'influenceur
      const influencer = influencers.find(inf => inf.workspace.id === finalWorkspaceId)
      if (influencer) {
        await loadInfluencerData(influencer.id)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la sauvegarde' })
    }
  }

  const handleDeleteCall = async (id, workspaceId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet appel ?')) return

    try {
      const { error } = await supabase
        .from('influencer_calls')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Appel supprimé avec succès' })
      
      // Recharger les données de l'influenceur
      const influencer = influencers.find(inf => inf.workspace.id === workspaceId)
      if (influencer) {
        await loadInfluencerData(influencer.id)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
    }
  }

  const handleEditCall = (call, workspaceId) => {
    setEditingItem({ ...call, workspaceId })
    setCallForm({
      title: call.title || '',
      description: call.description || '',
      call_date: call.call_date || '',
      call_time: call.call_time || '',
      duration: call.duration || 60,
      call_type: call.call_type || 'call',
      platform: call.platform || '',
      meeting_link: call.meeting_link || '',
      status: call.status || 'scheduled'
    })
    setShowCallForm(true)
  }

  // Fonctions CRUD pour le contenu
  const handleSaveContent = async (workspaceId) => {
    console.log('handleSaveContent appelé avec:', { workspaceId, editingItem, selectedWorkspaceForMenu, contentForm })
    
    // Récupérer le workspaceId depuis editingItem s'il n'est pas fourni en paramètre
    const finalWorkspaceId = workspaceId || editingItem?.workspaceId || selectedWorkspaceForMenu
    
    if (!finalWorkspaceId) {
      console.error('workspaceId manquant:', { workspaceId, editingItem, selectedWorkspaceForMenu })
      setMessage({ type: 'error', text: 'Erreur: impossible de déterminer le workspace. Veuillez réessayer.' })
      return
    }
    
    if (!contentForm.title) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs requis' })
      return
    }

    try {
      console.log('Tentative de sauvegarde avec workspaceId:', finalWorkspaceId)

      if (editingItem && editingItem.id) {
        const { error } = await supabase
          .from('influencer_content')
          .update({
            ...contentForm,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'Contenu mis à jour avec succès' })
      } else {
        const { error } = await supabase
          .from('influencer_content')
          .insert({
            ...contentForm,
            workspace_id: finalWorkspaceId,
            created_by: user?.id,
            assigned_by: user?.id
          })

        if (error) throw error
        setMessage({ type: 'success', text: 'Contenu créé avec succès' })
      }

      setShowContentForm(false)
      setEditingItem(null)
      setContentForm({
        title: '',
        description: '',
        content_type: 'post',
        platform: '',
        deadline: '',
        status: 'todo',
        priority: 'medium',
        content_url: ''
      })
      
      // Recharger les données de l'influenceur
      const influencer = influencers.find(inf => inf.workspace.id === finalWorkspaceId)
      if (influencer) {
        await loadInfluencerData(influencer.id)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la sauvegarde' })
    }
  }

  const handleDeleteContent = async (id, workspaceId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return

    try {
      const { error } = await supabase
        .from('influencer_content')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Contenu supprimé avec succès' })
      
      // Recharger les données de l'influenceur
      const influencer = influencers.find(inf => inf.workspace.id === workspaceId)
      if (influencer) {
        await loadInfluencerData(influencer.id)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
    }
  }

  const handleEditContent = (contentItem, workspaceId) => {
    setEditingItem({ ...contentItem, workspaceId })
    setContentForm({
      title: contentItem.title || '',
      description: contentItem.description || '',
      content_type: contentItem.content_type || 'post',
      platform: contentItem.platform || '',
      deadline: contentItem.deadline || '',
      status: contentItem.status || 'todo',
      priority: contentItem.priority || 'medium',
      content_url: contentItem.content_url || ''
    })
    setShowContentForm(true)
  }


  if (!isAdmin()) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600">Seuls les administrateurs peuvent accéder à cette page.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Organisation Influenceurs
          </h1>
          <p className="text-gray-600">
            Gérez les workspaces et le contenu des influenceurs
          </p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Liste de tous les influenceurs avec leurs tâches */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <FaSpinner className="animate-spin text-2xl text-primary mx-auto mb-4" />
            <p className="text-gray-600">Chargement des influenceurs...</p>
          </div>
        ) : influencers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <p className="text-gray-500">Aucun influenceur avec un workspace actif</p>
            <p className="text-sm text-gray-400 mt-2">Accordez l'accès organisation depuis la page "Gestion des Utilisateurs"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Barre de recherche */}
            <motion.div
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un influenceur par email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm && (
                  <motion.button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTimes />
                  </motion.button>
                )}
              </div>
              {searchTerm && (
                <motion.p
                  className="text-sm text-gray-500 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {influencers.filter(inf => 
                    inf.email.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length} influenceur(s) trouvé(s)
                </motion.p>
              )}
            </motion.div>

            {/* Liste des influenceurs filtrés */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {influencers
                .filter(influencer => 
                  influencer.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((influencer, index) => (
              <motion.div 
                key={influencer.id} 
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {/* En-tête de l'influenceur */}
                <motion.div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                  onClick={() => handleToggleExpand(influencer.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold text-lg">
                          {influencer.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{influencer.email}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaCalendar className="text-xs" />
                          {influencer.events.length} événement{influencer.events.length > 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaPhone className="text-xs" />
                          {influencer.calls.length} appel{influencer.calls.length > 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaFileAlt className="text-xs" />
                          {influencer.content.length} contenu{influencer.content.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.button 
                    className="text-gray-400 hover:text-gray-600"
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    {expandedInfluencer === influencer.id ? (
                      <FaTimes />
                    ) : (
                      <FaEdit />
                    )}
                  </motion.button>
                </motion.div>

                {/* Détails de l'influenceur (expandable) */}
                {expandedInfluencer === influencer.id && (
                  <motion.div 
                    className="border-t border-gray-200 p-6 space-y-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Module 1: Calendrier */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <FaCalendar className="text-primary text-xl" />
                          <h3 className="text-lg font-semibold text-gray-900">Calendrier</h3>
                        </div>
                      </div>
                      
                      {/* Calendrier interactif */}
                      <motion.div 
                        className="bg-white border border-gray-200 rounded-lg p-2 sm:p-4 overflow-x-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
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
                            className="text-sm sm:text-lg font-semibold text-gray-900"
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
                        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 min-w-[280px]">
                          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Grille du calendrier */}
                        <motion.div 
                          className="grid grid-cols-7 gap-0.5 sm:gap-1 min-w-[280px]"
                          key={currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, staggerChildren: 0.02 }}
                        >
                          {getDaysInMonth(currentMonth).map((date, index) => {
                            if (!date) {
                              return <div key={index} className="aspect-square" />
                            }
                            
                            const dayEvents = getEventsForDate(date, influencer.events)
                            const dayCalls = getCallsForDate(date, influencer.calls)
                            const dayContent = getContentForDate(date, influencer.content)
                            const totalItems = dayEvents.length + dayCalls.length + dayContent.length
                            
                            const isSelected = selectedDate && 
                              date.getDate() === selectedDate.getDate() &&
                              date.getMonth() === selectedDate.getMonth() &&
                              date.getFullYear() === selectedDate.getFullYear()
                            const today = isToday(date)
                            
                            return (
                              <motion.button
                                key={`${date.getTime()}-${index}`}
                                onClick={() => handleDayClick(date, influencer.workspace.id)}
                                className={`aspect-square border rounded text-xs sm:text-sm p-0.5 sm:p-1 hover:bg-gray-50 transition-colors relative ${
                                  today ? 'border-primary border-2' : 'border-gray-200'
                                } ${isSelected ? 'bg-primary/10' : ''}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: index * 0.01 }}
                                whileHover={{ scale: 1.05, zIndex: 10 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <div className={`text-xs sm:text-sm font-medium ${today ? 'text-primary' : 'text-gray-900'}`}>
                                  {date.getDate()}
                                </div>
                                {totalItems > 0 && (
                                  <motion.div 
                                    className="mt-0.5 sm:mt-1 space-y-0.5"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {/* Événements */}
                                    {dayEvents.slice(0, 1).map((event) => {
                                      const eventColor = getEventColor(event)
                                      return (
                                        <motion.div
                                          key={event.id}
                                          className="text-xs px-1 py-0.5 rounded truncate"
                                          style={{
                                            backgroundColor: `${eventColor}20`,
                                            color: eventColor,
                                            borderLeft: `2px solid ${eventColor}`
                                          }}
                                          title={event.title}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ duration: 0.2 }}
                                          whileHover={{ scale: 1.05 }}
                                        >
                                          {event.title}
                                        </motion.div>
                                      )
                                    })}
                                    {/* Calls */}
                                    {dayCalls.slice(0, 1).map((call) => (
                                      <motion.div
                                        key={call.id}
                                        className="text-xs px-1 py-0.5 rounded truncate bg-blue-100 text-blue-800 border-l-2 border-blue-500"
                                        title={call.title}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2, delay: 0.05 }}
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        📞 {call.title}
                                      </motion.div>
                                    ))}
                                    {/* Contenu */}
                                    {dayContent.slice(0, 1).map((item) => (
                                      <motion.div
                                        key={item.id}
                                        className="text-xs px-1 py-0.5 rounded truncate bg-purple-100 text-purple-800 border-l-2 border-purple-500"
                                        title={item.title}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2, delay: 0.1 }}
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        📝 {item.title}
                                      </motion.div>
                                    ))}
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
                          })}
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
                ))}
            </motion.div>
            
            {/* Message si aucun résultat */}
            {searchTerm && influencers.filter(inf => 
              inf.email.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 && (
              <motion.div
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-gray-500">Aucun influenceur trouvé pour "{searchTerm}"</p>
                <p className="text-sm text-gray-400 mt-2">Essayez avec un autre terme de recherche</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Modal menu de sélection du type d'élément */}
        {showDayMenu && selectedDayForMenu && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowDayMenu(false)
              setSelectedDayForMenu(null)
            }}
          >
            <motion.div 
              className="bg-white rounded-lg p-6 max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
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
                  Ajouter un élément pour le {selectedDayForMenu.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <motion.button 
                  onClick={() => {
                    setShowDayMenu(false)
                    setSelectedDayForMenu(null)
                  }} 
                  className="text-gray-400 hover:text-gray-600"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes />
                </motion.button>
              </motion.div>
              <div className="space-y-3">
                <motion.button
                  onClick={() => handleAddItemType('event', selectedDayForMenu, selectedWorkspaceForMenu)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <FaCalendar className="text-2xl text-primary" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Événement / Texte</h4>
                      <p className="text-sm text-gray-600">Ajouter un événement ou une note texte</p>
                    </div>
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => handleAddItemType('call', selectedDayForMenu, selectedWorkspaceForMenu)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-2xl text-primary" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Planning de call</h4>
                      <p className="text-sm text-gray-600">Planifier un appel ou une réunion</p>
                    </div>
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => handleAddItemType('content', selectedDayForMenu, selectedWorkspaceForMenu)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <FaFileAlt className="text-2xl text-primary" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Contenu à faire</h4>
                      <p className="text-sm text-gray-600">Ajouter du contenu à produire</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal vue détaillée d'un jour */}
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
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleAddFromDayDetails}
                    className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlus className="inline mr-1" />
                    Ajouter
                  </motion.button>
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
                </div>
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
                      {dayDetailsData.events.map((event, idx) => {
                        // S'assurer que l'événement a bien une couleur
                        const eventColor = event?.color || '#3B82F6'
                        console.log('Affichage événement dans modal:', { 
                          eventId: event.id, 
                          eventTitle: event.title,
                          eventColor: event.color,
                          computedColor: eventColor 
                        })
                        return (
                          <motion.div 
                            key={event.id} 
                            className="border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + idx * 0.05 }}
                            whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ 
                                    backgroundColor: eventColor,
                                    minWidth: '12px',
                                    minHeight: '12px',
                                    border: `1px solid ${eventColor}`
                                  }}
                                />
                                <h5 className="font-semibold text-gray-900">{event.title}</h5>
                              </div>
                              {event.description && (() => {
                                const truncated = truncateText(event.description, 100)
                                return (
                                  <div className="text-sm text-gray-600 break-words overflow-wrap-anywhere whitespace-pre-wrap">
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
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <motion.button
                                onClick={() => {
                                  setShowDayDetails(false)
                                  handleEditEvent(event, selectedWorkspaceForMenu)
                                }}
                                className="p-2 text-primary hover:bg-primary/10 rounded flex items-center justify-center"
                                title="Modifier"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FaEdit />
                              </motion.button>
                              <motion.button
                                onClick={() => {
                                  handleDeleteEvent(event.id, selectedWorkspaceForMenu)
                                  const influencer = influencers.find(inf => inf.workspace.id === selectedWorkspaceForMenu)
                                  if (influencer) {
                                    const updated = getAllItemsForDate(selectedDate, influencer)
                                    setDayDetailsData(updated)
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded flex items-center justify-center"
                                title="Supprimer"
                                whileHover={{ scale: 1.1, rotate: -5 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FaTrash />
                              </motion.button>
                            </div>
                          </motion.div>
                        )
                      })}
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
                          className="border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + idx * 0.05 }}
                          whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        >
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 mb-1">{call.title}</h5>
                            {call.description && (() => {
                              const truncated = truncateText(call.description, 100)
                              return (
                                <div className="text-sm text-gray-600 break-words overflow-wrap-anywhere whitespace-pre-wrap">
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
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <motion.button
                              onClick={() => {
                                setShowDayDetails(false)
                                handleEditCall(call, selectedWorkspaceForMenu)
                              }}
                              className="p-2 text-primary hover:bg-primary/10 rounded flex items-center justify-center"
                              title="Modifier"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaEdit />
                            </motion.button>
                            <motion.button
                              onClick={() => {
                                handleDeleteCall(call.id, selectedWorkspaceForMenu)
                                const influencer = influencers.find(inf => inf.workspace.id === selectedWorkspaceForMenu)
                                if (influencer) {
                                  const updated = getAllItemsForDate(selectedDate, influencer)
                                  setDayDetailsData(updated)
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Supprimer"
                              whileHover={{ scale: 1.1, rotate: -5 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaTrash />
                            </motion.button>
                          </div>
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
                          className="border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + idx * 0.05 }}
                          whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-semibold text-gray-900">{item.title}</h5>
                              <span className={`px-2 py-1 rounded text-xs ${
                                item.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                item.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {item.priority}
                              </span>
                            </div>
                            {item.description && (() => {
                              const truncated = truncateText(item.description, 100)
                              return (
                                <div className="text-sm text-gray-600 break-words overflow-wrap-anywhere whitespace-pre-wrap">
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
                              <span className={`px-2 py-1 rounded ${
                                item.status === 'published' ? 'bg-green-100 text-green-800' :
                                item.status === 'validated' ? 'bg-green-100 text-green-800' :
                                item.status === 'review' ? 'bg-purple-100 text-purple-800' :
                                item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <motion.button
                              onClick={() => {
                                setShowDayDetails(false)
                                handleEditContent(item, selectedWorkspaceForMenu)
                              }}
                              className="p-2 text-primary hover:bg-primary/10 rounded flex items-center justify-center"
                              title="Modifier"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaEdit />
                            </motion.button>
                            <motion.button
                              onClick={() => {
                                handleDeleteContent(item.id, selectedWorkspaceForMenu)
                                const influencer = influencers.find(inf => inf.workspace.id === selectedWorkspaceForMenu)
                                if (influencer) {
                                  const updated = getAllItemsForDate(selectedDate, influencer)
                                  setDayDetailsData(updated)
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Supprimer"
                              whileHover={{ scale: 1.1, rotate: -5 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaTrash />
                            </motion.button>
                          </div>
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

        {/* Modal pour les événements */}
        {showEventForm && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowEventForm(false)
              setEditingItem(null)
            }}
          >
            <motion.div 
              className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
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
                <h3 className="text-lg font-semibold">{editingItem ? 'Modifier' : 'Ajouter'} un événement</h3>
                <motion.button 
                  onClick={() => { 
                    setShowEventForm(false)
                    setEditingItem(null) 
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none overflow-wrap break-words"
                    rows="3"
                    wrap="soft"
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {(eventForm.description || '').length} caractères
                    {(eventForm.description || '').split('\n').length > 1 && (
                      <span className="ml-2">
                        • {(eventForm.description || '').split('\n').length} lignes
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={eventForm.event_date}
                      onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                    <input
                      type="time"
                      value={eventForm.event_time}
                      onChange={(e) => setEventForm({ ...eventForm, event_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={eventForm.event_type}
                      onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="task">Tâche</option>
                      <option value="deadline">Deadline</option>
                      <option value="event">Événement</option>
                      <option value="meeting">Réunion</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      value={eventForm.status}
                      onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="pending">En attente</option>
                      <option value="in_progress">En cours</option>
                      <option value="completed">Terminé</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { name: 'Bleu', value: '#3B82F6' },
                      { name: 'Vert', value: '#10B981' },
                      { name: 'Rouge', value: '#EF4444' },
                      { name: 'Orange', value: '#F59E0B' },
                      { name: 'Violet', value: '#8B5CF6' },
                      { name: 'Rose', value: '#EC4899' },
                      { name: 'Jaune', value: '#FBBF24' },
                      { name: 'Indigo', value: '#6366F1' }
                    ].map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setEventForm({ ...eventForm, color: color.value })}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          eventForm.color === color.value
                            ? 'border-gray-900 scale-110'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={eventForm.color}
                    onChange={(e) => setEventForm({ ...eventForm, color: e.target.value })}
                    className="mt-2 w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const wsId = editingItem?.workspaceId || selectedWorkspaceForMenu
                      if (!wsId) {
                        console.error('workspaceId non trouvé:', { editingItem, selectedWorkspaceForMenu })
                        setMessage({ type: 'error', text: 'Erreur: workspace non défini. Veuillez réessayer.' })
                        return
                      }
                      handleSaveEvent(wsId)
                    }}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    Enregistrer
                  </button>
                  <button
                    onClick={() => { setShowEventForm(false); setEditingItem(null) }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal pour les appels */}
        {showCallForm && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowCallForm(false)
              setEditingItem(null)
            }}
          >
            <motion.div 
              className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
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
                <h3 className="text-lg font-semibold">{editingItem ? 'Modifier' : 'Ajouter'} un appel</h3>
                <motion.button 
                  onClick={() => { 
                    setShowCallForm(false)
                    setEditingItem(null) 
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={callForm.title}
                    onChange={(e) => setCallForm({ ...callForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    ref={callDescriptionRef}
                    value={callForm.description}
                    onChange={(e) => setCallForm({ ...callForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none overflow-wrap break-words"
                    rows="3"
                    wrap="soft"
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {calculateTotalCharacters(callForm.description, callDescriptionRef)} caractères
                    {calculateVisualLines(callForm.description, callDescriptionRef) > 1 && (
                      <span className="ml-2">
                        • {calculateVisualLines(callForm.description, callDescriptionRef)} lignes
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={callForm.call_date}
                      onChange={(e) => setCallForm({ ...callForm, call_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure *</label>
                    <input
                      type="time"
                      value={callForm.call_time}
                      onChange={(e) => setCallForm({ ...callForm, call_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durée (min)</label>
                    <input
                      type="number"
                      value={callForm.duration}
                      onChange={(e) => setCallForm({ ...callForm, duration: parseInt(e.target.value) || 60 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={callForm.call_type}
                      onChange={(e) => setCallForm({ ...callForm, call_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="call">Appel</option>
                      <option value="meeting">Réunion</option>
                      <option value="interview">Interview</option>
                      <option value="collaboration">Collaboration</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plateforme</label>
                  <input
                    type="text"
                    value={callForm.platform}
                    onChange={(e) => setCallForm({ ...callForm, platform: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Zoom, Teams, Google Meet..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lien de la réunion</label>
                  <input
                    type="url"
                    value={callForm.meeting_link}
                    onChange={(e) => setCallForm({ ...callForm, meeting_link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={callForm.status}
                    onChange={(e) => setCallForm({ ...callForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="scheduled">Planifié</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                    <option value="rescheduled">Reporté</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const wsId = editingItem?.workspaceId || selectedWorkspaceForMenu
                      if (!wsId) {
                        console.error('workspaceId non trouvé:', { editingItem, selectedWorkspaceForMenu })
                        setMessage({ type: 'error', text: 'Erreur: workspace non défini. Veuillez réessayer.' })
                        return
                      }
                      handleSaveCall(wsId)
                    }}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    Enregistrer
                  </button>
                  <button
                    onClick={() => { setShowCallForm(false); setEditingItem(null) }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal pour le contenu */}
        {showContentForm && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowContentForm(false)
              setEditingItem(null)
            }}
          >
            <motion.div 
              className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
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
                <h3 className="text-lg font-semibold">{editingItem ? 'Modifier' : 'Ajouter'} du contenu</h3>
                <motion.button 
                  onClick={() => { 
                    setShowContentForm(false)
                    setEditingItem(null) 
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={contentForm.title}
                    onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    ref={contentDescriptionRef}
                    value={contentForm.description}
                    onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none overflow-wrap break-words"
                    rows="3"
                    wrap="soft"
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {calculateTotalCharacters(contentForm.description, contentDescriptionRef)} caractères
                    {calculateVisualLines(contentForm.description, contentDescriptionRef) > 1 && (
                      <span className="ml-2">
                        • {calculateVisualLines(contentForm.description, contentDescriptionRef)} lignes
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={contentForm.content_type}
                      onChange={(e) => setContentForm({ ...contentForm, content_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="post">Post</option>
                      <option value="video">Vidéo</option>
                      <option value="story">Story</option>
                      <option value="reel">Reel</option>
                      <option value="article">Article</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plateforme</label>
                    <input
                      type="text"
                      value={contentForm.platform}
                      onChange={(e) => setContentForm({ ...contentForm, platform: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Instagram, TikTok..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input
                      type="date"
                      value={contentForm.deadline}
                      onChange={(e) => setContentForm({ ...contentForm, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                    <select
                      value={contentForm.priority}
                      onChange={(e) => setContentForm({ ...contentForm, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={contentForm.status}
                    onChange={(e) => setContentForm({ ...contentForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="todo">À faire</option>
                    <option value="in_progress">En cours</option>
                    <option value="review">En révision</option>
                    <option value="validated">Validé</option>
                    <option value="published">Publié</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                {editingItem && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL du contenu</label>
                    <input
                      type="url"
                      value={contentForm.content_url || ''}
                      onChange={(e) => setContentForm({ ...contentForm, content_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="https://..."
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const wsId = editingItem?.workspaceId || selectedWorkspaceForMenu
                      if (!wsId) {
                        console.error('workspaceId non trouvé:', { editingItem, selectedWorkspaceForMenu })
                        setMessage({ type: 'error', text: 'Erreur: workspace non défini. Veuillez réessayer.' })
                        return
                      }
                      handleSaveContent(wsId)
                    }}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    Enregistrer
                  </button>
                  <button
                    onClick={() => { setShowContentForm(false); setEditingItem(null) }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
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
                className="text-gray-700 whitespace-pre-wrap break-words overflow-wrap-anywhere"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {expandedText.text}
              </motion.div>
              <div className="text-xs text-gray-500 mt-4 text-right border-t pt-2">
                {expandedText.text.length} caractères
                {expandedText.text.split('\n').length > 1 && (
                  <span className="ml-2">
                    • {expandedText.text.split('\n').length} lignes
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default DashboardInfluencerOrganization


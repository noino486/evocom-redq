import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AffiliateProvider } from './context/AffiliateContext'
import { LegalProvider } from './context/LegalContext'
import { AuthProvider } from './context/AuthContext'
import SEO from './components/SEO'
import Header from './components/Header'
import Footer from './components/Footer'
import AppDetector from './components/AppDetector'
import ProtectedRoute from './components/ProtectedRoute'
import useGlobalClickTracker from './hooks/useGlobalClickTracker'
import useVisitorTracker from './hooks/useVisitorTracker'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import LegalNotice from './pages/LegalNotice'
import Login from './pages/Login'
import DashboardProducts from './pages/DashboardProducts'
import DashboardPack from './pages/DashboardPack'
import DashboardUsers from './pages/DashboardUsers'
import DashboardStats from './pages/DashboardStats'
import DashboardSettings from './pages/DashboardSettings'
import DashboardAffiliates from './pages/DashboardAffiliates'
import DashboardPdfSections from './pages/DashboardPdfSections'
import DashboardLegal from './pages/DashboardLegal'
import DashboardScraper from './pages/DashboardScraper'
import DashboardSuppliers from './pages/DashboardSuppliers'
import DashboardDiscord from './pages/DashboardDiscord'
import DashboardRedirect from './components/DashboardRedirect'

function AppContent() {
  const location = useLocation()
  const isDashboardRoute = location.pathname.startsWith('/dashboard')

  return (
    <div className="min-h-screen">
      {!isDashboardRoute && <Header />}
      <Routes>
                  {/* Routes publiques */}
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/mentions-legales" element={<LegalNotice />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Routes dashboard protégées - Redirection vers le premier pack disponible */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <DashboardRedirect />
                      </ProtectedRoute>
                    } 
                  />
                  {/* Routes pour chaque pack */}
                  <Route 
                    path="/dashboard/pack-global-sourcing" 
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <DashboardPack />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard/pack-global-business" 
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <DashboardPack />
                      </ProtectedRoute>
                    } 
                  />
                  <Route
                    path="/dashboard/pack-global-business/pdfs"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <DashboardPack initialSection="pdfs" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/pack-global-business/suppliers"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <DashboardPack initialSection="suppliers" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/pack-global-business/discord"
                    element={
                      <ProtectedRoute requireAuth={true} minAccessLevel={2}>
                        <DashboardDiscord />
                      </ProtectedRoute>
                    }
                  />
                  {/* Route produits gardée pour compatibilité */}
                  <Route 
                    path="/dashboard/products" 
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <DashboardProducts />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard/users" 
                    element={
                      <ProtectedRoute requireAuth={true} minAccessLevel={4}>
                        <DashboardUsers />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard/stats" 
                    element={
                      <ProtectedRoute requireAuth={true} minAccessLevel={4}>
                        <DashboardStats />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard/settings" 
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <DashboardSettings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard/affiliates" 
                    element={
                      <ProtectedRoute requireAuth={true} minAccessLevel={4}>
                        <DashboardAffiliates />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard/pdf-sections" 
                    element={
                      <ProtectedRoute requireAuth={true} minAccessLevel={3}>
                        <DashboardPdfSections />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard/legal" 
                    element={
                      <ProtectedRoute requireAuth={true} minAccessLevel={4}>
                        <DashboardLegal />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard/scraper" 
                    element={
                      <ProtectedRoute requireAuth={true} minAccessLevel={3}>
                        <DashboardScraper />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard/suppliers" 
                    element={
                      <ProtectedRoute requireAuth={true} minAccessLevel={2}>
                        <DashboardSuppliers />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
      {!isDashboardRoute && <Footer />}
    </div>
  )
}

function App() {
  // Activer le tracking global de tous les clics
  useGlobalClickTracker()
  
  // Activer le tracking des visiteurs
  useVisitorTracker()

  return (
    <>
      {/* Gestion du SEO entièrement en JSX */}
      <SEO />
      
      {/* Détecteur d'applications tierces */}
      <AppDetector />
      
      <Router>
        <AuthProvider>
          <AffiliateProvider>
            <LegalProvider>
              <AppContent />
            </LegalProvider>
          </AffiliateProvider>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App


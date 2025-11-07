import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AffiliateProvider } from './context/AffiliateContext'
import { LegalProvider } from './context/LegalContext'
import SEO from './components/SEO'
import Header from './components/Header'
import Footer from './components/Footer'
import AppDetector from './components/AppDetector'
import useGlobalClickTracker from './hooks/useGlobalClickTracker'
import useVisitorTracker from './hooks/useVisitorTracker'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Admin from './pages/Admin'
import LegalNotice from './pages/LegalNotice'

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
        <AffiliateProvider>
          <LegalProvider>
            <div className="min-h-screen">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/mentions-legales" element={<LegalNotice />} />
              </Routes>
              <Footer />
            </div>
          </LegalProvider>
        </AffiliateProvider>
      </Router>
    </>
  )
}

export default App


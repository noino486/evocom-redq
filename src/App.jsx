import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AffiliateProvider } from './context/AffiliateContext'
import SEO from './components/SEO'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Admin from './pages/Admin'
import LegalNotice from './pages/LegalNotice'

function App() {
  return (
    <>
      {/* Gestion du SEO entièrement en JSX */}
      <SEO />
      
      <Router>
        <AffiliateProvider>
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
        </AffiliateProvider>
      </Router>
    </>
  )
}

export default App


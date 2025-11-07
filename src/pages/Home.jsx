import React from 'react'
import Hero from '../components/Hero'
import Products from '../components/Products'
import Comparison from '../components/Comparison'
import WhyChoose from '../components/WhyChoose'
import Process from '../components/Process'
import WhatsAppContact from '../components/WhatsAppContact'
import Testimonials from '../components/Testimonials'
import DiscordCommunity from '../components/DiscordCommunity'
import FOMO from '../components/FOMO'

const Home = () => {
  return (
    <>
      <Hero />
      <Products />
      <Comparison />
      <WhyChoose />
      <Process />
      <WhatsAppContact />
      <DiscordCommunity />
      <Testimonials />
      <FOMO />
    </>
  )
}

export default Home


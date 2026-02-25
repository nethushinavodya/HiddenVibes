import React from 'react'
import Head from 'next/head'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import AboutHero from '@/components/about/AboutHero'
import AboutMission from '@/components/about/AboutMission'
import AboutValues from '@/components/about/AboutValues'
import AboutCTA from '@/components/about/AboutCTA'

const About = () => {
  return (
    <>
      <Head>
        <link rel="preload" as="image" href="/images/about.jpg" />
        <link rel="preload" as="image" href="/images/about2.jpg" />
      </Head>
      <Navbar />
      <AboutHero />
      <AboutMission />
      <AboutValues />
      <AboutCTA />
      <Footer />
    </>
  )
}

export default About

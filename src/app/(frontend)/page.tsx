import React from 'react'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import HeroVideo from '@/components/landing/HeroVideo'
import FeaturedPlaces from '@/components/landing/FeaturedPlaces'
import HowItWorks from '@/components/landing/HowItWorks'
import DistrictExplorer from '@/components/landing/DistrictExplorer'

const SRI_LANKA_DISTRICTS = [
  'Colombo',
  'Kandy',
  'Galle',
  'Matara',
  'Nuwara Eliya',
  'Ella',
  'Trincomalee',
  'Jaffna',
  'Anuradhapura',
  'Polonnaruwa',
  'Sigiriya',
  'Batticaloa',
  'Hambantota',
  'Ratnapura',
  'Badulla',
  'Kalutara',
  'Ampara',
  'Kurunegala',
]

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Discover Hidden Gems',
    desc: 'Explore secret waterfalls, untouched beaches, ancient ruins, and mystical forests that most tourists never find.',
    color: '#d8f3dc',
  },
  {
    icon: '📸',
    title: 'Share Your Finds',
    desc: 'Submit your own discoveries with photos and descriptions. Help others experience the real, unfiltered Sri Lanka.',
    color: '#fff3e0',
  },
  {
    icon: '🌿',
    title: 'Community Curated',
    desc: 'Every submission is reviewed by our team to ensure quality and authenticity. Only the best hidden spots make the cut.',
    color: '#e8f5e9',
  },
  {
    icon: '📍',
    title: 'District Filtering',
    desc: 'Browse places by all 25 Sri Lankan districts. Find hidden spots near you or plan your next adventure.',
    color: '#e3f2fd',
  },
]

const STEPS = [
  {
    num: '01',
    icon: '👤',
    title: 'Create Account',
    desc: 'Sign up for free and join our growing community of Sri Lankan explorers in seconds.',
  },
  {
    num: '02',
    icon: '📝',
    title: 'Submit a Place',
    desc: 'Share a hidden spot with title, description, photos, and your district. Every detail matters.',
  },
  {
    num: '03',
    icon: '✅',
    title: 'Get Approved & Shine',
    desc: 'Our admins review your submission. Once approved, your discovery is live for the world to explore.',
  },
]

const CATEGORIES = [
  { icon: '💧', label: 'Waterfalls' },
  { icon: '🏖️', label: 'Secret Beaches' },
  { icon: '🏛️', label: 'Ancient Ruins' },
  { icon: '🌲', label: 'Forest Trails' },
  { icon: '🦜', label: 'Wildlife Spots' },
  { icon: '🏔️', label: 'Hilltops' },
  { icon: '🌊', label: 'Lagoons' },
  { icon: '🕌', label: 'Sacred Sites' },
]

export default function HomePage() {
  return (
    <div className="hv-root">
      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── HERO ── */}
      <section className="hv-hero">
        {/* Video background */}
        <HeroVideo />

        {/* Dark overlay */}
        <div className="hv-hero-overlay" />

        {/* Bottom-left hero content */}
        <div className="hv-hero-content">
          <h1 className="hv-hero-title">
            Discover the
            <br />
            <em className="hv-hero-em">Hidden Side</em>
            <br />
            of Sri Lanka
          </h1>

          <p className="hv-hero-desc">
            Join hands with HiddenVibes to explore secret waterfalls, untouched beaches, and
            wildlife for generations to come. Every small discovery creates a bigger adventure.
          </p>

          <Link href="/explore" className="hv-btn-get-involved">
            EXPLORE MORE
            <span className="hv-btn-arrow">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Bottom-right scroll indicator */}
        <div className="hv-hero-scroll">
          <div className="hv-scroll-chevron">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <span className="hv-scroll-label">SCROLL DOWN</span>
        </div>
      </section>

      {/* ── FEATURED PLACES ── */}
      <FeaturedPlaces />

      {/* ── HOW IT WORKS ── */}
      <HowItWorks />

      {/* ── DISTRICT EXPLORER ── */}
      <DistrictExplorer />

      <Footer />
    </div>
  )
}

// A minimal profile page to ensure Next.js recognizes this path as a module.
import React from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

export default function ProfilePage() {
  return (
    <div className="hv-profile-root">
      <Navbar />
      <main className="hv-profile-main">
        <h1>Your profile</h1>
        <p>This page is under construction.</p>
      </main>
      <Footer />
    </div>
  )
}


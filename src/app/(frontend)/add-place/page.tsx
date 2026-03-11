import React from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import AuthGuard from '@/components/auth/AuthGuard'
import AddPlaceForm from '@/components/places/AddPlaceForm'

export const metadata = {
  title: 'Add a Hidden Place — HiddenVibes',
  description: 'Share a secret spot in Sri Lanka with the HiddenVibes community.',
}

export default function AddPlacePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-[90px] pb-16">
        <AuthGuard>
          <AddPlaceForm />
        </AuthGuard>
      </div>
      <Footer />
    </>
  )
}

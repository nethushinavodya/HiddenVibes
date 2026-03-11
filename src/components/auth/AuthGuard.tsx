'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Loader2, Lock } from 'lucide-react'
import Link from 'next/link'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/add-place')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full text-center border border-gray-100">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <Lock className="w-8 h-8 text-green-700" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in Required</h2>
          <p className="text-gray-500 text-sm mb-6">
            You need to be logged in to share a hidden place.
          </p>
          <Link
            href="/login?redirect=/add-place"
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Sign In
          </Link>
          <p className="text-xs text-gray-400 mt-3">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-green-700 hover:underline font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

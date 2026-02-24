import React from 'react'
import './styles.css'

export const metadata = {
  description:
    'HiddenVibes — A community platform for discovering and sharing hidden natural gems across Sri Lanka.',
  title: "HiddenVibes — Discover Sri Lanka's Hidden Places",
  keywords: 'Sri Lanka, hidden places, travel, nature, waterfalls, beaches, explore',
  openGraph: {
    title: "HiddenVibes — Discover Sri Lanka's Hidden Places",
    description:
      'A community platform for discovering and sharing hidden natural gems across Sri Lanka.',
    type: 'website',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}


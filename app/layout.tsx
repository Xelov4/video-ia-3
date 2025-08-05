import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video-IA.net Tool Scraper MVP',
  description: 'AI-powered tool analysis and scraping for Video-IA.net',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
} 
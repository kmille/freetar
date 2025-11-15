import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';

// Ensure we have a valid URL for metadataBase
const getMetadataBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://freetar.de';
  // Ensure the URL starts with http:// or https://
  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    return baseUrl;
  }
  // If no protocol, default to production URL
  return 'https://freetar.de';
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1f2937',
};

export const metadata: Metadata = {
  metadataBase: new URL(getMetadataBaseUrl()),
  title: 'Freetar - guitar chords from Ultimate Guitar',
  description: 'freetar is an open source alternative frontend to ultimate-guitar.com. Search for your chords/tabs hosted on Ultimate Guitar. View them in a simple design. You can save them for later in your favorites without having an account.',
  keywords: ['freetar', 'guitar', 'chords', 'tabs', 'ultimate-guitar'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Freetar',
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'freetar - guitar chords from Ultimate Guitar',
    siteName: 'freetar',
    url: 'https://freetar.de',
    description: 'freetar is an alternative frontend for ultimate-guitar.com',
    type: 'website',
    images: [{
      url: '/guitar.png',
    }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const theme = JSON.parse(localStorage.getItem("dark_mode")) || isDarkMode ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="px-4 py-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

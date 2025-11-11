import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Navbar from '@/components/Navbar';
import BootstrapClient from '@/components/BootstrapClient';

export const metadata: Metadata = {
  title: 'Freetar - guitar chords from Ultimate Guitar',
  description: 'freetar is an open source alternative frontend to ultimate-guitar.com. Search for your chords/tabs hosted on Ultimate Guitar. View them in a simple design. You can save them for later in your favorites without having an account.',
  keywords: ['freetar', 'guitar', 'chords', 'tabs', 'ultimate-guitar'],
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
                if (JSON.parse(localStorage.getItem("dark_mode")) || isDarkMode) {
                  document.documentElement.setAttribute('data-bs-theme', 'dark');
                } else {
                  document.documentElement.setAttribute('data-bs-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <Navbar />
        <div className="container">
          <div className="row">
            {children}
          </div>
        </div>
        <BootstrapClient />
      </body>
    </html>
  );
}

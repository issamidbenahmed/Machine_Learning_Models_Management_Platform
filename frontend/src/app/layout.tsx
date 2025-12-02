import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ML Platform - Gestion de Modèles Machine Learning',
  description: 'Plateforme moderne pour créer, tester et gérer des modèles ML',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen relative overflow-hidden">
          {/* Animated Background */}
          <div className="fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
          </div>

          {/* Header */}
          <header className="sticky top-0 z-40 glass border-b border-white/20 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">ML</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold gradient-text">
                      ML Platform
                    </h1>
                    <p className="text-xs text-gray-500">Intelligence Artificielle</p>
                  </div>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                  <a href="/" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
                    Dashboard
                  </a>
                  <a href="/models/create" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
                    Créer un modèle
                  </a>
                  <a href="/monitoring" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Monitoring
                  </a>
                </nav>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="glass border-t border-white/20 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">ML</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">ML Platform</span>
                </div>
                <p className="text-sm text-gray-500">
                  © 2024 ML Platform. Tous droits réservés.
                </p>
                <div className="flex items-center gap-4">
                  <a href="#" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                    Documentation
                  </a>
                  <a href="#" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                    Support
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

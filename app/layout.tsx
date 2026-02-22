import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MockMatch - AI-Powered Interview Preparation',
  description:
    'Practice technical interviews with AI-generated questions tailored to your target role',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-primary-600 text-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold hover:text-primary-100">
                MockMatch
              </Link>
              <div className="flex gap-6">
                <Link
                  href="/"
                  className="hover:text-primary-100 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/interview"
                  className="hover:text-primary-100 transition-colors"
                >
                  Interview
                </Link>
                <Link
                  href="/results"
                  className="hover:text-primary-100 transition-colors"
                >
                  Results
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>&copy; 2026 MockMatch. AI-powered interview preparation.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

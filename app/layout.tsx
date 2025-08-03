import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PragatiBook',
  description: 'Professional bill management system for creating, managing, and sharing invoices with beautiful design',
  icons: {
    icon: '/bpg.png',
    shortcut: '/bpg.png',
    apple: '/bpg.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/bpg.png" type="image/png" />
        <link rel="shortcut icon" href="/bpg.png" type="image/png" />
        <link rel="apple-touch-icon" href="/bpg.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Biometric Facial Analysis & Aesthetic Optimizer',
  description: 'Advanced 3D facial analysis with real-time biometric scanning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}


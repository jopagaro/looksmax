import type { Metadata } from 'next';
import { Archivo, Archivo_Black } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-archivo',
});

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-archivo-black',
});

export const metadata: Metadata = {
  title: 'LOOKSMAX — Your face. Rated. Fixed.',
  description:
    'AI facial analysis with brutally honest scores and a personalized fix plan. All processing happens on-device.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${archivoBlack.variable}`}>
      <body className={archivo.className}>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { AppHeader } from '@/components/AppHeader';
import './globals.css';
import './kestrel-ui.css';
import './nordic.css';
import './communications.css';
import { ReportProblem } from './report-problem';

const geist = localFont({ src: '../public/fonts/geist-variable.ttf', variable: '--font-geist', display: 'swap', weight: '100 900' });

export const metadata: Metadata = {
  title: 'Kestrel Kids Safety',
  description: 'Child safety information for Kestrel Kids ski school',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={geist.variable}>
        <AppHeader />
        {children}
        <ReportProblem />
      </body>
    </html>
  );
}

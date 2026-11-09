import type { Metadata, Viewport } from 'next';
import { AppHeader } from '@/components/AppHeader';
import './globals.css';
import './kestrel-ui.css';
import { ReportProblem } from './report-problem';

export const metadata: Metadata = {
  title: 'Kestrel Kids Safety',
  description: 'Child safety information for Kestrel Kids ski school',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppHeader />
        {children}
        <ReportProblem />
      </body>
    </html>
  );
}

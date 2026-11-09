import type { Metadata } from 'next';
import './globals.css';
import { ReportProblem } from './report-problem';

export const metadata: Metadata = {
  title: 'Kestrel Kids Safety',
  description: 'Kestrel Kids Safety hackathon workspace',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<ReportProblem /></body></html>;
}

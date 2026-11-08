import { DeskMockProvider } from './mock-context';

export default function DeskLayout({ children }: { children: React.ReactNode }) {
  return <DeskMockProvider>{children}</DeskMockProvider>;
}

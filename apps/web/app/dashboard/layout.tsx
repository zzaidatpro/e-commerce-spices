import { SessionWatcher } from './session-watcher';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionWatcher />
      {children}
    </>
  );
}
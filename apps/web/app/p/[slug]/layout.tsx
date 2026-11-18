import { redirect } from 'next/navigation';
import { getRoleSite } from '@/lib/session-role';

export default async function ProductsLayout({ children }: { children: React.ReactNode }) {
  const { role } = await getRoleSite();
  if (role === 'livreur') redirect('/livraisons');
  return <>{children}</>;
}
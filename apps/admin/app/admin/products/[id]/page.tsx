import { notFound } from 'next/navigation';
import { requireRole } from '@/actions/helper';
import { ProductForm } from '@/components/molecules/ProductForm';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const auth = await requireRole(['admin', 'manager']);

  const { data: produit, error } = await auth.supabase
    .from('produits')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) return <p className="text-xs text-destructive">Erreur : {error.message}</p>;
  if (!produit) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Modifier le produit</h1>
        <p className="text-xs text-muted-foreground">{produit.nom}</p>
      </div>
      <ProductForm valeurs={produit} isAdmin={auth.role === 'admin'} />
    </div>
  );
}
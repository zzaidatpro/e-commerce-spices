import { requireRole } from '@/actions/helper';
import { ProductForm } from '@/components/molecules/ProductForm';

export default async function NewProductPage() {
  const auth = await requireRole(['admin', 'manager']);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">Nouveau produit</h1>
      <ProductForm isAdmin={auth.role === 'admin'} />
    </div>
  );
}
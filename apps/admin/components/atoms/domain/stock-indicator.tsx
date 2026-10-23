import { Badge } from '@/components/atoms/ui/badge';
import { cn } from '@/lib/utils';

interface StockIndicatorProps {
  stock: number;
  lowStockThreshold?: number;
  className?: string;
}

export function StockIndicator({
  stock,
  lowStockThreshold = 10,
  className,
}: StockIndicatorProps) {
  if (isNaN(stock) || stock < 0) {
    console.error("Invalid stock:", stock);
    stock = 0;
  }

  if (isNaN(lowStockThreshold) || lowStockThreshold < 0) {
    console.error("Invalid lowStockThreshold:", lowStockThreshold);
    lowStockThreshold = 10;
  }
  if (stock <= 0) {
    return (
      <Badge variant="destructive" className={cn('gap-1.5', className)} aria-label="Rupture de stock">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive-foreground" aria-hidden="true" />
        Rupture de stock
      </Badge>
    );
  }

  if (stock <= lowStockThreshold) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'gap-1.5 border-amber-500/50 text-amber-600 dark:text-amber-500',
          className
        )}
        aria-label={`Plus que ${stock} en stock`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
        Plus que {stock} en stock
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
        className
      )}
      aria-label="En stock"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
      En stock
    </Badge>
  );
}
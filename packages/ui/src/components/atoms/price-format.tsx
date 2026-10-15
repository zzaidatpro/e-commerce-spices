import { Badge } from '../ui/badge';
import { cn } from "src/lib/utils"

interface PriceFormatProps {
  amount: number;
  currency?: string;
  locale?: string;
  className?: string;
  originalAmount?: number;
}

export function PriceFormat({
  amount,
  currency = 'EUR',
  locale = 'fr-FR',
  className,
  originalAmount,
}: PriceFormatProps) {
  const formattedPrice = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);

  const formattedOriginalPrice = originalAmount
    ? new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(originalAmount)
    : null;

  const discountPercentage = originalAmount
    ? Math.round(((originalAmount - amount) / originalAmount) * 100)
    : null;

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className="font-semibold text-lg">{formattedPrice}</span>
      {formattedOriginalPrice && (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {formattedOriginalPrice}
          </span>
          {discountPercentage && discountPercentage > 0 && (
            <Badge variant="destructive" className="text-xs font-bold">
              -{discountPercentage}%
            </Badge>
          )}
        </>
      )}
    </div>
  );
}
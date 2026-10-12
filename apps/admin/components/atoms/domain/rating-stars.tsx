import { Star, StarHalf } from 'lucide-react';
import { Badge } from '@/components/atoms/ui/badge';
import { cn } from "@/lib/utils";


interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showScore?: boolean;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 16,
  showScore = false,
  className,
}: RatingStarsProps) {
  const normalizedRating = Math.min(Math.max(rating, 0), maxRating);

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        className="flex items-center text-amber-400"
        aria-label={`Note: ${rating} sur ${maxRating}`}
      >
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1;

          if (normalizedRating >= starValue) {
            return (
              <Star
                key={index}
                size={size}
                className="fill-amber-400 text-amber-400"
              />
            );
          }

          if (normalizedRating >= starValue - 0.5) {
            return (
              <StarHalf
                key={index}
                size={size}
                className="fill-amber-400 text-amber-400"
              />
            );
          }

          return (
            <Star
              key={index}
              size={size}
              className="text-muted-foreground/30"
            />
          );
        })}
      </div>

      {showScore && (
        <Badge variant="secondary" className="text-xs px-1.5 py-0">
          {rating.toFixed(1)}
        </Badge>
      )}
    </div>
  );
}
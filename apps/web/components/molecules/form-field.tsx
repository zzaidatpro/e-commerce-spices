import { cn } from "@repo/ui";

type FormFieldProps = React.ComponentProps<"input"> & {
  id: string;
  label: string;
  hint?: string;
  trailing?: React.ReactNode; // ex. bouton afficher/masquer le mot de passe
};

export function FormField({ id, label, hint, trailing, className, ...props }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={cn(
            "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground",
            "placeholder:text-muted-foreground/60 outline-none transition-colors",
            "focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15",
            "disabled:opacity-50",
            trailing && "pr-11",
            className,
          )}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-3 flex items-center">{trailing}</div>}
      </div>

      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
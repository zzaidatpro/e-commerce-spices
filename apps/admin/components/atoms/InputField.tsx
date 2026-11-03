import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  icon?: LucideIcon;
  error?: string;
}

export default function InputField({
  label,
  name,
  icon: Icon,
  error,
  className = '',
  ...props
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={name} className="text-xs font-semibold text-foreground">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <input
          id={name}
          name={name}
          className={`w-full py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50 transition-colors ${
            Icon ? 'pl-9 pr-3' : 'px-3'
          } ${error ? 'border-destructive focus:ring-destructive/50' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-[10px] text-destructive font-medium">{error}</span>}
    </div>
  );
}
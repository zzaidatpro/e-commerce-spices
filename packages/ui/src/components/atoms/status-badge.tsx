import * as React from "react";
import { cn } from "../../lib/utils";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "pending" | "success" | "cancelled" | "active";
}

export function StatusBadge({ status, className, children, ...props }: StatusBadgeProps) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    success: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
    active: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles[status],
        className
      )}
      {...props}
    >
      {children || status}
    </div>
  );
}
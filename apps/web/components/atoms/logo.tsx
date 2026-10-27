import React from "react";
import Link from "next/link";
import { cn } from "@repo/ui";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href="/">
      <h2 className={cn(
        "text-[15px] font-black tracking-wider uppercase text-shop-dark-green hover:text-shop-light-green transition-colors duration-200 group font-sans",
          className
        )}
      >
        Tej <span className="text-shop-light-green group-hover:text-shop-dark-green hoverEffect ease-in-out">patta</span>
      </h2>
    </Link>
  );
};

export default Logo;

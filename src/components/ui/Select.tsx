import { SelectHTMLAttributes } from "react";

export function Select({ className = "", children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`wire-select ${className}`} {...rest}>
      {children}
    </select>
  );
}

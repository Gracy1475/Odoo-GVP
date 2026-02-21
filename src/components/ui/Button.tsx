"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  icon?: ReactNode;
}

const variantClass = {
  primary: "wire-button",
  secondary: "wire-button-alt",
  ghost: "wire-button-alt bg-transparent",
};

export function Button({ children, variant = "primary", icon, className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={`${variantClass[variant]} ${className}`}
      {...rest}
    >
      <span className="pointer-events-none inline-flex items-center gap-2">
        {icon}
        {children}
      </span>
    </button>
  );
}

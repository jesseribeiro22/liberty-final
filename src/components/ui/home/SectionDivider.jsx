// src/components/ui/home/SectionDivider.jsx
import React from "react";

/**
 * SectionDivider
 * - Variante "dark": onda clara para separar fundos escuros
 * - Variante "light": onda escura para separar fundos claros
 * - height: altura (px ou string)
 *
 * Exemplo de uso:
 * <SectionDivider variant="dark" height={80} />
 */
export default function SectionDivider({ variant = "dark", height = 80 }) {
  const h = typeof height === "number" ? `${height}px` : height;

  if (variant === "light") {
    // onda escura sobre fundo claro
    return (
      <div aria-hidden="true" style={{ lineHeight: 0 }}>
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: h }}
        >
          <path
            d="M0,32 C240,96 480,96 720,64 C960,32 1200,32 1440,64 L1440,120 L0,120 Z"
            fill="rgb(17,17,17)" // ~ gray-950
          />
        </svg>
      </div>
    );
  }

  // variante "dark": onda clara sobre fundo escuro
  return (
    <div aria-hidden="true" style={{ lineHeight: 0 }}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: h }}
      >
        <path
          d="M0,32 C240,96 480,96 720,64 C960,32 1200,32 1440,64 L1440,120 L0,120 Z"
          fill="rgba(255,255,255,0.08)" // sutil, aparece em fundo escuro
        />
      </svg>
    </div>
  );
}

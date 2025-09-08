// Arquivo: src/components/ui/home/Header.jsx
import React, { useEffect, useState } from "react";
import logoLiberty from "@/assets/new_logo_liberty_horizontal.png"; // ajuste se o nome for outro

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        "border-b",
        scrolled
          ? "bg-transparent border-white/10 backdrop-blur-md text-white"
          : "bg-red-600 border-red-600 text-white",
      ].join(" ")}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* logo fixa */}
        <a href="#inicio" className="shrink-0">
          <img src={logoLiberty} alt="Liberty" className="h-9 w-auto" />
        </a>

        <button
          className="md:hidden text-white text-3xl"
          onClick={() => setMenuAberto((v) => !v)}
          aria-label="Abrir menu"
        >
          ☰
        </button>

        <nav className="hidden md:flex items-center gap-6 font-semibold">
          {[
            ["inicio", "Início"],
            ["sobre", "Sobre"],
            ["pacotes", "Pacotes"],
            ["depoimentos", "Evolução do aluno"],
            ["areas-atendimento", "Áreas"],
            ["como-funciona", "Como Funciona"],
            ["contato", "Contato"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="relative text-white/95 hover:text-white transition-colors after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 hover:after:w-full after:bg-white after:transition-all after:duration-300"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      {menuAberto && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 font-semibold text-white bg-black/60 backdrop-blur-md">
          {[
            ["inicio", "Início"],
            ["sobre", "Sobre"],
            ["pacotes", "Pacotes"],
            ["depoimentos", "Evolução do aluno"],
            ["areas-atendimento", "Áreas"],
            ["como-funciona", "Como Funciona"],
            ["contato", "Contato"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setMenuAberto(false)}
              className="py-2"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

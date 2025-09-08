// Arquivo: src/components/ui/home/About.jsx (Versão Simplificada)

import React from "react";
import { Button } from "@/components/ui/button";
import fallbackImage from "@/assets/transito-em-sao-paulo.jpeg";

/**
 * Props:
 * - title: string
 * - subtitle: string (Parágrafo principal)
 * - imageUrl?: string
 * - onContact?: () => void
 */
function About({ title, subtitle, imageUrl, onContact }) {
  return (
    <section id="sobre" className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            {/* Título dinâmico */}
            <h2 className="text-3xl font-bold mb-6">{title}</h2>

            {/* Subtítulo/Parágrafo principal dinâmico (com fonte maior) */}
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              {subtitle}
            </p>

            <Button
              onClick={onContact}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Entre em contato
            </Button>
          </div>

          <div className="bg-gray-200 rounded-lg h-96 overflow-hidden flex items-center justify-center">
            {/* Imagem dinâmica com fallback */}
            <img
              src={imageUrl || fallbackImage}
              alt="Trânsito em São Paulo"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;

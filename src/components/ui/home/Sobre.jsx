// Arquivo: src/components/ui/home/Sobre.jsx (Versão Simplificada Final)
import React from "react";
import { Button } from "@/components/ui/button";
import fallbackImage from "@/assets/transito-em-sao-paulo.jpeg";

function About({ title, subtitle, imageUrl, onContact }) {
  return (
    <section id="sobre" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4"> {/* <-- PASSO 1: Espaçamento corrigido */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">{title}</h2>
            
            {/* Subtítulo/Parágrafo principal dinâmico */}
            <p className="text-gray-700 mb-8 text-xl font-medium leading-relaxed"> {/* <-- PASSO 2: Fonte ajustada */}
              {subtitle}
            </p>

            <Button onClick={onContact} className="bg-blue-600 hover:bg-blue-700 text-white">
              Entre em contato
            </Button>
          </div>
          <div className="bg-gray-200 rounded-lg h-96 overflow-hidden flex items-center justify-center shadow-lg">
            <img 
              src={imageUrl || fallbackImage} 
              alt="Mulher dirigindo com confiança" 
              className="object-cover w-full h-full" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;

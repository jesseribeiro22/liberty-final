// src/components/ui/home/Areas.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function AreaThumb({ cidade, imagem_url, getInitials }) {
  if (imagem_url) {
    return (
      <img
        src={imagem_url}
        alt={cidade}
        className="rounded-md h-32 w-full object-cover mb-2"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }
  return (
    <div className="rounded-md h-32 w-full mb-2 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
      <span className="text-2xl font-bold text-gray-200">
        {getInitials?.(cidade) || "SP"}
      </span>
    </div>
  );
}

export default function Areas({
  areas = [],
  carregando = false,
  getInitials,
  onCtaClick,
}) {
  return (
    <section id="areas-atendimento" className="isolate relative z-0 bg-gray-900 text-gray-100 py-16">
      {/* divisor suave */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-gray-800/70 to-transparent" />

      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Áreas de Atendimento</h2>

        {carregando ? (
          <div className="text-center text-gray-300">Carregando áreas…</div>
        ) : areas.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {areas.map((area) => (
              <Card
                key={area.id}
                className="bg-gray-800/70 border border-blue-500/30 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300"
                data-aos="zoom-in"
              >
                <CardHeader>
                  <AreaThumb cidade={area.cidade} imagem_url={area.imagem_url} getInitials={getInitials} />
                  <CardTitle className="text-lg text-white text-center">{area.cidade}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-300 font-semibold text-center">✓ Atendimento Incluso</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-300 mb-8">
            Nenhuma área cadastrada no momento.
          </div>
        )}

        <div className="bg-gray-800/70 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-yellow-300 text-2xl">ℹ️</div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-200 mb-2">Outras Regiões</h3>
              <p className="text-gray-200 mb-3">
                Atendemos também outras regiões da Grande São Paulo com valor adicional. Entre em contato para consultar disponibilidade e valores.
              </p>
              <button
                onClick={onCtaClick}
                className="inline-flex items-center rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-400 transition-colors"
              >
                Consultar Outras Regiões
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


// src/components/ui/home/VideosDepoimentos.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function VideosDepoimentos({ title, videosLoading, videos }) {
  return (
    <section
      id="depoimentos"
      className="isolate relative z-0 bg-gray-900 text-gray-100 py-16"
    >
      {/* divisor suave */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-gray-800/70 to-transparent" />

      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>

        {videosLoading ? (
          <div className="text-center text-gray-300">Carregando vídeos…</div>
        ) : videos.length === 0 ? (
          <div className="text-center text-gray-300">
            Nenhum vídeo disponível no momento.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((v) => (
              <Card
                key={v.id}
                className="bg-gray-800/70 border border-gray-700 backdrop-blur-sm shadow-md hover:-translate-y-1 transition-transform duration-300"
                data-aos="zoom-in"
              >
                <CardContent className="p-0">
                  <div className="bg-black rounded-t-lg overflow-hidden">
                    <iframe
                      className="w-full aspect-video"
                      src={`https://www.youtube.com/embed/${v.youtube_id}`}
                      title={v.titulo || `Vídeo ${v.youtube_id}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 text-white">
                      {v.titulo || "Registro da aula"}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Veja o progresso dos nossos alunos na direção
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

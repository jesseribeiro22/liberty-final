// Arquivo: src/components/ui/home/Depoimentos.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function VideosDepoimentos({
  title,
  videosLoading,
  videos,
}) {
  const safeTitle = title || "Como são as aulas na prática";

  return (
    <section id="depoimentos" className="bg-gray-100 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          {safeTitle}
        </h2>

        {videosLoading && (
          <p className="text-center text-gray-500">
            Carregando vídeos…
          </p>
        )}

        {!videosLoading && (!videos || videos.length === 0) && (
          <p className="text-center text-gray-500">
            Nenhum vídeo disponível no momento.
          </p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(videos || []).map((v) => (
            <Card key={v.id} className="overflow-hidden">
              <div className="aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${v.youtube_id}`}
                  title={v.titulo || `Vídeo ${v.youtube_id}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">
                  {v.titulo || "Registro da aula"}
                </h3>
                <p className="text-sm text-gray-600">
                  Veja o progresso dos nossos alunos na direção
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}



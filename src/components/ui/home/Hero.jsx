// src/components/ui/home/Hero.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import heroMarca from "@/assets/Logo01Branca.png";

/**
 * Hero da Home
 * Props:
 * - title: string
 * - subtitle: string
 * - videoUrl?: string
 * - bgImageUrl?: string
 * - onCtaClick: () => void
 */
export default function Hero({
  title,
  subtitle,
  videoUrl = "",
  bgImageUrl = "",
  onCtaClick,
}) {
  const hasVideo = Boolean(videoUrl?.trim());
  const hasBgImg = Boolean(bgImageUrl?.trim());

  return (
    // MUDANÇA 1: Adicionadas classes para altura mínima da tela e para centralizar o conteúdo.
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: hasBgImg ? `url(${bgImageUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Vídeo de fundo (se houver) */}
      {hasVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover -z-10 pointer-events-none"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}

      {/* Overlay escuro para dar contraste */}
      <div className="absolute inset-0 -z-10 pointer-events-none bg-gray-900/80" />

      {/* MUDANÇA 2: Removidos os espaçamentos (padding) que estavam na <section>
          e movidos para este container, para melhor controle do alinhamento. */}
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        {/* Marca */}
        <div className="flex justify-center">
          <img
            src={heroMarca}
            alt="Liberty"
            className="w-[520px] max-w-[70vw] h-auto opacity-95 drop-shadow-lg"
            // Removido o style de margem, pois o flexbox agora cuida do alinhamento.
          />
        </div>

        {/* Título/Subtítulo */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mt-4">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mt-2 max-w-4xl mx-auto">
          {subtitle}
        </p>

        {/* Botão */}
        <div className="mt-8">
          <Button
            onClick={onCtaClick}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
          >
            Fale no WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}


// src/pages/HomePage.jsx (Versão com a seção "Sobre" simplificada)
import React, { useEffect, useState } from "react";

// Componentes da UI
import Header from "@/components/ui/home/Header";
import Hero from "@/components/ui/home/Hero";
import Sobre from "@/components/ui/home/Sobre"; // Mantido o nome original
import Benefits from "@/components/ui/home/Benefits";
import Pacotes from "@/components/ui/home/Pacotes";
import Areas from "@/components/ui/home/Areas";
import VideosDepoimentos from "@/components/ui/home/VideosDepoimentos";
import ComoFunciona from "@/components/ui/home/ComoFunciona";
import Contato from "@/components/ui/home/Contato";
import Footer from "@/components/ui/home/Footer";
import WhatsAppButton from "../components/ui/WhatsAppButton.jsx";

// Libs
import AOS from "aos";
import "aos/dist/aos.css";
import { supabase } from "@/lib/supabaseClient.js";

// Helpers
const getInitials = (nome = "") =>
  (nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")) || "SP";

export default function HomePage() {
  // ======= STATES =======
  const [areas, setAreas] = useState([]);
  const [areasCarregando, setAreasCarregando] = useState(true);

  const [pacotes, setPacotes] = useState([]);

  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [heroBgImageUrl, setHeroBgImageUrl] = useState("");

  // ===== SEÇÃO SOBRE - SIMPLIFICADO =====
  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutSubtitle, setAboutSubtitle] = useState("");
  const [aboutImageUrl, setAboutImageUrl] = useState("");

  const [videosTitle, setVideosTitle] = useState("");
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);

  // ======= EFFECTS =======
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // Pacotes
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("pacotes")
        .select("*")
        .order("preco", { ascending: true });

      if (!error) setPacotes(data || []);
    })();
  }, []);

  // Áreas
  useEffect(() => {
    (async () => {
      setAreasCarregando(true);
      const { data, error } = await supabase
        .from("areas")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true })
        .order("cidade", { ascending: true });

      setAreas(error ? [] : data || []);
      setAreasCarregando(false);
    })();
  }, []);

  // Textos do site (hero/about/videos)
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_texts")
        .select("key, value")
        .in("key", [
          "hero_title",
          "hero_subtitle",
          "hero_video_url",
          "hero_bg_image_url",
          "about_title",
          "about_subtitle", // Apenas os campos necessários
          "about_image_url",
          "videos_title",
        ]);

      if (error) {
        console.error("Erro ao buscar textos:", error);
        return;
      }

      const map = new Map(data.map((r) => [r.key, r.value]));

      setHeroTitle(map.get("hero_title") || "");
      setHeroSubtitle(map.get("hero_subtitle") || "");
      setHeroVideoUrl(map.get("hero_video_url") || "");
      setHeroBgImageUrl(map.get("hero_bg_image_url") || "");

      setAboutTitle(map.get("about_title") || "");
      setAboutSubtitle(map.get("about_subtitle") || "");
      setAboutImageUrl(map.get("about_image_url") || "");

      setVideosTitle(map.get("videos_title") || "");
    })();
  }, []);

  // Vídeos
  useEffect(() => {
    (async () => {
      setVideosLoading(true);
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: true });

      setVideos(error ? [] : data || []);
      setVideosLoading(false);
    })();
  }, []);

  // ======= HANDLERS =======
  const handleWhatsAppClick = () =>
    window.open("https://wa.me/5511968409733", "_blank"  );

  // ======= RENDER =======
  return (
    <>
      <Header />

      <Hero
        title={heroTitle}
        subtitle={heroSubtitle}
        videoUrl={heroVideoUrl}
        bgImageUrl={heroBgImageUrl}
        onCtaClick={handleWhatsAppClick}
      />

      {/* ===== SOBRE (Renderização Simplificada) ===== */}
      <Sobre
        title={aboutTitle}
        subtitle={aboutSubtitle}
        imageUrl={aboutImageUrl}
        onContact={handleWhatsAppClick}
      />

      <Benefits />

      <Pacotes pacotes={pacotes} onCtaClick={handleWhatsAppClick} />

      <VideosDepoimentos
        title={videosTitle}
        videosLoading={videosLoading}
        videos={videos}
      />

      <Areas
        areas={areas}
        carregando={areasCarregando}
        getInitials={getInitials}
        onCtaClick={handleWhatsAppClick}
      />

      <ComoFunciona onCtaClick={handleWhatsAppClick} />

      <Contato />

      <Footer />

      <WhatsAppButton />
    </>
  );
}

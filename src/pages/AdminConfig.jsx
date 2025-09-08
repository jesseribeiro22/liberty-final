// src/pages/AdminConfig.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Importado para a nova seção

/**
 * AdminConfig
 * - Textos do Site: hero_title, hero_subtitle, videos_title, hero_video_url,
 *                   hero_bg_image_url, contact_bg_image_url
 * - Footer: whatsapp principal/alternativo + email
 * - Senha: alteração de senha do usuário logado
 *
 * Storage usado:
 * - Bucket público "site"    -> uploads da imagem de fundo da HERO   (caminho: bg/<timestamp>_<nome>)
 * - Bucket público "contact" -> uploads da imagem de fundo CONTATO   (caminho: bg/<timestamp>_<nome>)
 */

const HERO_BUCKET = "site";      // <-- ALTERADO (era "hero")
const CONTACT_BUCKET = "contact";

export default function AdminConfig() {
  // ====== STATES – TEXTOS DO SITE ======
  const [loadingTextos, setLoadingTextos] = useState(true);
  const [savingTextos, setSavingTextos] = useState(false);

  const [heroTitle, setHeroTitle] = useState(
    "Recupere sua liberdade no volante com aulas práticas seguras e personalizadas"
  );
  const [heroSubtitle, setHeroSubtitle] = useState(
    "A Liberty é uma empresa especializada em aulas para motoristas já habilitados que sentem medo ou insegurança ao dirigir."
  );
  const [videosTitle, setVideosTitle] = useState("Como são as aulas na prática");
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [heroBgImageUrl, setHeroBgImageUrl] = useState("");

  // Fundo da seção Contato
  const [contactBgImageUrl, setContactBgImageUrl] = useState("");

  // upload flags
  const [uploadingHeroBg, setUploadingHeroBg] = useState(false);
  const [uploadingContactBg, setUploadingContactBg] = useState(false);

  // ====== STATES – SOBRE ======
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutSubtitle, setAboutSubtitle] = useState('');
  const [aboutImageUrl, setAboutImageUrl] = useState('');
  const [aboutImageFile, setAboutImageFile] = useState(null);
  const [uploadingAbout, setUploadingAbout] = useState(false);

  // ====== STATES – FOOTER ======
  const [loadingFooter, setLoadingFooter] = useState(true);
  const [savingFooter, setSavingFooter] = useState(false);

  const [whatsPrincipal, setWhatsPrincipal] = useState("11968409733");
  const [whatsAlternativo, setWhatsAlternativo] = useState("11944414125");
  const [emailContato, setEmailContato] = useState("joseildoliberty@hotmail.com");

  // ====== STATES – SENHA ======
  const [savingSenha, setSavingSenha] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ===============================
  // LOAD: TEXTOS (site_texts)
  // ===============================
  useEffect(() => {
    (async () => {
      setLoadingTextos(true);
      const { data, error } = await supabase
        .from("site_texts")
        .select("key, value")
        .in("key", [
          "hero_title",
          "hero_subtitle",
          "videos_title",
          "hero_video_url",
          "hero_bg_image_url",
          "contact_bg_image_url",
          "about_title",       // <-- ADICIONADO
          "about_subtitle",    // <-- ADICIONADO
          "about_image_url",   // <-- ADICIONADO
        ]);

      if (!error && Array.isArray(data)) {
        const map = new Map(data.map((r) => [r.key, r.value]));
        if (map.has("hero_title")) setHeroTitle(map.get("hero_title") || "");
        if (map.has("hero_subtitle")) setHeroSubtitle(map.get("hero_subtitle") || "");
        if (map.has("videos_title")) setVideosTitle(map.get("videos_title") || "");
        if (map.has("hero_video_url")) setHeroVideoUrl((map.get("hero_video_url") || "").trim());
        if (map.has("hero_bg_image_url"))
          setHeroBgImageUrl((map.get("hero_bg_image_url") || "").trim());
        if (map.has("contact_bg_image_url"))
          setContactBgImageUrl((map.get("contact_bg_image_url") || "").trim());
        
        // Lógica para "Sobre" adicionada
        if (map.has("about_title")) setAboutTitle(map.get("about_title") || "");
        if (map.has("about_subtitle")) setAboutSubtitle(map.get("about_subtitle") || "");
        if (map.has("about_image_url")) setAboutImageUrl((map.get("about_image_url") || "").trim());
      }
      setLoadingTextos(false);
    })();
  }, []);

  // ===============================
  // LOAD: FOOTER (site_texts)
  // ===============================
  useEffect(() => {
    (async () => {
      setLoadingFooter(true);
      const { data, error } = await supabase
        .from("site_texts")
        .select("key, value")
        .in("key", ["footer_whatsapp_principal", "footer_whatsapp_alt", "footer_email"]);

      if (!error && Array.isArray(data)) {
        const map = new Map(data.map((r) => [r.key, r.value]));
        if (map.has("footer_whatsapp_principal"))
          setWhatsPrincipal(map.get("footer_whatsapp_principal") || "");
        if (map.has("footer_whatsapp_alt"))
          setWhatsAlternativo(map.get("footer_whatsapp_alt") || "");
        if (map.has("footer_email")) setEmailContato(map.get("footer_email") || "");
      }
      setLoadingFooter(false);
    })();
  }, []);

  // ===============================
  // SAVE: TEXTOS (site_texts)
  // ===============================
  async function handleSalvarTextos(e) {
    e.preventDefault();
    if (savingTextos) return;

    setSavingTextos(true);

    const rows = [
      { key: "hero_title", value: heroTitle ?? "" },
      { key: "hero_subtitle", value: heroSubtitle ?? "" },
      { key: "videos_title", value: videosTitle ?? "" },
      { key: "hero_video_url", value: (heroVideoUrl || "").trim() },
      { key: "hero_bg_image_url", value: (heroBgImageUrl || "").trim() },
      { key: "contact_bg_image_url", value: (contactBgImageUrl || "").trim() },
      // Campos "Sobre" adicionados
      { key: "about_title", value: aboutTitle ?? "" },
      { key: "about_subtitle", value: aboutSubtitle ?? "" },
      { key: "about_image_url", value: (aboutImageUrl || "").trim() },
    ];

    const { error } = await supabase.from("site_texts").upsert(rows, {
      onConflict: "key",
    });

    setSavingTextos(false);

    if (error) {
      alert("Erro ao salvar Textos do Site: " + error.message);
    } else {
      alert("Textos do Site atualizados!");
    }
  }

  // ===============================
  // SAVE: FOOTER (site_texts)
  // ===============================
  async function handleSalvarFooter(e) {
    e.preventDefault();
    if (savingFooter) return;

    setSavingFooter(true);

    const rows = [
      { key: "footer_whatsapp_principal", value: whatsPrincipal ?? "" },
      { key: "footer_whatsapp_alt", value: whatsAlternativo ?? "" },
      { key: "footer_email", value: emailContato ?? "" },
    ];

    const { error } = await supabase.from("site_texts").upsert(rows, {
      onConflict: "key",
    });

    setSavingFooter(false);

    if (error) {
      alert("Erro ao salvar Contatos do Footer: " + error.message);
    } else {
      alert("Contatos do Footer atualizados!");
    }
  }

  // ===============================
  // SENHA (Supabase Auth)
  // ===============================
  async function handleAlterarSenha(e) {
    e.preventDefault();
    if (savingSenha) return;

    if (!newPassword || newPassword.length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    setSavingSenha(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingSenha(false);

    if (error) {
      alert("Erro ao alterar senha: " + error.message);
    } else {
      setNewPassword("");
      setConfirmPassword("");
      alert("Senha alterada com sucesso!");
    }
  }

  // ===============================
  // UPLOAD: Hero Background (Storage)  <-- usa bucket 'site'
  // ===============================
  async function handleUploadHeroBg(file) {
    if (!file) return;
    try {
      setUploadingHeroBg(true);

      const path = `bg/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage
        .from(HERO_BUCKET) // 'site'
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (upErr) {
        alert("Erro no upload da imagem: " + upErr.message);
        setUploadingHeroBg(false);
        return;
      }

      const { data: pub } = supabase.storage.from(HERO_BUCKET).getPublicUrl(path);
      const publicUrl = pub?.publicUrl || "";
      setHeroBgImageUrl(publicUrl);

      const { error: upsertErr } = await supabase
        .from("site_texts")
        .upsert([{ key: "hero_bg_image_url", value: publicUrl }], { onConflict: "key" });

      if (upsertErr) alert("Imagem enviada, mas houve erro ao salvar a URL: " + upsertErr.message);
      else alert("Imagem da HERO enviada e salva com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Falha inesperada no upload. Tente novamente.");
    } finally {
      setUploadingHeroBg(false);
    }
  }
  function handleLimparHeroBg() {
    setHeroBgImageUrl("");
  }

  // ===============================
  // UPLOAD: Contact Background (Storage)
  // ===============================
  async function handleUploadContactBg(file) {
    if (!file) return;
    try {
      setUploadingContactBg(true);

      const path = `bg/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage
        .from(CONTACT_BUCKET) // 'contact'
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (upErr) {
        alert("Erro no upload da imagem: " + upErr.message);
        setUploadingContactBg(false);
        return;
      }

      const { data: pub } = supabase.storage.from(CONTACT_BUCKET).getPublicUrl(path);
      const publicUrl = pub?.publicUrl || "";
      setContactBgImageUrl(publicUrl);

      const { error: upsertErr } = await supabase
        .from("site_texts")
        .upsert([{ key: "contact_bg_image_url", value: publicUrl }], { onConflict: "key" });

      if (upsertErr)
        alert("Imagem enviada, mas houve erro ao salvar a URL: " + upsertErr.message);
      else alert("Imagem do CONTATO enviada e salva com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Falha inesperada no upload. Tente novamente.");
    } finally {
      setUploadingContactBg(false);
    }
  }
  function handleLimparContactBg() {
    setContactBgImageUrl("");
  }

  // ===============================
  // UPLOAD: About Image (Storage)
  // ===============================
  async function handleUploadAboutImage(file) {
    if (!file) return;
    try {
      setUploadingAbout(true);

      // Usaremos o bucket 'site' para simplificar
      const path = `about/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("site") 
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (upErr) {
        alert("Erro no upload da imagem: " + upErr.message);
        setUploadingAbout(false);
        return;
      }

      const { data: pub } = supabase.storage.from("site").getPublicUrl(path);
      const publicUrl = pub?.publicUrl || "";
      setAboutImageUrl(publicUrl);
      
      // Salva a URL imediatamente no banco
      await supabase
        .from("site_texts")
        .upsert([{ key: "about_image_url", value: publicUrl }], { onConflict: "key" });

      alert("Imagem da seção Sobre enviada e salva com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Falha inesperada no upload. Tente novamente.");
    } finally {
      setUploadingAbout(false);
    }
  }
  function handleLimparAboutImage() {
    setAboutImageUrl("");
  }

  return (
    <div className="space-y-8">
      {/* TEXTOS DO SITE */}
      <Card>
        <CardHeader>
          <CardTitle>Textos do Site (Hero / Vídeos / Contato)</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTextos ? (
            <p className="text-gray-500">Carregando…</p>
          ) : (
            <form onSubmit={handleSalvarTextos} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Título da Hero</Label>
                  <Input
                    id="heroTitle"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Ex.: Recupere sua liberdade no volante…"
                    required
                />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videosTitle">Título da seção de vídeos</Label>
                  <Input
                    id="videosTitle"
                    value={videosTitle}
                    onChange={(e) => setVideosTitle(e.target.value)}
                    placeholder="Ex.: Como são as aulas na prática"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="heroSubtitle">Subtítulo da Hero</Label>
                  <Input
                    id="heroSubtitle"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Subtítulo que aparece embaixo do título principal"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroVideoUrl">URL do Vídeo de Fundo (opcional)</Label>
                  <Input
                    id="heroVideoUrl"
                    value={heroVideoUrl}
                    onChange={(e) => setHeroVideoUrl(e.target.value)}
                    placeholder="https://… (mp4, mov, etc. )"
                  />
                  <p className="text-xs text-gray-500">
                    Se preenchido, o vídeo fica por baixo da imagem/overlay na seção Hero.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroBgImageUrl">
                    URL da Imagem de Fundo da Hero (enviada no bucket “{HERO_BUCKET}”)
                  </Label>
                  <Input
                    id="heroBgImageUrl"
                    value={heroBgImageUrl}
                    onChange={(e) => setHeroBgImageUrl(e.target.value)}
                    placeholder="https://… (imagem )"
                  />
                  <p className="text-xs text-gray-500">
                    Você pode colar a URL ou enviar um arquivo aqui embaixo.
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="heroBgFile"
                      onChange={(e) => handleUploadHeroBg(e.currentTarget.files?.[0])}
                      disabled={uploadingHeroBg}
                    />
                    {uploadingHeroBg ? (
                      <span className="text-sm text-gray-500">Enviando…</span>
                    ) : (
                      <Button type="button" variant="secondary" onClick={handleLimparHeroBg}>
                        Limpar imagem
                      </Button>
                    )}
                  </div>
                  {heroBgImageUrl ? (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Pré-visualização:</p>
                      <div className="rounded-md overflow-hidden border">
                        <img
                          src={heroBgImageUrl}
                          alt="Hero BG Preview"
                          className="w-full h-40 object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Fundo da seção CONTATO */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="contactBgImageUrl">
                    URL da Imagem de Fundo da seção Contato (enviada no bucket “{CONTACT_BUCKET}”)
                  </Label>
                  <Input
                    id="contactBgImageUrl"
                    value={contactBgImageUrl}
                    onChange={(e) => setContactBgImageUrl(e.target.value)}
                    placeholder="https://… (imagem )"
                  />
                  <p className="text-xs text-gray-500">
                    Você pode colar a URL ou enviar um arquivo abaixo. Recomendado usar imagens
                    com foco central e boa legibilidade (o site aplica overlay para leitura).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Enviar arquivo (bucket “{CONTACT_BUCKET}”)</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      id="contactBgFile"
                      onChange={(e) => handleUploadContactBg(e.currentTarget.files?.[0])}
                      disabled={uploadingContactBg}
                    />
                    {uploadingContactBg ? (
                      <span className="text-sm text-gray-500">Enviando…</span>
                    ) : (
                      <Button type="button" variant="secondary" onClick={handleLimparContactBg}>
                        Limpar imagem
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {contactBgImageUrl ? (
                    <>
                      <Label>Pré-visualização</Label>
                      <div className="rounded-md overflow-hidden border">
                        <img
                          src={contactBgImageUrl}
                          alt="Contact BG Preview"
                          className="w-full h-40 object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              {/* SEÇÃO SOBRE */}
              <hr className="my-8" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">Seção Sobre</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="aboutTitle">Título da Seção Sobre</Label>
                  <Input
                    id="aboutTitle"
                    value={aboutTitle}
                    onChange={(e) => setAboutTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="aboutSubtitle">Subtítulo/Descrição da Seção Sobre</Label>
                  <Textarea
                    id="aboutSubtitle"
                    rows={4}
                    value={aboutSubtitle}
                    onChange={(e) => setAboutSubtitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Imagem da Seção Sobre</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="aboutImageFile"
                      onChange={(e) => handleUploadAboutImage(e.currentTarget.files?.[0])}
                      disabled={uploadingAbout}
                    />
                    {uploadingAbout ? (
                      <span className="text-sm text-gray-500">Enviando…</span>
                    ) : (
                      <Button type="button" variant="secondary" onClick={handleLimparAboutImage}>
                        Limpar imagem
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {aboutImageUrl ? (
                    <>
                      <Label>Pré-visualização</Label>
                      <div className="rounded-md overflow-hidden border">
                        <img
                          src={aboutImageUrl}
                          alt="About BG Preview"
                          className="w-full h-40 object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={savingTextos}>
                  {savingTextos ? "Salvando…" : "Salvar Textos"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* FOOTER */}
      <Card>
        <CardHeader>
          <CardTitle>Contatos do Footer</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingFooter ? (
            <p className="text-gray-500">Carregando…</p>
          ) : (
            <form onSubmit={handleSalvarFooter} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="w1">WhatsApp principal</Label>
                  <Input
                    id="w1"
                    value={whatsPrincipal}
                    onChange={(e) => setWhatsPrincipal(e.target.value)}
                    placeholder="11999999999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="w2">WhatsApp alternativo</Label>
                  <Input
                    id="w2"
                    value={whatsAlternativo}
                    onChange={(e) => setWhatsAlternativo(e.target.value)}
                    placeholder="11999999999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="em">E-mail</Label>
                  <Input
                    id="em"
                    value={emailContato}
                    onChange={(e) => setEmailContato(e.target.value)}
                    placeholder="voce@exemplo.com"
                  />
                </div>
              </div>
              <Button type="submit" disabled={savingFooter}>
                {savingFooter ? "Salvando…" : "Salvar Contatos"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ALTERAR SENHA */}
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAlterarSenha} className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="npw">Nova senha</Label>
              <Input
                id="npw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpw">Confirmar nova senha</Label>
              <Input
                id="cpw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={savingSenha}>
                {savingSenha ? "Salvando…" : "Alterar Senha"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

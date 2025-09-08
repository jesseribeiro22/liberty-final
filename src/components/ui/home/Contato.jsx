// src/components/ui/home/Contato.jsx (Versão com Feedback Visual)
import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Home, MapPin, Clock, Shield } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { createLead } from "@/services/leadsService";

export default function Contato() {
  const [sending, setSending] = useState(false);
  const [bgUrl, setBgUrl] = useState("");
  const formRef = useRef(null);

  // << MUDANÇA 1: Estado para controlar o feedback do formulário >>
  const [formFeedback, setFormFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_texts")
        .select("value")
        .eq("key", "contact_bg_image_url")
        .maybeSingle();
      if (!error && data?.value) setBgUrl(String(data.value));
    })();
  }, []);

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (sending) return;

    // Limpa o feedback anterior a cada novo envio
    setFormFeedback({ type: '', message: '' });
    setSending(true);

    const fd = new FormData(e.currentTarget);
    const nome = fd.get("nome")?.toString().trim();
    const email = fd.get("email")?.toString().trim();
    const telefone = fd.get("telefone")?.toString().trim();
    const cidade = fd.get("cidade")?.toString().trim();
    const mensagem = fd.get("mensagem")?.toString().trim();

    if (!nome || !email || !cidade || !mensagem) {
      // << MUDANÇA 2: Usa o estado de feedback em vez de alert() >>
      setFormFeedback({ type: 'error', message: 'Por favor, preencha todos os campos obrigatórios.' });
      setSending(false);
      return;
    }

    const payload = { nome, email, telefone, cidade, mensagem };

    try {
      const { error } = await createLead(payload);

      if (error) {
        console.error("Erro ao criar lead:", error);
        // << MUDANÇA 3: Usa o estado de feedback para erros >>
        setFormFeedback({ type: 'error', message: 'Não foi possível enviar seu contato. Tente novamente.' });
      } else {
        // << MUDANÇA 4: Usa o estado de feedback para sucesso >>
        setFormFeedback({ type: 'success', message: 'Recebemos seu contato! Em breve retornaremos.' });
        if (formRef.current) {
          formRef.current.reset();
        }
      }
    } catch (err) {
      console.error("Exceção no formulário:", err);
      setFormFeedback({ type: 'error', message: 'Ocorreu um erro inesperado. Tente mais tarde.' });
    } finally {
      setSending(false);
      // Limpa a mensagem após 5 segundos
      setTimeout(() => setFormFeedback({ type: '', message: '' }), 5000);
    }
  }

  return (
    <section
      id="contato"
      className="relative py-16"
      style={ bgUrl ? { backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined }
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Entre em contato</h2>
        <div className="grid md:grid-cols-2 gap-8 items-start justify-items-center">
          <Card className="w-full md:w-[70%] h-full bg-white/20 backdrop-blur-md border-white/30 shadow-xl">
            <CardContent className="p-8">
              <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="nome" className="text-white">Nome</Label>
                  <Input id="nome" name="nome" type="text" required className="mt-1 bg-white/80" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">E-mail</Label>
                  <Input id="email" name="email" type="email" required className="mt-1 bg-white/80" />
                </div>
                <div>
                  <Label htmlFor="telefone" className="text-white">Telefone (WhatsApp)</Label>
                  <Input id="telefone" name="telefone" type="tel" placeholder="11999999999" className="mt-1 bg-white/80" />
                </div>
                <div>
                  <Label htmlFor="cidade" className="text-white">Cidade</Label>
                  <Input id="cidade" name="cidade" type="text" placeholder="Ex.: Embu das Artes" required className="mt-1 bg-white/80" />
                </div>
                <div>
                  <Label htmlFor="mensagem" className="text-white">Mensagem</Label>
                  <Textarea id="mensagem" name="mensagem" required rows={4} className="mt-1 bg-white/80" />
                </div>
                <p className="text-sm text-white/80">
                  💡 Receberemos sua mensagem e entraremos em contato pelo WhatsApp informado.
                </p>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={sending}>
                  {sending ? "Enviando..." : "Enviar"}
                </Button>
                
                {/* << MUDANÇA 5: Elemento de feedback visual >> */}
                {formFeedback.message && (
                  <p className={`mt-4 text-center font-semibold p-3 rounded-md ${
                    formFeedback.type === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {formFeedback.message}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
          <Card className="w-full md:w-[70%] h-full border-0 shadow-2xl bg-gradient-to-b from-neutral-900/70 to-neutral-900/50 backdrop-blur-md ring-1 ring-white/10">
            <CardHeader className="pb-2">
              <div className="inline-flex items-center gap-2">
                <span className="h-5 w-1.5 rounded-full bg-red-500" />
                <CardTitle className="text-white text-2xl">A Liberty vai até você</CardTitle>
              </div>
              <p className="text-neutral-200 mt-2">Seu endereço é o nosso ponto de partida.</p>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-neutral-200/90 leading-relaxed">
                Sem sair de casa: o instrutor busca você onde mora e finaliza a aula no mesmo local. Aprenda nos trajetos que você realmente usa — trabalho, faculdade, escola dos filhos — ganhando confiança no trânsito do seu dia a dia.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3">
                  <Home size={18} className="text-red-400 mt-0.5" />
                  <span className="text-neutral-200">Embarque e desembarque na sua casa</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-red-400 mt-0.5" />
                  <span className="text-neutral-200">Aulas nos seus trajetos reais</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={18} className="text-red-400 mt-0.5" />
                  <span className="text-neutral-200">Economia de tempo e mais conveniência</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield size={18} className="text-red-400 mt-0.5" />
                  <span className="text-neutral-200">Segurança e acompanhamento personalizado</span>
                </li>
              </ul>
              <div className="mt-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-sm text-neutral-200/90">
                  Atendemos Grande São Paulo — consulte disponibilidade para sua região.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

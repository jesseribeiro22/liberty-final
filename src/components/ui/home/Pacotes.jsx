// src/components/ui/home/Pacotes.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const cardStyles = {
  red:    { border: "border-red-500/40",    badge: "bg-red-600",    price: "text-red-400",    cta: "bg-red-600 hover:bg-red-700" },
  yellow: { border: "border-yellow-500/40", badge: "bg-yellow-500", price: "text-yellow-300", cta: "bg-yellow-500 hover:bg-yellow-600 text-black" },
  blue:   { border: "border-blue-500/40",   badge: "bg-blue-600",   price: "text-blue-300",   cta: "bg-blue-600 hover:bg-blue-700" },
};

export default function Pacotes({ pacotes = [], onCtaClick }) {
  return (
    <section id="pacotes" className="isolate relative z-0 bg-gray-900 text-gray-100 py-16">
      {/* divisor suave para separar da seção anterior */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-gray-800/70 to-transparent" />

      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Nossos Pacotes</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {pacotes.map((pacote) => {
            const styles = cardStyles[pacote.cor_card] || cardStyles.red;
            return (
              <Card
                key={pacote.id}
                className={[
                  "bg-gray-800/70 border",
                  styles.border,
                  "backdrop-blur-sm shadow-lg hover:-translate-y-1 transition-transform duration-300"
                ].join(" ")}
                data-aos="fade-left"
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full ${styles.badge} text-white flex items-center justify-center mx-auto mb-4 font-bold text-xl`}>
                    {pacote.numero_aulas}
                  </div>
                  <CardTitle className="text-2xl text-white text-center">{pacote.titulo}</CardTitle>
                  <p className={`text-3xl font-bold ${styles.price} mt-2 text-center`}>R$ {pacote.preco}</p>
                </CardHeader>
                <CardContent>
                  <ul className="text-gray-200/90 space-y-2 text-sm">
                    <li>✓ {pacote.numero_aulas} aulas práticas</li>
                    <li>✓ 45 minutos cada aula</li>
                    <li>✓ Horários flexíveis</li>
                    <li>✓ Instrutor experiente</li>
                    <li>✓ Foco na confiança</li>
                    {pacote.economia && <li>✓ {pacote.economia}</li>}
                  </ul>
                  <Button
                    onClick={onCtaClick}
                    className={`w-full mt-6 ${styles.cta} text-white`}
                  >
                    Contratar Pacote
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-300">💡 Pagamento via Pix no WhatsApp</p>
        </div>
      </div>
    </section>
  );
}

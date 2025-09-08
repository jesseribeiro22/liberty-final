// src/components/ui/home/ComoFunciona.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STEPS = [
  { step: 1, title: "Contato",        desc: "Entre em contato pelo WhatsApp",      color: "red"    },
  { step: 2, title: "Dúvidas",        desc: "Esclareça suas dúvidas diretamente",  color: "yellow" },
  { step: 3, title: "Agendamento",    desc: "Agende com flexibilidade",            color: "blue"   },
  { step: 4, title: "Aula Prática",   desc: "Aula respeitando seu ritmo",          color: "red"    },
  { step: 5, title: "Pagamento",      desc: "Pagamento via Pix no WhatsApp",       color: "yellow" },
];

function badgeColor(color) {
  switch (color) {
    case "red": return "bg-red-600";
    case "yellow": return "bg-yellow-500 text-black";
    default: return "bg-blue-600";
  }
}

export default function ComoFunciona({ onCtaClick }) {
  return (
    <section id="como-funciona" className="isolate relative z-0 bg-gray-900 text-gray-100 py-16">
      {/* divisor suave */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-gray-800/70 to-transparent" />

      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Como funcionam as aulas práticas</h2>

        <div className="grid md:grid-cols-5 gap-8">
          {STEPS.map((item, idx) => {
            const anim = ["fade-right","fade-up","fade-left","fade-up","fade-right"][idx];
            return (
              <Card
                key={item.step}
                className="bg-gray-800/70 border border-gray-700 backdrop-blur-sm text-center hover:-translate-y-1 transition-transform duration-300"
                data-aos={anim}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-full ${badgeColor(item.color)} text-white flex items-center justify-center mx-auto mb-4 font-bold text-lg`}>
                    {item.step}
                  </div>
                  <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-200 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={onCtaClick}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
          >
            Agendar primeira aula
          </Button>
        </div>
      </div>
    </section>
  );
}

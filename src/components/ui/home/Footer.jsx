// src/components/ui/home/Footer.jsx (Versão com Links Acessíveis)
import React from "react";
import logoLiberty from "@/assets/logo_liberty.jpg";
import { MessageCircle, Phone } from "lucide-react";

export default function Footer() {
  // A função scrollToSection não é mais necessária aqui,
  // pois o navegador cuida da rolagem com os links de âncora.
  // No entanto, a rolagem suave é definida globalmente no seu CSS (html { scroll-behavior: smooth; }),
  // então o efeito visual será o mesmo.

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo + descrição */}
          <div>
            <img
              src={logoLiberty}
              alt="Liberty"
              className="h-12 mb-4"
            />
            <p className="text-gray-400">
              Aulas de direção personalizadas para motoristas já habilitados
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-gray-400">
              {[
                "inicio",
                "sobre",
                "pacotes",
                "areas-atendimento",
                "depoimentos",
                "como-funciona",
                "contato",
              ].map((id) => (
                <li key={id}>
                  {/* << MUDANÇA AQUI: de <button> para <a> >> */}
                  <a
                    href={`#${id}`}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {id
                      .replace(/-/g, " ") // Corrigido para substituir todos os hifens
                      .replace(/\b\w/g, (s) => s.toUpperCase())}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center gap-2">
                <MessageCircle size={16} />
                WhatsApp: (11) 96840-9733
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} />
                WhatsApp Alternativo: (11) 94441-4125
              </p>
              <p className="flex items-center gap-2">
                📧 E-mail: joseildoliberty@hotmail.com
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Liberty - Aulas de Direção. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

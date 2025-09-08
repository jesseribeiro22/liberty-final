// src/components/ui/WhatsAppButton.jsx
import React from 'react';

// Componente SVG para o ícone do WhatsApp, para maior fidelidade visual.
const WhatsAppIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M16.6 14.2c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.5-1.8-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.3-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.7-.8 1.8 0 1 .8 2.1 1 2.2.1 0 1.5.7 3.5 2.5 1.8 1.6 2.1 1.5 2.5 1.5.4 0 1.2-.5 1.4-1 .2-.5.2-1 .1-1.1s-.2-.2-.4-.3zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18.2c-4.5 0-8.2-3.7-8.2-8.2S7.5 3.8 12 3.8s8.2 3.7 8.2 8.2-3.7 8.2-8.2 8.2z" />
  </svg>
 );

export default function WhatsAppButton() {
  const handleWhatsAppClick = () => {
    const phoneNumber = "5511968409733";
    window.open(`https://wa.me/${phoneNumber}`, "_blank" );
  };

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        handleWhatsAppClick();
      }}
      // Classes atualizadas para um botão circular e moderno
      className="fixed bottom-6 right-6 z-50 h-14 w-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:bg-green-600 animate-pulse"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <WhatsAppIcon className="h-8 w-8" />
    </a>
  );
}

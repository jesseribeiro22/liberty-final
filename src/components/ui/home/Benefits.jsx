// src/components/ui/home/Benefits.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Heart, Clock } from "lucide-react";

export default function Benefits() {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Por que escolher a Liberty?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="card-border-red hover-lift smooth-transition bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <CardTitle className="text-xl text-white">Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center">
                Aulas práticas com foco total na sua segurança e confiança no volante.
              </p>
            </CardContent>
          </Card>

          <Card className="card-border-yellow hover-lift smooth-transition bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <Heart className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <CardTitle className="text-xl text-white">Paciência</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center">
                Instrutor experiente e paciente, respeitando seu ritmo e necessidades.
              </p>
            </CardContent>
          </Card>

          <Card className="card-border-blue hover-lift smooth-transition bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <CardTitle className="text-xl text-white">Flexibilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center">
                Horários flexíveis que se adaptam à sua rotina e disponibilidade.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}


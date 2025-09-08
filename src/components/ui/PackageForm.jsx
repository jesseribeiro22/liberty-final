// Arquivo: src/components/ui/PackageForm.jsx

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Props:
 * - onFinished(): callback após salvar
 * - initialData?: { id, titulo, preco, numero_aulas, economia, cor_card }
 */
function PackageForm({ onFinished, initialData = null }) {
  const isEdit = Boolean(initialData?.id);

  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [preco, setPreco] = useState('');
  const [numeroAulas, setNumeroAulas] = useState('');
  const [economia, setEconomia] = useState('');
  const [corCard, setCorCard] = useState('red');

  // Preenche o form quando em edição
  useEffect(() => {
    if (isEdit) {
      setTitulo(initialData.titulo ?? '');
      setPreco(String(initialData.preco ?? ''));
      setNumeroAulas(String(initialData.numero_aulas ?? ''));
      setEconomia(initialData.economia ?? '');
      setCorCard(initialData.cor_card ?? 'red');
    } else {
      setTitulo('');
      setPreco('');
      setNumeroAulas('');
      setEconomia('');
      setCorCard('red');
    }
  }, [isEdit, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const row = {
      titulo: titulo.trim(),
      preco: parseInt(preco, 10),
      numero_aulas: parseInt(numeroAulas, 10),
      economia: economia?.trim() || null,
      cor_card: corCard,
    };

    let error;

    if (isEdit) {
      ({ error } = await supabase
        .from('pacotes')
        .update(row)
        .eq('id', initialData.id));
    } else {
      ({ error } = await supabase.from('pacotes').insert(row));
    }

    setLoading(false);

    if (error) {
      alert('Erro ao salvar o pacote: ' + error.message);
    } else {
      alert(isEdit ? 'Pacote atualizado!' : 'Pacote salvo com sucesso!');
      onFinished?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="titulo">Título do Pacote</Label>
        <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="preco">Preço (somente números)</Label>
        <Input id="preco" type="number" value={preco} onChange={(e) => setPreco(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="numeroAulas">Número de Aulas</Label>
        <Input id="numeroAulas" type="number" value={numeroAulas} onChange={(e) => setNumeroAulas(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="economia">Texto de Economia (opcional)</Label>
        <Input id="economia" value={economia} onChange={(e) => setEconomia(e.target.value)} placeholder="Ex: Economia de R$ 50" />
      </div>
      <div>
        <Label htmlFor="corCard">Cor do Card</Label>
        <Select onValueChange={setCorCard} value={corCard}>
          <SelectTrigger id="corCard">
            <SelectValue placeholder="Selecione uma cor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="red">Vermelho</SelectItem>
            <SelectItem value="yellow">Amarelo</SelectItem>
            <SelectItem value="blue">Azul</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Salvar Pacote')}
        </Button>
      </div>
    </form>
  );
}

export default PackageForm;

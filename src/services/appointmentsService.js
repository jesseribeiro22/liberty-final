// Arquivo: src/services/appointmentsService.js (Versão Final com RPC)
import { supabase } from '@/lib/supabaseClient';

// ... (as funções createAppointment, updateAppointment, etc., não precisam mudar) ...
// ... (copie e cole o arquivo inteiro para garantir) ...

/** Utils */
function toIsoOrNull(v) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(v))) {
    const d = new Date(String(v));
    return d.toISOString();
  }
  return String(v);
}

/** Checagem de conflito de horário */
async function hasOverlap({ inicioISO, fimISO, excludeId = null }) {
  let q = supabase
    .from('agendamentos')
    .select('id')
    .eq('status', 'marcado')
    .not('fim', 'lte', inicioISO)
    .not('inicio', 'gte', fimISO);
  
  if (excludeId) {
    q = q.not('id', 'eq', excludeId);
  }

  const { data, error } = await q.limit(1);
  if (error) return { error, overlap: false };
  return { error: null, overlap: (data?.length ?? 0) > 0 };
}

/** Create */
export async function createAppointment(payload) {
  const inicioISO = toIsoOrNull(payload.inicio);
  const fimISO = toIsoOrNull(payload.fim);

  if (!inicioISO || !fimISO) return { data: null, error: new Error('Informe início e fim do agendamento') };
  if (new Date(inicioISO) >= new Date(fimISO)) return { data: null, error: new Error('O horário de início deve ser antes do fim') };

  const { overlap, error: overlapErr } = await hasOverlap({ inicioISO, fimISO });
  if (overlapErr) return { data: null, error: overlapErr };
  if (overlap) return { data: null, error: new Error('Já existe agendamento nesse horário') };

  const row = {
    lead_id:     payload.lead_id ?? null,
    cliente_id:  payload.cliente_id ?? null,
    titulo:      payload.titulo ?? null,
    local:       payload.local ?? null,
    cidade:      payload.cidade ?? null,
    observacoes: payload.observacoes ?? null,
    inicio:      inicioISO,
    fim:         fimISO,
    status:      payload.status ?? 'marcado',
  };

  const { data, error } = await supabase.from('agendamentos').insert(row).select().single();
  return { data, error };
}

/** Read (usando a função RPC para garantir o resultado) */
export async function listAppointments(filters = {}) {
  // << A MUDANÇA FINAL E GARANTIDA >>
  // Chamamos a função 'get_all_appointments' que criamos no banco de dados.
  // Isso executa o SQL exato que sabemos que funciona.
  const { data, error } = await supabase.rpc('get_all_appointments');

  // A filtragem por data e status será feita no lado do cliente (JavaScript)
  // já que a função RPC nos traz todos os dados.
  if (error) {
    return { data: null, error };
  }

  let filteredData = data;

  if (filters.from) {
    const fromDate = new Date(toIsoOrNull(filters.from));
    filteredData = filteredData.filter(item => new Date(item.inicio) >= fromDate);
  }
  if (filters.to) {
    const toDate = new Date(toIsoOrNull(filters.to));
    filteredData = filteredData.filter(item => new Date(item.inicio) <= toDate);
  }
  if (filters.status && filters.status !== 'todos') {
    filteredData = filteredData.filter(item => item.status === filters.status);
  }
  if (filters.cidade) {
    filteredData = filteredData.filter(item => item.cidade && item.cidade.toLowerCase().includes(filters.cidade.toLowerCase()));
  }

  return { data: filteredData, error: null };
}

export async function getAppointment(id) {
  // A busca de um único agendamento pode continuar usando select, mas vamos otimizar também.
  return await supabase.from('agendamentos').select('*, leads:lead_id(name), clients:cliente_id(name)').eq('id', id).single();
}

/** Update */
export async function updateAppointment(id, patch = {}) {
  const update = {
    lead_id:     patch.lead_id,
    cliente_id:  patch.cliente_id,
    titulo:      patch.titulo,
    local:       patch.local,
    cidade:      patch.cidade,
    observacoes: patch.observacoes,
    status:      patch.status,
  };
  if (patch.inicio) update.inicio = toIsoOrNull(patch.inicio);
  if (patch.fim)    update.fim    = toIsoOrNull(patch.fim);

  Object.keys(update).forEach(key => update[key] === undefined && delete update[key]);

  if (update.inicio && update.fim) {
    const { overlap, error: ovErr } = await hasOverlap({
      inicioISO: update.inicio,
      fimISO:    update.fim,
      excludeId: id,
    });
    if (ovErr)   return { data: null, error: ovErr };
    if (overlap) return { data: null, error: new Error('Horário conflita com outro agendamento') };
  }

  const { data, error } = await supabase.from('agendamentos').update(update).eq('id', id).select().single();
  return { data, error };
}

/** Status helpers */
export async function cancelAppointment(id) {
  return await supabase.from('agendamentos').update({ status: 'cancelado' }).eq('id', id);
}
export async function completeAppointment(id) {
  return await supabase.from('agendamentos').update({ status: 'concluido' }).eq('id', id);
}
export async function deleteAppointment(id) {
  return await supabase.from('agendamentos').delete().eq('id', id);
}

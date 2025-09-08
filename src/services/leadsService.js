// Arquivo: src/services/leadsService.js (Versão Completa e Corrigida)
import { supabase } from '@/lib/supabaseClient';
import * as clientsSvc from '@/services/clientsService';

function cleanString(s) {
  if (s == null) return null;
  const v = String(s).trim();
  return v.length ? v : null;
}

export async function createLead(payload) {
  const row = {
    name:    cleanString(payload.nome),
    email:   cleanString(payload.email),
    phone:   cleanString(payload.telefone),
    city:    cleanString(payload.cidade),
    message: cleanString(payload.mensagem),
    source:  payload.origem || 'site',
    status:  payload.status || 'novo',
  };
  return await supabase.from('leads').insert(row).select().single();
}

export async function listLeadsPage({ search, status = 'todos', origem, from, to, page = 1, pageSize = 20 }) {
  const fromIdx = (Math.max(1, page) - 1) * pageSize;
  const toIdx = fromIdx + pageSize - 1;
  let q = supabase.from('leads').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (search) {
    const term = `%${search}%`;
    q = q.or(`name.ilike.${term},email.ilike.${term},city.ilike.${term},message.ilike.${term},phone.ilike.${term}`);
  }
  if (status && status !== 'todos') q = q.eq('status', status);
  if (origem) q = q.eq('source', origem);
  if (from) q = q.gte('created_at', from);
  if (to) q = q.lte('created_at', to);
  const { data, error, count } = await q.range(fromIdx, toIdx);
  return { data, error, count };
}

export async function getLead(id) {
  return await supabase.from('leads').select('*').eq('id', id).single();
}

export async function updateLead(id, patch) {
  const update = {};
  if (patch.name !== undefined)    update.name = cleanString(patch.name);
  if (patch.email !== undefined)   update.email = cleanString(patch.email);
  if (patch.phone !== undefined)   update.phone = cleanString(patch.phone);
  if (patch.city !== undefined)    update.city = cleanString(patch.city);
  if (patch.message !== undefined) update.message = cleanString(patch.message);
  if (patch.status !== undefined)  update.status = patch.status;
  if (patch.source !== undefined)  update.source = patch.source;
  
  if (Object.keys(update).length === 0) {
    return { data: null, error: { message: "Nenhum campo para atualizar." } };
  }

  return await supabase.from('leads').update(update).eq('id', id);
}

export async function deleteLead(id) {
  return await supabase.from('leads').delete().eq('id', id);
}

export async function convertLeadToClient(leadId, extra = {}) {
  // A lógica agora está 100% centralizada no `clientsService`.
  // Este arquivo apenas "chama" a função de lá.
  return await clientsSvc.convertLeadToClient(leadId);
}

// Arquivo: src/services/clientsService.js
import { supabase } from '@/lib/supabaseClient';
import { getLead, updateLead } from '@/services/leadsService';

/**
 * Cria um cliente na tabela `clients`.
 * Campos opcionais vão como null.
 */
export async function createClient(payload = {}) {
  const row = {
    name: payload.name ?? null,
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    city: payload.city ?? null,
    address: payload.address ?? null,
    notes: payload.notes ?? null,
    status: payload.status ?? 'active',
    lead_id: payload.lead_id ?? null,
  };

  const { data, error } = await supabase
    .from('clients')
    .insert(row)
    .select()
    .single();

  return { data, error };
}

/**
 * Lista clientes com filtros, paginação (limit/offset) e total.
 */
export async function listClients({
  status = 'all',
  q = '',
  limit = 100,
  offset = 0,
} = {}) {
  let query = supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (q) {
    const like = `%${q}%`;
    query = query.or(
      [
        `name.ilike.${like}`,
        `email.ilike.${like}`,
        `phone.ilike.${like}`,
        `city.ilike.${like}`,
        `address.ilike.${like}`,
        `notes.ilike.${like}`,
      ].join(',')
    );
  }

  const { data, error, count } = await query;
  return { data, error, count };
}

export async function getClient(id) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function updateClient(id, patch = {}) {
  const { data, error } = await supabase
    .from('clients')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteClient(id) {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  return { error };
}

/**
 * Converte um lead em cliente (alternativo):
 * - carrega o lead
 * - cria o cliente em `clients`
 * - marca o lead como 'convertido'
 */
export async function convertLeadToClient(leadId) {
  const { data: lead, error: loadErr } = await getLead(leadId);
  if (loadErr) return { error: loadErr };

  const payload = {
    name: lead?.name ?? lead?.nome ?? null,
    email: lead?.email ?? null,
    phone: lead?.phone ?? lead?.telefone ?? null,
    city: lead?.city ?? lead?.cidade ?? null,
    address: lead?.location_address ?? null,
    notes: lead?.notes ?? lead?.message ?? lead?.mensagem ?? null,
    status: 'active',
    lead_id: lead?.id ?? null,
  };

  const { data: client, error: createErr } = await createClient(payload);
  if (createErr) return { error: createErr };

  const { error: updErr } = await updateLead(leadId, { status: 'convertido' });
  if (updErr) return { data: client, error: updErr };

  return { data: client, error: null };
}

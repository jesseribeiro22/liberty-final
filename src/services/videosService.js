// Arquivo: src/services/videosService.js
import { supabase } from '@/lib/supabaseClient';

export function normalizeYoutubeId(input = '') {
  const val = (input || '').trim();
  if (!val) return '';
  if (/^[A-Za-z0-9_-]{6,}$/i.test(val) && !val.includes('http')) return val;
  try {
    const url = new URL(val);
    if (url.hostname.includes('youtu.be')) return url.pathname.replace('/', '');
    if (url.searchParams.has('v')) return url.searchParams.get('v');
    const parts = url.pathname.split('/');
    const i = parts.indexOf('embed');
    if (i >= 0 && parts[i + 1]) return parts[i + 1];
  } catch {}
  return val;
}

export async function listVideos({ includeInactive = false } = {}) {
  let q = supabase
    .from('videos')
    .select('*')
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: true });

  if (!includeInactive) q = q.eq('ativo', true);

  const { data, error } = await q;
  return { data, error };
}

export async function createVideo(row) {
  const payload = {
    youtube_id: row.youtube_id,
    titulo: row.titulo ?? null,
    ativo: row.ativo ?? true,
    ordem: row.ordem ?? 0,
  };
  const { data, error } = await supabase.from('videos').insert(payload).select().single();
  return { data, error };
}

export async function updateVideo(id, patch = {}) {
  const { data, error } = await supabase.from('videos').update(patch).eq('id', id).select().single();
  return { data, error };
}

export async function deleteVideo(id) {
  const { error } = await supabase.from('videos').delete().eq('id', id);
  return { error };
}


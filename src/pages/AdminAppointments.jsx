// Arquivo: src/pages/AdminAppointments.jsx (Versão com Lista Melhorada)
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { listAppointments, createAppointment, updateAppointment, deleteAppointment, cancelAppointment, completeAppointment } from '@/services/appointmentsService';
import { supabase } from '@/lib/supabaseClient';

function fmtDateTime(s) {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function addMinutes(d, mins) { const x = new Date(d); x.setMinutes(x.getMinutes() + Number(mins || 0)); return x; }
function buildDate(dateStr, timeStr) { return new Date(`${dateStr}T${timeStr}`); }
function diffMinutes(a, b) { return Math.max(1, Math.round((new Date(b) - new Date(a)) / 60000)); }

const STATUS_OPTS = [
  { value: 'todos', label: 'Todos' },
  { value: 'marcado', label: 'Marcado' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
];

export default function AdminAppointments() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('todos');
  const [cidade, setCidade] = useState('');
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await listAppointments({
      from: from ? `${from}T00:00` : undefined,
      to:   to   ? `${to}T23:59:59` : undefined,
      status: status !== 'todos' ? status : undefined,
      cidade: cidade || undefined,
    });
    if (error) {
      console.error('Erro ao listar agendamentos:', error);
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const v = q.toLowerCase();
    return rows.filter(r =>
      String(r.titulo || '').toLowerCase().includes(v) ||
      String(r.cidade || '').toLowerCase().includes(v) ||
      String(r.local || '').toLowerCase().includes(v) ||
      String(r.observacoes || '').toLowerCase().includes(v) ||
      String(r.clients?.name || '').toLowerCase().includes(v) ||
      String(r.clients?.address || '').toLowerCase().includes(v) || // << BUSCA NO ENDEREÇO
      String(r.leads?.name || '').toLowerCase().includes(v)
    );
  }, [rows, q]);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fDate, setFDate] = useState('');
  const [fTime, setFTime] = useState('');
  const [fDuration, setFDuration] = useState(60);
  const [fTitulo, setFTitulo] = useState('');
  const [fCidade, setFCidade] = useState('');
  const [fLocal, setFLocal] = useState('');
  const [fObs, setFObs] = useState('');
  const [fLeadId, setFLeadId] = useState('');
  const [fClienteId, setFClienteId] = useState('');

  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  async function loadClientsAndLeads() {
    setClientsLoading(true);
    setLeadsLoading(true);
    const { data: cData } = await supabase.from('clients').select('id, name').order('name', { ascending: true });
    setClients(cData || []);
    setClientsLoading(false);
    const { data: lData } = await supabase.from('leads').select('id, name').order('name', { ascending: true });
    setLeads(lData || []);
    setLeadsLoading(false);
  }

  useEffect(() => { loadClientsAndLeads(); }, []);

  function openCreate() {
    setEditing(null);
    setFDate(''); setFTime(''); setFDuration(60);
    setFTitulo(''); setFCidade(''); setFLocal(''); setFObs('');
    setFLeadId(''); setFClienteId('');
    setOpenForm(true);
  }

  function openEdit(row) {
    setEditing(row);
    const d = new Date(row.inicio);
    setFDate(d.toISOString().slice(0, 10));
    setFTime(d.toTimeString().slice(0, 5));
    setFDuration(diffMinutes(row.inicio, row.fim));
    setFTitulo(row.titulo ?? '');
    setFCidade(row.cidade ?? '');
    setFLocal(row.local ?? '');
    setFObs(row.observacoes ?? '');
    setFLeadId(row.lead_id ?? '');
    setFClienteId(row.cliente_id ?? '');
    setOpenForm(true);
  }

  async function handleSave(e) {
    e?.preventDefault();
    if (!fDate || !fTime) return alert('Informe data e hora.');
    if (!fDuration || Number(fDuration) <= 0) return alert('Duração inválida.');
    const inicio = buildDate(fDate, fTime);
    const fim = addMinutes(inicio, fDuration);
    setSaving(true);
    let error;
    const payload = {
      lead_id: fLeadId || null,
      cliente_id: fClienteId || null,
      titulo: fTitulo, cidade: fCidade, local: fLocal, observacoes: fObs,
      inicio, fim,
    };
    if (editing) ({ error } = await updateAppointment(editing.id, payload));
    else ({ error } = await createAppointment(payload));
    setSaving(false);
    if (error) {
      const msg = String(error.message || error).toLowerCase();
      if (msg.includes('overlap') || msg.includes('conflit')) alert('Esse horário já está ocupado. Escolha outro.');
      else alert('Não foi possível salvar o agendamento. ' + (error.message || ''));
      return;
    }
    setOpenForm(false);
    setEditing(null);
    await load();
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este agendamento?')) return;
    const { error } = await deleteAppointment(id);
    if (error) alert('Erro ao excluir: ' + error.message);
    else await load();
  }
  async function handleCancel(id) {
    if (!confirm('Cancelar este agendamento?')) return;
    const { error } = await cancelAppointment(id);
    if (error) alert('Erro ao cancelar: ' + error.message);
    else await load();
  }
  async function handleComplete(id) {
    if (!confirm('Concluir este agendamento?')) return;
    const { error } = await completeAppointment(id);
    if (error) alert('Erro ao concluir: ' + error.message);
    else await load();
  }

  return (
    <div className="min-h-[calc(100vh-56px)] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Agendamentos</h1>
            <p className="text-gray-600">Gerencie os horários de aulas.</p>
          </div>
          <Dialog open={openForm} onOpenChange={(v) => { setOpenForm(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild><Button onClick={openCreate}>Novo Agendamento</Button></DialogTrigger>
            <DialogContent className="dialog-content max-w-lg">
              <DialogHeader><DialogTitle>{editing ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Data</Label><Input type="date" value={fDate} onChange={(e)=>setFDate(e.target.value)} required /></div>
                  <div><Label>Hora</Label><Input type="time" value={fTime} onChange={(e)=>setFTime(e.target.value)} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Duração (min)</Label><Input type="number" min={1} step={5} value={fDuration} onChange={(e)=>setFDuration(e.target.value)} required /></div>
                  <div><Label>Título</Label><Input value={fTitulo} onChange={(e)=>setFTitulo(e.target.value)} placeholder="Aula prática / avaliação..." /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Cidade</Label><Input value={fCidade} onChange={(e)=>setFCidade(e.target.value)} placeholder="Ex.: Embu das Artes" /></div>
                  <div><Label>Local (Ponto de Partida)</Label><Input value={fLocal} onChange={(e)=>setFLocal(e.target.value)} placeholder="Se diferente do endereço do cliente" /></div>
                </div>
                <div className="space-y-2">
                  <Label>Cliente (opcional)</Label>
                  <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={fClienteId || ''} onChange={(e)=>{ setFClienteId(e.target.value); setFLeadId(''); }} disabled={clientsLoading}>
                    <option value="">{clientsLoading ? 'Carregando…' : '— Nenhum —'}</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Lead (opcional)</Label>
                  <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={fLeadId || ''} onChange={(e)=>{ setFLeadId(e.target.value); setFClienteId(''); }} disabled={leadsLoading}>
                    <option value="">{leadsLoading ? 'Carregando…' : '— Nenhum —'}</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div><Label>Observações</Label><Textarea rows={3} value={fObs} onChange={(e)=>setFObs(e.target.value)} placeholder="Detalhes adicionais…" /></div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={()=>setOpenForm(false)}>Cancelar</Button>
                  <Button type="submit" disabled={saving}>{saving ? 'Salvando…' : (editing ? 'Salvar' : 'Criar')}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Card className="mb-6">
          <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2"><Label>Busca (título, cidade, nome, endereço...)</Label><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex.: avaliação, Embu, Maria..." /></div>
              <div><Label>Status</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>{STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
              <div><Label>De</Label><Input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} /></div>
              <div><Label>Até</Label><Input type="date" value={to} onChange={(e)=>setTo(e.target.value)} /></div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => { setQ(''); setFrom(''); setTo(''); setStatus('todos'); }}>Limpar</Button>
              <Button onClick={load} disabled={loading}>{loading ? 'Carregando...' : 'Aplicar Filtros'}</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div className="flex items-center justify-between"><CardTitle>Agendamentos <span className="text-gray-500 font-normal">({filtered.length})</span></CardTitle><div className="text-sm text-gray-500">{loading ? 'Carregando...' : ''}</div></div></CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-white"><div className="max-h-[70vh] overflow-y-auto">
              <table className="table-fixed w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  {/* << CABEÇALHO DA TABELA ATUALIZADO >> */}
                  <tr className="text-left">
                    <th className="w-48 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aluno</th>
                    <th className="w-48 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Endereço / Ponto de Partida</th>
                    <th className="w-40 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Título da Aula</th>
                    <th className="w-40 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Início</th>
                    <th className="w-40 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fim</th>
                    <th className="w-28 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="w-40 px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (<tr><td colSpan={7} className="px-6 py-6 text-center text-gray-500">Carregando...</td></tr>)}
                  {!loading && filtered.length === 0 && (<tr><td colSpan={7} className="px-6 py-6 text-center text-gray-500">Nenhum agendamento encontrado.</td></tr>)}
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-t">
                      {/* Aluno */}
                      <td className="px-4 py-3">
                        <div className="font-medium truncate">{row.clients?.name || row.leads?.name || 'Não vinculado'}</div>
                        <div className="text-gray-500 text-xs">{row.clients ? 'CLIENTE' : (row.leads ? 'LEAD' : '')}</div>
                      </td>
                      {/* << NOVA CÉLULA PARA ENDEREÇO / LOCAL >> */}
                      <td className="px-4 py-3">
                        <div className="truncate">{row.local || row.clients?.address || 'Não informado'}</div>
                        <div className="text-gray-500 text-xs">{row.local ? 'Ponto de partida' : (row.clients?.address ? 'Endereço do cliente' : '')}</div>
                      </td>
                      {/* Título */}
                      <td className="px-4 py-3 truncate">{row.titulo || '—'}</td>
                      {/* Início / Fim */}
                      <td className="px-4 py-3">{fmtDateTime(row.inicio)}</td>
                      <td className="px-4 py-3">{fmtDateTime(row.fim)}</td>
                      {/* Status */}
                      <td className="px-4 py-3"><span className={row.status === 'concluido' ? 'text-emerald-700' : row.status === 'cancelado' ? 'text-red-600' : 'text-gray-700'}>{row.status || '—'}</span></td>
                      {/* Ações */}
                      <td className="px-4 py-3"><div className="flex justify-end gap-2 flex-wrap">
                        {row.status === 'marcado' && (<><Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleComplete(row.id)}>Concluir</Button><Button size="sm" variant="destructive" onClick={() => handleCancel(row.id)}>Cancelar</Button></>)}
                        <Button size="sm" variant="outline" onClick={() => openEdit(row)}>Editar</Button>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDelete(row.id)}>Excluir</Button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

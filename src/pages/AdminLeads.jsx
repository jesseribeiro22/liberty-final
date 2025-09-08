// Arquivo: src/pages/AdminLeads.jsx (Versão Final Corrigida)
import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listLeadsPage, updateLead, deleteLead, convertLeadToClient } from '@/services/leadsService';
import { createAppointment } from '@/services/appointmentsService';

function fmtDateTime(s) {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function addMinutes(d, mins) { const x = new Date(d); x.setMinutes(x.getMinutes() + Number(mins||0)); return x; }
function buildDate(dateStr, timeStr) { return new Date(`${dateStr}T${timeStr}`); }

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'novo', label: 'Novo' },
  { value: 'contato', label: 'Contato' },
  { value: 'convertido', label: 'Convertido' },
  { value: 'perdido', label: 'Perdido' },
];

function AdminLeads() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('todos');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  const showingStart = useMemo(() => (total === 0 ? 0 : (page - 1) * pageSize + 1), [page, pageSize, total]);
  const showingEnd   = useMemo(() => Math.min(page * pageSize, total), [page, pageSize, total]);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);

  async function refresh() {
    setLoading(true);
    const { data, error, count } = await listLeadsPage({
      search: search.trim() || undefined,
      status,
      from: from ? new Date(`${from}T00:00`).toISOString() : undefined,
      to:   to   ? new Date(`${to}T23:59:59`).toISOString() : undefined,
      page,
      pageSize,
    });
    if (error) {
      console.error(error);
      alert('Erro ao carregar leads.');
      setLeads([]);
      setTotal(0);
    } else {
      setLeads(data || []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }

  useEffect(() => { refresh(); }, [page, pageSize]);
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      refresh();
    }, 500);
    return () => clearTimeout(handler);
  }, [search, status, from, to]);

  const [isSchedOpen, setIsSchedOpen] = useState(false);
  const [schedLead, setSchedLead] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(45);
  const [titulo, setTitulo] = useState(''); // << NOVO ESTADO PARA O TÍTULO
  const [cidade, setCidade] = useState('');
  const [local, setLocal] = useState('');
  const [obs, setObs] = useState('');
  const [savingSched, setSavingSched] = useState(false);

  function openScheduleModal(lead) {
    setSchedLead(lead);
    setDate(''); setTime(''); setDuration(45);
    setTitulo(''); // << GARANTE QUE O TÍTULO COMECE VAZIO
    setCidade(lead?.city || '');
    setLocal(''); setObs('');
    setIsSchedOpen(true);
  }

  async function handleCreateSchedule(e) {
    e?.preventDefault();
    if (!date || !time) return alert('Informe data e hora.');
    if (!duration || Number(duration) <= 0) return alert('Duração inválida.');
    setSavingSched(true);
    try {
      const inicio = buildDate(date, time);
      const fim = addMinutes(inicio, duration);
      const { error } = await createAppointment({
        lead_id: schedLead?.id ?? null,
        titulo: titulo || null, // << USA O TÍTULO DO FORMULÁRIO
        cidade: cidade || null,
        local: local || null,
        observacoes: obs || null,
        inicio, fim,
      });
      if (error) {
        const msg = String(error.message || error).toLowerCase();
        if (msg.includes('exclusion') || msg.includes('overlap') || msg.includes('conflit')) {
          alert('Esse horário já está ocupado. Escolha outro.');
        } else {
          alert('Não foi possível agendar. ' + (error.message || ''));
        }
      } else {
        alert('Agendamento criado com sucesso!');
        setIsSchedOpen(false);
      }
    } finally {
      setSavingSched(false);
    }
  }

  async function handleConvert(lead) {
    if (!confirm(`Converter o lead "${lead.name || ''}" em cliente?`)) return;
    const { error } = await convertLeadToClient(lead.id, { observacoes: lead.message });
    if (error) { console.error(error); return alert('Erro ao converter lead.'); }
    alert('Lead convertido!');
    refresh();
  }

  async function handleDelete(lead) {
    if (!confirm(`Excluir o lead "${lead.name || ''}"?`)) return;
    const { error } = await deleteLead(lead.id);
    if (error) { console.error(error); return alert('Erro ao excluir lead.'); }
    alert('Lead excluído!');
    if (leads.length === 1 && page > 1) setPage((p) => p - 1);
    else refresh();
  }

  async function handleQuickStatus(lead, newStatus) {
    const { error } = await updateLead(lead.id, { status: newStatus });
    if (error) { console.error(error); return alert('Erro ao atualizar status.'); }
    refresh();
  }

  function applyFilters() { setPage(1); refresh(); }
  function clearFilters() { setSearch(''); setStatus('todos'); setFrom(''); setTo(''); setPage(1); refresh(); }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <a href="/admin/clientes" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50">Clientes</a>
      </div>
      <Card className="mb-6">
        <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <Label>Busca (nome, e-mail, telefone, cidade...)</Label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ex.: Maria, 11 9..." />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>De</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
              <div><Label>Até</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={clearFilters}>Limpar</Button>
            <Button onClick={applyFilters} disabled={loading}>{loading ? 'Carregando…' : 'Aplicar Filtros'}</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leads <span className="text-gray-400 text-sm">({total})</span></CardTitle>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-gray-500">{showingStart}–{showingEnd} de {total}</span>
              <select className="border rounded px-2 py-1" value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }}>
                {[10,20,50,100].map(n=><option key={n} value={n}>{n}/página</option>)}
              </select>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={()=>setPage(1)} disabled={page===1}>«</Button>
                <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>‹</Button>
                <span className="px-2">Página {page} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>›</Button>
                <Button variant="outline" size="sm" onClick={()=>setPage(totalPages)} disabled={page===totalPages}>»</Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-white">
            <div className="max-h-[70vh] overflow-y-auto">
              <table className="table-fixed w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="text-left">
                    <th className="w-48 px-4 py-3 text-[11px] font-medium text-gray-500 uppercase">Nome</th>
                    <th className="w-72 px-4 py-3 text-[11px] font-medium text-gray-500 uppercase">Contato</th>
                    <th className="w-44 px-4 py-3 text-[11px] font-medium text-gray-500 uppercase">Cidade</th>
                    <th className="w-44 px-4 py-3 text-[11px] font-medium text-gray-500 uppercase">Criado em</th>
                    <th className="w-48 px-4 py-3 text-[11px] font-medium text-gray-500 uppercase">Status</th>
                    <th className="w-64 px-4 py-3 text-right text-[11px] font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="px-4 py-3 font-medium truncate">{l.name || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="truncate">{l.email || '—'}</div>
                        {l.phone ? <div className="text-gray-500 truncate">{l.phone}</div> : null}
                      </td>
                      <td className="px-4 py-3 truncate">{l.city || '—'}</td>
                      <td className="px-4 py-3">{fmtDateTime(l.created_at)}</td>
                      <td className="px-4 py-3">
                        <Select value={l.status || 'novo'} onValueChange={(val) => handleQuickStatus(l, val)}>
                          <SelectTrigger className="h-8 w-[160px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.filter(s=>s.value!=='todos').map(s => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openScheduleModal(l)}>Agendar</Button>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleConvert(l)}>Converter</Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDelete(l)}>Excluir</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && leads.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Nenhum lead encontrado com os filtros atuais.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <span className="text-gray-600">Mostrando <strong>{showingStart || 0}</strong>–<strong>{showingEnd || 0}</strong> de <strong>{total}</strong></span>
            <div className="flex items-center gap-2">
              <select className="border rounded px-2 py-1" value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }}>
                {[10,20,50,100].map(n=><option key={n} value={n}>{n}/página</option>)}
              </select>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={()=>setPage(1)} disabled={page===1}>«</Button>
                <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>‹</Button>
                <span className="px-2">Página {page} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>›</Button>
                <Button variant="outline" size="sm" onClick={()=>setPage(totalPages)} disabled={page===totalPages}>»</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isSchedOpen} onOpenChange={setIsSchedOpen}>
        <DialogContent className="dialog-content max-w-lg">
          <DialogHeader><DialogTitle>Agendar aula {schedLead?.name ? `– ${schedLead.name}` : ''}</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Data</Label><Input type="date" value={date} onChange={(e)=>setDate(e.target.value)} required /></div>
              <div><Label>Hora de início</Label><Input type="time" value={time} onChange={(e)=>setTime(e.target.value)} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Duração (min)</Label><Input type="number" min={1} step={5} value={duration} onChange={(e)=>setDuration(e.target.value)} required /></div>
              <div><Label>Cidade</Label><Input value={cidade} onChange={(e)=>setCidade(e.target.value)} placeholder="Ex.: Embu das Artes" /></div>
            </div>
            {/* << CAMPO DE TÍTULO ADICIONADO >> */}
            <div className="grid grid-cols-1 gap-4">
              <div><Label>Título (opcional)</Label><Input value={titulo} onChange={(e)=>setTitulo(e.target.value)} placeholder="Ex: Aula de baliza, Percurso trabalho" /></div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div><Label>Local</Label><Input value={local} onChange={(e)=>setLocal(e.target.value)} placeholder="Ponto de encontro/endereço" /></div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea rows={3} value={obs} onChange={(e)=>setObs(e.target.value)} placeholder="Detalhes adicionais…" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={()=>setIsSchedOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={savingSched}>{savingSched ? 'Agendando…' : 'Agendar'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminLeads;




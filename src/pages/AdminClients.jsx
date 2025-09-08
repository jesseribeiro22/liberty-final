//src/pages/AdminClients.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listClients,
  createClient,
  updateClient,
  deleteClient,
} from '@/services/clientsService';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
];

function fmtDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function AdminClients() {
  const navigate = useNavigate();

  // dados
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // filtros + paginação
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const totalPages  = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  const showingFrom = useMemo(() => (total === 0 ? 0 : (page - 1) * pageSize + 1), [page, pageSize, total]);
  const showingTo   = useMemo(() => Math.min(page * pageSize, total), [page, pageSize, total]);

  // modal
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // form fields
  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fCity, setFCity] = useState('');
  const [fAddress, setFAddress] = useState('');
  const [fNotes, setFNotes] = useState('');
  const [fStatus, setFStatus] = useState('active');

  async function load() {
    setLoading(true);
    const { data, error, count } = await listClients({
      status,
      q,
      limit: pageSize,
      offset: (Math.max(1, page) - 1) * pageSize,
    });
    if (error) {
      console.error('Erro ao listar clientes:', error);
      setItems([]);
      setTotal(0);
    } else {
      setItems(data || []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);               // primeira carga
  useEffect(() => { load(); }, [page, pageSize]); // muda paginação

  function applyFilters(e) {
    e?.preventDefault();
    setPage(1);
    load();
  }

  function openCreate() {
    setEditingId(null);
    setFName('');
    setFEmail('');
    setFPhone('');
    setFCity('');
    setFAddress('');
    setFNotes('');
    setFStatus('active');
    setOpenForm(true);
  }

  function openEdit(row) {
    setEditingId(row.id);
    setFName(row.name ?? '');
    setFEmail(row.email ?? '');
    setFPhone(row.phone ?? '');
    setFCity(row.city ?? '');
    setFAddress(row.address ?? '');
    setFNotes(row.notes ?? '');
    setFStatus(row.status ?? 'active');
    setOpenForm(true);
  }

  async function handleSave(e) {
    e?.preventDefault();
    setSaving(true);
    const payload = {
      name: fName,
      email: fEmail || null,
      phone: fPhone || null,
      city: fCity || null,
      address: fAddress || null,
      notes: fNotes || null,
      status: fStatus,
    };

    let error;
    if (editingId) ({ error } = await updateClient(editingId, payload));
    else ({ error } = await createClient(payload));

    setSaving(false);

    if (error) {
      alert('Erro ao salvar cliente: ' + error.message);
    } else {
      setOpenForm(false);
      load();
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este cliente?')) return;
    setDeleting(true);
    const { error } = await deleteClient(id);
    setDeleting(false);
    if (error) alert('Erro ao excluir cliente: ' + error.message);
    else {
      if (items.length === 1 && page > 1) setPage(p => p - 1);
      else load();
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-gray-600">Cadastre clientes manualmente ou gerencie os convertidos de leads.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/leads')}>Leads</Button>
          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={openCreate}>
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="dialog-content max-w-2xl">
              <DialogHeader><DialogTitle>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle></DialogHeader>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fName">Nome</Label>
                    <Input id="fName" value={fName} onChange={(e) => setFName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="fEmail">E-mail</Label>
                    <Input id="fEmail" value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="fPhone">Telefone/WhatsApp</Label>
                    <Input id="fPhone" value={fPhone} onChange={(e) => setFPhone(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="fCity">Cidade</Label>
                    <Input id="fCity" value={fCity} onChange={(e) => setFCity(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fAddress">Endereço</Label>
                  <Input id="fAddress" value={fAddress} onChange={(e) => setFAddress(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="fNotes">Notas</Label>
                  <Textarea id="fNotes" rows={3} value={fNotes} onChange={(e) => setFNotes(e.target.value)} />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={fStatus} onValueChange={setFStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={applyFilters} className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="q">Busca (nome, e-mail, telefone...)</Label>
              <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex.: Ana, 11 9..." />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Aplicar Filtros</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista com cabeçalho fixo e sem scroll horizontal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Clientes <span className="text-gray-500 font-normal">({total})</span></CardTitle>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-gray-500">{showingFrom}–{showingTo} de {total}</span>
              <select
                className="border rounded px-2 py-1"
                value={pageSize}
                onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }}
              >
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
                    <th className="w-56 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="w-80 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contato</th>
                    <th className="w-48 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cidade</th>
                    <th className="w-36 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="w-44 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Criado em</th>
                    <th className="w-56 px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                        Nenhum cliente encontrado com os filtros atuais.
                      </td>
                    </tr>
                  )}

                  {items.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="px-4 py-3 font-medium truncate">{row.name || '—'}</td>
                      <td className="px-4 py-3">
                        {row.email ? <div className="truncate">{row.email}</div> : <div className="text-gray-400">—</div>}
                        {row.phone ? <div className="text-gray-500 truncate">{row.phone}</div> : null}
                      </td>
                      <td className="px-4 py-3 truncate">{row.city || '—'}</td>
                      <td className="px-4 py-3">{row.status || '—'}</td>
                      <td className="px-4 py-3">{fmtDateTime(row.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Dialog open={openForm && editingId === row.id} onOpenChange={(v) => { setOpenForm(v); if (!v) setEditingId(null); }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => openEdit(row)}>Editar</Button>
                            </DialogTrigger>
                          </Dialog>
                          <Button variant="destructive" size="sm" disabled={deleting} onClick={() => handleDelete(row.id)}>
                            {deleting ? 'Excluindo...' : 'Excluir'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* paginação base */}
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <span className="text-gray-600">
                Mostrando <strong>{showingFrom || 0}</strong>–<strong>{showingTo || 0}</strong> de <strong>{total}</strong>
              </span>
              <div className="flex items-center gap-2">
                <select
                  className="border rounded px-2 py-1"
                  value={pageSize}
                  onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }}
                >
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




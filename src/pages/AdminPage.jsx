// src/pages/AdminPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';

// shadcn/ui
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

// Ícones
import { Trash2 } from 'lucide-react';

// Form de Pacotes
import PackageForm from '@/components/ui/PackageForm';

// Vídeos: service centralizado
import {
  listVideos,
  createVideo,
  updateVideo,
  deleteVideo as deleteVideoSvc,
  normalizeYoutubeId,
} from '@/services/videosService';

export default function AdminPage() {
  // ====== PACOTES ======
  const [pacotes, setPacotes] = useState([]);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  async function getPacotes() {
    const { data, error } = await supabase
      .from('pacotes')
      .select('*')
      .order('preco', { ascending: true });

    if (error) console.error('Erro pacotes:', error);
    else setPacotes(data || []);
  }

  const openCreatePackage = () => {
    setEditingPackage(null);
    setIsPackageModalOpen(true);
  };
  const openEditPackage = (p) => {
    setEditingPackage(p);
    setIsPackageModalOpen(true);
  };

  const handleDeletePacote = async (pacoteId) => {
    if (!confirm('Excluir este pacote?')) return;
    const { error } = await supabase.from('pacotes').delete().eq('id', pacoteId);
    if (error) alert('Erro ao excluir o pacote: ' + error.message);
    else {
      alert('Pacote excluído!');
      getPacotes();
    }
  };

  // excluir dentro do modal (pacote)
  const handleDeletePacoteFromModal = async () => {
    const id = editingPackage?.id;
    if (!id) return;
    if (!confirm('Excluir este pacote permanentemente?')) return;
    const { error } = await supabase.from('pacotes').delete().eq('id', id);
    if (error) return alert('Erro ao excluir o pacote: ' + error.message);
    alert('Pacote excluído!');
    setIsPackageModalOpen(false);
    setEditingPackage(null);
    getPacotes();
  };

  const handlePackageFormFinished = () => {
    setIsPackageModalOpen(false);
    setEditingPackage(null);
    getPacotes();
  };

  // ====== ÁREAS ======
  const [areas, setAreas] = useState([]);
  const [areasLoading, setAreasLoading] = useState(true);

  const [isAreasModalOpen, setIsAreasModalOpen] = useState(false);
  const [editingAreaId, setEditingAreaId] = useState(null);
  const [cidade, setCidade] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [imagemFile, setImagemFile] = useState(null);
  const [ativo, setAtivo] = useState(true);
  const [ordem, setOrdem] = useState(0);
  const [savingArea, setSavingArea] = useState(false);

  async function getAreas() {
    setAreasLoading(true);
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .order('ordem', { ascending: true })
      .order('cidade', { ascending: true });

    if (error) {
      console.error('Erro áreas:', error);
      setAreas([]);
    } else {
      setAreas(data || []);
    }
    setAreasLoading(false);
  }

  // Faz upload quando necessário e retorna a public URL
  async function uploadImagemSeNecessario() {
    if (!imagemFile) return imagemUrl || null;
    const ext = (imagemFile.name.split('.').pop() || 'jpg').toLowerCase();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('areas')
      .upload(fileName, imagemFile, { contentType: imagemFile.type, upsert: false });
    if (upErr) {
      alert('Erro ao enviar imagem: ' + upErr.message);
      return null;
    }
    const { data: pub } = supabase.storage.from('areas').getPublicUrl(fileName);
    return pub?.publicUrl ?? null;
  }

  function resetAreaForm() {
    setEditingAreaId(null);
    setCidade('');
    setImagemUrl('');
    setImagemFile(null);
    setAtivo(true);
    setOrdem(0);
  }

  function openCreateArea() {
    resetAreaForm();
    setIsAreasModalOpen(true);
  }

  function openEditArea(area) {
    setEditingAreaId(area.id);
    setCidade(area.cidade || '');
    setImagemUrl(area.imagem_url || '');
    setImagemFile(null);
    setAtivo(Boolean(area.ativo));
    setOrdem(Number.isFinite(area.ordem) ? area.ordem : 0);
    setIsAreasModalOpen(true);
  }

  const handleSaveArea = async (e) => {
    e.preventDefault();
    setSavingArea(true);

    const finalUrl = await uploadImagemSeNecessario();

    const payload = {
      cidade: cidade.trim(),
      imagem_url: finalUrl,
      ativo: Boolean(ativo),
      ordem: Number(ordem) || 0,
    };

    let error;
    if (editingAreaId) ({ error } = await supabase.from('areas').update(payload).eq('id', editingAreaId));
    else ({ error } = await supabase.from('areas').insert(payload));

    setSavingArea(false);

    if (error) {
      alert('Erro ao salvar área: ' + error.message);
    } else {
      alert(editingAreaId ? 'Área atualizada!' : 'Área criada!');
      setIsAreasModalOpen(false);
      resetAreaForm();
      getAreas();
    }
  };

  const handleDeleteArea = async (areaId) => {
    if (!confirm('Excluir esta área?')) return;
    const { error } = await supabase.from('areas').delete().eq('id', areaId);
    if (error) alert('Erro ao excluir área: ' + error.message);
    else {
      alert('Área excluída!');
      getAreas();
    }
  };

  // excluir dentro do modal (área)
  const handleDeleteAreaFromModal = async () => {
    if (!editingAreaId) return;
    if (!confirm('Excluir esta área permanentemente?')) return;
    const { error } = await supabase.from('areas').delete().eq('id', editingAreaId);
    if (error) return alert('Erro ao excluir área: ' + error.message);
    alert('Área excluída!');
    setIsAreasModalOpen(false);
    resetAreaForm();
    getAreas();
  };

  // ====== VÍDEOS ======
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);

  const [isVideosModalOpen, setIsVideosModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [youtubeIdRaw, setYoutubeIdRaw] = useState('');
  const [tituloVideo, setTituloVideo] = useState('');
  const [ativoVideo, setAtivoVideo] = useState(true);
  const [ordemVideo, setOrdemVideo] = useState(0);
  const [savingVideo, setSavingVideo] = useState(false);

  async function getVideos() {
    setVideosLoading(true);
    const { data, error } = await listVideos({ includeInactive: true });
    if (error) {
      console.error('Erro vídeos:', error);
      setVideos([]);
    } else {
      setVideos(data || []);
    }
    setVideosLoading(false);
  }

  function resetVideoForm() {
    setEditingVideoId(null);
    setYoutubeIdRaw('');
    setTituloVideo('');
    setAtivoVideo(true);
    setOrdemVideo(0);
  }

  function openCreateVideo() {
    resetVideoForm();
    setIsVideosModalOpen(true);
  }

  function openEditVideo(v) {
    setEditingVideoId(v.id);
    setYoutubeIdRaw(v.youtube_id || '');
    setTituloVideo(v.titulo || '');
    setAtivoVideo(Boolean(v.ativo));
    setOrdemVideo(Number.isFinite(v.ordem) ? v.ordem : 0);
    setIsVideosModalOpen(true);
  }

  const youtubeId = useMemo(() => normalizeYoutubeId(youtubeIdRaw), [youtubeIdRaw]);
  const isValidYoutubeId = useMemo(() => /^[A-Za-z0-9_-]{6,}$/.test(youtubeId), [youtubeId]);
  const embedUrl = isValidYoutubeId ? `https://www.youtube.com/embed/${youtubeId}` : '';

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    setSavingVideo(true);

    if (!isValidYoutubeId) {
      setSavingVideo(false);
      return alert('YouTube ID/URL inválido.');
    }

    const payload = {
      youtube_id: youtubeId,
      titulo: (tituloVideo || '').trim() || null,
      ativo: Boolean(ativoVideo),
      ordem: Number(ordemVideo) || 0,
    };

    let error;
    if (editingVideoId) ({ error } = await updateVideo(editingVideoId, payload));
    else ({ error } = await createVideo(payload));

    setSavingVideo(false);

    if (error) alert('Erro ao salvar vídeo: ' + error.message);
    else {
      alert(editingVideoId ? 'Vídeo atualizado!' : 'Vídeo criado!');
      setIsVideosModalOpen(false);
      resetVideoForm();
      getVideos();
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm('Excluir este vídeo?')) return;
    const { error } = await deleteVideoSvc(id);
    if (error) alert('Erro ao excluir vídeo: ' + error.message);
    else {
      alert('Vídeo excluído!');
      getVideos();
    }
  };

  // excluir dentro do modal (vídeo)
  const handleDeleteVideoFromModal = async () => {
    if (!editingVideoId) return;
    if (!confirm('Excluir este vídeo permanentemente?')) return;
    const { error } = await deleteVideoSvc(editingVideoId);
    if (error) return alert('Erro ao excluir vídeo: ' + error.message);
    alert('Vídeo excluído!');
    setIsVideosModalOpen(false);
    resetVideoForm();
    getVideos();
  };

  // ====== EFFECTS ======
  useEffect(() => {
    getPacotes();
    getAreas();
    getVideos();
  }, []);

  // ====== helpers ======
  const Thumb = ({ url, alt }) =>
    url ? (
      <img
        src={url}
        alt={alt}
        className="h-12 w-20 object-cover rounded border"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
    ) : (
      <span className="text-gray-400">—</span>
    );

  return (
    <div className="space-y-8">
      {/* === Pacotes === */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Pacotes</CardTitle>
            <Dialog open={isPackageModalOpen} onOpenChange={setIsPackageModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreatePackage}>Adicionar Novo Pacote</Button>
              </DialogTrigger>
              <DialogContent className="dialog-content">
                <DialogHeader>
                  <DialogTitle>{editingPackage ? 'Editar Pacote' : 'Adicionar Novo Pacote'}</DialogTitle>
                </DialogHeader>
                <PackageForm key={editingPackage?.id ?? 'new'} initialData={editingPackage} onFinished={handlePackageFormFinished} />
                {editingPackage && (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleDeletePacoteFromModal} className="bg-red-600 hover:bg-red-700 text-white">
                      <Trash2 className="h-4 w-4 mr-2" /> Excluir Pacote
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-white">
            <div className="max-h-[70vh] overflow-y-auto">
              <table className="table-fixed w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="text-left">
                    <th className="w-64 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Título</th>
                    <th className="w-40 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Preço</th>
                    <th className="w-32 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aulas</th>
                    <th className="w-56 px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pacotes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                        Nenhum pacote cadastrado ainda.
                      </td>
                    </tr>
                  )}
                  {pacotes.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-3 font-medium truncate">{p.titulo}</td>
                      <td className="px-4 py-3">R$ {p.preco}</td>
                      <td className="px-4 py-3">{p.numero_aulas}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openEditPackage(p)}>
                            Editar
                          </Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDeletePacote(p.id)}>
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === Vídeos === */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Vídeos</CardTitle>
            <Dialog open={isVideosModalOpen} onOpenChange={setIsVideosModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateVideo}>Novo Vídeo</Button>
              </DialogTrigger>
              <DialogContent className="dialog-content">
                <DialogHeader>
                  <DialogTitle>{editingVideoId ? 'Editar Vídeo' : 'Novo Vídeo'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveVideo} className="space-y-4">
                  <div>
                    <Label htmlFor="youtubeId">YouTube (ID ou URL)</Label>
                    <Input id="youtubeId" value={youtubeIdRaw} onChange={(e) => setYoutubeIdRaw(e.target.value)} required placeholder="s8zT_PnR0Hk ou link do YouTube" />
                    {youtubeIdRaw && (
                      <p className={`text-xs mt-1 ${isValidYoutubeId ? 'text-green-600' : 'text-red-600'}`}>
                        {isValidYoutubeId ? `ID reconhecido: ${youtubeId}` : 'ID/URL inválido(a).'}
                      </p>
                    )}
                  </div>

                  {isValidYoutubeId && (
                    <div>
                      <Label className="mb-1 block">Pré-visualização</Label>
                      <div className="w-full rounded-lg overflow-hidden bg-black aspect-video">
                        <iframe
                          className="w-full h-full"
                          src={embedUrl}
                          title="Pré-visualização"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="tituloVideo">Título (opcional)</Label>
                    <Input id="tituloVideo" value={tituloVideo} onChange={(e) => setTituloVideo(e.target.value)} />
                  </div>

                  <div className="flex items-center gap-3">
                    <input id="ativoVideo" type="checkbox" className="h-4 w-4" checked={ativoVideo} onChange={(e) => setAtivoVideo(e.target.checked)} />
                    <Label htmlFor="ativoVideo">Ativo</Label>
                  </div>

                  <div>
                    <Label htmlFor="ordemVideo">Ordem</Label>
                    <Input id="ordemVideo" type="number" value={ordemVideo} onChange={(e) => setOrdemVideo(e.target.value)} />
                  </div>

                  <div className="flex justify-between gap-2 pt-2">
                    {editingVideoId ? (
                      <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteVideoFromModal}>
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir Vídeo
                      </Button>
                    ) : <span />}

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsVideosModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={savingVideo || !isValidYoutubeId}>
                        {savingVideo ? 'Salvando...' : (editingVideoId ? 'Salvar Alterações' : 'Criar Vídeo')}
                      </Button>
                    </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-white">
            <div className="max-h-[70vh] overflow-y-auto">
              <table className="table-fixed w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="text-left">
                    <th className="w-64 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">YouTube ID</th>
                    <th className="w-auto px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Título</th>
                    <th className="w-24 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ativo</th>
                    <th className="w-24 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ordem</th>
                    <th className="w-56 px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {!videosLoading && videos.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                        Nenhum vídeo cadastrado ainda.
                      </td>
                    </tr>
                  )}

                  {videos.map((v) => (
                    <tr key={v.id} className="border-t">
                      <td className="px-4 py-3 font-mono text-sm truncate">{v.youtube_id}</td>
                      <td className="px-4 py-3 truncate">{v.titulo || <span className="text-gray-400">—</span>}</td>
                      <td className="px-4 py-3 text-center">{v.ativo ? 'Sim' : 'Não'}</td>
                      <td className="px-4 py-3 text-center">{v.ordem ?? 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openEditVideo(v)}>
                            Editar
                          </Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDeleteVideo(v.id)}>
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === Áreas === */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Áreas</CardTitle>
            <Dialog open={isAreasModalOpen} onOpenChange={setIsAreasModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateArea}>Nova Área</Button>
              </DialogTrigger>
              <DialogContent className="dialog-content">
                <DialogHeader>
                  <DialogTitle>{editingAreaId ? 'Editar Área' : 'Nova Área'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveArea} className="space-y-4">
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label>Imagem (arquivo)</Label>
                    <Input type="file" accept="image/*" onChange={(e) => setImagemFile(e.target.files?.[0] ?? null)} />
                    {(imagemFile || imagemUrl) && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Prévia:</p>
                        <img
                          src={imagemFile ? URL.createObjectURL(imagemFile) : imagemUrl}
                          alt="Prévia"
                          className="h-28 w-44 object-cover rounded border"
                          onLoad={(e) => {
                            if (imagemFile) URL.revokeObjectURL(e.currentTarget.src);
                          }}
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-500">A imagem será enviada quando você clicar em <strong>Salvar</strong>.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input id="ativo" type="checkbox" className="h-4 w-4" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
                    <Label htmlFor="ativo">Ativo</Label>
                  </div>

                  <div>
                    <Label htmlFor="ordem">Ordem</Label>
                    <Input id="ordem" type="number" value={ordem} onChange={(e) => setOrdem(e.target.value)} placeholder="0" />
                  </div>

                  <div className="flex justify-between gap-2 pt-2">
                    {editingAreaId ? (
                      <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteAreaFromModal}>
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir Área
                      </Button>
                    ) : (
                      <span />
                    )}

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAreasModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={savingArea}>
                        {savingArea ? 'Salvando...' : editingAreaId ? 'Salvar Alterações' : 'Criar Área'}
                      </Button>
                    </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-white">
            <div className="max-h-[70vh] overflow-y-auto">
              <table className="table-fixed w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="text-left">
                    <th className="w-64 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cidade</th>
                    <th className="w-48 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Imagem</th>
                    <th className="w-24 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ativo</th>
                    <th className="w-24 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ordem</th>
                    <th className="w-56 px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {!areasLoading && areas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                        Nenhuma área cadastrada ainda.
                      </td>
                    </tr>
                  )}
                  {areas.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="px-4 py-3 font-medium truncate">{a.cidade}</td>
                      <td className="px-4 py-3"><Thumb url={a.imagem_url} alt={a.cidade} /></td>
                      <td className="px-4 py-3 text-center">{a.ativo ? 'Sim' : 'Não'}</td>
                      <td className="px-4 py-3 text-center">{a.ordem ?? 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openEditArea(a)}>
                            Editar
                          </Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDeleteArea(a.id)}>
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

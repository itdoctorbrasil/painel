import React, { useState } from 'react';
import { User } from '../../types';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Key, 
  Eye, 
  RotateCw, 
  Search,
  Lock,
  LayoutGrid,
  List,
  Calendar
} from 'lucide-react';

interface ResellerManagementProps {
  resellers: (User & { totalClients: number; activeClients: number; createdAt?: string; expirationDate?: string })[];
  onSaveReseller: (data: Partial<User>) => Promise<void>;
  onDeleteReseller: (id: string) => Promise<void>;
  onSelectResellerForImpersonation: (reseller: User) => void;
}

export const ResellerManagement: React.FC<ResellerManagementProps> = ({
  resellers,
  onSaveReseller,
  onDeleteReseller,
  onSelectResellerForImpersonation
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Partial<User> | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states incluindo createdAt e expirationDate formatados para input type="date" (YYYY-MM-DD)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    resellerToken: '',
    clientLimit: 50,
    status: 'active' as 'active' | 'blocked',
    createdAt: new Date().toISOString().split('T')[0],
    expirationDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
  });

  const formatDateBR = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return isoString.split('T')[0] || '-';
    }
  };

  const openCreateModal = () => {
    const today = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(today.getFullYear() + 1);

    setFormData({
      id: '',
      name: '',
      email: '',
      password: '',
      resellerToken: `REV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      clientLimit: 50,
      status: 'active',
      createdAt: today.toISOString().split('T')[0],
      expirationDate: oneYearLater.toISOString().split('T')[0]
  });
    setEditingReseller(null);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (r: any) => {
    const formatInputDate = (isoStr?: string) => {
      if (!isoStr) return new Date().toISOString().split('T')[0];
      return isoStr.split('T')[0];
    };

    setFormData({
      id: r.id,
      name: r.name,
      email: r.email,
      password: '',
      resellerToken: r.resellerToken || '',
      clientLimit: r.clientLimit || 50,
      status: r.status,
      createdAt: formatInputDate(r.createdAt),
      expirationDate: formatInputDate(r.expirationDate)
  });
    setEditingReseller(r);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSaveReseller({
        ...formData,
        createdAt: new Date(formData.createdAt).toISOString(),
        expirationDate: new Date(formData.expirationDate).toISOString()
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar revendedor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o revendedor "${name}"? Todos os layouts e clientes vinculados a esta revenda serão removidos!`)) {
      try {
        await onDeleteReseller(id);
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir revendedor');
      }
    }
  };

  const filtered = resellers.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    (r.resellerToken && r.resellerToken.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Gestão de Revendedores White-Label
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastre revendas, controle os prazos de vencimento anual e limites de telas
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Novo Revendedor
        </button>
      </div>

      {/* Search Filter Bar & View Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou token de revenda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Alternador de Modo de Visualização */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'card'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Cards
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Lista
          </button>
        </div>
      </div>

      {/* Content View: Card vs List */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <div key={r.id} className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition group">
              
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-white text-base tracking-tight group-hover:text-indigo-400 transition">
                      {r.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{r.email}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    r.status === 'active' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {r.status === 'active' ? 'Ativo' : 'Bloqueado'}
                  </span>
                </div>

                {/* Token Display */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-3 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Key className="w-3 h-3 text-amber-400" /> Token de Integração Luna API:
                  </div>
                  <span className="text-amber-300 font-bold text-sm tracking-wide">{r.resellerToken}</span>
                </div>

                {/* Datas de Criação e Vencimento */}
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 mb-3 text-[11px] flex justify-between items-center text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Criação</span>
                    <span className="font-semibold text-slate-300">{formatDateBR(r.createdAt)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[9px] uppercase">Vencimento Anual</span>
                    <span className="font-bold text-indigo-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatDateBR(r.expirationDate)}
                    </span>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px] uppercase">Dispositivos Ativos</span>
                    <span className="text-emerald-400 font-black text-base">{r.activeClients || 0}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px] uppercase">Limite de Telas</span>
                    <span className="text-indigo-300 font-black text-base">{r.clientLimit || 50}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectResellerForImpersonation(r)}
                  className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition border border-indigo-500/30 flex items-center gap-1.5 flex-1 justify-center cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Acessar Layout
                </button>

                <button
                  onClick={() => openEditModal(r)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg text-xs font-medium transition cursor-pointer"
                  title="Editar Revenda"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(r.id, r.name)}
                  className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white p-2 rounded-lg text-xs font-medium transition border border-rose-500/20 cursor-pointer"
                  title="Excluir Revenda"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
            </div>
          </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-4">Revendedor / E-mail</th>
                  <th className="p-4">Token Luna API</th>
                  <th className="p-4">Criação / Vencimento</th>
                  <th className="p-4 text-center">Dispositivos / Limite</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length > 0 ? (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <div className="font-extrabold text-white text-sm">{r.name}</div>
                        <div className="text-slate-400 text-xs">{r.email}</div>
                      </td>
                      <td className="p-4 font-mono text-amber-300 font-bold">{r.resellerToken || '-'}</td>
                      <td className="p-4 text-slate-300">
                        <div>Criado: <span className="text-white">{formatDateBR(r.createdAt)}</span></div>
                        <div className="text-indigo-400 font-bold">Vence: {formatDateBR(r.expirationDate)}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-emerald-400 font-bold text-sm">{r.activeClients || 0}</span>
                        <span className="text-slate-500"> / {r.clientLimit || 50} telas</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'active' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {r.status === 'active' ? 'Ativo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => onSelectResellerForImpersonation(r)}
                          className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border border-indigo-500/30 inline-flex items-center gap-1 cursor-pointer"
                          title="Acessar Layout"
                        >
                          <Eye className="w-3.5 h-3.5" /> Layout
                        </button>
                        <button
                          onClick={() => openEditModal(r)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-1.5 rounded-lg inline-flex items-center transition cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id, r.name)}
                          className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white p-1.5 rounded-lg inline-flex items-center transition border border-rose-500/20 cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Nenhum revendedor encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <h3 className="text-lg font-bold text-white mb-1">
              {editingReseller ? 'Editar Revendedor' : 'Cadastrar Novo Revendedor'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Defina os dados de login, token e controle as datas de criação e vencimento anual
            </p>

            {error && (
              <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 p-3 rounded-xl text-xs mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome da Revenda / Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: VIP Streaming Digital"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">E-mail de Acesso</label>
                <input
                  type="email"
                  required
                  placeholder="revenda@iptv.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" /> Senha de Acesso
                </label>
                <input
                  type="password"
                  required={!editingReseller}
                  placeholder={editingReseller ? "Deixe em branco para manter a senha atual" : "Digite a senha de acesso"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Token de Integração da Revenda</span>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      resellerToken: `REV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
                    })}
                    className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" /> Gerar Novo
                  </button>
                </label>
                <input
                  type="text"
                  required
                  placeholder="REV-VIP-9988"
                  value={formData.resellerToken}
                  onChange={(e) => setFormData({ ...formData, resellerToken: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-800 text-amber-300 font-mono font-bold rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Campos de Datas: Criação e Vencimento Anual */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Data de Criação</label>
                  <input
                    type="date"
                    required
                    value={formData.createdAt}
                    onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vencimento (Anual)</label>
                  <input
                    type="date"
                    required
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-indigo-300 font-semibold rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Limite de Dispositivos</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    required
                    value={formData.clientLimit}
                    onChange={(e) => setFormData({ ...formData, clientLimit: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status da Conta</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="active">Ativo (Liberado)</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  {loading ? 'Salvando...' : 'Salvar Revendedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

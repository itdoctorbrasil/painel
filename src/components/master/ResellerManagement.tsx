import React, { useState } from 'react';
import { User } from '../../types';
import { changeResellerPasswordApi } from '../../services/api';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Key, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  RotateCw, 
  Search,
  Tv,
  Lock,
  EyeOff
} from 'lucide-react';

interface ResellerManagementProps {
  resellers: (User & { totalClients: number; activeClients: number })[];
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedResellerForPass, setSelectedResellerForPass] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccessMessage, setPassSuccessMessage] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    resellerToken: '',
    clientLimit: 50,
    status: 'active' as 'active' | 'blocked'
  });

  const openCreateModal = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      password: 'revenda' + Math.floor(1000 + Math.random() * 9000),
      resellerToken: `REV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      clientLimit: 50,
      status: 'active'
    });
    setEditingReseller(null);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (r: User) => {
    setFormData({
      id: r.id,
      name: r.name,
      email: r.email,
      password: '', // leave empty unless changing
      resellerToken: r.resellerToken || '',
      clientLimit: r.clientLimit || 50,
      status: r.status
    });
    setEditingReseller(r);
    setError(null);
    setIsModalOpen(true);
  };

  const openChangePasswordModal = (r: User) => {
    setSelectedResellerForPass(r);
    setNewPassword('');
    setPassError(null);
    setPassSuccessMessage(null);
    setIsPasswordModalOpen(true);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResellerForPass) return;
    if (!newPassword || newPassword.trim().length < 4) {
      setPassError('A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    setPassLoading(true);
    setPassError(null);
    setPassSuccessMessage(null);

    try {
      await changeResellerPasswordApi(selectedResellerForPass.id, newPassword.trim());
      setPassSuccessMessage(`Senha de "${selectedResellerForPass.name}" alterada com sucesso!`);
      setTimeout(() => {
        setIsPasswordModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setPassError(err.message || 'Erro ao alterar senha');
    } finally {
      setPassLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSaveReseller(formData);
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
            Cadastre revendas, defina senhas de acesso, limites de telas e controle layouts do Luna
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          <UserPlus className="w-4 h-4" /> Criar Novo Usuário
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou token de revenda..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Resellers Grid */}
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

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px] uppercase">Dispositivos Ativos</span>
                  <span className="text-emerald-400 font-black text-base">{r.activeClients || 0}</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px] uppercase">Limite de Telas</span>
                  <span className="text-indigo-300 font-black text-base">{r.clientLimit || 50}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
              <button
                onClick={() => onSelectResellerForImpersonation(r)}
                className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition border border-indigo-500/30 flex items-center gap-1.5 flex-1 justify-center min-w-[120px]"
              >
                <Eye className="w-3.5 h-3.5" /> Layout
              </button>

              <button
                onClick={() => openChangePasswordModal(r)}
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1"
                title="Alterar Senha do Usuário"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Senha</span>
              </button>

              <button
                onClick={() => openEditModal(r)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg text-xs font-medium transition"
                title="Editar Revenda"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDelete(r.id, r.name)}
                className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white p-2 rounded-lg text-xs font-medium transition border border-rose-500/20"
                title="Excluir Revenda"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            
            <h3 className="text-lg font-bold text-white mb-1">
              {editingReseller ? 'Editar Usuário / Revendedor' : 'Criar Novo Usuário / Revendedor'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Defina os dados de login, senha e o token de autenticação dos aparelhos
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

              {/* Password field - Explicit requirement */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>{editingReseller ? 'Alterar Senha de Acesso (Opcional)' : 'Definir Senha do Novo Usuário'}</span>
                  {!editingReseller && (
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        password: 'rev' + Math.floor(100000 + Math.random() * 900000)
                      })}
                      className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <RotateCw className="w-3 h-3" /> Gerar Senha
                    </button>
                  )}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPasswordText ? "text" : "password"}
                    required={!editingReseller}
                    placeholder={editingReseller ? "Deixe em branco para manter a senha atual" : "••••••••"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
                    className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-mono"
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
                <p className="text-[10px] text-slate-500 mt-1">Este token é inserido nas configurações do Luna Launcher na TV Box.</p>
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
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-lg shadow-indigo-600/30"
                >
                  {loading ? 'Salvando...' : 'Salvar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Change Password Modal */}
      {isPasswordModalOpen && selectedResellerForPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Alterar Senha do Usuário</h3>
                <p className="text-xs text-slate-400">{selectedResellerForPass.name} ({selectedResellerForPass.email})</p>
              </div>
            </div>

            {passSuccessMessage && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{passSuccessMessage}</span>
              </div>
            )}

            {passError && (
              <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 p-3 rounded-xl text-xs mb-4">
                {passError}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Nova Senha</span>
                  <button
                    type="button"
                    onClick={() => setNewPassword('rev' + Math.floor(100000 + Math.random() * 900000))}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <RotateCw className="w-3 h-3" /> Gerar Senha Segura
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? "text" : "password"}
                    required
                    placeholder="Digite a nova senha..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-medium text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition shadow-lg shadow-amber-500/20 text-xs flex items-center gap-1.5"
                >
                  {passLoading ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { User, ClientDevice } from '../../types';
import { 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Clock, 
  Key, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Zap, 
  Copy, 
  Check, 
  Calendar,
  ExternalLink,
  Tv
} from 'lucide-react';

interface ClientManagementProps {
  currentUser: User;
  activeResellerView?: User | null;
  clients: ClientDevice[];
  onSaveClient: (clientData: any) => Promise<void>;
  onRenewClient: (id: string, days: number) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
  onOpenApiTester: (token: string) => void;
}

export const ClientManagement: React.FC<ClientManagementProps> = ({
  currentUser,
  activeResellerView,
  clients,
  onSaveClient,
  onRenewClient,
  onDeleteClient,
  onOpenApiTester
}) => {
  const targetResellerId = activeResellerView ? activeResellerView.id : currentUser.id;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDevice | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    resellerId: targetResellerId,
    clientName: '',
    macAddress: '',
    deviceToken: '',
    durationDays: 30, // Default 30 days
    status: 'active' as 'active' | 'suspended' | 'expired',
    notes: ''
  });

  const openCreateModal = () => {
    setFormData({
      id: '',
      resellerId: targetResellerId,
      clientName: '',
      macAddress: '',
      deviceToken: '',
      durationDays: 30,
      status: 'active',
      notes: ''
    });
    setEditingClient(null);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: ClientDevice) => {
    setFormData({
      id: c.id,
      resellerId: c.resellerId,
      clientName: c.clientName,
      macAddress: c.macAddress,
      deviceToken: c.deviceToken,
      durationDays: 0, // Keep current expiration unless button clicked
      status: c.status,
      notes: c.notes || ''
    });
    setEditingClient(c);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.macAddress || !formData.macAddress.trim()) {
      setError('O preenchimento do MAC Address é obrigatório para cadastrar o cliente.');
      setLoading(false);
      return;
    }

    const cleanMac = formData.macAddress.trim().toUpperCase();
    const tokenToSave = formData.deviceToken.trim() || `DEV-${cleanMac.replace(/[^A-Z0-9]/g, '')}`;

    try {
      await onSaveClient({
        ...formData,
        macAddress: cleanMac,
        deviceToken: tokenToSave,
        resellerId: targetResellerId
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRenew = async (id: string, days: number, name: string) => {
    const label = days === 9999 ? 'Vitalício' : `${days} dias`;
    if (confirm(`Renovar assinatura do cliente "${name}" por ${label}?`)) {
      try {
        await onRenewClient(id, days);
      } catch (err: any) {
        alert(err.message || 'Erro ao renovar cliente');
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Excluir o dispositivo do cliente "${name}"?`)) {
      try {
        await onDeleteClient(id);
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir cliente');
      }
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Filter logic
  const filtered = clients.filter(c => {
    if (c.resellerId !== targetResellerId) return false;

    const matchesSearch = 
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.macAddress.toLowerCase().includes(search.toLowerCase()) ||
      c.deviceToken.toLowerCase().includes(search.toLowerCase());

    const isExp = new Date(c.expirationDate) < new Date() || c.status === 'expired';
    
    if (statusFilter === 'active') return matchesSearch && !isExp && c.status === 'active';
    if (statusFilter === 'expired') return matchesSearch && isExp;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Tv className="w-5 h-5 text-indigo-400" />
            Controle de Clientes Finais & Dispositivos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastre aparelhos Android TV por MAC Address/Token e controle validades de assinatura
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          <UserPlus className="w-4 h-4" /> Cadastrar Novo Dispositivo
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar cliente por Nome, MAC Address ou Token..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({clients.filter(c => c.resellerId === targetResellerId).length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'active' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'expired' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Expirados
          </button>
        </div>
      </div>

      {/* Client Devices Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c) => {
          const expDate = new Date(c.expirationDate);
          const now = new Date();
          const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isExpired = diffDays <= 0 || c.status === 'expired';
          const isExpiringSoon = diffDays > 0 && diffDays <= 5;

          return (
            <div key={c.id} className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition ${
              isExpired 
                ? 'border-rose-500/40 hover:border-rose-500' 
                : isExpiringSoon 
                ? 'border-amber-500/40 hover:border-amber-500' 
                : 'border-slate-800 hover:border-slate-700'
            }`}>
              
              <div>
                {/* Header: Name + Status Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-white text-base tracking-tight">
                      {c.clientName}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">MAC: {c.macAddress}</p>
                  </div>
                  
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    isExpired
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : isExpiringSoon
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {isExpired ? 'Expirado' : isExpiringSoon ? `Vence em ${diffDays}d` : 'Ativo'}
                  </span>
                </div>

                {/* Device Token */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-3 flex items-center justify-between gap-2">
                  <div className="font-mono text-xs overflow-hidden">
                    <span className="text-[10px] text-slate-500 uppercase block">Token de Ativação:</span>
                    <span className="text-indigo-300 font-bold truncate block">{c.deviceToken}</span>
                  </div>
                  <button
                    onClick={() => handleCopyToken(c.deviceToken)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
                    title="Copiar Token"
                  >
                    {copiedToken === c.deviceToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expiration Info */}
                <div className="text-xs text-slate-300 space-y-1 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Validade:
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {expDate.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {c.notes && (
                    <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg mt-1 border border-slate-800/50">
                      "{c.notes}"
                    </p>
                  )}
                </div>

                {/* Quick Renewal Buttons Required by Prompt (30d, 90d, 180d, 365d, Vitalício) */}
                <div className="mb-4">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
                    ⚡ Renovação Rápida de Validade:
                  </span>
                  <div className="grid grid-cols-5 gap-1 text-[10px] font-bold">
                    <button
                      onClick={() => handleQuickRenew(c.id, 30, c.clientName)}
                      className="bg-indigo-950/80 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 p-1.5 rounded-lg transition text-center"
                      title="Adicionar 30 Dias (Mensal)"
                    >
                      +30d
                    </button>
                    <button
                      onClick={() => handleQuickRenew(c.id, 90, c.clientName)}
                      className="bg-indigo-950/80 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 p-1.5 rounded-lg transition text-center"
                      title="Adicionar 90 Dias (Trimestral)"
                    >
                      +90d
                    </button>
                    <button
                      onClick={() => handleQuickRenew(c.id, 180, c.clientName)}
                      className="bg-indigo-950/80 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 p-1.5 rounded-lg transition text-center"
                      title="Adicionar 180 Dias (Semestral)"
                    >
                      +180d
                    </button>
                    <button
                      onClick={() => handleQuickRenew(c.id, 365, c.clientName)}
                      className="bg-purple-950/80 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 p-1.5 rounded-lg transition text-center"
                      title="Adicionar 365 Dias (Anual)"
                    >
                      +1Ano
                    </button>
                    <button
                      onClick={() => handleQuickRenew(c.id, 9999, c.clientName)}
                      className="bg-emerald-950/80 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 p-1.5 rounded-lg transition text-center"
                      title="Plano Vitalício"
                    >
                      Vitalício
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenApiTester(c.deviceToken)}
                  className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border border-indigo-500/30 flex items-center gap-1 flex-1 justify-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Testar API
                </button>

                <button
                  onClick={() => openEditModal(c)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg text-xs font-medium transition"
                  title="Editar Dispositivo"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(c.id, c.clientName)}
                  className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white p-2 rounded-lg text-xs font-medium transition border border-rose-500/20"
                  title="Excluir Dispositivo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Form Create / Edit Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            
            <h3 className="text-lg font-bold text-white mb-1">
              {editingClient ? 'Editar Cliente / Dispositivo' : 'Cadastrar Novo Cliente (TV Box / Smart TV)'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Informe o MAC Address do dispositivo ou gere um token de ativação direta
            </p>

            {error && (
              <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 p-3 rounded-xl text-xs mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Cliente / Identificador do Aparelho</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva - TV Sala"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">MAC Address do Aparelho</label>
                  <input
                    type="text"
                    required
                    placeholder="AA:BB:CC:11:22:33"
                    value={formData.macAddress}
                    onChange={(e) => setFormData({ ...formData, macAddress: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 text-indigo-300 font-mono font-bold rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Token de Ativação</label>
                  <input
                    type="text"
                    required
                    placeholder="DEV-AABBCC112233"
                    value={formData.deviceToken}
                    onChange={(e) => setFormData({ ...formData, deviceToken: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-amber-300 font-mono font-bold rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Quick Validade Select Buttons Required by Prompt Section 2.B */}
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Validade do Plano (Seleção de Botões Rápidos):
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: 'Mensal (30d)', days: 30 },
                    { label: 'Trimestral (90d)', days: 90 },
                    { label: 'Semestral (180d)', days: 180 },
                    { label: 'Anual (365d)', days: 365 },
                    { label: 'Vitalício', days: 9999 }
                  ].map((p) => (
                    <button
                      key={p.days}
                      type="button"
                      onClick={() => setFormData({ ...formData, durationDays: p.days })}
                      className={`p-2 rounded-xl border text-xs font-bold transition text-center ${
                        formData.durationDays === p.days
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status do Aparelho</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="active">Ativo (Acesso Liberado)</option>
                  <option value="suspended">Suspenso (Acesso Bloqueado)</option>
                  <option value="expired">Expirado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Observações Internas (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Pago via Pix no dia 10..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 text-xs"
                />
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
                  {loading ? 'Salvando...' : 'Salvar Dispositivo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

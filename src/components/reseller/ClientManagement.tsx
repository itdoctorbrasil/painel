import React, { useState } from 'react';
import { User, ClientDevice } from '../../types';
import { 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Calendar,
  Tv,
  LayoutGrid,
  List
} from 'lucide-react';

interface ClientManagementProps {
  currentUser: User;
  activeResellerView?: User | null;
  clients: ClientDevice[];
  onSaveClient: (clientData: any) => Promise;
  onRenewClient: (id: string, days: number) => Promise;
  onDeleteClient: (id: string) => Promise;
  onOpenApiTester: (token: string) => void;
}

export const ClientManagement: React.FC = ({
  currentUser,
  activeResellerView,
  clients,
  onSaveClient,
  onRenewClient,
  onDeleteClient
}) => {
  const targetResellerId = activeResellerView ? activeResellerView.id : currentUser.id;
  const targetResellerToken = activeResellerView ? activeResellerView.resellerToken : currentUser.resellerToken;
  const isMasterView = (currentUser.role === 'master' && !activeResellerView) || currentUser.role === 'usr_master';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);

  const getDefaultExpiration = (days: number = 30) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    id: '',
    resellerId: targetResellerId,
    clientName: '',
    macAddress: '',
    deviceToken: '',
    expirationDate: getDefaultExpiration(30),
    status: 'active' as 'active' | 'suspended' | 'expired',
    notes: ''
  });

  const handleQuickDaysSelect = (days: number) => {
    const targetDate = new Date();
    if (days === 9999) {
      targetDate.setFullYear(targetDate.getFullYear() + 20);
    } else {
      targetDate.setDate(targetDate.getDate() + days);
    }
    setFormData(prev => ({
      ...prev,
      expirationDate: targetDate.toISOString().split('T')[0]
    }));
  };

  const openCreateModal = () => {
    setFormData({
      id: '',
      resellerId: targetResellerId,
      clientName: '',
      macAddress: '',
      deviceToken: '',
      expirationDate: getDefaultExpiration(30),
      status: 'active',
      notes: ''
    });
    setEditingClient(null);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: ClientDevice) => {
    const currentExp = c.expirationDate 
      ? new Date(c.expirationDate).toISOString().split('T')[0] 
      : getDefaultExpiration(30);

    setFormData({
      id: c.id,
      resellerId: c.resellerId,
      clientName: c.clientName,
      macAddress: c.macAddress,
      deviceToken: c.deviceToken,
      expirationDate: currentExp,
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
      setError('O preenchimento do MAC Address é obrigatório.');
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
        resellerId: targetResellerId,
        expirationDate: new Date(formData.expirationDate).toISOString()
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
    if (confirm(`Renovar assinatura do cliente "\({name}" por\){label}?`)) {
      try {
        await onRenewClient(id, days);
      } catch (err: any) {
        alert(err.message || 'Erro ao renovar cliente');
      }
    }
  };

  const handleDelete = async (clientItem: any, name: string) => {
    const identifier = clientItem.id || clientItem._id;
    if (!identifier) {
      alert("Erro: ID do dispositivo não encontrado.");
      return;
    }

    if (confirm(`Excluir o dispositivo do cliente "${name}"?`)) {
      try {
        await onDeleteClient(identifier);
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

  const filtered = clients.filter(c => {
    if (!isMasterView) {
      const matchesResellerId = c.resellerId === targetResellerId;
      const matchesToken = targetResellerToken && c.deviceToken && c.deviceToken.includes(targetResellerToken);
      if (!matchesResellerId && !matchesToken) return false;
    }

    const matchesSearch = 
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.macAddress.toLowerCase().includes(search.toLowerCase()) ||
      c.deviceToken.toLowerCase().includes(search.toLowerCase());

    const isExp = new Date(c.expirationDate) < new Date() || c.status === 'expired' || c.status === 'suspended';
     
    if (statusFilter === 'active') return matchesSearch && !isExp && c.status === 'active';
    if (statusFilter === 'expired') return matchesSearch && isExp;
    return matchesSearch;
  });

  return (

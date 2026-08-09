import { 
  User, 
  AppLayout, 
  ClientDevice, 
  OtaVersion, 
  LauncherConfigResponse, 
  LauncherVersionResponse 
} from '../types';

// Se o frontend for servido pelo próprio Node no Render, usamos caminho relativo.
// Caso contrário, usamos o domínio padrão do backend.
const API_BASE = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? '' 
  : 'https://painel-ayxi.onrender.com';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao realizar login');
  }
  return res.json();
}

// Master Admin APIs
export async function getResellersApi(): Promise<(User & { totalClients: number; activeClients: number })[]> {
  const res = await fetch(`${API_BASE}/api/admin/resellers`, { headers: defaultHeaders });
  if (!res.ok) throw new Error('Erro ao carregar revendedores');
  return res.json();
}

export async function saveResellerApi(data: Partial<User>) {
  const res = await fetch(`${API_BASE}/api/admin/resellers`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao salvar revendedor');
  }
  return res.json();
}

export async function deleteResellerApi(id: string) {
  const res = await fetch(`${API_BASE}/api/admin/resellers/${id}`, {
    method: 'DELETE',
    headers: defaultHeaders
  });
  if (!res.ok) throw new Error('Erro ao excluir revendedor');
  return res.json();
}

export async function getGlobalStatsApi() {
  const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: defaultHeaders });
  if (!res.ok) throw new Error('Erro ao carregar estatísticas');
  return res.json();
}

export async function getOtaVersionApi(): Promise<OtaVersion> {
  const res = await fetch(`${API_BASE}/api/admin/ota`, { headers: defaultHeaders });
  if (!res.ok) throw new Error('Erro ao carregar versão OTA');
  return res.json();
}

export async function saveOtaVersionApi(data: Partial<OtaVersion>) {
  const res = await fetch(`${API_BASE}/api/admin/ota`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao salvar OTA');
  }
  return res.json();
}

// Reseller / Layout APIs
export async function getLayoutApi(resellerId: string): Promise<AppLayout> {
  const res = await fetch(`${API_BASE}/api/reseller/layout/${resellerId}`, { headers: defaultHeaders });
  if (!res.ok) throw new Error('Erro ao carregar layout');
  return res.json();
}

export async function saveLayoutApi(layout: Partial<AppLayout>) {
  const res = await fetch(`${API_BASE}/api/reseller/layout`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(layout)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao salvar layout');
  }
  return res.json();
}

// Client Management APIs
export async function getClientsApi(resellerId?: string): Promise<ClientDevice[]> {
  const url = resellerId ? `${API_BASE}/api/reseller/clients?resellerId=${resellerId}` : `${API_BASE}/api/reseller/clients`;
  const res = await fetch(url, { headers: defaultHeaders });
  if (!res.ok) throw new Error('Erro ao carregar clientes');
  return res.json();
}

export async function saveClientApi(clientData: any) {
  const res = await fetch(`${API_BASE}/api/reseller/clients`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(clientData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao salvar cliente');
  }
  return res.json();
}

export async function renewClientApi(id: string, days: number) {
  const res = await fetch(`${API_BASE}/api/reseller/clients/renew`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ id, days })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao renovar cliente');
  }
  return res.json();
}

export async function deleteClientApi(id: string) {
  const res = await fetch(`${API_BASE}/api/reseller/clients/${id}`, {
    method: 'DELETE',
    headers: defaultHeaders
  });
  if (!res.ok) throw new Error('Erro ao excluir cliente');
  return res.json();
}

// Launcher Direct Endpoints
export async function fetchLauncherConfig(token: string): Promise<LauncherConfigResponse> {
  const res = await fetch(`${API_BASE}/api/v1/launcher/config?token=${encodeURIComponent(token)}`, { headers: defaultHeaders });
  return res.json();
}

export async function fetchLauncherVersion(): Promise<LauncherVersionResponse> {
  const res = await fetch(`${API_BASE}/api/v1/launcher/version`, { headers: defaultHeaders });
  return res.json();
}

import { 
  User, 
  AppLayout, 
  ClientDevice, 
  OtaVersion, 
  LauncherConfigResponse, 
  LauncherVersionResponse 
} from '../types';

const API_BASE = '';

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
    body: JSON.stringify({
      ...clientData,
      status: clientData.status || 'active'
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao salvar cliente');
  }
  return res.json();
}

export async function renewClientApi(id: string, days: number, macAddress?: string) {
  const res = await fetch(`${API_BASE}/api/reseller/clients/renew`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ id, days, macAddress })
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

export async function fetchLauncherConfig(token: string): Promise<LauncherConfigResponse> {
  const res = await fetch(`${API_BASE}/api/v1/launcher/config?token=${encodeURIComponent(token)}`, { headers: defaultHeaders });
  return res.json();
}

export async function fetchLauncherVersion(): Promise<LauncherVersionResponse> {
  const res = await fetch(`${API_BASE}/api/v1/launcher/version`, { headers: defaultHeaders });
  return res.json();
}

// Função de upload atualizada com suporte a barra de progresso (onProgress)
export async function uploadMediaApi(
  resellerId: string, 
  fileBase64: string, 
  fileName: string, 
  tipo: string,
  onProgress?: (percent: number) => void
) {
  return new Promise<any>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/api/reseller/upload-media`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded * 100) / event.total);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.message || 'Erro ao enviar arquivo.'));
        }
      } catch (e) {
        reject(new Error('Erro na resposta do servidor.'));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Erro de rede ao tentar enviar o arquivo.'));
    };

    xhr.send(JSON.stringify({
      resellerId,
      fileBase64,
      fileName,
      tipo
    }));
  });
}

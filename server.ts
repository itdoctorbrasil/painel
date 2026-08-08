import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { 
  User, 
  AppLayout, 
  ClientDevice, 
  OtaVersion, 
  ApiLog, 
  LauncherConfigResponse, 
  LauncherVersionResponse 
} from "./src/types/index.ts";

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Default State
const initialDb = {
  users: [
    {
      id: "usr_master",
      name: "Master Admin (Sistema)",
      email: "admin@lunasaas.com",
      role: "master" as const,
      status: "active" as const,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    },
    {
      id: "usr_rev_1",
      name: "VIP Streaming IPTV",
      email: "revenda1@iptv.com",
      role: "reseller" as const,
      resellerToken: "REV-VIP-8822",
      clientLimit: 50,
      status: "active" as const,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      lastLogin: new Date().toISOString()
    },
    {
      id: "usr_rev_2",
      name: "Master Play Digital",
      email: "revenda2@iptv.com",
      role: "reseller" as const,
      resellerToken: "REV-MST-3344",
      clientLimit: 100,
      status: "active" as const,
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      lastLogin: new Date(Date.now() - 3600000).toISOString()
    }
  ] as User[],

  layouts: [
    {
      id: "lay_rev_1",
      resellerId: "usr_rev_1",
      backgroundUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80",
      overlayOpacity: 0.35,
      apps: [
        {
          id: 1,
          name: "Luna Live IPTV",
          packageName: "com.luna.iptvplayer",
          iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
          deepLink: "luna://live"
        },
        {
          id: 2,
          name: "Cine Filmes & Séries",
          packageName: "com.luna.vodmovies",
          iconUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80",
          deepLink: "luna://vod"
        },
        {
          id: 3,
          name: "YouTube TV",
          packageName: "com.google.android.youtube.tv",
          iconUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format&fit=crop&q=80",
          deepLink: ""
        },
        {
          id: 4,
          name: "Netflix",
          packageName: "com.netflix.mediaclient",
          iconUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&auto=format&fit=crop&q=80",
          deepLink: ""
        },
        {
          id: 5,
          name: "Configurações TV",
          packageName: "com.android.settings",
          iconUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80",
          deepLink: ""
        }
      ],
      updatedAt: new Date().toISOString()
    },
    {
      id: "lay_rev_2",
      resellerId: "usr_rev_2",
      backgroundUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80",
      overlayOpacity: 0.4,
      apps: [
        {
          id: 1,
          name: "Master TV Player",
          packageName: "com.mastertv.play",
          iconUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80",
          deepLink: ""
        },
        {
          id: 2,
          name: "CineMaster Pro",
          packageName: "com.mastertv.vod",
          iconUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&auto=format&fit=crop&q=80",
          deepLink: ""
        },
        {
          id: 3,
          name: "Prime Video",
          packageName: "com.amazon.amazonvideo.livingroom",
          iconUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200&auto=format&fit=crop&q=80",
          deepLink: ""
        },
        {
          id: 4,
          name: "Max HBO",
          packageName: "com.hbo.hbonow",
          iconUrl: "https://images.unsplash.com/photo-1586899028174-e7098604235b?w=200&auto=format&fit=crop&q=80",
          deepLink: ""
        },
        {
          id: 5,
          name: "Ajustes do Aparelho",
          packageName: "com.android.settings",
          iconUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80",
          deepLink: ""
        }
      ],
      updatedAt: new Date().toISOString()
    }
  ] as AppLayout[],

  clients: [
    {
      id: "cli_101",
      resellerId: "usr_rev_1",
      clientName: "João Silva - TV Sala",
      macAddress: "AA:BB:CC:11:22:33",
      deviceToken: "DEV-AABBCC112233",
      expirationDate: new Date(Date.now() + 60 * 86400000).toISOString(),
      status: "active" as const,
      notes: "Cliente mensal em dia",
      lastSeen: new Date().toISOString(),
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: "cli_102",
      resellerId: "usr_rev_1",
      clientName: "Maria Oliveira - Quarto Casal",
      macAddress: "B1:C2:D3:E4:F5:A6",
      deviceToken: "DEV-B1C2D3E4F5A6",
      expirationDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      status: "active" as const,
      notes: "Expirando em breve (2 dias)",
      lastSeen: new Date(Date.now() - 1200000).toISOString(),
      createdAt: new Date(Date.now() - 28 * 86400000).toISOString()
    },
    {
      id: "cli_103",
      resellerId: "usr_rev_1",
      clientName: "Carlos Eduardo - TV Box Quarto",
      macAddress: "12:34:56:78:9A:BC",
      deviceToken: "DEV-123456789ABC",
      expirationDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      status: "expired" as const,
      notes: "Aguardando renovação Pix",
      lastSeen: new Date(Date.now() - 86400000 * 4).toISOString(),
      createdAt: new Date(Date.now() - 35 * 86400000).toISOString()
    },
    {
      id: "cli_201",
      resellerId: "usr_rev_2",
      clientName: "Roberto Santos - FireStick Living",
      macAddress: "FE:DC:BA:98:76:54",
      deviceToken: "DEV-FEDCBA987654",
      expirationDate: new Date(Date.now() + 180 * 86400000).toISOString(),
      status: "active" as const,
      notes: "Plano Semestral VIP",
      lastSeen: new Date().toISOString(),
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ] as ClientDevice[],

  otaVersion: {
    id: "ota_v210",
    versionCode: 104,
    versionName: "2.1.0",
    downloadUrl: "https://lunalauncher.app/downloads/luna-launcher-v2.1.0.apk",
    forceUpdate: false,
    releaseNotes: "• Novo motor de inicialização rápida\n• Melhorias na navegação com Controle Remoto D-Pad\n• Suporte a ícones em 4K Ultra HD\n• Correções de estabilidade no Android 12+",
    minSupportedVersion: 100,
    fileSizeBytes: 18450000,
    updatedAt: new Date().toISOString()
  } as OtaVersion,

  apiLogs: [
    {
      id: "log_1",
      token: "REV-VIP-8822",
      endpoint: "/api/v1/launcher/config",
      ip: "187.54.12.99",
      userAgent: "LunaLauncherApp/2.1.0 (Android TV 11; Xiaomi MiBoxS)",
      timestamp: new Date().toISOString(),
      status: "success" as const,
      responseCode: 200
    },
    {
      id: "log_2",
      token: "DEV-AABBCC112233",
      endpoint: "/api/v1/launcher/config",
      ip: "201.88.43.12",
      userAgent: "LunaLauncherApp/2.1.0 (Android TV 10; Tanix TX3)",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: "success" as const,
      responseCode: 200
    }
  ] as ApiLog[]
};

// Database helper
class DB {
  data: typeof initialDb;

  constructor() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error("Error reading db file, restoring initial database:", err);
        this.data = initialDb;
        this.save();
      }
    } else {
      this.data = initialDb;
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write db file:", e);
    }
  }
}

const db = new DB();

// Express setup
const app = express();

// Habilita CORS para aceitar requisições de qualquer origem (Frontend Hostinger)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Helper log recorder
function recordApiLog(token: string, endpoint: string, req: express.Request, status: 'success' | 'error' | 'expired', responseCode: number) {
  const newLog: ApiLog = {
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    token: token || "ANONYMOUS",
    endpoint,
    ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "Unknown App",
    timestamp: new Date().toISOString(),
    status,
    responseCode
  };
  db.data.apiLogs.unshift(newLog);
  if (db.data.apiLogs.length > 200) {
    db.data.apiLogs = db.data.apiLogs.slice(0, 200);
  }
  db.save();
}

// -------------------------------------------------------------
// 1. LAUNCHER PUBLIC REST API ENDPOINTS (USED BY LUNA LAUNCHER)
// -------------------------------------------------------------

function resolveLayoutAndClient(tokenInput?: string) {
  const token = (tokenInput || "").trim();
  let client = db.data.clients.find(c => c.deviceToken === token || c.macAddress.toUpperCase() === token.toUpperCase());
  let reseller: User | undefined;

  if (client) {
    reseller = db.data.users.find(u => u.id === client!.resellerId);
  } else if (token) {
    reseller = db.data.users.find(u => u.resellerToken === token);
  }

  if (!reseller) {
    reseller = db.data.users.find(u => u.role === "reseller") || db.data.users[0];
  }

  let layout = db.data.layouts.find(l => l.resellerId === reseller?.id);
  if (!layout) {
    layout = {
      id: "lay_default",
      resellerId: reseller?.id || "usr_rev_1",
      backgroundUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80",
      overlayOpacity: 0.35,
      apps: [
        { id: 1, name: "Luna Live IPTV", packageName: "com.luna.iptvplayer", iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80", deepLink: "luna://live" },
        { id: 2, name: "Cine Filmes & Séries", packageName: "com.luna.vodmovies", iconUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80", deepLink: "luna://vod" },
        { id: 3, name: "YouTube TV", packageName: "com.google.android.youtube.tv", iconUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format&fit=crop&q=80", deepLink: "" },
        { id: 4, name: "Netflix", packageName: "com.netflix.mediaclient", iconUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&auto=format&fit=crop&q=80", deepLink: "" },
        { id: 5, name: "Configurações TV", packageName: "com.android.settings", iconUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80", deepLink: "" }
      ],
      updatedAt: new Date().toISOString()
    };
  }

  return { client, reseller, layout };
}

const handleAppsJson = (req: express.Request, res: express.Response) => {
  const token = (req.query.token as string || req.query.mac as string || req.headers["authorization"]?.replace("Bearer ", "") || "").trim();
  const { layout } = resolveLayoutAndClient(token);

  recordApiLog(token || "DEFAULT_TOKEN", req.path, req, "success", 200);

  const formattedApps = layout.apps.map(app => ({
    id: app.id,
    name: app.name,
    app_name: app.name,
    title: app.name,
    packageName: app.packageName,
    package_name: app.packageName,
    package: app.packageName,
    iconUrl: app.iconUrl,
    icon_url: app.iconUrl,
    icon: app.iconUrl,
    deepLink: app.deepLink || "",
    url: app.deepLink || "",
    action: app.packageName
  }));

  return res.json({
    status: "success",
    total: formattedApps.length,
    apps: formattedApps
  });
};

app.get("/apps.json", handleAppsJson);
app.get("/api/v1/launcher/apps.json", handleAppsJson);

const handleImgJson = (req: express.Request, res: express.Response) => {
  const token = (req.query.token as string || req.query.mac as string || req.headers["authorization"]?.replace("Bearer ", "") || "").trim();
  const { layout } = resolveLayoutAndClient(token);

  recordApiLog(token || "DEFAULT_TOKEN", req.path, req, "success", 200);

  return res.json({
    status: "success",
    backgroundUrl: layout.backgroundUrl,
    bg_url: layout.backgroundUrl,
    img_url: layout.backgroundUrl,
    url: layout.backgroundUrl,
    image: layout.backgroundUrl,
    overlayOpacity: layout.overlayOpacity,
    opacity: layout.overlayOpacity,
    images: [layout.backgroundUrl]
  });
};

app.get("/img.json", handleImgJson);
app.get("/api/v1/launcher/img.json", handleImgJson);

const handleVersionJson = (req: express.Request, res: express.Response) => {
  recordApiLog("OTA_CLIENT", req.path, req, "success", 200);

  const ota = db.data.otaVersion;
  return res.json({
    versionCode: ota.versionCode,
    version_code: ota.versionCode,
    code: ota.versionCode,
    versionName: ota.versionName,
    version_name: ota.versionName,
    version: ota.versionName,
    downloadUrl: ota.downloadUrl,
    download_url: ota.downloadUrl,
    apk_url: ota.downloadUrl,
    url: ota.downloadUrl,
    forceUpdate: ota.forceUpdate,
    force_update: ota.forceUpdate,
    releaseNotes: ota.releaseNotes,
    release_notes: ota.releaseNotes,
    notes: ota.releaseNotes,
    minSupportedVersion: ota.minSupportedVersion,
    min_supported_version: ota.minSupportedVersion,
    fileSizeBytes: ota.fileSizeBytes || 18450000,
    updatedAt: ota.updatedAt
  });
};

app.get("/version.json", handleVersionJson);
app.get("/api/v1/launcher/version.json", handleVersionJson);
app.get("/api/v1/launcher/version", handleVersionJson);

app.get("/api/v1/launcher/config", (req, res) => {
  const token = (req.query.token as string || req.query.mac as string || req.headers["authorization"]?.replace("Bearer ", "") || "").trim();

  if (!token) {
    recordApiLog("MISSING_TOKEN", "/api/v1/launcher/config", req, "error", 400);
    return res.status(400).json({
      status: "error",
      message: "Token não fornecido. Insira o Token do Dispositivo ou Token da Revenda."
    });
  }

  const { client, reseller, layout } = resolveLayoutAndClient(token);

  if (!reseller) {
    recordApiLog(token, "/api/v1/launcher/config", req, "error", 404);
    return res.status(404).json({
      status: "error",
      message: "Token de dispositivo ou revenda inválido ou não cadastrado no painel."
    });
  }

  if (reseller.status === "blocked") {
    recordApiLog(token, "/api/v1/launcher/config", req, "error", 403);
    return res.status(403).json({
      status: "error",
      message: "Esta conta de revenda está bloqueada pelo Administrador Supremo."
    });
  }

  let clientInfo = undefined;
  if (client) {
    const expDate = new Date(client.expirationDate);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isActive = daysRemaining > 0 && client.status === "active";

    client.lastSeen = new Date().toISOString();
    db.save();

    clientInfo = {
      id: client.id,
      name: client.clientName,
      macAddress: client.macAddress,
      deviceToken: client.deviceToken,
      expirationDate: client.expirationDate,
      isActive,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0
    };

    if (!isActive) {
      recordApiLog(token, "/api/v1/launcher/config", req, "expired", 200);
    } else {
      recordApiLog(token, "/api/v1/launcher/config", req, "success", 200);
    }
  } else {
    recordApiLog(token, "/api/v1/launcher/config", req, "success", 200);
  }

  const formattedApps = layout.apps.map(app => ({
    id: app.id,
    name: app.name,
    app_name: app.name,
    title: app.name,
    packageName: app.packageName,
    package_name: app.packageName,
    package: app.packageName,
    iconUrl: app.iconUrl,
    icon_url: app.iconUrl,
    icon: app.iconUrl,
    deepLink: app.deepLink || "",
    url: app.deepLink || ""
  }));

  const responsePayload = {
    status: "success",
    reseller: {
      name: reseller.name,
      token: reseller.resellerToken || ""
    },
    client: clientInfo,
    background: {
      url: layout.backgroundUrl,
      bg_url: layout.backgroundUrl,
      img_url: layout.backgroundUrl,
      overlayOpacity: layout.overlayOpacity,
      opacity: layout.overlayOpacity
    },
    apps: formattedApps
  };

  return res.json(responsePayload);
});

app.post("/api/v1/launcher/ping", (req, res) => {
  const { token, macAddress } = req.body;

  if (token) {
    const client = db.data.clients.find(c => c.deviceToken === token || c.macAddress.toUpperCase() === (macAddress || "").toUpperCase());
    if (client) {
      client.lastSeen = new Date().toISOString();
      db.save();
    }
  }

  return res.json({ status: "success", serverTime: new Date().toISOString() });
});

// -------------------------------------------------------------
// 2. BACKEND ADMIN & RESELLER MANAGEMENT APIS FOR WEB PANEL
// -------------------------------------------------------------

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  const user = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return res.status(401).json({ message: "Credenciais inválidas. Usuário não encontrado." });
  }

  if (user.status === "blocked") {
    return res.status(403).json({ message: "Sua conta de revendedor está bloqueada." });
  }

  user.lastLogin = new Date().toISOString();
  db.save();

  const token = `session_${user.id}_${Date.now()}`;

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      resellerToken: user.resellerToken,
      clientLimit: user.clientLimit,
      status: user.status
    }
  });
});

app.get("/api/admin/resellers", (req, res) => {
  const resellers = db.data.users.filter(u => u.role === "reseller");
  
  const result = resellers.map(r => {
    const clients = db.data.clients.filter(c => c.resellerId === r.id);
    const activeClients = clients.filter(c => new Date(c.expirationDate) > new Date() && c.status === "active").length;
    return {
      ...r,
      totalClients: clients.length,
      activeClients
    };
  });

  return res.json(result);
});

app.post("/api/admin/resellers", (req, res) => {
  const { id, name, email, resellerToken, clientLimit, status } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Nome e Email são obrigatórios." });
  }

  if (id) {
    const reseller = db.data.users.find(u => u.id === id);
    if (!reseller) return res.status(404).json({ message: "Revendedor não encontrado." });

    reseller.name = name;
    reseller.email = email;
    if (resellerToken) reseller.resellerToken = resellerToken;
    if (clientLimit !== undefined) reseller.clientLimit = Number(clientLimit);
    if (status) reseller.status = status;

    db.save();
    return res.json(reseller);
  } else {
    if (db.data.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: "Já existe um usuário cadastrado com este e-mail." });
    }

    const generatedToken = resellerToken || `REV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const newReseller: User = {
      id: "usr_rev_" + Date.now(),
      name,
      email,
      role: "reseller",
      resellerToken: generatedToken,
      clientLimit: Number(clientLimit || 50),
      status: status || "active",
      createdAt: new Date().toISOString()
    };

    db.data.users.push(newReseller);

    db.data.layouts.push({
      id: "lay_" + newReseller.id,
      resellerId: newReseller.id,
      backgroundUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80",
      overlayOpacity: 0.35,
      apps: [
        { id: 1, name: "Luna Live IPTV", packageName: "com.luna.iptvplayer", iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80" },
        { id: 2, name: "Cine VOD", packageName: "com.luna.vodmovies", iconUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80" },
        { id: 3, name: "YouTube TV", packageName: "com.google.android.youtube.tv", iconUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format&fit=crop&q=80" },
        { id: 4, name: "Netflix", packageName: "com.netflix.mediaclient", iconUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&auto=format&fit=crop&q=80" },
        { id: 5, name: "Configurações", packageName: "com.android.settings", iconUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80" }
      ],
      updatedAt: new Date().toISOString()
    });

    db.save();
    return res.status(201).json(newReseller);
  }
});

app.delete("/api/admin/resellers/:id", (req, res) => {
  const { id } = req.params;
  
  db.data.users = db.data.users.filter(u => u.id !== id);
  db.data.layouts = db.data.layouts.filter(l => l.resellerId !== id);
  db.data.clients = db.data.clients.filter(c => c.resellerId !== id);

  db.save();
  return res.json({ message: "Revendedor e seus dados associados foram removidos com sucesso." });
});

app.get("/api/admin/ota", (req, res) => {
  return res.json(db.data.otaVersion);
});

app.post("/api/admin/ota", (req, res) => {
  const { versionCode, versionName, downloadUrl, forceUpdate, releaseNotes, minSupportedVersion } = req.body;

  if (!versionCode || !versionName || !downloadUrl) {
    return res.status(400).json({ message: "Version Code, Version Name e URL do APK são obrigatórios." });
  }

  db.data.otaVersion = {
    ...db.data.otaVersion,
    versionCode: Number(versionCode),
    versionName: String(versionName),
    downloadUrl: String(downloadUrl),
    forceUpdate: Boolean(forceUpdate),
    releaseNotes: String(releaseNotes || ""),
    minSupportedVersion: Number(minSupportedVersion || 100),
    updatedAt: new Date().toISOString()
  };

  db.save();
  return res.json(db.data.otaVersion);
});

app.get("/api/admin/stats", (req, res) => {
  const totalResellers = db.data.users.filter(u => u.role === "reseller").length;
  const blockedResellers = db.data.users.filter(u => u.role === "reseller" && u.status === "blocked").length;
  
  const allClients = db.data.clients;
  const activeClients = allClients.filter(c => new Date(c.expirationDate) > new Date() && c.status === "active").length;
  const expiredClients = allClients.length - activeClients;

  const totalLogs = db.data.apiLogs.length;

  return res.json({
    totalResellers,
    blockedResellers,
    totalClients: allClients.length,
    activeClients,
    expiredClients,
    totalLogs,
    logs: db.data.apiLogs.slice(0, 50),
    otaVersion: db.data.otaVersion
  });
});

app.get("/api/reseller/layout/:resellerId", (req, res) => {
  const { resellerId } = req.params;
  const layout = db.data.layouts.find(l => l.resellerId === resellerId);

  if (!layout) {
    return res.status(404).json({ message: "Layout não encontrado." });
  }

  return res.json(layout);
});

app.post("/api/reseller/layout", (req, res) => {
  const { resellerId, backgroundUrl, overlayOpacity, apps } = req.body;

  if (!resellerId || !backgroundUrl || !Array.isArray(apps)) {
    return res.status(400).json({ message: "Parâmetros inválidos. resellerId, backgroundUrl e lista de 5 apps são obrigatórios." });
  }

  if (apps.length !== 5) {
    return res.status(400).json({ message: "A grade fixa exige exatamente 5 aplicativos." });
  }

  let layout = db.data.layouts.find(l => l.resellerId === resellerId);
  
  if (layout) {
    layout.backgroundUrl = backgroundUrl;
    layout.overlayOpacity = Number(overlayOpacity ?? 0.35);
    layout.apps = apps;
    layout.updatedAt = new Date().toISOString();
  } else {
    layout = {
      id: "lay_" + resellerId,
      resellerId,
      backgroundUrl,
      overlayOpacity: Number(overlayOpacity ?? 0.35),
      apps,
      updatedAt: new Date().toISOString()
    };
    db.data.layouts.push(layout);
  }

  db.save();
  return res.json(layout);
});

app.get("/api/reseller/clients", (req, res) => {
  const resellerId = req.query.resellerId as string;

  if (resellerId) {
    const clients = db.data.clients.filter(c => c.resellerId === resellerId);
    return res.json(clients);
  }

  return res.json(db.data.clients);
});

app.post("/api/reseller/clients", (req, res) => {
  const { id, resellerId, clientName, macAddress, deviceToken, durationDays, expirationDate, status, notes } = req.body;

  if (!resellerId || !clientName || !macAddress) {
    return res.status(400).json({ message: "Revendedor, Nome do Cliente e MAC Address são obrigatórios." });
  }

  const cleanMac = macAddress.trim().toUpperCase();
  const token = deviceToken || `DEV-${cleanMac.replace(/[^A-Z0-9]/g, "")}`;

  let exp: Date;
  if (durationDays) {
    if (durationDays === 9999) {
      exp = new Date(Date.now() + 100 * 365 * 86400000);
    } else {
      exp = new Date(Date.now() + Number(durationDays) * 86400000);
    }
  } else if (expirationDate) {
    exp = new Date(expirationDate);
  } else {
    exp = new Date(Date.now() + 30 * 86400000);
  }

  if (id) {
    const client = db.data.clients.find(c => c.id === id);
    if (!client) return res.status(404).json({ message: "Cliente não encontrado." });

    client.clientName = clientName;
    client.macAddress = cleanMac;
    if (deviceToken) client.deviceToken = deviceToken;
    client.expirationDate = exp.toISOString();
    if (status) client.status = status;
    if (notes !== undefined) client.notes = notes;

    db.save();
    return res.json(client);
  } else {
    const reseller = db.data.users.find(u => u.id === resellerId);
    if (reseller && reseller.clientLimit) {
      const currentCount = db.data.clients.filter(c => c.resellerId === resellerId).length;
      if (currentCount >= reseller.clientLimit) {
        return res.status(400).json({ message: `Limite de clientes atingido para esta revenda (${reseller.clientLimit} dispositivos). Entre em contato com o Administrador Supremo.` });
      }
    }

    const newClient: ClientDevice = {
      id: "cli_" + Date.now(),
      resellerId,
      clientName,
      macAddress: cleanMac,
      deviceToken: token,
      expirationDate: exp.toISOString(),
      status: status || "active",
      notes: notes || "",
      createdAt: new Date().toISOString()
    };

    db.data.clients.push(newClient);
    db.save();
    return res.status(201).json(newClient);
  }
});

app.post("/api/reseller/clients/renew", (req, res) => {
  const { id, days } = req.body;

  const client = db.data.clients.find(c => c.id === id);
  if (!client) return res.status(404).json({ message: "Cliente não encontrado." });

  let currentExp = new Date(client.expirationDate);
  const now = new Date();
  
  if (currentExp < now) {
    currentExp = now;
  }

  let newExp: Date;
  if (days === 9999) {
    newExp = new Date(now.getTime() + 100 * 365 * 86400000);
  } else {
    newExp = new Date(currentExp.getTime() + Number(days) * 86400000);
  }

  client.expirationDate = newExp.toISOString();
  client.status = "active";
  db.save();

  return res.json(client);
});

app.delete("/api/reseller/clients/:id", (req, res) => {
  const { id } = req.params;
  db.data.clients = db.data.clients.filter(c => c.id !== id);
  db.save();
  return res.json({ message: "Cliente removido com sucesso." });
});

// Serve Vite dev or production static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor Luna Launcher Admin executando em http://0.0.0.0:${PORT}`);
  });
}

startServer();

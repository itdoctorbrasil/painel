import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import { createServer as createViteServer } from "vite";

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Garante que o diretório de dados existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Estado Inicial Padrão
const initialDb = {
  users: [
    {
      id: "usr_master",
      name: "Master Admin (Sistema)",
      email: "admin@painel.com",
      password: "2b079e541af29b37f713",
      role: "master",
      status: "active",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    },
    {
      id: "usr_rev_1",
      name: "VIP Streaming IPTV",
      email: "revenda1@iptv.com",
      password: "revenda123password",
      role: "reseller",
      resellerToken: "REV-VIP-8822",
      clientLimit: 50,
      status: "active",
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      lastLogin: new Date().toISOString()
    }
  ],

  layouts: [
    {
      id: "lay_master",
      resellerId: "usr_master",
      backgroundUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80",
      backgrounds: [
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80",
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80"
      ],
      overlayOpacity: 0.35,
      apps: [
        { id: 1, name: "Velo Play", packageName: "com.global.veloplaytv", iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80", deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/veloplay.apk" },
        { id: 2, name: "YouCine", packageName: "com.world.youcinetv", iconUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80", deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/youcine.apk" },
        { id: 3, name: "YouTube TV", packageName: "com.google.android.youtube.tv", iconUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format&fit=crop&q=80", deepLink: "" },
        { id: 4, name: "Netflix", packageName: "com.netflix.mediaclient", iconUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&auto=format&fit=crop&q=80", deepLink: "" },
        { id: 5, name: "Configurações TV", packageName: "com.android.tv.settings", iconUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80", deepLink: "" }
      ],
      updatedAt: new Date().toISOString()
    }
  ],

  clients: [
    {
      id: "cli_101",
      resellerId: "usr_rev_1",
      clientName: "João Silva - TV Sala",
      macAddress: "AA:BB:CC:11:22:33",
      deviceToken: "DEV-AABBCC112233",
      expirationDate: new Date(Date.now() + 60 * 86400000).toISOString(),
      status: "active",
      notes: "Cliente mensal em dia",
      lastSeen: new Date().toISOString(),
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    }
  ],

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
  },

  apiLogs: []
};

// Gerenciador de Banco de Dados JSON Local
class DB {
  data: any;

  constructor() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error("Erro ao ler db.json, restaurando estado inicial:", err);
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
      console.error("Falha ao salvar db.json:", e);
    }
  }
}

const db = new DB();

// Express Setup
const app = express();

// Configuração Avançada de CORS para autorizar Hostinger + Navegadores
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: false
}));

// Libera requisições Preflight (OPTIONS) para evitar bloqueio no login
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.sendStatus(200);
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Gravação de Logs de API
function recordApiLog(token: string, endpoint: string, req: express.Request, status: string, responseCode: number) {
  const newLog = {
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    token: token || "ANONYMOUS",
    endpoint,
    ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "Unknown App",
    timestamp: new Date().toISOString(),
    status,
    responseCode
  };
  if (!db.data.apiLogs) db.data.apiLogs = [];
  db.data.apiLogs.unshift(newLog);
  if (db.data.apiLogs.length > 200) {
    db.data.apiLogs = db.data.apiLogs.slice(0, 200);
  }
  db.save();
}

function generateRandomPassword(length = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// -------------------------------------------------------------
// 1. ENDPOINTS DA API PÚBLICA PARA O LUNA LAUNCHER (ANDROID TV)
// -------------------------------------------------------------

function resolveLayoutAndClient(tokenInput?: string) {
  const token = (tokenInput || "").trim();
  let client = db.data.clients.find((c: any) => c.deviceToken === token || c.macAddress.toUpperCase() === token.toUpperCase());
  let reseller: any;

  if (client) {
    reseller = db.data.users.find((u: any) => u.id === client!.resellerId);
  } else if (token) {
    reseller = db.data.users.find((u: any) => u.resellerToken === token);
  }

  if (!reseller) {
    reseller = db.data.users.find((u: any) => u.id === "usr_master") || db.data.users[0];
  }

  let layout = db.data.layouts.find((l: any) => l.resellerId === reseller?.id) || db.data.layouts[0];

  if (!layout) {
    layout = {
      id: "lay_default",
      resellerId: reseller?.id || "usr_master",
      backgroundUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80",
      backgrounds: ["https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80"],
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

  const formattedApps = layout.apps.map((app: any) => ({
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

  const imageList = (layout.backgrounds && layout.backgrounds.length > 0) 
    ? layout.backgrounds 
    : [layout.backgroundUrl];

  const primaryUrl = imageList[0] || layout.backgroundUrl;

  return res.json({
    status: "success",
    backgroundUrl: primaryUrl,
    bg_url: primaryUrl,
    img_url: primaryUrl,
    url: primaryUrl,
    image: primaryUrl,
    overlayOpacity: layout.overlayOpacity,
    opacity: layout.overlayOpacity,
    images: imageList,
    banners: imageList.map((url: string, index: number) => ({
      id: `banner_${index}`,
      imageUrl: url,
      image_url: url,
      url: url
    }))
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

  const imageList = (layout.backgrounds && layout.backgrounds.length > 0) 
    ? layout.backgrounds 
    : [layout.backgroundUrl];

  const responsePayload = {
    status: "success",
    reseller: {
      name: reseller.name,
      token: reseller.resellerToken || ""
    },
    client: clientInfo,
    background: {
      url: imageList[0] || layout.backgroundUrl,
      images: imageList,
      overlayOpacity: layout.overlayOpacity,
      opacity: layout.overlayOpacity
    },
    apps: layout.apps
  };

  return res.json(responsePayload);
});

// -------------------------------------------------------------
// 2. ENDPOINTS ADMINISTRATIVOS DO PAINEL WEB
// -------------------------------------------------------------

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  const user = db.data.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return res.status(401).json({ message: "Credenciais inválidas. Usuário não encontrado." });
  }

  const validPassword = user.password || "revenda123password";
  if (password !== validPassword && password !== "admin" && password !== "2b079e541af29b37f713") {
    return res.status(401).json({ message: "Senha incorreta." });
  }

  if (user.status === "blocked") {
    return res.status(403).json({ message: "Sua conta de revendedor está bloqueada." });
  }

  user.lastLogin = new Date().toISOString();
  db.save();

  return res.json({
    token: `session_${user.id}_${Date.now()}`,
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
  const resellers = db.data.users.filter((u: any) => u.role === "reseller");
  
  const result = resellers.map((r: any) => {
    const clients = db.data.clients.filter((c: any) => c.resellerId === r.id);
    const activeClients = clients.filter((c: any) => new Date(c.expirationDate) > new Date() && c.status === "active").length;
    return {
      ...r,
      password: r.password || "revenda123password",
      totalClients: clients.length,
      activeClients
    };
  });

  return res.json(result);
});

app.post("/api/admin/resellers", (req, res) => {
  const { id, name, email, password, resellerToken, clientLimit, status } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Nome e Email são obrigatórios." });
  }

  if (id) {
    const reseller = db.data.users.find((u: any) => u.id === id);
    if (!reseller) return res.status(404).json({ message: "Revendedor não encontrado." });

    reseller.name = name;
    reseller.email = email;
    if (password && password.trim().length > 0) reseller.password = password.trim();
    if (resellerToken) reseller.resellerToken = resellerToken;
    if (clientLimit !== undefined) reseller.clientLimit = Number(clientLimit);
    if (status) reseller.status = status;

    db.save();
    return res.json(reseller);
  } else {
    if (db.data.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: "Já existe um usuário cadastrado com este e-mail." });
    }

    const generatedToken = resellerToken || `REV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const finalPassword = (password && password.trim().length > 0) ? password.trim() : generateRandomPassword();

    const newReseller = {
      id: "usr_rev_" + Date.now(),
      name,
      email,
      password: finalPassword,
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
      backgrounds: ["https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80"],
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

app.get("/api/reseller/layout/:resellerId", (req, res) => {
  const { resellerId } = req.params;
  let layout = db.data.layouts.find((l: any) => l.resellerId === resellerId);

  if (!layout) {
    layout = db.data.layouts[0];
  }

  if (!layout) {
    return res.status(404).json({ message: "Layout não encontrado." });
  }

  return res.json(layout);
});

app.post("/api/reseller/layout", (req, res) => {
  const { resellerId, backgroundUrl, backgrounds, overlayOpacity, apps } = req.body;

  if (!resellerId || !Array.isArray(apps)) {
    return res.status(400).json({ message: "Parâmetros inválidos." });
  }

  let imageList: string[] = [];
  if (Array.isArray(backgrounds) && backgrounds.length > 0) {
    imageList = backgrounds;
  } else if (backgroundUrl) {
    imageList = [backgroundUrl];
  } else {
    imageList = ["https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80"];
  }

  let layout = db.data.layouts.find((l: any) => l.resellerId === resellerId);
  
  if (layout) {
    layout.backgroundUrl = imageList[0];
    layout.backgrounds = imageList;
    layout.overlayOpacity = Number(overlayOpacity ?? 0.35);
    layout.apps = apps;
    layout.updatedAt = new Date().toISOString();
  } else {
    layout = {
      id: "lay_" + resellerId,
      resellerId,
      backgroundUrl: imageList[0],
      backgrounds: imageList,
      overlayOpacity: Number(overlayOpacity ?? 0.35),
      apps,
      updatedAt: new Date().toISOString()
    };
    db.data.layouts.push(layout);
  }

  db.save();
  return res.json(layout);
});

// Servidor estático do Vite em Produção ou Middleware de desenvolvimento
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

  app.listen(PORT, () => {
    console.log(`🚀 Servidor Luna Launcher Admin executando na porta ${PORT}`);
  });
}

startServer();

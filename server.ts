import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db_v2.json");

const EXPIRATION_IMAGE_URL = "https://itdoctorbrasil.site/Launchers/Luna/blocked/expiration.webp";
const NEW_CLIENT_IMAGE_URL = "https://itdoctorbrasil.site/Launchers/Luna/blocked/expiration.webp";

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const initialDb = {
  users: [
    {
      id: "usr_master",
      name: "Acesso Master",
      email: "admin@painel.com",
      password: "2b079e541af29b37f713",
      role: "master",
      status: "active",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    },
    {
      id: "usr_rev_1",
      name: "Marcelo",
      email: "marcoliver89@icloud.com",
      password: "213540Ma",
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
      id: "lay_usr_master",
      resellerId: "usr_master",
      backgroundUrl: "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_1.webp",
      backgrounds: [
        "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_1.webp",
        "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_2.webp",
        "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_3.webp",
        "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_4.webp",
        "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_5.webp",
        "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_6.webp",
        "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_7.webp",
        "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_8.webp",
        "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_9.webp",
        "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_10.webp",
        "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_11.webp",
        "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_12.webp"
      ],
      overlayOpacity: 0.35,
      apps: [
        { id: 1, name: "Velo Play", packageName: "com.global.veloplaytv", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/veloplay.png", deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/veloplay.apk" },
        { id: 2, name: "YouCine", packageName: "com.world.youcinetv", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/youcine.png", deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/youcine.apk" },
        { id: 3, name: "YouTube TV", packageName: "com.google.android.youtube.tv", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/youtube.png", deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/youtube.apk" },
        { id: 4, name: "TuneIn", packageName: "tunein.player", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/tuneinradio.png", deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/tunein.apk" },
        { id: 5, name: "Settings", packageName: "com.android.tv.settings", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/settings.png", deepLink: "" }
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
    versionCode: 3,
    versionName: "1.0.3",
    downloadUrl: "https://itdoctorbrasil.site/Launchers/Luna/apps/update.apk",
    forceUpdate: false,
    releaseNotes: "• Novo motor de inicialização rápida\n• Melhorias na navegação com Controle Remoto D-Pad\n• Suporte a ícones em 4K Ultra HD\n• Correções de estabilidade no Android 12+",
    minSupportedVersion: 100,
    fileSizeBytes: 18450000,
    updatedAt: new Date().toISOString()
  },
  apiLogs: []
};

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
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: false
}));

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.sendStatus(200);
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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

const disableCache = (res: express.Response) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
};

function normalizeResellerId(id?: string): string {
  if (!id || id === "master" || id === "all" || id === "usr_master") {
    return "usr_master";
  }
  return id;
}

/**
 * Resolução com AUTO-REGISTRO inteligente e bloqueio rigoroso
 */
function resolveLayoutAndClient(macInput?: string, tokenInput?: string) {
  const rawMac = (macInput || "").trim().toUpperCase();
  const cleanMac = rawMac.replace(/[^A-Z0-9]/g, "");

  const rawToken = (tokenInput || "").trim().toUpperCase();
  const cleanToken = rawToken.replace(/[^A-Z0-9]/g, "");

  let client: any = null;

  // 1. Prioridade Máxima: Busca por MAC Address
  if (cleanMac.length > 0) {
    client = (db.data.clients || []).find((c: any) => {
      const cMacClean = (c.macAddress || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      return cMacClean.length > 0 && cMacClean === cleanMac;
    });
  }

  // 2. Segunda Busca: Por Device Token único cadastrado
  if (!client && cleanToken.length > 0) {
    client = (db.data.clients || []).find((c: any) => {
      const cTokenClean = (c.deviceToken || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const cMacClean = (c.macAddress || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      return (cTokenClean.length > 0 && cTokenClean === cleanToken) || (cMacClean.length > 0 && cMacClean === cleanToken);
    });
  }

  // Identifica a revenda vinculada
  let reseller: any = null;
  if (cleanToken.length > 0) {
    reseller = db.data.users.find((u: any) => (u.resellerToken || "").toUpperCase().replace(/[^A-Z0-9]/g, "") === cleanToken);
  }
  if (!reseller && client) {
    reseller = db.data.users.find((u: any) => u.id === client.resellerId);
  }
  if (!reseller) {
    reseller = db.data.users.find((u: any) => u.id === "usr_master") || db.data.users[0];
  }

  // -------------------------------------------------------------
  // AUTO-REGISTRO: Se o dispositivo é novo e tem MAC, registra no banco
  // -------------------------------------------------------------
  if (!client && cleanMac.length > 0) {
    const formattedMac = rawMac.includes(":") 
      ? rawMac 
      : cleanMac.match(/.{1,2}/g)?.join(":") || cleanMac;

    const shortId = cleanMac.length >= 6 ? cleanMac.slice(-6) : cleanMac;

    client = {
      id: "cli_" + Date.now(),
      resellerId: reseller.id,
      clientName: `Novo Aparelho (${shortId})`,
      macAddress: formattedMac,
      deviceToken: `DEV-${cleanMac}`,
      expirationDate: new Date().toISOString(), // Vencido no ato do registro
      status: "pending", // Pendente para aprovação no painel
      notes: "Auto-registrado via TV Box. Aguardando aprovação.",
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (!db.data.clients) db.data.clients = [];
    db.data.clients.unshift(client);
    db.save();

    console.log(`[AUTO-REGISTRO] Novo dispositivo registrado: MAC ${formattedMac} vinculado a ${reseller.name}`);
  }

  let isExpired = false;
  let isNewClient = false;

  // SE ENCONTROU OU AUTO-REGISTROU O CLIENTE: Valida o status dele
  if (client) {
    const now = new Date();
    const expDate = new Date(client.expirationDate);

    // Se estiver pendente, exibe a tela newclient.webp
    if (client.status === "pending") {
      isNewClient = true;
      isExpired = true;
    } 
    // Se estiver suspenso, expirado, bloqueado ou com data vencida -> exibe expiration.webp
    else if (client.status !== "active" || expDate < now) {
      isExpired = true;
      if (client.status === "active" && expDate < now) {
        client.status = "expired";
        db.save();
      }
    }
  } else {
    // Consulta direta sem MAC (apenas revenda)
    const isDirectResellerQuery = cleanToken.length > 0 && (db.data.users || []).some((u: any) => (u.resellerToken || "").toUpperCase().replace(/[^A-Z0-9]/g, "") === cleanToken);

    if (!isDirectResellerQuery) {
      isNewClient = true;
      isExpired = true;
    }
  }

  if (reseller && reseller.status === "blocked") {
    isExpired = true;
  }

  const targetId = normalizeResellerId(reseller?.id);
  let layout = db.data.layouts.find((l: any) => l.resellerId === targetId || l.id === `lay_${targetId}`);

  if (!layout) {
    layout = db.data.layouts[0];
  }

  return { client, reseller, layout, isExpired, isNewClient };
}

function extractDeviceCredentials(req: express.Request) {
  const mac = (req.query.mac as string || req.headers["x-mac-address"] as string || "").trim();
  const token = (req.query.token as string || req.headers["authorization"]?.replace("Bearer ", "") || "").trim();
  return { mac, token };
}

// -------------------------------------------------------------
// DOWNLOAD DO APK
// -------------------------------------------------------------
app.get("/api/v1/apk/download", (req, res) => {
  try {
    const token = (req.query.token as string) || "DEFAULT";
    const baseApkPath = path.join(process.cwd(), "public", "base.apk");

    if (!fs.existsSync(baseApkPath)) {
      return res.status(404).json({
        status: "error",
        message: "O arquivo base.apk não foi encontrado na pasta public do servidor."
      });
    }

    return res.download(baseApkPath, `LunaLauncher_${token}.apk`);
  } catch (error) {
    console.error("Erro ao entregar APK:", error);
    return res.status(500).json({ status: "error", message: "Erro ao processar o download do APK." });
  }
});

// -------------------------------------------------------------
// 1. ENDPOINTS DA API PÚBLICA PARA O LUNA LAUNCHER (ANDROID TV)
// -------------------------------------------------------------
const handleAppsJson = (req: express.Request, res: express.Response) => {
  disableCache(res);
  const { mac, token } = extractDeviceCredentials(req);
  const { layout, isExpired } = resolveLayoutAndClient(mac, token);

  if (isExpired) {
    recordApiLog(mac || token || "ANONYMOUS", req.path, req, "expired", 200);
    return res.json({
      status: "expired",
      isExpired: true,
      message: "Seu login expirou ou está suspenso. Entre em contato com seu revendedor.",
      total: 0,
      apps: []
    });
  }

  recordApiLog(mac || token || "ANONYMOUS", req.path, req, "success", 200);

  const formattedApps = layout.apps.map((app: any, index: number) => ({
    id: app.id || `app_${index + 1}`,
    order: index,
    position: index,
    name: app.name,
    app_name: app.name,
    title: app.name,
    packageName: app.packageName,
    package_name: app.packageName,
    package: app.packageName,
    iconUrl: app.iconUrl || "",
    icon_url: app.iconUrl || "",
    icon: app.iconUrl || "",
    bannerUrl: app.iconUrl || "",
    banner_url: app.iconUrl || "",
    banner: app.iconUrl || "",
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
  disableCache(res);
  const { mac, token } = extractDeviceCredentials(req);
  const { layout, isExpired, isNewClient } = resolveLayoutAndClient(mac, token);

  if (isExpired) {
    recordApiLog(mac || token || "ANONYMOUS", req.path, req, "expired", 200);
    const blockedUrl = isNewClient ? NEW_CLIENT_IMAGE_URL : EXPIRATION_IMAGE_URL;

    return res.json({
      status: "expired",
      isExpired: true,
      backgroundUrl: blockedUrl,
      bg_url: blockedUrl,
      img_url: blockedUrl,
      url: blockedUrl,
      image: blockedUrl,
      overlayOpacity: 0.0,
      opacity: 0.0,
      images: [blockedUrl],
      banners: [
        { id: "banner_expired", imageUrl: blockedUrl, image_url: blockedUrl, url: blockedUrl }
      ]
    });
  }

  recordApiLog(mac || token || "ANONYMOUS", req.path, req, "success", 200);

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
      id: `banner_${index}_${Date.now()}`,
      imageUrl: url,
      image_url: url,
      url: url
    }))
  });
};

app.get("/img.json", handleImgJson);
app.get("/api/v1/launcher/img.json", handleImgJson);

const handleVersionJson = (req: express.Request, res: express.Response) => {
  disableCache(res);
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
  disableCache(res);
  const { mac, token } = extractDeviceCredentials(req);

  if (!mac && !token) {
    recordApiLog("MISSING_IDENTIFIER", "/api/v1/launcher/config", req, "error", 400);
    return res.status(400).json({
      status: "error",
      message: "Token ou MAC não fornecido. Insira o Identificador do Dispositivo."
    });
  }

  const { client, reseller, layout, isExpired, isNewClient } = resolveLayoutAndClient(mac, token);

  if (isExpired) {
    recordApiLog(mac || token, "/api/v1/launcher/config", req, "expired", 200);
    const blockedUrl = isNewClient ? NEW_CLIENT_IMAGE_URL : EXPIRATION_IMAGE_URL;

    return res.json({
      status: "expired",
      isExpired: true,
      message: "Seu login expirou ou está suspenso. Entre em contato com seu revendedor.",
      reseller: reseller ? {
        name: reseller.name,
        token: reseller.resellerToken || ""
      } : undefined,
      client: client ? {
        id: client.id,
        name: client.clientName,
        macAddress: client.macAddress,
        deviceToken: client.deviceToken,
        expirationDate: client.expirationDate,
        isActive: false,
        daysRemaining: 0
      } : undefined,
      background: {
        url: blockedUrl,
        images: [blockedUrl],
        overlayOpacity: 0.0
      },
      banners: [
        { id: "banner_expired", imageUrl: blockedUrl, image_url: blockedUrl, url: blockedUrl }
      ],
      apps: []
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

    recordApiLog(mac || token, "/api/v1/launcher/config", req, "success", 200);
  } else {
    recordApiLog(mac || token, "/api/v1/launcher/config", req, "success", 200);
  }

  const imageList = (layout.backgrounds && layout.backgrounds.length > 0) 
    ? layout.backgrounds 
    : [layout.backgroundUrl];

  const responsePayload = {
    status: "success",
    isExpired: false,
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
    banners: imageList.map((url: string, index: number) => ({
      id: `banner_${index}_${Date.now()}`,
      imageUrl: url,
      image_url: url,
      url: url
    })),
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

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  const user = db.data.users.find((u: any) => u.email.trim().toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(401).json({ message: "Credenciais inválidas. Usuário não encontrado." });
  }

  const userPassword = user.password ? user.password.trim() : "revenda123password";

  const isPasswordValid = (cleanPassword === userPassword) || 
                          (user.role === "master" && (cleanPassword === "2b079e541af29b37f713" || cleanPassword === "admin"));

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Senha incorreta." });
  }

  if (user.status === "blocked") {
    return res.status(403).json({ message: "Sua conta está bloqueada pelo Administrador." });
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
      resellerToken: user.resellerToken || "",
      clientLimit: user.clientLimit || 0,
      status: user.status
    }
  });
});

app.get("/api/admin/stats", (req, res) => {
  try {
    const resellers = (db.data.users || []).filter((u: any) => u.role === "reseller");
    const clients = db.data.clients || [];
    
    const now = new Date();
    const activeClients = clients.filter((c: any) => new Date(c.expirationDate) > now && c.status === "active").length;
    const expiredClients = clients.filter((c: any) => new Date(c.expirationDate) <= now || c.status !== "active").length;

    return res.json({
      success: true,
      totalResellers: resellers.length,
      activeResellers: resellers.filter((r: any) => r.status === "active").length,
      totalClients: clients.length,
      activeClients,
      expiredClients,
      otaVersion: db.data.otaVersion?.versionName || "1.0.3",
      totalApiRequests: (db.data.apiLogs || []).length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      totalResellers: 0,
      activeResellers: 0,
      totalClients: 0,
      activeClients: 0,
      expiredClients: 0,
      otaVersion: "1.0.3",
      totalApiRequests: 0
    });
  }
});

app.get("/api/admin/logs", (req, res) => {
  return res.json(db.data.apiLogs || []);
});

app.get("/api/admin/ota", (req, res) => {
  return res.json(db.data.otaVersion);
});

app.post("/api/admin/ota", (req, res) => {
  const { versionCode, versionName, downloadUrl, forceUpdate, releaseNotes, minSupportedVersion, fileSizeBytes } = req.body;

  db.data.otaVersion = {
    ...db.data.otaVersion,
    versionCode: Number(versionCode || db.data.otaVersion.versionCode),
    versionName: versionName || db.data.otaVersion.versionName,
    downloadUrl: downloadUrl || db.data.otaVersion.downloadUrl,
    forceUpdate: Boolean(forceUpdate),
    releaseNotes: releaseNotes || db.data.otaVersion.releaseNotes,
    minSupportedVersion: Number(minSupportedVersion || db.data.otaVersion.minSupportedVersion || 100),
    fileSizeBytes: Number(fileSizeBytes || db.data.otaVersion.fileSizeBytes || 18450000),
    updatedAt: new Date().toISOString()
  };

  db.save();
  return res.json(db.data.otaVersion);
});

app.get("/api/admin/resellers", (req, res) => {
  const resellers = (db.data.users || []).filter((u: any) => u.role === "reseller");
  
  const result = resellers.map((r: any) => {
    const clients = (db.data.clients || []).filter((c: any) => c.resellerId === r.id);
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
    reseller.email = email.trim().toLowerCase();
    if (password && password.trim().length > 0) reseller.password = password.trim();
    if (resellerToken) reseller.resellerToken = resellerToken;
    if (clientLimit !== undefined) reseller.clientLimit = Number(clientLimit);
    if (status) reseller.status = status;

    db.save();
    return res.json(reseller);
  } else {
    const cleanEmail = email.trim().toLowerCase();
    if (db.data.users.some((u: any) => u.email.trim().toLowerCase() === cleanEmail)) {
      return res.status(400).json({ message: "Já existe um usuário cadastrado com este e-mail." });
    }

    const generatedToken = resellerToken || `REV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const finalPassword = (password && password.trim().length > 0) ? password.trim() : "revenda123password";

    const newReseller = {
      id: "usr_rev_" + Date.now(),
      name,
      email: cleanEmail,
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
      backgroundUrl: "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_1.webp",
      backgrounds: ["https://itdoctorbrasil.site/Launchers/Luna/banners/banner_1.webp"],
      overlayOpacity: 0.35,
      apps: [
        { id: 1, name: "Velo Play", packageName: "com.global.veloplaytv", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/veloplay.png" },
        { id: 2, name: "YouCine", packageName: "com.world.youcinetv", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/youcine.png" },
        { id: 3, name: "YouTube TV", packageName: "com.google.android.youtube.tv", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/youtube.png" },
        { id: 4, name: "TuneIn", packageName: "tunein.player", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/tuneinradio.png" },
        { id: 5, name: "Settings", packageName: "com.android.tv.settings", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/settings.png" }
      ],
      updatedAt: new Date().toISOString()
    });

    db.save();
    return res.status(201).json(newReseller);
  }
});

app.delete("/api/admin/resellers/:id", (req, res) => {
  const { id } = req.params;
  db.data.users = (db.data.users || []).filter((u: any) => u.id !== id);
  db.save();
  return res.json({ status: "success" });
});

app.get("/api/reseller/clients", (req, res) => {
  const { resellerId } = req.query;
  let clients = db.data.clients || [];

  if (resellerId) {
    clients = clients.filter((c: any) => c.resellerId === resellerId);
  }

  return res.json(clients);
});

app.post("/api/reseller/clients", (req, res) => {
  const { id, resellerId, clientName, macAddress, deviceToken, days, expirationDate, status, notes } = req.body;

  const cleanMac = (macAddress || "").trim().toUpperCase();
  let cleanToken = (deviceToken || "").trim().toUpperCase();

  if (!clientName || (!cleanMac && !cleanToken)) {
    return res.status(400).json({ message: "Nome do Cliente e pelo menos o MAC Address ou Token são obrigatórios." });
  }

  if (!db.data.clients) db.data.clients = [];

  if (!cleanToken) {
    cleanToken = cleanMac 
      ? `DEV-${cleanMac.replace(/[^A-Z0-9]/g, "")}` 
      : `DEV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  if (id) {
    const client = db.data.clients.find((c: any) => c.id === id);
    if (!client) return res.status(404).json({ message: "Cliente não encontrado." });

    client.clientName = clientName;
    if (cleanMac) client.macAddress = cleanMac;
    client.deviceToken = cleanToken;
    if (status) client.status = status;
    if (notes !== undefined) client.notes = notes;

    // Atualização manual da data de expiração ou por dias adicionados
    if (expirationDate) {
      client.expirationDate = new Date(expirationDate).toISOString();
    } else if (days) {
      const expDays = Number(days);
      client.expirationDate = new Date(Date.now() + expDays * 86400000).toISOString();
    }

    db.save();
    return res.json(client);
  } else {
    const expDays = Number(days || 30);
    const initialExpDate = expirationDate 
      ? new Date(expirationDate).toISOString() 
      : new Date(Date.now() + expDays * 86400000).toISOString();

    const newClient = {
      id: "cli_" + Date.now(),
      resellerId: resellerId || "usr_rev_1",
      clientName,
      macAddress: cleanMac || "00:00:00:00:00:00",
      deviceToken: cleanToken,
      expirationDate: initialExpDate,
      status: status || "active",
      notes: notes || "",
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    db.data.clients.push(newClient);
    db.save();
    return res.status(201).json(newClient);
  }
});

app.post("/api/reseller/clients/renew", (req, res) => {
  const { id, days } = req.body;
  const client = (db.data.clients || []).find((c: any) => c.id === id);

  if (!client) return res.status(404).json({ message: "Cliente não encontrado." });

  const addDays = Number(days || 30);
  const currentExp = new Date(client.expirationDate);
  const baseDate = currentExp > new Date() ? currentExp : new Date();

  client.expirationDate = new Date(baseDate.getTime() + addDays * 86400000).toISOString();
  client.status = "active";

  db.save();
  return res.json(client);
});

app.delete("/api/reseller/clients/:id", (req, res) => {
  const { id } = req.params;
  db.data.clients = (db.data.clients || []).filter((c: any) => c.id !== id);
  db.save();
  return res.json({ status: "success" });
});

// -------------------------------------------------------------
// ROTAS DE LAYOUT (Sincronização Master e Revendedores)
// -------------------------------------------------------------
app.get("/api/reseller/layout/:resellerId", (req, res) => {
  const targetId = normalizeResellerId(req.params.resellerId);
  let layout = db.data.layouts.find((l: any) => l.resellerId === targetId || l.id === `lay_${targetId}`);

  if (!layout) {
    layout = {
      id: "lay_" + targetId,
      resellerId: targetId,
      backgroundUrl: db.data.layouts[0]?.backgroundUrl || "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_1.webp",
      backgrounds: db.data.layouts[0]?.backgrounds || ["https://itdoctorbrasil.site/Launchers/Luna/banners/banner_1.webp"],
      overlayOpacity: 0.35,
      apps: db.data.layouts[0]?.apps || [],
      updatedAt: new Date().toISOString()
    };
    db.data.layouts.push(layout);
    db.save();
  }

  const validImages = (layout.backgrounds && layout.backgrounds.length > 0)
    ? layout.backgrounds
    : [layout.backgroundUrl];

  return res.json({
    ...layout,
    backgroundUrl: layout.backgroundUrl || validImages[0],
    backgrounds: validImages,
    backgroundUrls: validImages
  });
});

app.post("/api/reseller/layout", (req, res) => {
  const { resellerId, backgroundUrl, backgrounds, backgroundUrls, overlayOpacity, apps } = req.body;

  const targetId = normalizeResellerId(resellerId);

  const incomingImages = backgrounds || backgroundUrls || (backgroundUrl ? [backgroundUrl] : []);
  const validImageList = Array.isArray(incomingImages) && incomingImages.length > 0
    ? incomingImages
    : ["https://itdoctorbrasil.site/Launchers/Luna/banners/banner_1.webp"];

  const activeBg = backgroundUrl || validImageList[0];

  let layoutIndex = db.data.layouts.findIndex((l: any) => l.resellerId === targetId || l.id === `lay_${targetId}`);

  const updatedLayout = {
    id: "lay_" + targetId,
    resellerId: targetId,
    backgroundUrl: activeBg,
    backgrounds: validImageList,
    backgroundUrls: validImageList,
    overlayOpacity: Number(overlayOpacity ?? 0.35),
    apps: Array.isArray(apps) ? apps : (db.data.layouts[0]?.apps || []),
    updatedAt: new Date().toISOString()
  };

  if (layoutIndex !== -1) {
    db.data.layouts[layoutIndex] = updatedLayout;
  } else {
    db.data.layouts.push(updatedLayout);
  }

  db.save();
  return res.json(updatedLayout);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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

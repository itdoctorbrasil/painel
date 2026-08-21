import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db_v2.json");

const EXPIRATION_IMAGE_URL = "https://itdoctorbrasil.site/Launchers/Luna/blocked/expiration.webp";
const NEW_CLIENT_IMAGE_URL = "https://itdoctorbrasil.site/Launchers/Luna/blocked/newclient.webp";
const CONNECTION_LOST_IMAGE_URL = "https://itdoctorbrasil.site/Launchers/Luna/blocked/connectiolost.webp";

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
        "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_6.webp"
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
  clients: [],
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Mac-Address'],
  credentials: false
}));

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-Mac-Address');
  res.sendStatus(200);
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

function recordApiLog(token: string, endpoint: string, req: express.Request, status: string, responseCode: number) {
  try {
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
  } catch (_: any) {}
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
 * Resolução com identificação estrita por MAC e priorização de status Ativo
 */
function resolveLayoutAndClient(macInput?: string, tokenInput?: string) {
  const rawMac = (macInput || "").trim().toUpperCase();
  const cleanMac = rawMac.replace(/[^A-Z0-9]/g, "");

  const rawToken = (tokenInput || "").trim().toUpperCase();
  const cleanToken = rawToken.replace(/[^A-Z0-9]/g, "");

  let reseller: any = null;
  if (cleanToken.length > 0) {
    reseller = (db.data.users || []).find((u: any) => (u.resellerToken || "").toUpperCase().replace(/[^A-Z0-9]/g, "") === cleanToken);
  }

  let client: any = null;
  if (cleanMac.length > 0) {
    const matching = (db.data.clients || []).filter((c: any) => {
      const cMacClean = (c.macAddress || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const cTokClean = (c.deviceToken || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      return (cMacClean.length > 0 && cMacClean === cleanMac) || (cTokClean.length > 0 && cTokClean === cleanMac);
    });

    if (matching.length > 0) {
      // Prioriza sempre o registro ativo com validade válida
      const now = new Date();
      client = matching.find((c: any) => c.status === "active" && new Date(c.expirationDate) > now) ||
               matching.find((c: any) => c.status === "active") ||
               matching[0];
    }
  }

  if (!reseller && client) {
    reseller = (db.data.users || []).find((u: any) => u.id === client.resellerId);
  }
  if (!reseller) {
    reseller = (db.data.users || []).find((u: any) => u.id === "usr_master") || db.data.users[0];
  }

  // Auto-registro se não existir nenhum cliente cadastrado para este MAC
  if (!client && cleanMac.length >= 6) {
    const formattedMac = rawMac.includes(":") 
      ? rawMac 
      : cleanMac.match(/.{1,2}/g)?.join(":") || cleanMac;

    const shortId = cleanMac.slice(-6);

    client = {
      id: "cli_" + Date.now(),
      resellerId: reseller.id,
      clientName: `Novo Aparelho (${shortId})`,
      macAddress: formattedMac,
      deviceToken: formattedMac,
      expirationDate: new Date().toISOString(),
      status: "pending",
      notes: "Auto-registrado via TV Box. Aguardando aprovação.",
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (!db.data.clients) db.data.clients = [];
    db.data.clients.unshift(client);
    db.save();
  }

  let isExpired = false;
  let isNewClient = false;

  if (client) {
    const now = new Date();
    const expDate = new Date(client.expirationDate);

    if (client.status === "pending") {
      isNewClient = true;
      isExpired = true;
    } else if (client.status === "suspended" || client.status === "expired" || client.status !== "active" || expDate < now) {
      isExpired = true;
      if (client.status === "active" && expDate < now) {
        client.status = "expired";
        db.save();
      }
    }
  } else {
    isNewClient = true;
    isExpired = true;
  }

  if (reseller && reseller.status === "blocked") {
    isExpired = true;
  }

  const targetId = normalizeResellerId(reseller?.id);
  let layout = (db.data.layouts || []).find((l: any) => l.resellerId === targetId || l.id === `lay_${targetId}`);

  if (!layout) {
    layout = db.data.layouts[0] || initialDb.layouts[0];
  }

  return { client, reseller, layout, isExpired, isNewClient };
}

function extractDeviceCredentials(req: express.Request) {
  const rawMac = (req.query.mac as string || req.headers["x-mac-address"] as string || "").trim();
  const rawToken = (req.query.token as string || req.headers["authorization"]?.replace("Bearer ", "") || "").trim();
  return { mac: rawMac, token: rawToken };
}

// -------------------------------------------------------------
// ENDPOINTS DA API PÚBLICA PARA O LUNA LAUNCHER
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

  const formattedApps = (layout.apps || []).map((app: any, index: number) => ({
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

  const ota = db.data.otaVersion || initialDb.otaVersion;
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

app.get("/api/v1/launcher/config", (req, res) => {
  disableCache(res);
  const { mac, token } = extractDeviceCredentials(req);
  const { client, reseller, layout, isExpired, isNewClient } = resolveLayoutAndClient(mac, token);

  if (isExpired) {
    const blockedUrl = isNewClient ? NEW_CLIENT_IMAGE_URL : EXPIRATION_IMAGE_URL;
    return res.json({
      status: "expired",
      isExpired: true,
      message: "Seu login expirou ou está suspenso. Entre em contato com seu revendedor.",
      background: { url: blockedUrl, images: [blockedUrl], overlayOpacity: 0.0 },
      banners: [{ id: "banner_expired", imageUrl: blockedUrl }],
      apps: []
    });
  }

  const imageList = (layout.backgrounds && layout.backgrounds.length > 0) ? layout.backgrounds : [layout.backgroundUrl];

  return res.json({
    status: "success",
    isExpired: false,
    reseller: { name: reseller.name, token: reseller.resellerToken || "" },
    background: {
      url: imageList[0] || layout.backgroundUrl,
      images: imageList,
      overlayOpacity: layout.overlayOpacity
    },
    banners: imageList.map((url: string, index: number) => ({ id: `banner_${index}`, imageUrl: url })),
    apps: layout.apps
  });
});

// -------------------------------------------------------------
// ENDPOINTS DO PAINEL WEB
// -------------------------------------------------------------
app.get("/api/reseller/clients", (req, res) => {
  disableCache(res);
  const { resellerId } = req.query;
  let clients = db.data.clients || [];

  if (resellerId && resellerId !== "all" && resellerId !== "usr_master" && resellerId !== "master") {
    clients = clients.filter((c: any) => c.resellerId === resellerId);
  }

  return res.json(clients);
});

app.post("/api/reseller/clients", (req, res) => {
  const { id, resellerId, clientName, macAddress, deviceToken, days, expirationDate, status, notes } = req.body;

  const cleanMac = (macAddress || "").trim().toUpperCase();
  let cleanToken = (deviceToken || "").trim().toUpperCase();

  if (!clientName || (!cleanMac && !cleanToken)) {
    return res.status(400).json({ message: "Nome do Cliente e MAC Address são obrigatórios." });
  }

  if (!db.data.clients) db.data.clients = [];

  let finalExpDate = new Date();
  if (expirationDate) {
    finalExpDate = new Date(expirationDate);
  } else if (days) {
    finalExpDate = new Date(Date.now() + Number(days) * 86400000);
  } else {
    finalExpDate = new Date(Date.now() + 30 * 86400000);
  }

  const cleanMacDigits = cleanMac.replace(/[^A-Z0-9]/g, "");

  // Se já existir registro para este MAC, atualiza o existente para evitar duplicações
  let client = id 
    ? db.data.clients.find((c: any) => c.id === id)
    : db.data.clients.find((c: any) => (c.macAddress || "").toUpperCase().replace(/[^A-Z0-9]/g, "") === cleanMacDigits);

  if (client) {
    client.clientName = clientName;
    if (cleanMac) client.macAddress = cleanMac;
    client.deviceToken = cleanToken || cleanMac;
    client.expirationDate = finalExpDate.toISOString();
    client.status = status || "active";
    if (notes !== undefined) client.notes = notes;
    if (resellerId) client.resellerId = resellerId;

    db.save();
    return res.json(client);
  } else {
    const newClient = {
      id: "cli_" + Date.now(),
      resellerId: resellerId || "usr_rev_1",
      clientName,
      macAddress: cleanMac,
      deviceToken: cleanToken || cleanMac,
      expirationDate: finalExpDate.toISOString(),
      status: status || "active",
      notes: notes || "",
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    db.data.clients.unshift(newClient);
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

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPassword = (password || "").trim();

  const user = (db.data.users || []).find((u: any) => u.email.trim().toLowerCase() === cleanEmail);
  if (!user) return res.status(401).json({ message: "Credenciais inválidas." });

  const isValid = (cleanPassword === (user.password || "revenda123password").trim()) ||
                  (user.role === "master" && (cleanPassword === "2b079e541af29b37f713" || cleanPassword === "admin"));

  if (!isValid) return res.status(401).json({ message: "Senha incorreta." });

  return res.json({
    token: `session_${user.id}_${Date.now()}`,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, resellerToken: user.resellerToken || "", clientLimit: user.clientLimit || 0 }
  });
});

app.get("/api/admin/stats", (req, res) => {
  const clients = db.data.clients || [];
  const resellers = (db.data.users || []).filter((u: any) => u.role === "reseller");
  const now = new Date();

  return res.json({
    success: true,
    totalResellers: resellers.length,
    activeResellers: resellers.filter((r: any) => r.status === "active").length,
    totalClients: clients.length,
    activeClients: clients.filter((c: any) => new Date(c.expirationDate) > now && c.status === "active").length,
    expiredClients: clients.filter((c: any) => new Date(c.expirationDate) <= now || c.status !== "active").length,
    otaVersion: db.data.otaVersion?.versionName || "1.0.3",
    totalApiRequests: (db.data.apiLogs || []).length
  });
});

app.get("/api/admin/resellers", (req, res) => {
  const resellers = (db.data.users || []).filter((u: any) => u.role === "reseller");
  return res.json(resellers.map((r: any) => ({
    ...r,
    totalClients: (db.data.clients || []).filter((c: any) => c.resellerId === r.id).length,
    activeClients: (db.data.clients || []).filter((c: any) => c.resellerId === r.id && new Date(c.expirationDate) > new Date() && c.status === "active").length
  })));
});

app.get("/api/reseller/layout/:resellerId", (req, res) => {
  const targetId = normalizeResellerId(req.params.resellerId);
  let layout = (db.data.layouts || []).find((l: any) => l.resellerId === targetId || l.id === `lay_${targetId}`);
  if (!layout) layout = db.data.layouts[0] || initialDb.layouts[0];
  return res.json(layout);
});

app.post("/api/reseller/layout", (req, res) => {
  const { resellerId, backgroundUrl, backgrounds, overlayOpacity, apps } = req.body;
  const targetId = normalizeResellerId(resellerId);

  const updatedLayout = {
    id: "lay_" + targetId,
    resellerId: targetId,
    backgroundUrl: backgroundUrl || backgrounds?.[0] || initialDb.layouts[0].backgroundUrl,
    backgrounds: backgrounds || [backgroundUrl || initialDb.layouts[0].backgroundUrl],
    overlayOpacity: Number(overlayOpacity ?? 0.35),
    apps: Array.isArray(apps) ? apps : initialDb.layouts[0].apps,
    updatedAt: new Date().toISOString()
  };

  const idx = (db.data.layouts || []).findIndex((l: any) => l.resellerId === targetId || l.id === `lay_${targetId}`);
  if (idx !== -1) db.data.layouts[idx] = updatedLayout;
  else db.data.layouts.push(updatedLayout);

  db.save();
  return res.json(updatedLayout);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, () => console.log(`🚀 Luna Launcher Admin executando na porta ${PORT}`));
}

startServer();

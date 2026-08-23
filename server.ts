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

const defaultBackgrounds = [
  "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_1.webp",
  "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_2.webp",
  "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_3.webp",
  "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_4.webp",
  "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_5.webp",
  "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_6.webp"
];

const defaultApps = [
  { id: 1, name: "Velo Play", packageName: "com.global.veloplaytv", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/veloplay.png", deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/veloplay.apk" },
  { id: 2, name: "YouCine", packageName: "com.world.youcinetv", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/youcine.png", deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/youcine.apk" },
  { id: 3, name: "YouTube TV", packageName: "com.google.android.youtube.tv", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/youtube.png", deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/youtube.apk" },
  { id: 4, name: "TuneIn", packageName: "tunein.player", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/tuneinradio.png", deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/tunein.apk" },
  { id: 5, name: "Best Apps", packageName: "com.itdoctorbrasil.store", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/store.png", deepLink: "https://itdoctorbrasil.site/store/bestapps.apk" }
];

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
        ],
  layouts: [
    {
      id: "lay_usr_master",
      resellerId: "usr_master",
      backgroundUrl: defaultBackgrounds[0],
      backgrounds: defaultBackgrounds,
      overlayOpacity: 0.35,
      apps: defaultApps,
      updatedAt: new Date().toISOString()
    },
    {
      id: "lay_usr_rev_1",
      resellerId: "usr_rev_1",
      backgroundUrl: defaultBackgrounds[0],
      backgrounds: defaultBackgrounds,
      overlayOpacity: 0.35,
      apps: defaultApps,
      updatedAt: new Date().toISOString()
    }
  ],
  clients: [],
  otaVersion: {
    id: "ota_v210",
    versionCode: 5,
    versionName: "1.0.5",
    downloadUrl: "https://itdoctorbrasil.site/Launchers/Luna/apps/update.apk",
    forceUpdate: false,
    releaseNotes: "• Correções, melhorias e novos recursos",
    minSupportedVersion: 100,
    fileSizeBytes: 18450000,
    updatedAt: new Date().toISOString()
  },
  apiLogs: []
};

class DB {
  data: any;

  constructor() {
    this.reload();
  }

  reload() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        if (!Array.isArray(this.data.clients)) this.data.clients = [];
        if (!Array.isArray(this.data.users)) this.data.users = initialDb.users;
        if (!Array.isArray(this.data.layouts)) this.data.layouts = initialDb.layouts;
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

function cleanHex(str: any): string {
  if (!str) return "";
  return str.toString().trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
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
 * Resolução Multi-Tenant isolada por Token e MAC
 */
function resolveLayoutAndClient(macInput?: string, tokenInput?: string) {
  db.reload();

  const cleanMac = cleanHex(decodeURIComponent(macInput || ""));
  const cleanToken = cleanHex(decodeURIComponent(tokenInput || ""));

  // 1. Identifica a Revenda dona da requisição através do Token
  let reseller: any = null;
  if (cleanToken.length > 0) {
    reseller = (db.data.users || []).find((u: any) => cleanHex(u.resellerToken) === cleanToken);
  }

  // 2. Busca o Cliente por MAC
  let client: any = null;
  if (cleanMac.length >= 4) {
    const matches = (db.data.clients || []).filter((c: any) => {
      const cMac = cleanHex(c.macAddress);
      const cTok = cleanHex(c.deviceToken);
      return (cMac.length > 0 && cMac === cleanMac) || (cTok.length > 0 && cTok === cleanMac);
    });

    if (matches.length > 0) {
      const now = new Date();
      client = matches.find((c: any) => new Date(c.expirationDate) > now && c.status !== "suspended") ||
               matches.find((c: any) => c.status === "active") ||
               matches[0];
    }
  }

  // Se o cliente existe mas a requisição não enviou token, herda o revendedor do cliente
  if (!reseller && client) {
    reseller = (db.data.users || []).find((u: any) => u.id === client.resellerId);
  }
  if (!reseller) {
    reseller = (db.data.users || []).find((u: any) => u.id === "usr_rev_1") || db.data.users[0];
  }

  // 3. Auto-registro vinculado estritamente à revenda identificada
  if (!client && cleanMac.length >= 4) {
    const formattedMac = cleanMac.match(/.{1,2}/g)?.join(":") || cleanMac;
    const shortId = cleanMac.slice(-6);

    client = {
      id: "cli_" + Date.now(),
      resellerId: reseller ? reseller.id : "usr_rev_1",
      clientName: `Novo dispositivo (${shortId})`,
      macAddress: formattedMac,
      deviceToken: formattedMac,
      expirationDate: new Date().toISOString(),
      status: "pending",
      notes: "Nova instalação detectada, aguardando liberação.",
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

    if (expDate > now && client.status !== "suspended") {
      if (client.status === "pending") {
        client.status = "active";
        db.save();
      }
      isExpired = false;
      isNewClient = false;
    } else {
      isExpired = true;
      isNewClient = (client.status === "pending");
      if (client.status === "active" && expDate <= now) {
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

  // Entrega o layout customizado e exclusivo do revendedor vinculado
  const targetId = reseller ? reseller.id : "usr_master";
  let layout = (db.data.layouts || []).find((l: any) => l.resellerId === targetId || l.id === `lay_${targetId}`);
  if (!layout) layout = (db.data.layouts || [])[0] || initialDb.layouts[0];

  return { client, reseller, layout, isExpired, isNewClient };
}

function extractDeviceCredentials(req: express.Request) {
  const rawMac = (req.query.mac as string || req.headers["x-mac-address"] as string || "").trim();
  const rawToken = (req.query.token as string || req.headers["authorization"]?.replace("Bearer ", "") || "").trim();
  return { mac: rawMac, token: rawToken };
}

// -------------------------------------------------------------
// ENDPOINTS PÚBLICOS DO LAUNCHER
// -------------------------------------------------------------
const handleAppsJson = (req: express.Request, res: express.Response) => {
  disableCache(res);
  const { mac, token } = extractDeviceCredentials(req);
  const { layout, isExpired } = resolveLayoutAndClient(mac, token);

  if (isExpired) {
    return res.json({
      status: "expired",
      isExpired: true,
      message: "Acesso bloqueado ou expirado. Entre em contato com seu revendedor.",
      total: 0,
      apps: []
    });
  }

  const formattedApps = (layout.apps || defaultApps).map((app: any, index: number) => ({
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

  const imageList = (layout.backgrounds && layout.backgrounds.length > 0) 
    ? layout.backgrounds 
    : defaultBackgrounds;

  const primaryUrl = imageList[0];

  return res.json({
    status: "success",
    backgroundUrl: primaryUrl,
    bg_url: primaryUrl,
    img_url: primaryUrl,
    url: primaryUrl,
    image: primaryUrl,
    overlayOpacity: layout.overlayOpacity ?? 0.35,
    opacity: layout.overlayOpacity ?? 0.35,
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

// -------------------------------------------------------------
// ENDPOINTS ADMIN (GESTÃO DE REVENDEDORES)
// -------------------------------------------------------------
app.get("/api/admin/resellers", (req, res) => {
  disableCache(res);
  db.reload();
  const resellers = (db.data.users || []).filter((u: any) => u.role === "reseller");
  const now = new Date();

  return res.json(resellers.map((r: any) => {
    const myClients = (db.data.clients || []).filter((c: any) => c.resellerId === r.id);
    const activeClients = myClients.filter((c: any) => new Date(c.expirationDate) > now && c.status === "active").length;
    return {
      ...r,
      totalClients: myClients.length,
      activeClients
    };
  }));
});

app.post("/api/admin/resellers", (req, res) => {
  db.reload();
  const { id, name, email, password, resellerToken, clientLimit, status } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Nome e Email são obrigatórios." });
  }

  const cleanEmail = email.trim().toLowerCase();

  if (id) {
    const user = (db.data.users || []).find((u: any) => u.id === id);
    if (!user) return res.status(404).json({ message: "Revendedor não encontrado." });

    user.name = name;
    user.email = cleanEmail;
    if (password && password.trim().length > 0) user.password = password.trim();
    if (resellerToken) user.resellerToken = resellerToken.trim().toUpperCase();
    if (clientLimit !== undefined) user.clientLimit = Number(clientLimit);
    if (status) user.status = status;

    db.save();
    return res.json(user);
  } else {
    // Validação de email duplicado
    if ((db.data.users || []).some((u: any) => u.email.trim().toLowerCase() === cleanEmail)) {
      return res.status(400).json({ message: "Já existe um usuário cadastrado com este e-mail." });
    }

    const newResellerId = "usr_rev_" + Date.now();
    const token = resellerToken ? resellerToken.trim().toUpperCase() : `REV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newReseller = {
      id: newResellerId,
      name,
      email: cleanEmail,
      password: password ? password.trim() : "revenda123password",
      role: "reseller",
      resellerToken: token,
      clientLimit: Number(clientLimit || 50),
      status: status || "active",
      createdAt: new Date().toISOString()
    };

    if (!db.data.users) db.data.users = [];
    db.data.users.push(newReseller);

    // Cria automaticamente um layout exclusivo para este novo revendedor
    if (!db.data.layouts) db.data.layouts = [];
    db.data.layouts.push({
      id: "lay_" + newResellerId,
      resellerId: newResellerId,
      backgroundUrl: defaultBackgrounds[0],
      backgrounds: defaultBackgrounds,
      overlayOpacity: 0.35,
      apps: defaultApps,
      updatedAt: new Date().toISOString()
    });

    db.save();
    console.log(`[ADMIN] Novo Revendedor criado com sucesso: ${newReseller.name} (Token: ${newReseller.resellerToken})`);
    return res.status(201).json(newReseller);
  }
});

app.delete("/api/admin/resellers/:id", (req, res) => {
  db.reload();
  const { id } = req.params;
  db.data.users = (db.data.users || []).filter((u: any) => u.id !== id);
  db.data.layouts = (db.data.layouts || []).filter((l: any) => l.resellerId !== id && l.id !== `lay_${id}`);
  db.save();
  return res.json({ status: "success" });
});

// -------------------------------------------------------------
// GESTÃO DE CLIENTES (FILTRAGEM POR REVENDA)
// -------------------------------------------------------------
app.get("/api/reseller/clients", (req, res) => {
  disableCache(res);
  db.reload();
  const { resellerId } = req.query;
  let clients = db.data.clients || [];

  if (resellerId && resellerId !== "all" && resellerId !== "usr_master" && resellerId !== "master") {
    clients = clients.filter((c: any) => c.resellerId === resellerId);
  }

  return res.json(clients);
});

app.post("/api/reseller/clients", (req, res) => {
  db.reload();
  const { id, resellerId, clientName, macAddress, deviceToken, days, expirationDate, status, notes } = req.body;

  const cleanMac = cleanHex(macAddress || deviceToken);
  const formattedMac = cleanMac.match(/.{1,2}/g)?.join(":") || cleanMac;

  if (!clientName || cleanMac.length < 4) {
    return res.status(400).json({ message: "Nome do Cliente e MAC Address válido são obrigatórios." });
  }

  let finalExpDate = new Date();
  if (expirationDate) {
    finalExpDate = new Date(expirationDate);
  } else if (days) {
    finalExpDate = new Date(Date.now() + Number(days) * 86400000);
  } else {
    finalExpDate = new Date(Date.now() + 30 * 86400000);
  }

  let client = id 
    ? db.data.clients.find((c: any) => c.id === id)
    : db.data.clients.find((c: any) => cleanHex(c.macAddress) === cleanMac || cleanHex(c.deviceToken) === cleanMac);

  if (client) {
    client.clientName = clientName;
    client.macAddress = formattedMac;
    client.deviceToken = formattedMac;
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
      macAddress: formattedMac,
      deviceToken: formattedMac,
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
  db.reload();
  const { id, macAddress, days } = req.body;
  const cleanMac = cleanHex(macAddress || id);

  const client = (db.data.clients || []).find((c: any) => 
    c.id === id || cleanHex(c.macAddress) === cleanMac || cleanHex(c.deviceToken) === cleanMac
  );

  if (!client) {
    return res.status(404).json({ message: "Cliente não encontrado para renovação." });
  }

  const addDays = Number(days === 9999 ? 3650 : (days || 30));
  const currentExp = new Date(client.expirationDate);
  const now = new Date();
  const baseDate = (!isNaN(currentExp.getTime()) && currentExp > now) ? currentExp : now;

  client.expirationDate = new Date(baseDate.getTime() + addDays * 86400000).toISOString();
  client.status = "active";

  db.save();
  return res.json(client);
});

app.delete("/api/reseller/clients/:id", (req, res) => {
  db.reload();
  const { id } = req.params;
  db.data.clients = (db.data.clients || []).filter((c: any) => c.id !== id);
  db.save();
  return res.json({ status: "success" });
});

// -------------------------------------------------------------
// GESTÃO DE LAYOUTS INDIVIDUAIS POR REVENDA
// -------------------------------------------------------------
app.get("/api/reseller/layout/:resellerId", (req, res) => {
  db.reload();
  const targetId = req.params.resellerId;
  let layout = (db.data.layouts || []).find((l: any) => l.resellerId === targetId || l.id === `lay_${targetId}`);

  if (!layout) {
    layout = {
      id: "lay_" + targetId,
      resellerId: targetId,
      backgroundUrl: defaultBackgrounds[0],
      backgrounds: defaultBackgrounds,
      overlayOpacity: 0.35,
      apps: defaultApps,
      updatedAt: new Date().toISOString()
    };
    db.data.layouts.push(layout);
    db.save();
  }
  return res.json(layout);
});

app.post("/api/reseller/layout", (req, res) => {
  db.reload();
  const { resellerId, backgroundUrl, backgrounds, overlayOpacity, apps } = req.body;
  const targetId = resellerId || "usr_master";

  const updatedLayout = {
    id: "lay_" + targetId,
    resellerId: targetId,
    backgroundUrl: backgroundUrl || backgrounds?.[0] || defaultBackgrounds[0],
    backgrounds: backgrounds || [backgroundUrl || defaultBackgrounds[0]],
    overlayOpacity: Number(overlayOpacity ?? 0.35),
    apps: Array.isArray(apps) ? apps : defaultApps,
    updatedAt: new Date().toISOString()
  };

  const idx = (db.data.layouts || []).findIndex((l: any) => l.resellerId === targetId || l.id === `lay_${targetId}`);
  if (idx !== -1) db.data.layouts[idx] = updatedLayout;
  else db.data.layouts.push(updatedLayout);

  db.save();
  return res.json(updatedLayout);
});

// -------------------------------------------------------------
// AUTENTICAÇÃO E ESTATÍSTICAS
// -------------------------------------------------------------
app.post("/api/auth/login", (req, res) => {
  db.reload();
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
  db.reload();
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

app.get("/api/admin/ota", (req, res) => {
  db.reload();
  return res.json(db.data.otaVersion || initialDb.otaVersion);
});

app.post("/api/admin/ota", (req, res) => {
  db.reload();
  const { versionCode, versionName, downloadUrl, forceUpdate, releaseNotes } = req.body;
  db.data.otaVersion = {
    ...db.data.otaVersion,
    versionCode: Number(versionCode || db.data.otaVersion.versionCode),
    versionName: versionName || db.data.otaVersion.versionName,
    downloadUrl: downloadUrl || db.data.otaVersion.downloadUrl,
    forceUpdate: Boolean(forceUpdate),
    releaseNotes: releaseNotes || db.data.otaVersion.releaseNotes,
    updatedAt: new Date().toISOString()
  };
  db.save();
  return res.json(db.data.otaVersion);
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

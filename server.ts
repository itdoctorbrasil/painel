import express from "express";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "";

// Configuração do Transporter de E-mail para os alertas de vencimento anual
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "admin@itdoctorbrasil.site",
    pass: process.env.SMTP_PASS || "SUA_SENHA_AQUI"
  }
});

const EXPIRATION_IMAGE_URL = "https://itdoctorbrasil.site/Launchers/Luna/blocked/expiration.webp";
const NEW_CLIENT_IMAGE_URL = "https://itdoctorbrasil.site/Launchers/Luna/blocked/newclient.webp";
const CONNECTION_LOST_IMAGE_URL = "https://itdoctorbrasil.site/Launchers/Luna/blocked/connectiolost.webp";

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
  { id: 2, name: "Settings", packageName: "com.itdoctorbrasil.settings", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/settings.png", deepLink: "https://itdoctorbrasil.site/Launchers/Luna/Clientes/FgTech/Apps/Settings.apk" },
  { id: 3, name: "Youtube", packageName: "com.android.youtube.tv", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/youtube.png", deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/youtube.apk" },
  { id: 4, name: "TuneIn", packageName: "tunein.player", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/tuneinradio.png", deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/tunein.apk" },
  { id: 5, name: "MemoryClean", packageName: "com.oranth.memoryclean", iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/Clientes/FgTech/Apps/icones/memoryclean.png", deepLink: "https://itdoctorbrasil.site/Launchers/Luna/Clientes/FgTech/Apps/MemoryClean.apk" }
];

// Definição dos Schemas do Mongoose
const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: String,
  resellerToken: String,
  clientLimit: Number,
  status: String,
  whatsapp: String,
  showWhatsapp: { type: Boolean, default: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  expirationDate: { type: String, default: () => new Date(Date.now() + 365 * 86400000).toISOString() },
  lastLogin: String
});

const layoutSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  resellerId: String,
  backgroundUrl: String,
  backgrounds: [String],
  overlayOpacity: Number,
  logoUrl: { type: String, default: "" },
  bootVideoUrl: { type: String, default: "" },
  apps: Array,
  updatedAt: String
});

const clientSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  resellerId: String,
  clientName: String,
  macAddress: String,
  deviceToken: String,
  expirationDate: String,
  status: String,
  notes: String,
  lastSeen: String,
  createdAt: String
});

const otaSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  versionCode: Number,
  versionName: String,
  downloadUrl: String,
  forceUpdate: Boolean,
  releaseNotes: String,
  minSupportedVersion: Number,
  fileSizeBytes: Number,
  updatedAt: String
});

const User = mongoose.model("User", userSchema);
const Layout = mongoose.model("Layout", layoutSchema);
const Client = mongoose.model("Client", clientSchema);
const Ota = mongoose.model("Ota", otaSchema);

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

function formatDateBR(isoString: string): string {
  if (!isoString) return "-";
  try {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    return isoString.split("T")[0] || "-";
  }
}

async function checkAndSendExpirationAlerts() {
  try {
    const resellers = await User.find({ role: "reseller" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const rev of resellers) {
      if (!rev.expirationDate) {
        rev.createdAt = rev.createdAt || new Date().toISOString();
        const base = new Date(rev.createdAt);
        base.setFullYear(base.getFullYear() + 1);
        rev.expirationDate = base.toISOString();
        await rev.save();
        continue;
      }

      const expDate = new Date(rev.expirationDate);
      expDate.setHours(0, 0, 0, 0);

      if (expDate.getTime() === today.getTime()) {
        const emailBody = `Painel Luna Launcher - Conta próxima ao vencimento
Revendedor: ${rev.name}
Data de criação: ${formatDateBR(rev.createdAt)}
Data de vencimento: ${formatDateBR(rev.expirationDate)}
Contato: ${rev.whatsapp || "Não informado"}
E-mail: ${rev.email}`;

        await transporter.sendMail({
          from: `"Painel Luna Launcher" <${process.env.SMTP_USER || "admin@itdoctorbrasil.site"}>`,
          to: process.env.ADMIN_ALERT_EMAIL || "admin@itdoctorbrasil.site",
          subject: `⚠️ Painel Luna Launcher - Conta próxima ao vencimento (${rev.name})`,
          text: emailBody
        });
      }
    }
  } catch (err) {
    console.error("❌ Erro ao verificar vencimentos de revendedores:", err);
  }
}

setInterval(checkAndSendExpirationAlerts, 24 * 60 * 60 * 1000);

async function seedDatabase() {
  const masterExists = await User.findOne({ id: "usr_master" });
  if (!masterExists) {
    await User.create({
      id: "usr_master",
      name: "Acesso Master",
      email: "admin@painel.com",
      password: "2b079e541af29b37f713",
      role: "master",
      status: "active",
      whatsapp: "5511999999999",
      showWhatsapp: true,
      createdAt: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 3650 * 86400000).toISOString(),
      lastLogin: new Date().toISOString()
    });
  }

  const allResellers = await User.find({ role: "reseller" });
  for (const r of allResellers) {
    let modified = false;
    if (!r.createdAt) {
      r.createdAt = new Date().toISOString();
      modified = true;
    }
    if (!r.expirationDate) {
      const base = new Date(r.createdAt);
      base.setFullYear(base.getFullYear() + 1);
      r.expirationDate = base.toISOString();
      modified = true;
    }
    if (modified) {
      await r.save();
    }
  }

  const masterLayout = await Layout.findOne({ resellerId: "usr_master" });
  if (!masterLayout) {
    await Layout.create({
      id: "lay_usr_master",
      resellerId: "usr_master",
      backgroundUrl: defaultBackgrounds[0],
      backgrounds: defaultBackgrounds,
      overlayOpacity: 0.35,
      logoUrl: "",
      bootVideoUrl: "",
      apps: defaultApps,
      updatedAt: new Date().toISOString()
    });
  }

  const otaExists = await Ota.findOne({ id: "ota_v210" });
  if (!otaExists) {
    await Ota.create({
      id: "ota_v210",
      versionCode: 5,
      versionName: "1.0.5",
      downloadUrl: "https://itdoctorbrasil.site/Launchers/Luna/apps/update.apk",
      forceUpdate: false,
      releaseNotes: "• Correções, melhorias e novos recursos",
      minSupportedVersion: 100,
      fileSizeBytes: 18450000,
      updatedAt: new Date().toISOString()
    });
  }

  checkAndSendExpirationAlerts();
}

async function resolveLayoutAndClient(macInput?: string, tokenInput?: string) {
  const cleanMac = cleanHex(decodeURIComponent(macInput || ""));
  const cleanToken = cleanHex(decodeURIComponent(tokenInput || ""));

  let reseller: any = null;
  if (cleanToken.length > 0) {
    reseller = await User.findOne({ resellerToken: new RegExp(`^${cleanToken}$`, "i") });
  }

  let client: any = null;
  if (cleanMac.length >= 4) {
    const allClients = await Client.find({});
    const matches = allClients.filter((c: any) => {
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

  if (!reseller && client) {
    reseller = await User.findOne({ id: client.resellerId });
  }
  if (!reseller) {
    reseller = await User.findOne({ id: "usr_rev_1" }) || await User.findOne({});
  }

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

    await Client.create(client);
  }

  let isExpired = false;
  let isNewClient = false;

  if (client) {
    const now = new Date();
    const expDate = new Date(client.expirationDate);

    if (expDate > now && client.status !== "suspended") {
      if (client.status === "pending") {
        client.status = "active";
        await Client.updateOne({ id: client.id }, { status: "active" });
      }
      isExpired = false;
      isNewClient = false;
    } else {
      isExpired = true;
      isNewClient = (client.status === "pending");
      if (client.status === "active" && expDate <= now) {
        client.status = "expired";
        await Client.updateOne({ id: client.id }, { status: "expired" });
      }
    }
  } else {
    isNewClient = true;
    isExpired = true;
  }

  if (reseller && reseller.status === "blocked") {
    isExpired = true;
  }

  const targetId = reseller ? reseller.id : "usr_master";
  let layout = await Layout.findOne({ $or: [{ resellerId: targetId }, { id: `lay_${targetId}` }] });
  if (!layout) {
    layout = await Layout.findOne({}) || {
      backgroundUrl: defaultBackgrounds[0],
      backgrounds: defaultBackgrounds,
      overlayOpacity: 0.35,
      logoUrl: "",
      bootVideoUrl: "",
      apps: defaultApps
    };
  }

  return { client, reseller, layout, isExpired, isNewClient };
}

function extractDeviceCredentials(req: express.Request) {
  const rawMac = (req.query.mac as string || req.headers["x-mac-address"] as string || "").trim();
  const rawToken = (req.query.token as string || req.headers["authorization"]?.replace("Bearer ", "") || "").trim();
  return { mac: rawMac, token: rawToken };
}

const handleAppsJson = async (req: express.Request, res: express.Response) => {
  disableCache(res);
  const { mac, token } = extractDeviceCredentials(req);
  const { layout, reseller, client, isExpired } = await resolveLayoutAndClient(mac, token);

  const cleanWhatsapp = reseller?.whatsapp ? reseller.whatsapp.replace(/\D/g, "") : "5511999999999";
  const whatsappUrl = `https://wa.me/+${cleanWhatsapp}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(whatsappUrl)}`;
  const showWhatsapp = reseller?.showWhatsapp ?? true;
  const logoUrl = layout?.logoUrl || "";
  const bootVideoUrl = layout?.bootVideoUrl || "";
  const dueDate = client?.expirationDate ? client.expirationDate.split("T")[0] : "";

  if (isExpired) {
    return res.json({
      status: "expired",
      isExpired: true,
      message: "Acesso bloqueado ou expirado. Entre em contato com seu revendedor.",
      showWhatsapp,
      whatsapp: cleanWhatsapp,
      whatsappUrl,
      qrCodeImageUrl,
      logoUrl,
      bootVideoUrl,
      dueDate,
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
    showWhatsapp,
    whatsapp: cleanWhatsapp,
    whatsappUrl,
    qrCodeImageUrl,
    logoUrl,
    bootVideoUrl,
    dueDate,
    total: formattedApps.length,
    apps: formattedApps
  });
};

app.get("/apps.json", handleAppsJson);
app.get("/api/v1/launcher/apps.json", handleAppsJson);

const handleImgJson = async (req: express.Request, res: express.Response) => {
  disableCache(res);
  const { mac, token } = extractDeviceCredentials(req);
  const { layout, reseller, client, isExpired, isNewClient } = await resolveLayoutAndClient(mac, token);

  const cleanWhatsapp = reseller?.whatsapp ? reseller.whatsapp.replace(/\D/g, "") : "5511999999999";
  const whatsappUrl = `https://wa.me/+${cleanWhatsapp}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(whatsappUrl)}`;
  const showWhatsapp = reseller?.showWhatsapp ?? true;
  const logoUrl = layout?.logoUrl || "";
  const bootVideoUrl = layout?.bootVideoUrl || "";
  const dueDate = client?.expirationDate ? client.expirationDate.split("T")[0] : "";

  if (isExpired) {
    const blockedUrl = isNewClient ? NEW_CLIENT_IMAGE_URL : EXPIRATION_IMAGE_URL;

    return res.json({
      status: "expired",
      isExpired: true,
      showWhatsapp,
      whatsapp: cleanWhatsapp,
      whatsappUrl,
      qrCodeImageUrl,
      logoUrl,
      bootVideoUrl,
      dueDate,
      backgroundUrl: blockedUrl,
      bg_url: blockedUrl,
      img_url: blockedUrl,
      url: blockedUrl,
      image: blockedUrl,
      overlayOpacity: 0.0,
      opacity: 0.0,
      images: [blockedUrl]
    });
  }

  const imageList = (layout.backgrounds && layout.backgrounds.length > 0) 
    ? layout.backgrounds 
    : defaultBackgrounds;

  const primaryUrl = imageList[0];

  return res.json({
    status: "success",
    showWhatsapp,
    whatsapp: cleanWhatsapp,
    whatsappUrl,
    qrCodeImageUrl,
    logoUrl,
    bootVideoUrl,
    dueDate,
    backgroundUrl: primaryUrl,
    bg_url: primaryUrl,
    img_url: primaryUrl,
    url: primaryUrl,
    image: primaryUrl,
    overlayOpacity: layout.overlayOpacity ?? 0.35,
    opacity: layout.overlayOpacity ?? 0.35,
    images: imageList
  });
};

app.get("/img.json", handleImgJson);
app.get("/api/v1/launcher/img.json", handleImgJson);

const handleVersionJson = async (req: express.Request, res: express.Response) => {
  disableCache(res);
  const ota = await Ota.findOne({ id: "ota_v210" }) || {
    versionCode: 5,
    versionName: "1.0.5",
    downloadUrl: "https://itdoctorbrasil.site/Launchers/Luna/apps/update.apk",
    forceUpdate: false,
    releaseNotes: "• Correções, melhorias e novos recursos",
    minSupportedVersion: 100,
    fileSizeBytes: 18450000,
    updatedAt: new Date().toISOString()
  };

  return res.json({
    versionCode: ota.versionCode,
    version_code: ota.versionCode,
    versionName: ota.versionName,
    version_name: ota.versionName,
    downloadUrl: ota.downloadUrl,
    download_url: ota.downloadUrl,
    forceUpdate: ota.forceUpdate,
    releaseNotes: ota.releaseNotes,
    minSupportedVersion: ota.minSupportedVersion
  });
};

app.get("/version.json", handleVersionJson);
app.get("/api/v1/launcher/version.json", handleVersionJson);

app.get("/api/admin/resellers", async (req, res) => {
  disableCache(res);
  const resellers = await User.find({ role: "reseller" });
  const clients = await Client.find({});
  const now = new Date();

  return res.json(resellers.map((r: any) => {
    const myClients = clients.filter((c: any) => c.resellerId === r.id);
    const activeClients = myClients.filter((c: any) => new Date(c.expirationDate) > now && c.status === "active").length;
    return {
      ...r.toObject(),
      totalClients: myClients.length,
      activeClients
    };
  }));
});

app.post("/api/admin/resellers", async (req, res) => {
  const { id, name, email, password, resellerToken, clientLimit, status, whatsapp, showWhatsapp, createdAt, expirationDate } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Nome e Email são obrigatórios." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanWhatsapp = whatsapp ? whatsapp.replace(/\D/g, "") : "";

  if (id) {
    const user = await User.findOne({ id });
    if (!user) return res.status(404).json({ message: "Revendedor não encontrado." });

    user.name = name;
    user.email = cleanEmail;
    if (password && password.trim().length > 0) user.password = password.trim();
    if (resellerToken) user.resellerToken = resellerToken.trim().toUpperCase();
    if (clientLimit !== undefined) user.clientLimit = Number(clientLimit);
    if (status) user.status = status;
    user.whatsapp = cleanWhatsapp;
    if (showWhatsapp !== undefined) user.showWhatsapp = Boolean(showWhatsapp);
    if (createdAt) user.createdAt = createdAt;
    if (expirationDate) user.expirationDate = expirationDate;

    await user.save();
    return res.json(user);
  } else {
    const existing = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, "i") });
    if (existing) {
      return res.status(400).json({ message: "Já existe um usuário cadastrado com este e-mail." });
    }

    const newResellerId = "usr_rev_" + Date.now();
    const token = resellerToken ? resellerToken.trim().toUpperCase() : `REV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const regDate = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();
    let expDate = expirationDate ? new Date(expirationDate).toISOString() : "";
    
    if (!expDate) {
      const base = new Date(regDate);
      base.setFullYear(base.getFullYear() + 1);
      expDate = base.toISOString();
    }

    const newReseller = await User.create({
      id: newResellerId,
      name,
      email: cleanEmail,
      password: password ? password.trim() : "revenda123password",
      role: "reseller",
      resellerToken: token,
      clientLimit: Number(clientLimit || 50),
      status: status || "active",
      whatsapp: cleanWhatsapp,
      showWhatsapp: showWhatsapp !== undefined ? Boolean(showWhatsapp) : true,
      createdAt: regDate,
      expirationDate: expDate
    });

    await Layout.create({
      id: "lay_" + newResellerId,
      resellerId: newResellerId,
      backgroundUrl: defaultBackgrounds[0],
      backgrounds: defaultBackgrounds,
      overlayOpacity: 0.35,
      logoUrl: "",
      bootVideoUrl: "",
      apps: defaultApps,
      updatedAt: new Date().toISOString()
    });

    return res.status(201).json(newReseller);
  }
});

app.delete("/api/admin/resellers/:id", async (req, res) => {
  const { id } = req.params;
  await User.deleteOne({ id });
  await Layout.deleteMany({ $or: [{ resellerId: id }, { id: `lay_${id}` }] });
  return res.json({ status: "success" });
});

app.post("/api/reseller/whatsapp", async (req, res) => {
  const { resellerId, whatsapp, showWhatsapp } = req.body;
  if (!resellerId) return res.status(400).json({ message: "ID do revendedor obrigatório." });

  const user = await User.findOne({ id: resellerId });
  if (!user) return res.status(404).json({ message: "Revendedor não encontrado." });

  if (whatsapp !== undefined) user.whatsapp = whatsapp.replace(/\D/g, "");
  if (showWhatsapp !== undefined) user.showWhatsapp = Boolean(showWhatsapp);
  await user.save();

  return res.json({ status: "success", whatsapp: user.whatsapp, showWhatsapp: user.showWhatsapp });
});

// -------------------------------------------------------------
// ENDPOINT DE PROXY PARA UPLOAD (Abordagem Base64 / Buffer fiável)
// -------------------------------------------------------------
app.post("/api/reseller/upload-media", async (req, res) => {
  try {
    const { resellerId, fileBase64, fileName, tipo } = req.body;
    console.log(`📥 Recebida requisição de upload para o revendedor: ${resellerId}, tipo: ${tipo}`);

    if (!resellerId || !fileBase64 || !fileName) {
      return res.status(400).json({ success: false, message: "Dados incompletos para o upload." });
    }

    const FormData = (await import("form-data")).default;
    const axios = (await import("axios")).default;

    const formData = new FormData();
    formData.append("id_revenda", resellerId);
    formData.append("tipo", tipo || "banner");

    const matches = fileBase64.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: "Formato Base64 inválido." });
    }

    const buffer = Buffer.from(matches[2], "base64");
    
    const fieldKey = tipo === "logo" ? "logo" : (tipo === "bootvideo" ? "bootvideo" : "banner");
    formData.append(fieldKey, buffer, { filename: fileName });

    const phpUploadUrl = "https://itdoctorbrasil.site/painel-luna/clientes/upload.php";
    console.log(`🌐 A reencaminhar upload para o PHP: ${phpUploadUrl}`);
    
    const phpResponse = await axios.post(phpUploadUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        "X-Api-Key": "REV-VIP-8822"
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log("✅ Resposta do PHP recebida com sucesso:", phpResponse.data);
    return res.json(phpResponse.data);
  } catch (error: any) {
    const phpErrorMessage = error.response?.data?.message || error.message;
    console.error("❌ Erro detalhado no proxy de upload:", phpErrorMessage);
    return res.status(500).json({ 
      success: false, 
      message: `Erro ao comunicar com o servidor de upload: ${phpErrorMessage}` 
    });
  }
});

app.get("/api/reseller/clients", async (req, res) => {
  disableCache(res);
  const { resellerId } = req.query;
  let query: any = {};

  if (resellerId && resellerId !== "all" && resellerId !== "usr_master" && resellerId !== "master") {
    query.resellerId = resellerId;
  }

  const clients = await Client.find(query);
  return res.json(clients);
});

app.post("/api/reseller/clients", async (req, res) => {
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

  let client: any = null;
  if (id) {
    client = await Client.findOne({ id });
  } else {
    const allClients = await Client.find({});
    client = allClients.find((c: any) => cleanHex(c.macAddress) === cleanMac || cleanHex(c.deviceToken) === cleanMac);
  }

  if (client) {
    client.clientName = clientName;
    client.macAddress = formattedMac;
    client.deviceToken = formattedMac;
    client.expirationDate = finalExpDate.toISOString();
    client.status = status || "active";
    if (notes !== undefined) client.notes = notes;
    if (resellerId) client.resellerId = resellerId;

    await client.save();
    return res.json(client);
  } else {
    const newClient = await Client.create({
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
    });

    return res.status(201).json(newClient);
  }
});

app.post("/api/reseller/clients/renew", async (req, res) => {
  const { id, macAddress, days } = req.body;
  const cleanMac = cleanHex(macAddress || id);

  const allClients = await Client.find({});
  const client = allClients.find((c: any) => c.id === id || cleanHex(c.macAddress) === cleanMac || cleanHex(c.deviceToken) === cleanMac);

  if (!client) {
    return res.status(404).json({ message: "Cliente não encontrado para renovação." });
  }

  const addDays = Number(days === 9999 ? 3650 : (days || 30));
  const currentExp = new Date(client.expirationDate);
  const now = new Date();
  const baseDate = (!isNaN(currentExp.getTime()) && currentExp > now) ? currentExp : now;

  client.expirationDate = new Date(baseDate.getTime() + addDays * 86400000).toISOString();
  client.status = "active";

  await client.save();
  return res.json(client);
});

app.delete("/api/reseller/clients/:id", async (req, res) => {
  const { id } = req.params;
  await Client.deleteOne({ id });
  return res.json({ status: "success" });
});

app.get("/api/reseller/layout/:resellerId", async (req, res) => {
  const targetId = req.params.resellerId;
  let layout = await Layout.findOne({ $or: [{ resellerId: targetId }, { id: `lay_${targetId}` }] });

  if (!layout) {
    layout = await Layout.create({
      id: "lay_" + targetId,
      resellerId: targetId,
      backgroundUrl: defaultBackgrounds[0],
      backgrounds: defaultBackgrounds,
      overlayOpacity: 0.35,
      logoUrl: "",
      bootVideoUrl: "",
      apps: defaultApps,
      updatedAt: new Date().toISOString()
    });
  }
  return res.json(layout);
});

app.post("/api/reseller/layout", async (req, res) => {
  const { resellerId, backgroundUrl, backgrounds, overlayOpacity, logoUrl, bootVideoUrl, apps } = req.body;
  const targetId = resellerId || "usr_master";

  const existingLayout = await Layout.findOne({ $or: [{ resellerId: targetId }, { id: `lay_${targetId}` }] });

  const updatedData = {
    id: "lay_" + targetId,
    resellerId: targetId,
    backgroundUrl: backgroundUrl || backgrounds?.[0] || existingLayout?.backgroundUrl || defaultBackgrounds[0],
    backgrounds: backgrounds || existingLayout?.backgrounds || defaultBackgrounds,
    overlayOpacity: Number(overlayOpacity ?? existingLayout?.overlayOpacity ?? 0.35),
    logoUrl: logoUrl !== undefined ? logoUrl : (existingLayout?.logoUrl || ""),
    bootVideoUrl: bootVideoUrl !== undefined ? bootVideoUrl : (existingLayout?.bootVideoUrl || ""),
    apps: Array.isArray(apps) ? apps : (existingLayout?.apps || defaultApps),
    updatedAt: new Date().toISOString()
  };

  let layout = await Layout.findOneAndUpdate(
    { $or: [{ resellerId: targetId }, { id: `lay_${targetId}` }] },
    updatedData,
    { new: true, upsert: true }
  );

  return res.json(layout);
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPassword = (password || "").trim();

  const user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, "i") });
  if (!user) return res.status(401).json({ message: "Credenciais inválidas." });

  const isValid = (cleanPassword === (user.password || "revenda123password").trim()) ||
                  (user.role === "master" && (cleanPassword === "2b079e541af29b37f713" || cleanPassword === "admin"));

  if (!isValid) return res.status(401).json({ message: "Senha incorreta." });

  if (user.role === "reseller" && user.expirationDate) {
    const now = new Date();
    const expDate = new Date(user.expirationDate);
    now.setHours(0, 0, 0, 0);
    expDate.setHours(0, 0, 0, 0);

    if (now > expDate || user.status === "blocked") {
      return res.status(403).json({ 
        expired: true, 
        message: "Seus acessos estão expirados, entre em contato com o administrador do painel" 
      });
    }
  }

  return res.json({
    token: `session_${user.id}_${Date.now()}`,
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      resellerToken: user.resellerToken || "", 
      clientLimit: user.clientLimit || 0,
      whatsapp: user.whatsapp || "",
      showWhatsapp: user.showWhatsapp ?? true
    }
  });
});

app.get("/api/admin/stats", async (req, res) => {
  const clients = await Client.find({});
  const resellers = await User.find({ role: "reseller" });
  const now = new Date();
  const ota = await Ota.findOne({ id: "ota_v210" });

  return res.json({
    success: true,
    totalResellers: resellers.length,
    activeResellers: resellers.filter((r: any) => r.status === "active").length,
    totalClients: clients.length,
    activeClients: clients.filter((c: any) => new Date(c.expirationDate) > now && c.status === "active").length,
    expiredClients: clients.filter((c: any) => new Date(c.expirationDate) <= now || c.status !== "active").length,
    otaVersion: ota?.versionName || "1.0.5",
    totalApiRequests: 0
  });
});

app.get("/api/admin/ota", async (req, res) => {
  const ota = await Ota.findOne({ id: "ota_v210" });
  return res.json(ota);
});

app.post("/api/admin/ota", async (req, res) => {
  const { versionCode, versionName, downloadUrl, forceUpdate, releaseNotes } = req.body;
  
  let ota = await Ota.findOne({ id: "ota_v210" });
  if (!ota) {
    ota = new Ota({ id: "ota_v210" });
  }

  ota.versionCode = Number(versionCode || ota.versionCode);
  ota.versionName = versionName || ota.versionName;
  ota.downloadUrl = downloadUrl || ota.downloadUrl;
  ota.forceUpdate = Boolean(forceUpdate);
  ota.releaseNotes = releaseNotes || ota.releaseNotes;
  ota.updatedAt = new Date().toISOString();

  await ota.save();
  return res.json(ota);
});

async function startServer() {
  if (!MONGO_URI) {
    console.error("❌ ERRO CRÍTICO: A variável de ambiente MONGO_URI não está definida no Render!");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("📦 Conectado ao MongoDB Atlas com sucesso!");
    await seedDatabase();

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
  } catch (err) {
    console.error("❌ Erro fatal ao conectar ao MongoDB Atlas:", err);
  }
}

startServer();

export interface BackgroundPreset {
  id: string;
  name: string;
  category: string;
  url: string;
}

export interface AppPreset {
  name: string;
  packageName: string;
  iconUrl: string;
  deepLink?: string;
}

// -------------------------------------------------------------
// FUNDOS DINÂMICOS, TECH E ABSTRATOS (HD 1080p)
// -------------------------------------------------------------
export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "preset_bg_1",
    name: "Cyber Neon Tech",
    category: "Futurista",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1920&auto=format&fit=crop&q=80"
  },
  {
    id: "preset_bg_2",
    name: "Purple Gradient Vibe",
    category: "Gradientes",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&auto=format&fit=crop&q=80"
  },
  {
    id: "preset_bg_3",
    name: "Abstrato Futurista",
    category: "Abstrato",
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1920&auto=format&fit=crop&q=80"
  },
  {
    id: "preset_bg_4",
    name: "Aurora Boreal Colorida",
    category: "Natureza / Luz",
    url: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=1920&auto=format&fit=crop&q=80"
  },
  {
    id: "preset_bg_5",
    name: "Ondas Tech Azul",
    category: "Minimalista",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&auto=format&fit=crop&q=80"
  },
  {
    id: "preset_bg_6",
    name: "Partículas Cósmicas",
    category: "Espaço",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&auto=format&fit=crop&q=80"
  },
  {
    id: "preset_bg_7",
    name: "Minimal Dark Purple",
    category: "Gradientes",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&auto=format&fit=crop&q=80"
  },
  {
    id: "preset_bg_8",
    name: "Neon Glow Pink & Blue",
    category: "Futurista",
    url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=1920&auto=format&fit=crop&q=80"
  },
  {
    id: "preset_bg_9",
    name: "Sunset Tech Gradient",
    category: "Gradientes",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&auto=format&fit=crop&q=80"
  },
  {
    id: "preset_bg_10",
    name: "Liquid Gold Texture",
    category: "Abstrato",
    url: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1920&auto=format&fit=crop&q=80"
  },
  {
    id: "preset_bg_11",
    name: "Geometria Moderna Dark",
    category: "Minimalista",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1920&auto=format&fit=crop&q=80"
  },
  {
    id: "preset_bg_12",
    name: "Galáxia Vibrante",
    category: "Espaço",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=80"
  }
];

// -------------------------------------------------------------
// APLICATIVOS PREDEFINIDOS OFICIAIS & POPULARES
// -------------------------------------------------------------
export const APP_PRESETS: AppPreset[] = [
  {
    name: "Unitv",
    packageName: "com.global.unitviptv",
    iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/unitv.png",
    deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/unitv.apk"
  },
  {
    name: "YouCine",
    packageName: "com.world.youcinetv",
    iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/youcine.png",
    deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/youcine.apk"
  },
  {
    name: "YouTube",
    packageName: "com.google.android.youtube.tv",
    iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/youtube.png",
    deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/youtube.apk"
  },
  {
    name: "TuneIn",
    packageName: "tunein.player",
    iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/tuneinradio.png",
    deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/tunein.apk"
  },
  {
    name: "Settings",
    packageName: "com.android.tv.settings",
    iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/settings.png",
    deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/settings.apk"
  },
  {
    name: "Netflix",
    packageName: "com.netflix.mediaclient",
    iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/netflix.png",
    deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/netflix.apk"
  },
  {
    name: "Downloader",
    packageName: "com.esaba.downloader",
    iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/downloader.png",
    deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/downloader.apk"
  },
  {
    name: "Chrome",
    packageName: "com.android.chrome",
    iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/chrome.png",
    deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/chrome.apk"
  },
  {
    name: "Prime Video",
    packageName: "com.amazon.avod.thirdpartyclient",
    iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/prime.png",
    deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/prime.apk"
  }
];

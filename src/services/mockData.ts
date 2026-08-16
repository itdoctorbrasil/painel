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
// BANNERS OFICIAIS DO LUNA LAUNCHER (HD 1080p / WEBP)
// -------------------------------------------------------------
export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "preset_bg_1",
    name: "Banner Principal 1",
    category: "Oficial",
    url: "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_1.webp"
  },
  {
    id: "preset_bg_2",
    name: "Banner Principal 2",
    category: "Oficial",
    url: "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_2.webp"
  },
  {
    id: "preset_bg_3",
    name: "Banner Principal 3",
    category: "Oficial",
    url: "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_3.webp"
  },
  {
    id: "preset_bg_4",
    name: "Banner Principal 4",
    category: "Oficial",
    url: "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_4.webp"
  },
  {
    id: "preset_bg_5",
    name: "Banner Principal 5",
    category: "Oficial",
    url: "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_5.webp"
  },
  {
    id: "preset_bg_6",
    name: "Banner Principal 6",
    category: "Oficial",
    url: "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_6.webp"
  },
  {
    id: "preset_bg_7",
    name: "Banner Principal 7",
    category: "Oficial",
    url: "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_7.webp"
  },
  {
    id: "preset_bg_8",
    name: "Banner Principal 8",
    category: "Oficial",
    url: "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_8.webp"
  },
  {
    id: "preset_bg_9",
    name: "Banner Principal 9",
    category: "Oficial",
    url: "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_9.webp"
  },
  {
    id: "preset_bg_10",
    name: "Banner Principal 10",
    category: "Oficial",
    url: "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_10.webp"
  },
  {
    id: "preset_bg_11",
    name: "Banner Principal 11",
    category: "Oficial",
    url: "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_11.webp"
  },
  {
    id: "preset_bg_12",
    name: "Banner Principal 12",
    category: "Oficial",
    url: "https://itdoctorbrasil.site/Launchers/Luna/banners/banner_12.webp"
  }
];

// -------------------------------------------------------------
// APLICATIVOS PREDEFINIDOS OFICIAIS & POPULARES
// -------------------------------------------------------------
export const APP_PRESETS: AppPreset[] = [
  {
    name: "Velo Play",
    packageName: "com.global.veloplaytv",
    iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/veloplay.png",
    deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/veloplay.apk"
  },
  {
    name: "YouCine",
    packageName: "com.world.youcinetv",
    iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/youcine.png",
    deepLink: "https://itdoctorbrasil.site/Launchers/Luna/apps/youcine.apk"
  },
  {
    name: "YouTube TV",
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
    deepLink: ""
  },
  {
    name: "Netflix TV",
    packageName: "com.netflix.ninja",
    iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/netflix.png",
    deepLink: ""
  },
  {
    name: "Prime Video",
    packageName: "com.amazon.amazonvideo.livingroom",
    iconUrl: "https://itdoctorbrasil.site/Launchers/Luna/icon/primevideo.png",
    deepLink: ""
  }
];

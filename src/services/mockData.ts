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

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "preset_bg_1",
    name: "Dark Neon Future",
    category: "Futurista",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80"
  },
  {
    id: "preset_bg_2",
    name: "Cinema Abstract Dark",
    category: "Cinema",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80"
  },
  {
    id: "preset_bg_3",
    name: "Cyberpunk City Light",
    category: "Gamer",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80"
  },
  {
    id: "preset_bg_4",
    name: "Purple Cosmic Mesh",
    category: "Gradiente",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80"
  },
  {
    id: "preset_bg_5",
    name: "Deep Blue Horizon",
    category: "Moderno",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80"
  },
  {
    id: "preset_bg_6",
    name: "Golden Luxury Stage",
    category: "Premium",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80"
  }
];

export const APP_PRESETS: AppPreset[] = [
  {
    name: "Luna Live IPTV",
    packageName: "com.luna.iptvplayer",
    iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"
  },
  {
    name: "Cine Filmes & VOD",
    packageName: "com.luna.vodmovies",
    iconUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80"
  },
  {
    name: "Séries On Demand",
    packageName: "com.luna.seriesplayer",
    iconUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200&auto=format&fit=crop&q=80"
  },
  {
    name: "YouTube TV",
    packageName: "com.google.android.youtube.tv",
    iconUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format&fit=crop&q=80"
  },
  {
    name: "Netflix",
    packageName: "com.netflix.mediaclient",
    iconUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&auto=format&fit=crop&q=80"
  },
  {
    name: "Amazon Prime Video",
    packageName: "com.amazon.amazonvideo.livingroom",
    iconUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&auto=format&fit=crop&q=80"
  },
  {
    name: "Max (HBO)",
    packageName: "com.hbo.hbonow",
    iconUrl: "https://images.unsplash.com/photo-1586899028174-e7098604235b?w=200&auto=format&fit=crop&q=80"
  },
  {
    name: "Kodi Media Center",
    packageName: "org.xbmc.kodi",
    iconUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80"
  },
  {
    name: "Configurações TV",
    packageName: "com.android.settings",
    iconUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80"
  }
];

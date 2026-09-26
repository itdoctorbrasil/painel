export type UserRole = 'master' | 'reseller';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  resellerToken?: string;
  clientLimit?: number;
  status: 'active' | 'blocked';
  createdAt: string;
  lastLogin?: string;
}

export interface AppItem {
  id: number;
  name: string;
  packageName: string;
  iconUrl: string;
  deepLink?: string;
}

export interface AppLayout {
  id: string;
  resellerId: string;
  backgroundUrl: string;
  backgrounds?: string[];
  overlayOpacity: number;
  apps: AppItem[];
  updatedAt: string;
}

export interface ClientDevice {
  id: string;
  resellerId: string;
  clientName: string;
  macAddress: string;
  deviceToken: string;
  expirationDate: string;
  status: 'active' | 'suspended' | 'expired';
  notes?: string;
  lastSeen?: string;
  createdAt: string;
}

export interface OtaVersion {
  id: string;
  versionCode: number;
  versionName: string;
  downloadUrl: string;
  forceUpdate: boolean;
  releaseNotes: string;
  minSupportedVersion: number;
  fileSizeBytes?: number;
  updatedAt: string;
}

export interface ApiLog {
  id: string;
  token: string;
  endpoint: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  status: 'success' | 'error' | 'expired';
  responseCode: number;
}

export interface LauncherConfigResponse {
  status: 'success' | 'error';
  message?: string;
  reseller?: {
    name: string;
    token: string;
  };
  client?: {
    id: string;
    name: string;
    macAddress: string;
    deviceToken: string;
    expirationDate: string;
    isActive: boolean;
    daysRemaining: number;
  };
  background: {
    url: string;
    images?: string[];
    overlayOpacity: number;
  };
  apps: AppItem[];
}

export interface LauncherVersionResponse {
  versionCode: number;
  versionName: string;
  downloadUrl: string;
  forceUpdate: boolean;
  releaseNotes: string;
  minSupportedVersion: number;
  updatedAt: string;
}

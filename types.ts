export interface ServerLocation {
  id: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  flag: string;
  load: number;
  ping: number;
}

export interface TrafficData {
  time: string;
  download: number;
  upload: number;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTING = 'DISCONNECTING',
}

export interface SecurityReport {
  status: 'secure' | 'vulnerable' | 'analyzing';
  summary: string;
  encryption: string;
  masking: string;
}

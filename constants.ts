import { ServerLocation } from './types';

export const US_SERVERS: ServerLocation[] = [
  { id: 'us-ny', city: 'New York', state: 'NY', country: 'United States', lat: 40.7128, lng: -74.0060, flag: '🇺🇸', load: 45, ping: 23 },
  { id: 'us-la', city: 'Los Angeles', state: 'CA', country: 'United States', lat: 34.0522, lng: -118.2437, flag: '🇺🇸', load: 62, ping: 45 },
  { id: 'us-chi', city: 'Chicago', state: 'IL', country: 'United States', lat: 41.8781, lng: -87.6298, flag: '🇺🇸', load: 30, ping: 35 },
  { id: 'us-mia', city: 'Miami', state: 'FL', country: 'United States', lat: 25.7617, lng: -80.1918, flag: '🇺🇸', load: 88, ping: 50 },
  { id: 'us-sea', city: 'Seattle', state: 'WA', country: 'United States', lat: 47.6062, lng: -122.3321, flag: '🇺🇸', load: 25, ping: 60 },
  { id: 'us-dal', city: 'Dallas', state: 'TX', country: 'United States', lat: 32.7767, lng: -96.7970, flag: '🇺🇸', load: 55, ping: 40 },
];

export const MOCK_IP_POOL = [
  '104.23.11.45',
  '192.168.44.12',
  '45.33.22.11',
  '198.51.100.22',
  '203.0.113.5'
];

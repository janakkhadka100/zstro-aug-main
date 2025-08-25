import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.janak.zstro',
  appName: 'Zstro',
  webDir: 'out',                 // keep
  server: { 
    url: 'https://zstro-aug-main-3257.vercel.app', 
    cleartext: false 
  }
};
export default config;

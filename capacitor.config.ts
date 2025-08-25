// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.janak.zstro',
  appName: 'Zstro',
  webDir: 'out',     // ✅ केवल static folder
  server: {
  url: 'http://192.168.1.68:3000', cleartext: true }

  }
;
export default config;
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.janak.zstro',
  appName: 'Zstro',
  webDir: 'out',          // ⬅️ static export को फोल्डर
  // यदि SSR/hosted URL लोड गर्ने हो भने:
  // server: { url: 'https://yourapp.vercel.app', cleartext: false },
};

export default config;
// Note: SSR/hosted URL को लागि server विकल्प अनकमेंट गर्नुहोस् र cleartext लाई आवश्यक अनुसार सेट गर्नुहोस्।

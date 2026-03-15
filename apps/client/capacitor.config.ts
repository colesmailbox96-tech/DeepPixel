import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.echoparty.game',
  appName: 'Project Echo Party',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

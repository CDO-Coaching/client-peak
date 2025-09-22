import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.796c46b649d349e2b9150f9253927333',
  appName: 'client-peak',
  webDir: 'dist',
  server: {
    url: 'https://796c46b6-49d3-49e2-b915-0f9253927333.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      backgroundColor: '#1a1a1a',
      style: 'dark'
    }
  }
};

export default config;
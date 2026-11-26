import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rahul.todoapp',
  appName: 'ToDoApp',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_notification',
      iconColor: '#6D28D9',
      sound: 'default',
    },
    StatusBar: {
      overlaysWebView: true,
    },
  },
};

export default config;

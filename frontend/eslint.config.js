import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rahul.todoapp', // Apna existing appId hi rakhna agar pehle se set hai
  appName: 'ToDoApp',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_notification',
      iconColor: '#6d28d9',
      sound: 'default',
    },
    StatusBar: {
      overlaysWebView: true,
    },
  },
};

export default config;

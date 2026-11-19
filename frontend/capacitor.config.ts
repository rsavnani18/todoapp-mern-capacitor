import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rahul.todoapp',
  appName: 'ToDoApp',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

import { Capacitor } from '@capacitor/core';

const hostname = window.location.hostname;
const apiHost = Capacitor.isNativePlatform() ? '192.168.1.114' : hostname;

export const environment = {
  production: false,
  apiUrl: `http://${apiHost}:3000`
};

import { Capacitor } from '@capacitor/core';

export const isMobileDevice = () => {
  return Capacitor.isNativePlatform();
};

export const isWebMobile = () => {
  return window.innerWidth < 768;
};

export const isMobileOrTablet = () => {
  return isMobileDevice() || isWebMobile();
};

export const getPlatform = () => {
  return Capacitor.getPlatform();
};

export const isIOS = () => {
  return Capacitor.getPlatform() === 'ios';
};

export const isAndroid = () => {
  return Capacitor.getPlatform() === 'android';
};
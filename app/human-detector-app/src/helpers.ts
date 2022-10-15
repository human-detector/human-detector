import * as ReactNative from 'react-native';
import * as Device from 'expo-device';

/**
 * This file will help make testing easier, and organize some helpers
 * for any expo or react native commands.
 */

export function getOS() {
  return ReactNative.Platform.OS;
}

export function isDevice() {
  return Device.isDevice;
}

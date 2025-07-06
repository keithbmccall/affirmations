/* global jest */
/* eslint-env jest */
import { beforeAll } from '@jest/globals';
import { router } from 'expo-router';
// Jest setup file for React Native/Expo testing
import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => {
    return {
      remove: jest.fn(),
    };
  }),
  addNotificationResponseReceivedListener: jest.fn(() => {
    return {
      remove: jest.fn(),
    };
  }),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'test-token' })),
}));

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

beforeAll(() => {
  const originalPush = router.push.bind(router);
  router.push = to => {
    if (typeof to === 'object') {
      const { pathname, params } = to;
      const search = new URLSearchParams(
        Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {})
      ).toString();
      return originalPush(`${pathname}?${search}`);
    }
    return originalPush(to);
  };
});

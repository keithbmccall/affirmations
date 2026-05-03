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

// Mock expo-notifications (extend as integration tests need more of the surface)
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('scheduled-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  getNotificationChannelsAsync: jest.fn(() => Promise.resolve([])),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidImportance: { MAX: 5 },
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

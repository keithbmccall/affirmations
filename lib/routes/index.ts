import { ExpoRouter } from 'expo-router';
import { ICON_MAPPING } from '../components/shared/icon-symbol/icon-mapping';

type Route = {
  name: string;
  title: string;
  icon: keyof typeof ICON_MAPPING;
  routePathname: ExpoRouter.__routes['hrefInputParams']['pathname'];
};

type TabRoutes = {
  home: Route;
  lens: Route;
  affirmations: Route;
};

type ModalRoutes = {
  notificationDetails: Route;
};

type RoutesStructure = {
  tabs: TabRoutes;
  modals: ModalRoutes;
};

export const Routes: RoutesStructure = {
  tabs: {
    home: {
      name: 'index',
      title: 'Home',
      icon: 'house.fill',
      routePathname: '/(tabs)',
    },
    lens: {
      name: 'lens-screen',
      title: 'Lens',
      icon: 'camera.fill',
      routePathname: '/(tabs)/lens-screen',
    },
    affirmations: {
      name: 'affirmations-screen',
      title: 'Affirmations',
      icon: 'note.text',
      routePathname: '/(tabs)/affirmations-screen',
    },
  },
  modals: {
    notificationDetails: {
      name: 'notification-details-modal',
      title: 'Notification Details',
      icon: 'alarm.fill',
      routePathname: '/(modals)/notification-details-modal',
    },
  },
};

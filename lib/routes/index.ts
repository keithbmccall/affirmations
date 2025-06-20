import { ICON_MAPPING } from '../components/shared/icon-symbol/icon-mapping';

type Route = {
  name: string;
  title: string;
  icon: keyof typeof ICON_MAPPING;
};

export const Routes: Record<string, Route> = {
  home: {
    name: 'index',
    title: 'Home',
    icon: 'house.fill',
  },
  lens: {
    name: 'lens-screen',
    title: 'Lens',
    icon: 'camera.fill',
  },
  affirmations: {
    name: 'affirmations-screen',
    title: 'Affirmations',
    icon: 'note.text',
  },
};

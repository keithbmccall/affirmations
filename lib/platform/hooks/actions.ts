import { useStateContext } from '../state-context-provider';

export const useSettings = () => {
  const { settings, actions } = useStateContext();

  return {
    ...actions.settings,
    ...settings,
  };
};

export const useNotifications = () => {
  const { affirmations, actions } = useStateContext();

  return {
    ...actions.affirmations,
    ...affirmations,
  };
};

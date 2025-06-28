import { useStateContext } from '../state-context-provider';

export const useSettings = () => {
  const { settings, actions } = useStateContext();

  return {
    ...actions.settings,
    ...settings,
  };
};

export const useAffirmations = () => {
  const { affirmations, actions } = useStateContext();

  return {
    ...actions.affirmations,
    ...affirmations,
  };
};

export const useLens = () => {
  const { lens, actions } = useStateContext();

  return {
    ...actions.lens,
    ...lens,
  };
};

export const useGeneral = () => {
  const { general, actions } = useStateContext();

  return {
    ...actions.general,
    ...general,
  };
};

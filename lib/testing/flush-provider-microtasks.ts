import { act } from 'expo-router/testing-library';

/** Flush microtasks from async provider effects (e.g. pending/history init) inside act. */
export async function flushProviderMicrotasks() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

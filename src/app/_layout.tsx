import { StateContextProvider } from '@platform';
import { ThemeProvider } from '@rneui/themed';
import { Theme } from '@theme';
import {
  Slot,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from 'expo-router';
import { useStoreRouteInfo } from 'expo-router/src/global-state/router-store';

export default function Layout() {
  const router = useRouter();
  const local = useLocalSearchParams();
  const path = usePathname();
  const storeInfo = useStoreRouteInfo();
  console.log({
    local,
    path,
    router,
    storeInfo,
  });
  return (
    <StateContextProvider>
      <ThemeProvider theme={Theme}>
        <Slot />
      </ThemeProvider>
    </StateContextProvider>
  );
}

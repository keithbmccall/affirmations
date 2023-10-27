import { ModalContainer } from '@modals';
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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
    <GestureHandlerRootView style={{ flex: 1, opacity: 1 }}>
      <StateContextProvider>
        <ThemeProvider theme={Theme}>
          <SafeAreaProvider>
            <Slot />
            <ModalContainer />
          </SafeAreaProvider>
        </ThemeProvider>
      </StateContextProvider>
    </GestureHandlerRootView>
  );
}

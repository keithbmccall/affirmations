import { StateContextProvider } from '@platform';
import { ThemeProvider, createTheme } from '@rneui/themed';
import {
  Slot,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from 'expo-router';
import { useStoreRouteInfo } from 'expo-router/src/global-state/router-store';
import { SafeAreaView } from 'react-native-safe-area-context';

const theme = createTheme({
  lightColors: {
    primary: '#e7e7e8',
  },
  darkColors: {
    primary: '#000',
  },
  mode: 'light',
});

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
      <ThemeProvider theme={theme}>
        <SafeAreaView>
          <Slot />
        </SafeAreaView>
      </ThemeProvider>
    </StateContextProvider>
  );
}

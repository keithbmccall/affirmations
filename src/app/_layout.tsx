import { StateContextProvider } from '@platform';
import { ThemeProvider, createTheme } from '@rneui/themed';
import { Slot } from 'expo-router';
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

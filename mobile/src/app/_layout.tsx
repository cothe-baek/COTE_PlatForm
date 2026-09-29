import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ProblemsProvider } from '../data/ProblemsContext'
import { ThemeProvider, useCoteTheme } from '../theme'

function AppStack() {
  const { theme } = useCoteTheme()

  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.layout } }} />
    </>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ProblemsProvider>
          <AppStack />
        </ProblemsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

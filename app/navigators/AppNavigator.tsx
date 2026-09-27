/** The course explorer is available without authentication. */
import { useCallback, useState } from "react"
import { View, type ViewStyle } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { NavigationSheet } from "@/components/NavigationSheet"
import Config from "@/config"
import { CourseDetailsScreen } from "@/screens/CourseDetailsScreen"
import { CourseListScreen } from "@/screens/CourseListScreen"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { FavoritesScreen } from "@/screens/FavoritesScreen"
import { useAppTheme } from "@/theme/context"

import type { NavigationPage } from "./navigationPages"
import type { AppStackParamList, NavigationProps } from "./navigationTypes"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
      initialRouteName="CourseList"
    >
      <Stack.Screen name="CourseList" component={CourseListScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
    </Stack.Navigator>
  )
}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()
  const [currentRoute, setCurrentRoute] = useState<string>()
  const navigateToPage = useCallback((name: NavigationPage) => {
    if (!navigationRef.isReady() || navigationRef.getCurrentRoute()?.name === name) return
    navigationRef.navigate({ name, params: undefined, pop: true })
  }, [])

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      {...props}
      onReady={() => {
        setCurrentRoute(navigationRef.getCurrentRoute()?.name)
        props.onReady?.()
      }}
      onStateChange={(state) => {
        setCurrentRoute(navigationRef.getCurrentRoute()?.name)
        props.onStateChange?.(state)
      }}
    >
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <View style={$root}>
          <View style={$root}>
            <AppStack />
          </View>
          <NavigationSheet currentRoute={currentRoute} onNavigate={navigateToPage} />
        </View>
      </ErrorBoundary>
    </NavigationContainer>
  )
}

const $root: ViewStyle = { flex: 1 }

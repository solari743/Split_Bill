import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator>
      {/* Bottom tabs */}
      <Stack.Screen
        name="Tabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />

      {/* Profile / Settings */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
        }}
      />
    </Stack.Navigator>
  );
}

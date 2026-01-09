import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import RootNavigator from './src/navigation/ProfileNavigator';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <RootNavigator/>
      </NavigationContainer>
    </ThemeProvider>
  );
}

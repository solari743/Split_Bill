import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import ReceiptReviewScreen from '../screens/ReceiptReviewScreen';
import ParticipantsScreen from '../screens/ParticipantsScreen';
import BillDetailScreen from '../screens/BillDetailScreen';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { theme } = useTheme();
  const { user, booting } = useAuth();

  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!user ? (
        // Login Screen - shown first when not logged in
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        // Main App - shown after login
        <>
          <Stack.Screen
            name="Tabs"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />
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
          <Stack.Screen
            name="ReceiptReview"
            component={ReceiptReviewScreen}
            options={{
              title: 'Review Receipt',
              headerStyle: { backgroundColor: theme.background },
              headerTintColor: theme.text,
            }}
          />
          <Stack.Screen
            name="Participants"
            component={ParticipantsScreen}
            options={{
              title: 'Split Bill',
              headerStyle: { backgroundColor: theme.background },
              headerTintColor: theme.text,
            }}
          />
          <Stack.Screen
            name="BillDetail"
            component={BillDetailScreen}
            options={{
              title: 'Bill Status',
              headerStyle: { backgroundColor: theme.background },
              headerTintColor: theme.text,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

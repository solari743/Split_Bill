import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ScanReceiptScreen from '../screens/ScanReceiptScreen';
import HistoryScreen from '../screens/HistoryScreen';
import CustomTabBarButton from '../components/CustomTabBarButton';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: theme.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: theme.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 20,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Home',
          headerTitle: 'Split Bill',
        }}
      />

      <Tab.Screen
        name="ScanReceipt"
        component={ScanReceiptScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="camera" size={32} color="#000" />
          ),
          tabBarLabel: '',
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
          headerTitle: 'Scan Receipt',
        }}
      />

      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
          tabBarLabel: 'History',
          headerTitle: 'History',
        }}
      />
    </Tab.Navigator>
  );
}

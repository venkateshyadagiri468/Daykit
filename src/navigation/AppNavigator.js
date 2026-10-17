import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../constants/colors';

import { TodayScreen } from '../screens/TodayScreen';
import { BrowseScreen } from '../screens/BrowseScreen';
import { PlaybookDetailScreen } from '../screens/PlaybookDetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { CreateScreen } from '../screens/CreateScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Today') {
            iconName = focused ? 'sunny' : 'sunny-outline';
          } else if (route.name === 'Browse') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Create') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textTertiary,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Browse" component={BrowseScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="PlaybookDetail" component={PlaybookDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
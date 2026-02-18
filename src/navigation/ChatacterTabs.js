import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import OverviewScreen from '../screens/OverviewScreen';
import SkillsScreen from '../screens/SkillsScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ReferenceScreen from '../screens/ReferenceScreen';

const Tab = createBottomTabNavigator();

export default function CharacterTabs({ route }) {
  // route.params.characterId (or the whole character) later
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Overview: 'stats-chart',
            Skills: 'body',
            Inventory: 'bag-handle',
            Reference: 'book',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Overview" component={OverviewScreen} />
      <Tab.Screen name="Skills" component={SkillsScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Reference" component={ReferenceScreen} />
    </Tab.Navigator>
  );
}

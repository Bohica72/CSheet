import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import OverviewScreen from '../screens/OverviewScreen';
import SkillsScreen from '../screens/SkillsScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ReferenceScreen from '../screens/ReferenceScreen';

const Tab = createBottomTabNavigator();

export default function CharacterTabs({ route }) {
  const { character } = route.params;

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
      <Tab.Screen name="Overview" component={OverviewScreen} initialParams={{ character }} />
      <Tab.Screen name="Skills" component={SkillsScreen} initialParams={{ character }} />
      <Tab.Screen name="Inventory" component={InventoryScreen} initialParams={{ character }} />
      <Tab.Screen name="Reference" component={ReferenceScreen} initialParams={{ character }} />
    </Tab.Navigator>
  );
}

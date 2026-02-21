import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../styles/theme';

import CharacterListScreen from '../screens/CharacterListScreen';
import CharacterTabs from './CharacterTabs';
import CharacterCreationWizard from '../screens/CharacterCreationWizard';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Characters"
        component={CharacterListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CharacterCreation"
        component={CharacterCreationWizard}
        options={{
          headerBackTitle: 'Characters',
          headerTitle: 'New Character',
          headerStyle: {
            backgroundColor: colors.surface,
            height: 36,
          },
          headerTintColor: colors.textMuted,
          headerBackTitleStyle: {
            fontSize: 11,
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="Character"
        component={CharacterTabs}
        options={{
          headerBackTitle: 'Characters',
          headerTitle: '',
          headerStyle: {
            backgroundColor: colors.surface,
            height: 36,
          },
          headerTintColor: colors.textMuted,
          headerBackTitleStyle: {
            fontSize: 11,
          },
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

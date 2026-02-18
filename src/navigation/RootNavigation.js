import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CharacterListScreen from '../screens/CharacterListScreen';
import CharacterTabs from './CharacterTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Characters" component={CharacterListScreen} />
      <Stack.Screen
        name="Character"
        component={CharacterTabs}
        options={{ headerTitle: 'Character' }}
      />
    </Stack.Navigator>
  );
}

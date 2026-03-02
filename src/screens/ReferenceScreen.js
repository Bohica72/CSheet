import React from 'react';
import { View, Text } from 'react-native';
import ClassReference from './ClassReference';
import { colors } from '../styles/theme'; // Adjust path if needed
import { getClassData } from '../data/classes'; // Imports from your new index.js!

export default function ReferenceScreen({ route }) {
  const { character } = route.params;
  
  // 1. Grab the unified class object directly
  const classData = getClassData(character.classId);

  if (!classData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textMuted }}>
          No reference data available for this class.
        </Text>
      </View>
    );
  }

  return (
    <ClassReference
      character={character}
      classData={classData}
      // 2. Subclasses are now safely nestled inside the classData object
      subclasses={classData.subclasses} 
    />
  );
}
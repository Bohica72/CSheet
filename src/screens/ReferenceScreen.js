import React from 'react';
import ClassReference from './ClassReference';
import { getClassReferenceData } from '../data/classReferenceIndex';

export default function ReferenceScreen({ route }) {
  const { character } = route.params;
  const { classData, subclasses } = getClassReferenceData(character.classId);

  if (!classData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textMuted }}>
          No reference data available for this class.
        </Text>
      </View>
    );
  }
// In your reference screen, log this:
console.log('char subclassId:', character.subclassId);
console.log('available subclass keys:', Object.keys(subclasses ?? {}));

  return (
    <ClassReference
      character={character}
      classData={classData}
      subclasses={subclasses}
    />
  );
}

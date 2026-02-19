import React from 'react';
import PugilistReference from './PugilistReference';

export default function ReferenceScreen({ route }) {
  const { character } = route.params;
  return <PugilistReference character={character} />;
}
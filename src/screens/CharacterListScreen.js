import React from 'react';
import { useNavigation } from '@react-navigation/native';
import CharacterList from '../screens/CharacterList';

export default function CharacterListScreen() {
  const navigation = useNavigation();

  return (
    <CharacterList
      onSelectCharacter={(character) => navigation.navigate('Character', { character })}
      onCreateCharacter={() => navigation.navigate('CharacterCreation')}
    />
  );
}

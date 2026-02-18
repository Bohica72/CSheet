import React from 'react';
import CharacterList from './CharacterList';

export default function CharacterListScreen({ navigation }) {
  return (
    <CharacterList
      onSelectCharacter={(character) => {
        navigation.navigate('Character', { characterId: character.id });
      }}
    />
  );
}

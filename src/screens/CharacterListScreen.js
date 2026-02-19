import React from 'react';
import { View, StyleSheet } from 'react-native';
import CharacterList from './CharacterList';
import { colors } from '../styles/theme';

export default function CharacterListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <CharacterList
        onSelectCharacter={(character) => {
          navigation.navigate('Character', { character });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

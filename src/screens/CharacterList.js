import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadCharacters, addCharacter } from '../utils/CharacterStore';
import { Character } from '../models/Character';
import { sampleCharacter } from '../data/sampleCharacter';
import { colors, spacing, typography, radius, shadows, sharedStyles } from '../styles/theme';

function rarityColor(classId) {
  // Extend this as you add more classes
  return colors.accent;
}

export default function CharacterList({ onSelectCharacter }) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await loadCharacters();
      if (data.length === 0) {
        const seeded = { ...sampleCharacter, id: 'char_' + Date.now() };
        const updated = await addCharacter(seeded);
        setCharacters(updated);
      } else {
        setCharacters(data);
      }
      setLoading(false);
    })();
  }, []);

  const handleAdd = async () => {
    const newChar = {
      ...sampleCharacter,
      id: 'char_' + Date.now(),
      name: 'New Pugilist ' + (characters.length + 1),
    };
    const updated = await addCharacter(newChar);
    setCharacters(updated);
  };

  if (loading) {
    return (
      <View style={sharedStyles.screen}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[typography.subtitle, { marginTop: spacing.md }]}>
            Loading characters...
          </Text>
        </View>
      </View>
    );
  }

  if (characters.length === 0) {
    return (
      <View style={sharedStyles.screen}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.center}>
          <Ionicons name="person-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Characters Yet</Text>
          <Text style={styles.emptySubtitle}>Create your first character to begin</Text>
          <TouchableOpacity style={sharedStyles.primaryButton} onPress={handleAdd}>
            <Text style={sharedStyles.primaryButtonText}>Create Character</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={sharedStyles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Page header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Characters</Text>
      </View>

      <FlatList
        data={characters}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.characterCard}
            onPress={() => onSelectCharacter(new Character(item))}
            activeOpacity={0.75}
          >
            {/* Red left accent */}
            <View style={styles.cardAccent} />

            <View style={styles.cardBody}>
              <Text style={styles.characterName}>{item.name}</Text>
              <Text style={styles.characterSub}>
                Level {item.level ?? 1}
                {' · '}
                {item.classId
                  ? item.classId.charAt(0).toUpperCase() + item.classId.slice(1)
                  : 'Pugilist'}
                {item.subclassId
                  ? ' · ' + item.subclassId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                  : ''}
              </Text>

              {/* Quick stats row */}
              <View style={styles.quickStats}>
                <StatPip label="HP" value={item.hpMax ?? '—'} />
                <StatPip label="AC" value={item.ac ?? '—'} />
                <StatPip
                  label="Moxie"
                  value={item.moxieMax ?? '—'}
                  color={colors.gold}
                />
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
              style={styles.cardChevron}
            />
          </TouchableOpacity>
        )}
      />

      {/* Add FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAdd}>
        <Ionicons name="add" size={28} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

function StatPip({ label, value, color }) {
  return (
    <View style={styles.statPip}>
      <Text style={styles.statPipValue(color)}>{value}</Text>
      <Text style={styles.statPipLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.heading,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.subtitle,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceDeep,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  // List
  listContent: {
    padding: spacing.md,
    paddingBottom: 80,
  },

  // Character card
  characterCard: {
    ...sharedStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    marginRight: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  characterSub: {
    ...typography.subtitle,
    marginBottom: spacing.sm,
  },
  cardChevron: {
    marginLeft: spacing.sm,
  },

  // Quick stats
  quickStats: {
    flexDirection: 'row',
  },
  statPip: {
    marginRight: spacing.lg,
    alignItems: 'center',
  },
  statPipValue: (color) => ({
    fontSize: 15,
    fontWeight: 'bold',
    color: color ?? colors.accentSoft,
  }),
  statPipLabel: {
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
});

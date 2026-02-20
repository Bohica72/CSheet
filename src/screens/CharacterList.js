import React, { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, StatusBar,
  Modal, TextInput, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadCharacters, addCharacter, saveCharacter, deleteCharacter } from '../utils/CharacterStore';
import { Character } from '../models/Character';
import { sampleCharacter } from '../data/sampleCharacter';
import { colors, spacing, typography, radius, shadows, sharedStyles } from '../styles/theme';

export default function CharacterList({ onSelectCharacter }) {
  const [characters, setCharacters]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameInput, setRenameInput]       = useState('');
  const selectedCharRef                     = useRef(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        const data = await loadCharacters();
        if (data.length === 0) {
          const seeded  = { ...sampleCharacter, id: 'char_' + Date.now() };
          const updated = await addCharacter(seeded);
          setCharacters(updated);
        } else {
          setCharacters(data);
        }
        setLoading(false);
      })();
    }, [])
  );

  const handleAdd = async () => {
    const newChar = {
      ...sampleCharacter,
      id:   'char_' + Date.now(),
      name: 'New Pugilist ' + (characters.length + 1),
    };
    const updated = await addCharacter(newChar);
    setCharacters(updated);
  };

  const handleLongPress = (item) => {
    selectedCharRef.current = item;
    setActionModalVisible(true);
  };

  const openRename = () => {
    setRenameInput(selectedCharRef.current?.name ?? '');
    setActionModalVisible(false);
    setTimeout(() => setRenameModalVisible(true), 300);
  };

  const handleRename = async () => {
    const trimmed = renameInput.trim();
    if (!trimmed) return;
    const updated = { ...selectedCharRef.current, name: trimmed };
    await saveCharacter(updated);
    setCharacters(prev =>
      prev.map(c => c.id === updated.id ? { ...c, name: trimmed } : c)
    );
    setRenameModalVisible(false);
  };

  const handleDelete = () => {
    const char = selectedCharRef.current;
    setActionModalVisible(false);
    setTimeout(() => {
      Alert.alert(
        'Delete Character',
        `Are you sure you want to delete ${char.name}? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const updated = await deleteCharacter(char.id);
              setCharacters(updated);
            },
          },
        ]
      );
    }, 300);
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
        <Text style={styles.headerHint}>Hold a character to rename or delete</Text>
      </View>

      <FlatList
        data={characters}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.characterCard}
            onPress={() => onSelectCharacter(new Character(item))}
            onLongPress={() => handleLongPress(item)}
            delayLongPress={400}
            activeOpacity={0.75}
          >
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
              <View style={styles.quickStats}>
                <StatPip label="HP"    value={item.hpMax ?? '—'} />
                <StatPip label="AC"    value={item.ac ?? '—'} />
                <StatPip label="Moxie" value={item.moxieMax ?? '—'} color={colors.gold} />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.cardChevron} />
          </TouchableOpacity>
        )}
      />

      {/* Add FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAdd}>
        <Ionicons name="add" size={28} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* ACTION MODAL — rename or delete */}
      <Modal visible={actionModalVisible} transparent animationType="fade">
        <View style={sharedStyles.modalOverlay}>
          <View style={sharedStyles.modalBox}>
            <Text style={sharedStyles.modalTitle}>
              {selectedCharRef.current?.name}
            </Text>
            <Text style={styles.actionSub}>
              Level {selectedCharRef.current?.level ?? 1} · {selectedCharRef.current?.classId ?? 'Pugilist'}
            </Text>

            <TouchableOpacity style={styles.actionButton} onPress={openRename}>
              <Ionicons name="pencil-outline" size={20} color={colors.accentSoft} />
              <Text style={styles.actionButtonText}>Rename</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.actionButtonDanger]} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={colors.accent} />
              <Text style={[styles.actionButtonText, { color: colors.accent }]}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActionModalVisible(false)}>
              <Text style={sharedStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* RENAME MODAL */}
      <Modal visible={renameModalVisible} transparent animationType="slide">
        <View style={sharedStyles.modalOverlay}>
          <View style={sharedStyles.modalBox}>
            <Text style={sharedStyles.modalTitle}>Rename Character</Text>
            <TextInput
              style={[sharedStyles.input, styles.renameInput]}
              value={renameInput}
              onChangeText={setRenameInput}
              placeholder="Character name"
              placeholderTextColor={colors.textDisabled}
              autoFocus
              maxLength={40}
              onSubmitEditing={handleRename}
            />
            <TouchableOpacity style={sharedStyles.primaryButton} onPress={handleRename}>
              <Text style={sharedStyles.primaryButtonText}>Save Name</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRenameModalVisible(false)}>
              <Text style={sharedStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  headerHint: {
    ...typography.subtitle,
    fontSize: 11,
    marginTop: 2,
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
  cardBody: { flex: 1 },
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
  cardChevron: { marginLeft: spacing.sm },

  // Quick stats
  quickStats: { flexDirection: 'row' },
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

  // Action modal
  actionSub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    width: '100%',
  },
  actionButtonDanger: {
    borderWidth: 1,
    borderColor: colors.accentDim,
  },
  actionButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },

  // Rename modal
  renameInput: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
});

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, sharedStyles } from '../styles/theme';
import { Character } from '../models/Character';

import OverviewScreen   from '../screens/OverviewScreen';
import SkillsScreen     from '../screens/SkillsScreen';
import InventoryScreen  from '../screens/InventoryScreen';
import ReferenceScreen  from '../screens/ReferenceScreen';

const TABS = [
  { key: 'Overview',   icon: 'stats-chart',  label: 'Overview'  },
  { key: 'Skills',     icon: 'body',         label: 'Skills'    },
  { key: 'Inventory',  icon: 'bag-handle',   label: 'Inventory' },
  { key: 'Reference',  icon: 'book',         label: 'Reference' },
];

const SCREENS = {
  Overview:  OverviewScreen,
  Skills:    SkillsScreen,
  Inventory: InventoryScreen,
  Reference: ReferenceScreen,
};

export default function CharacterTabs({ route }) {
  const raw = route.params.character;
  const character = raw instanceof Character ? raw : new Character(raw);

  const [activeTab, setActiveTab]           = useState('Overview');
  const [menuVisible, setMenuVisible]       = useState(false);
  const [restCallback, setRestCallback]     = useState(null);
  const [levelUpCallback, setLevelUpCallback] = useState(null);

  const ActiveScreen = SCREENS[activeTab];

  return (
    <SafeAreaView style={styles.container}>

      {/* Character name header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.characterName}>{character.name}</Text>
          <Text style={styles.characterSub}>
  {`Level ${character.level} ${character.classId
    ? character.classId.charAt(0).toUpperCase() + character.classId.slice(1)
    : 'Adventurer'}`}
  {character.subclassId
    ? ` · ${character.subclassId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`
    : ''}
  {character.race
    ? ` · ${character.race}`
    : ''}
</Text>

        </View>

        {/* Menu button */}
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Top tab bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.key ? colors.accent2 : colors.textMuted}
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.tabLabelActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active screen */}
      <View style={styles.screenContainer}>
        <ActiveScreen
          route={{ params: { character } }}
          onRegisterActions={(actions) => {
            if (actions.openRest)    setRestCallback(() => actions.openRest);
            if (actions.openLevelUp) setLevelUpCallback(() => actions.openLevelUp);
          }}
        />
      </View>

      {/* CHARACTER MENU MODAL */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity
          style={sharedStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setTimeout(() => levelUpCallback?.(), 300);
              }}
            >
              <Ionicons name="arrow-up-circle" size={20} color={colors.gold} />
              <Text style={styles.menuItemText}>Level Up</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setTimeout(() => restCallback?.(), 300);
              }}
            >
              <Ionicons name="moon" size={20} color={colors.accentSoft} />
              <Text style={styles.menuItemText}>Take a Rest</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  characterName: {
    ...typography.heading,
    fontSize: 20,
  },
  characterSub: {
    ...typography.subtitle,
    marginTop: 2,
  },
  menuButton: {
    padding: spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.surfaceDeep,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.accent,
  },
  tabActive2: {
    borderBottomColor: colors.accent,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: colors.accent2,
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Menu
  menuBox: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  menuItemText: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.surfaceDeep,
    marginHorizontal: spacing.md,
  },
});

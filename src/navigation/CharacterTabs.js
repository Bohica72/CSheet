import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../styles/theme';

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
  const { character } = route.params;
  const [activeTab, setActiveTab] = useState('Overview');
  const ActiveScreen = SCREENS[activeTab];

  return (
    <SafeAreaView style={styles.container}>

      {/* Character name header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.characterName}>{character.name}</Text>
          <Text style={styles.characterSub}>
            Level {character.level} Pugilist
            {character.subclassId ? ` · ${character.subclassId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}` : ''}
          </Text>
        </View>
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
              color={activeTab === tab.key ? colors.accent : colors.textMuted}
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
        <ActiveScreen route={{ params: { character } }} />
      </View>

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
    paddingVertical: spacing.md,
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
  tabLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
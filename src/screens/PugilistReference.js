import React, { useState } from 'react';
import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet
} from 'react-native';
import { PUGILIST_CLASS, PUGILIST_SUBCLASSES } from '../data/pugilist_data';
import { colors, spacing, radius, typography, shadows, sharedStyles } from '../styles/theme';

const SWEET_SCIENCE = PUGILIST_SUBCLASSES['sweet_science'];
const SUBCLASS_LEVELS = [3, 6, 11, 17];

// --- Expandable feature block ---

function FeatureItem({ item, isSubclass }) {
  const [expanded, setExpanded] = useState(false);
  if (!item.name) return <Text style={styles.levelNone}>No new features.</Text>;
  return (
    <TouchableOpacity
      style={[styles.featureBlock, isSubclass && styles.featureBlockSubclass]}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.7}
    >
      <View style={styles.featureHeader}>
        <Text style={[styles.featureName, isSubclass && styles.featureNameSubclass]}>
          {item.name}
        </Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </View>
      {expanded && (
        <Text style={styles.featureDesc}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );
}

// --- Reference table ---

function ReferenceTable({ currentLevel }) {
  const rows = Object.entries(PUGILIST_CLASS.levels);
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 0.5 }]}>Lvl</Text>
        <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 0.6 }]}>Prof</Text>
        <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 0.8 }]}>Fisticuffs</Text>
        <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 0.6 }]}>Moxie</Text>
        <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 2 }]}>Features</Text>
      </View>
      {rows.map(([lvl, data]) => {
        const isCurrentLevel = Number(lvl) === currentLevel;
        return (
          <View
            key={lvl}
            style={[
              styles.tableRow,
              Number(lvl) % 2 === 0 && styles.tableRowAlt,
              isCurrentLevel && styles.tableRowCurrent,
            ]}
          >
            <Text style={[styles.tableCell, { flex: 0.5 }, isCurrentLevel && styles.tableCellCurrent]}>
              {lvl}
            </Text>
            <Text style={[styles.tableCell, { flex: 0.6 }, isCurrentLevel && styles.tableCellCurrent]}>
              +{data.profBonus}
            </Text>
            <Text style={[styles.tableCell, { flex: 0.8 }, isCurrentLevel && styles.tableCellCurrent]}>
              {data.fisticuffs}
            </Text>
            <Text style={[styles.tableCell, { flex: 0.6 }, isCurrentLevel && styles.tableCellCurrent]}>
              {data.moxiePoints || '—'}
            </Text>
            <Text style={[styles.tableCell, { flex: 2 }, isCurrentLevel && styles.tableCellCurrent]}>
              {data.features.join(', ')}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// --- Main Component ---

export default function PugilistReference({ character }) {
  const currentLevel = character?.level ?? 1;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
    >
      {/* Header */}
      <View style={styles.headerBlock}>
        <Text style={styles.headerTitle}>{PUGILIST_CLASS.name}</Text>
        <Text style={styles.headerSub}>
          Hit Die: d{PUGILIST_CLASS.hitDie}  ·  Saves: STR, CON
        </Text>
        {SWEET_SCIENCE && (
          <Text style={styles.subclassBadge}>
            ✦ {SWEET_SCIENCE.name} features included
          </Text>
        )}
      </View>

      {/* Level by level */}
      {Object.entries(PUGILIST_CLASS.levels).map(([lvl, data]) => {
        const level         = Number(lvl);
        const isCurrentLevel = level === currentLevel;
        const subFeatures   = SUBCLASS_LEVELS.includes(level)
          ? (SWEET_SCIENCE?.features[level] ?? [])
          : [];

        return (
          <View key={lvl}>
            {/* Level header */}
            <View style={[
              styles.levelHeaderWrap,
              isCurrentLevel && styles.levelHeaderCurrent,
            ]}>
              <View style={styles.levelHeaderLeft}>
                <Text style={[
                  styles.levelHeader,
                  isCurrentLevel && styles.levelHeaderTextCurrent,
                ]}>
                  Level {level}
                  {isCurrentLevel && (
                    <Text style={styles.currentBadge}> ← current</Text>
                  )}
                </Text>
                <Text style={styles.levelMeta}>
                  {data.fisticuffs}  ·  {data.moxiePoints > 0 ? `${data.moxiePoints} Moxie` : 'No Moxie'}  ·  Prof +{data.profBonus}
                </Text>
              </View>
            </View>

            {/* Class features */}
            {data.features.length > 0 ? (
              data.features.map(name => (
                <FeatureItem
                  key={`class_${name}_${level}`}
                  item={{
                    name,
                    description: PUGILIST_CLASS.features[name]?.description ?? '',
                  }}
                  isSubclass={false}
                />
              ))
            ) : (
              <Text style={styles.levelNone}>No new class features.</Text>
            )}

            {/* Sweet Science subclass features */}
            {subFeatures.map(f => (
              <FeatureItem
                key={`sub_${f.name}_${level}`}
                item={{ name: f.name, description: f.description }}
                isSubclass={true}
              />
            ))}
          </View>
        );
      })}

      {/* Reference table */}
      <Text style={styles.tableTitle}>Class Reference Table</Text>
      <ReferenceTable currentLevel={currentLevel} />
      <View style={{ height: 32 }} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },

  // Header
  headerBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    ...shadows.card,
  },
  headerTitle: { ...typography.heading },
  headerSub: { ...typography.subtitle, marginTop: spacing.xs },
  subclassBadge: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },

  // Level headers
  levelHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },
  levelHeaderCurrent: {
    borderLeftColor: colors.gold,
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.sm,
  },
  levelHeaderLeft: { flex: 1 },
  levelHeader: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  levelHeaderTextCurrent: {
    color: colors.gold,
  },
  currentBadge: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: 'normal',
    fontStyle: 'italic',
  },
  levelMeta: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },

  // Feature blocks
  featureBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: 4,
    ...shadows.card,
  },
  featureBlockSubclass: {
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
    backgroundColor: colors.surfaceAlt,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  featureNameSubclass: {
    color: colors.gold,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 11,
    marginLeft: spacing.sm,
  },
  featureDesc: {
    ...typography.body,
    marginTop: spacing.sm,
  },
  levelNone: {
    color: colors.textDisabled,
    fontStyle: 'italic',
    padding: spacing.sm,
    fontSize: 12,
  },

  // Reference table
  tableTitle: {
    ...sharedStyles.sectionHeader,
    marginTop: spacing.xl,
  },
  table: {
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tableRowAlt: {
    backgroundColor: colors.surfaceAlt,
  },
  tableRowCurrent: {
    backgroundColor: colors.accentDim,
  },
  tableHeader: {
    backgroundColor: colors.surfaceDeep,
  },
  tableCell: {
    color: colors.textMuted,
    fontSize: 11,
    paddingHorizontal: spacing.xs,
  },
  tableCellHeader: {
    color: colors.accentSoft,
    fontWeight: 'bold',
  },
  tableCellCurrent: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
});

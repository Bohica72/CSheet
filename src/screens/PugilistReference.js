import React, { useState } from 'react';
import {
  View, Text, SectionList, ScrollView,
  TouchableOpacity, StyleSheet
} from 'react-native';
import { PUGILIST_CLASS, PUGILIST_SUBCLASSES } from '../data/pugilist_data';

// --- Helpers ---

function FeatureItem({ item }) {
  const [expanded, setExpanded] = useState(false);
  if (!item.name) return <Text style={styles.levelNone}>No new features.</Text>;
  return (
    <TouchableOpacity
      style={styles.featureBlock}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.7}
    >
      <View style={styles.featureHeader}>
        <Text style={styles.featureName}>{item.name}</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </View>
      {expanded && <Text style={styles.featureDesc}>{item.description}</Text>}
    </TouchableOpacity>
  );
}

// Subclass feature levels
const SUBCLASS_LEVELS = [3, 6, 11, 17];

function buildClassSections(subclassId) {
  const sub = subclassId ? PUGILIST_SUBCLASSES[subclassId] : null;

  return Object.entries(PUGILIST_CLASS.levels).map(([lvl, data]) => {
    const level = Number(lvl);

    // Base class features
    const items = data.features.map(name => ({
      id: `class_${name}_${level}`,
      name,
      description: PUGILIST_CLASS.features[name]?.description ?? '',
      isSubclass: false,
    }));

    // Inject subclass features at levels 3, 6, 11, 17
    if (sub && SUBCLASS_LEVELS.includes(level)) {
      const subFeatures = sub.features[level] ?? [];
      subFeatures.forEach(f => {
        items.push({
          id: `sub_${f.name}_${level}`,
          name: `${f.name} (${sub.name})`,
          description: f.description,
          isSubclass: true,
        });
      });
    }

    return {
      title: `Level ${level}`,
      levelData: data,
      data: items.length ? items : [{ id: `none_${level}`, name: null }],
    };
  });
}

function buildSubclassSections(subclassId) {
  const sub = PUGILIST_SUBCLASSES[subclassId];
  if (!sub) return [];
  return Object.entries(sub.features).map(([level, features]) => ({
    title: `Level ${level}`,
    data: features.map(f => ({
      id: `${subclassId}_${f.name}_${level}`,
      name: f.name,
      description: f.description,
    })),
  }));
}

// --- Reference Table ---

function ReferenceTable() {
  const rows = Object.entries(PUGILIST_CLASS.levels);
  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 0.5 }]}>Lvl</Text>
        <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 0.5 }]}>Prof</Text>
        <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 0.7 }]}>Fisticuffs</Text>
        <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 0.5 }]}>Moxie</Text>
        <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 2 }]}>Features</Text>
      </View>
      {rows.map(([lvl, data]) => (
        <View key={lvl} style={[styles.tableRow, Number(lvl) % 2 === 0 && styles.tableRowAlt]}>
          <Text style={[styles.tableCell, { flex: 0.5 }]}>{lvl}</Text>
          <Text style={[styles.tableCell, { flex: 0.5 }]}>+{data.profBonus}</Text>
          <Text style={[styles.tableCell, { flex: 0.7 }]}>{data.fisticuffs}</Text>
          <Text style={[styles.tableCell, { flex: 0.5 }]}>{data.moxiePoints || '—'}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{data.features.join(', ')}</Text>
        </View>
      ))}
    </View>
  );
}

// --- Subclass selector ---

const SUBCLASS_KEYS = Object.keys(PUGILIST_SUBCLASSES);

function SubclassSelector({ selected, onSelect }) {
  return (
    <View style={styles.selectorRow}>
      {SUBCLASS_KEYS.map(key => (
        <TouchableOpacity
          key={key}
          style={[styles.selectorChip, selected === key && styles.selectorChipActive]}
          onPress={() => onSelect(key)}
        >
          <Text style={[styles.selectorText, selected === key && styles.selectorTextActive]}>
            {PUGILIST_SUBCLASSES[key].name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// --- Main Component ---

export default function PugilistReference({ character }) {
  const [tab, setTab] = useState('class');
  // Subclass tab has its own selector, independent of the character's subclass
  const characterSubclass = character?.subclassId ?? null;
  const [viewedSubclass, setViewedSubclass] = useState(characterSubclass ?? SUBCLASS_KEYS[0]);

  const classSections = buildClassSections(characterSubclass);
  const subclassSections = buildSubclassSections(viewedSubclass);
  const subclassLabel = PUGILIST_SUBCLASSES[characterSubclass]?.name ?? 'Subclass';

  return (
    <View style={styles.container}>

      {/* Top tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'class' && styles.tabActive]}
          onPress={() => setTab('class')}
        >
          <Text style={[styles.tabText, tab === 'class' && styles.tabTextActive]}>Class</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'subclass' && styles.tabActive]}
          onPress={() => setTab('subclass')}
        >
          <Text style={[styles.tabText, tab === 'subclass' && styles.tabTextActive]}>
            {subclassLabel}
          </Text>
        </TouchableOpacity>
      </View>

      {/* CLASS TAB */}
      {tab === 'class' && (
        <SectionList
          style={styles.list}
          sections={classSections}
          keyExtractor={item => item.id}
          ListHeaderComponent={() => (
            <View style={styles.headerBlock}>
              <Text style={styles.headerTitle}>{PUGILIST_CLASS.name}</Text>
              <Text style={styles.headerSub}>
                Hit Die: d{PUGILIST_CLASS.hitDie}  ·  Saves: STR, CON
              </Text>
              {characterSubclass && (
                <Text style={styles.subclassBadge}>
                  ✦ {subclassLabel} features integrated
                </Text>
              )}
            </View>
          )}
          renderSectionHeader={({ section: { title, levelData } }) => (
            <View style={styles.levelHeaderWrap}>
              <Text style={styles.levelHeader}>{title}</Text>
              <Text style={styles.levelMeta}>
                {levelData.fisticuffs}  ·  {levelData.moxiePoints > 0 ? `${levelData.moxiePoints} Moxie` : 'No Moxie'}  ·  Prof +{levelData.profBonus}
              </Text>
            </View>
          )}
          renderItem={({ item }) => <FeatureItem item={item} />}
          stickySectionHeadersEnabled={false}
        />
      )}

      {/* SUBCLASS TAB */}
      {tab === 'subclass' && (
        <ScrollView style={styles.list}>
          {/* Subclass picker */}
          <Text style={styles.selectorLabel}>Select Subclass</Text>
          <SubclassSelector selected={viewedSubclass} onSelect={setViewedSubclass} />

          {/* Selected subclass header */}
          <View style={styles.headerBlock}>
            <Text style={styles.headerTitle}>{PUGILIST_SUBCLASSES[viewedSubclass]?.name}</Text>
            <Text style={styles.headerSub}>Pugilist Fight Club · Features at levels 3, 6, 11, 17</Text>
          </View>

          {/* Subclass features */}
          {subclassSections.map(section => (
            <View key={section.title}>
              <View style={styles.levelHeaderWrap}>
                <Text style={styles.levelHeader}>{section.title}</Text>
              </View>
              {section.data.map(item => (
                <FeatureItem key={item.id} item={item} />
              ))}
            </View>
          ))}

          {/* Reference table */}
          <Text style={styles.tableTitle}>Class Reference Table</Text>
          <ReferenceTable />
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  tabBar: { flexDirection: 'row', backgroundColor: '#0f3460' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#16213e', borderBottomWidth: 2, borderBottomColor: '#e94560' },
  tabText: { fontSize: 14, color: '#aaa', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  list: { flex: 1, paddingHorizontal: 12 },
  headerBlock: { backgroundColor: '#16213e', borderRadius: 10, padding: 14, marginVertical: 12 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#aaa', fontSize: 12, marginTop: 4 },
  subclassBadge: { color: '#f0c040', fontSize: 12, marginTop: 6 },
  levelHeaderWrap: {
    backgroundColor: '#0f3460', borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 12, marginBottom: 6, marginTop: 8,
  },
  levelHeader: { color: '#4fc3f7', fontSize: 13, fontWeight: 'bold' },
  levelMeta: { color: '#aaa', fontSize: 11, marginTop: 2 },
  featureBlock: { backgroundColor: '#16213e', borderRadius: 8, padding: 12, marginBottom: 6 },
  featureHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featureName: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },
  chevron: { color: '#4fc3f7', fontSize: 12, marginLeft: 8 },
  featureDesc: { color: '#ccc', fontSize: 13, lineHeight: 20, marginTop: 8 },
  levelNone: { color: '#555', fontStyle: 'italic', padding: 12 },

  // Subclass selector
  selectorLabel: { color: '#aaa', fontSize: 12, marginTop: 12, marginBottom: 6 },
  selectorRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  selectorChip: {
    backgroundColor: '#0f3460', borderRadius: 16,
    paddingHorizontal: 10, paddingVertical: 6,
    marginRight: 6, marginBottom: 6,
  },
  selectorChipActive: { backgroundColor: '#e94560' },
  selectorText: { color: '#aaa', fontSize: 12 },
  selectorTextActive: { color: '#fff', fontWeight: 'bold' },

  // Reference table
  tableTitle: { color: '#e0e0e0', fontSize: 15, fontWeight: 'bold', marginTop: 20, marginBottom: 8 },
  table: { borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  tableRow: { flexDirection: 'row', backgroundColor: '#16213e', paddingVertical: 6, paddingHorizontal: 4 },
  tableRowAlt: { backgroundColor: '#1a2540' },
  tableHeader: { backgroundColor: '#0f3460' },
  tableCell: { color: '#ccc', fontSize: 11, paddingHorizontal: 4 },
  tableCellHeader: { color: '#4fc3f7', fontWeight: 'bold' },
});

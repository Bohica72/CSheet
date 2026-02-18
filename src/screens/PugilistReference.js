import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  SectionList, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import pugilistData from '../data/pugilist.json';

const abilityNames = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

function formatScalingLabel(key) {
  return key
    .split('_')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function getFeaturesByLevel(classData) {
  const result = [];
  const maxLevel = 20;

  for (let level = 1; level <= maxLevel; level++) {
    const featureIds = classData.levelFeatures?.[level] || [];
    const features = featureIds
      .map(id => classData.featureDefinitions[id])
      .filter(Boolean);

    result.push({
      level,
      features,
    });
  }

  return result;
}

export default function PugilistReference() {
  const [tab, setTab] = useState('class');

  const levels = useMemo(() => getFeaturesByLevel(pugilistData), []);
  const scalingKeys = Object.keys(pugilistData.scaling || {});

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'class' && styles.tabActive]}
          onPress={() => setTab('class')}
        >
          <Text style={[styles.tabText, tab === 'class' && styles.tabTextActive]}>
            Class
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'subclasses' && styles.tabActive]}
          onPress={() => setTab('subclasses')}
        >
          <Text style={[styles.tabText, tab === 'subclasses' && styles.tabTextActive]}>
            Subclasses
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      {tab === 'class' ? (
        <SectionList
          style={styles.content}
          sections={levels.map(({ level, features }) => ({
            title: `Level ${level}`,
            data: features.length ? features : [{ id: `none_${level}`, name: null, description: null }],
          }))}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <View>
              <View style={styles.section}>
                <Text style={styles.title}>{pugilistData.name}</Text>
                <Text style={styles.subtitle}>Hit Die: d{pugilistData.hitDie}</Text>
              </View>
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.levelHeaderWrap}>
              <Text style={styles.levelHeader}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => {
            if (!item.name) {
              return <Text style={styles.levelNone}>No new features.</Text>;
            }
            return (
              <View style={styles.featureBlock}>
                <Text style={styles.featureName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.featureDesc}>
                    {item.description.length > 240 ? item.description.slice(0, 240) + '…' : item.description}
                  </Text>
                ) : null}
              </View>
            );
          }}
        />
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subclasses</Text>
            {pugilistData.subclasses?.map(sub => (
              <View key={sub.id} style={styles.subclassBlock}>
                <Text style={styles.subclassName}>{sub.name}</Text>
                {sub.shortName && (
                  <Text style={styles.subclassShort}>{sub.shortName}</Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#444', 
    zIndex: 10,
    elevation: 10,
    position: 'relative'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  levelHeaderWrap: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  levelHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelNone: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  featureBlock: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featureName: {
    fontSize: 15,
    fontWeight: '600',
  },
  featureDesc: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  subclassBlock: {
    marginBottom: 12,
  },
  subclassName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subclassShort: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
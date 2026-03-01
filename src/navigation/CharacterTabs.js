import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, StyleSheet, SafeAreaView, Keyboard, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, sharedStyles } from '../styles/theme';
import { Character } from '../models/Character';

import OverviewScreen  from '../screens/OverviewScreen';
import SkillsScreen    from '../screens/SkillsScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ReferenceScreen from '../screens/ReferenceScreen';
import { saveCharacter } from '../utils/CharacterStore';


import { getClassData } from '../utils/ClassStore';
import MagicScreen from '../screens/MagicScreen';

export default function CharacterTabs({ route }) {
  const raw = route.params.character;
  const character = raw instanceof Character ? raw : new Character(raw);

  // 1. Derive class data
  const classData = getClassData(character.classId);

  // 2. ALL useState hooks — must come before any conditionals or early returns
  const [activeTab, setActiveTab]           = useState('Overview');
  const [menuVisible, setMenuVisible]       = useState(false);
  const [restCallback, setRestCallback]     = useState(null);
  const [levelUpCallback, setLevelUpCallback] = useState(null);
  const [createWeaponVisible, setCreateWeaponVisible] = useState(false);
  const [weaponName, setWeaponName] = useState('');
  const [weaponType, setWeaponType] = useState('');
  const [weaponDice, setWeaponDice] = useState('1d6');
  const [weaponModifier, setWeaponModifier] = useState('str');
  const [weaponDescription, setWeaponDescription] = useState('');
  const [weaponBonusWeapon, setWeaponBonusWeapon] = useState('0');
  const [weaponAttunement, setWeaponAttunement] = useState(false);

const resetAndClose = () => {
  setWeaponName('');
  setWeaponType('');
  setWeaponDice('1d6');
  setWeaponModifier('str');
  setWeaponBonusWeapon('0');
  setWeaponAttunement(false);
  setWeaponDescription('');
  setCreateWeaponVisible(false);
};


const handleSaveCustomWeapon = async () => {
  Keyboard.dismiss();
  if (!weaponName.trim()) {
    Alert.alert('Missing Name', 'Please give your weapon a name.');
    return;
  }
  if (!weaponType) {
    Alert.alert('Missing Type', 'Please choose a weapon type.');
    return;
  }

  const newEntry = {
    itemName: weaponName.trim(),
    quantity: 1,
    equipped: false,
    attuned: false,
    charges: null,
    // Fields that mirror the weapon format so the app treats it correctly
    isCustomWeapon: true,
    Name: weaponName.trim(),       // needed by getItemByName lookups
    ObjectType: 'Weapon',          // THIS is what fixes the equipped list
    Type: weaponType,
    damageDie: weaponDice,
    modifier: weaponModifier,
    BonusWeapon: parseInt(weaponBonusWeapon, 10),
    Attunement: weaponAttunement ? 'Yes' : 'No',
    description: weaponDescription.trim(),
    Description: weaponDescription.trim(), // both cases for safety
  };

  

 // 3. Update and Save
  try {
    const updatedInventory = [...(character.inventory ?? []), newEntry];
    character.inventory = updatedInventory;
    
    await saveCharacter(character);
    resetAndClose();
  } catch (error) {
    Alert.alert("Error", "Failed to save weapon.");
    console.error(error);
  }
};




  // 3. Build SCREENS and TABS after hooks
  const SCREENS = {
    Overview:  OverviewScreen,
    Skills:    SkillsScreen,
    Inventory: InventoryScreen,
    Reference: ReferenceScreen,
    ...(classData?.spellcaster ? { Magic: MagicScreen } : {}),
  };

  const TABS = [
    { key: 'Overview',  label: 'Overview',  icon: 'person-outline'    },
    { key: 'Skills',    label: 'Skills',    icon: 'list-outline'      },
    { key: 'Inventory', label: 'Inventory', icon: 'bag-outline'       },
    { key: 'Reference', label: 'Reference', icon: 'book-outline'      },
    ...(classData?.spellcaster ? [{ key: 'Magic', label: 'Magic', icon: 'sparkles-outline' }] : []),
  ];

  // 4. Derive ActiveScreen — safe now because SCREENS and activeTab both exist
  const ActiveScreen = SCREENS[activeTab];

  // 5. Optional: guard against undefined (can remove once confirmed working)
  if (!ActiveScreen) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Unknown tab: {activeTab}</Text>

        
      </SafeAreaView>
    );
  }



  return (
    <SafeAreaView style={styles.container}>

    <Modal visible={createWeaponVisible} transparent animationType="slide">
  <View style={sharedStyles.modalOverlay}>
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">

      <View style={sharedStyles.modalBox}>
        <Text style={sharedStyles.modalTitle}>Create Custom Weapon</Text>

        {/* Weapon Name */}
        <Text style={styles.weaponLabel}>Weapon Name</Text>
        <TextInput
          style={sharedStyles.input}
          placeholder="e.g. Ancestral Blade"
          placeholderTextColor={colors.textDisabled}
          value={weaponName}
          onChangeText={setWeaponName}
        />

        {/* Weapon Type */}
<Text style={styles.weaponLabel}>Weapon Type</Text>
<View style={styles.chipGrid}>
  {['Simple', 'Martial', 'Light', 'Heavy', 'Finesse', 'Ranged', 'Thrown', 'Versatile', 'Two-Handed'].map(type => (
    <TouchableOpacity
      key={type}
      style={[styles.typeChip, weaponType === type && styles.typeChipActive]}
      onPress={() => setWeaponType(type)}
    >
      <Text style={[styles.typeChipText, weaponType === type && styles.typeChipTextActive]}>
        {type}
      </Text>
    </TouchableOpacity>
  ))}
</View>

{/* Damage Dice */}
<Text style={styles.weaponLabel}>Base Damage Dice</Text>
<View style={styles.chipGrid}>
  {['1d4', '1d6', '1d8', '1d10', '1d12', '2d6'].map(die => (
    <TouchableOpacity
      key={die}
      style={[styles.typeChip, weaponDice === die && styles.typeChipActive]}
      onPress={() => setWeaponDice(die)}
    >
      <Text style={[styles.typeChipText, weaponDice === die && styles.typeChipTextActive]}>
        {die}
      </Text>
    </TouchableOpacity>
  ))}
</View>

{/* Modifier */}
<Text style={styles.weaponLabel}>Ability Modifier</Text>
<View style={styles.chipGrid}>
  {['str', 'dex', 'int', 'wis', 'cha'].map(mod => (
    <TouchableOpacity
      key={mod}
      style={[styles.typeChip, weaponModifier === mod && styles.typeChipActive]}
      onPress={() => setWeaponModifier(mod)}
    >
      <Text style={[styles.typeChipText, weaponModifier === mod && styles.typeChipTextActive]}>
        {mod.toUpperCase()}
      </Text>
    </TouchableOpacity>
  ))}
</View>
{/* Attack Bonus */}
<Text style={styles.weaponLabel}>Attack / Damage Bonus</Text>
<View style={styles.chipGrid}>
  {['0', '1', '2', '3'].map(bonus => (
    <TouchableOpacity
      key={bonus}
      style={[styles.typeChip, weaponBonusWeapon === bonus && styles.typeChipActive]}
      onPress={() => setWeaponBonusWeapon(bonus)}
    >
      <Text style={[styles.typeChipText, weaponBonusWeapon === bonus && styles.typeChipTextActive]}>
        +{bonus}
      </Text>
    </TouchableOpacity>
  ))}
</View>

{/* Attunement */}
<TouchableOpacity
  style={[styles.typeChip, weaponAttunement && styles.typeChipActive, { marginBottom: spacing.md }]}
  onPress={() => setWeaponAttunement(prev => !prev)}
>
  <Text style={[styles.typeChipText, weaponAttunement && styles.typeChipTextActive]}>
    {weaponAttunement ? '✓ Requires Attunement' : 'Requires Attunement'}
  </Text>
</TouchableOpacity>



        {/* Description */}
        <Text style={styles.weaponLabel}>Description (optional)</Text>
        <TextInput
          style={[sharedStyles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Describe your weapon..."
          placeholderTextColor={colors.textDisabled}
          value={weaponDescription}
          onChangeText={setWeaponDescription}
          multiline
        />

        <TouchableOpacity style={sharedStyles.primaryButton} onPress={handleSaveCustomWeapon}>
          <Text style={sharedStyles.primaryButtonText}>Save to Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCreateWeaponVisible(false)} style={{ marginTop: spacing.md }}>
          <Text style={sharedStyles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </View>
</Modal>


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
            {character.race ? ` · ${character.race}` : ''}
          </Text>
        </View>

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
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
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
    onPress={() => { setMenuVisible(false); setTimeout(() => levelUpCallback?.(), 300); }}
  >
    <Ionicons name="arrow-up-circle" size={20} color={colors.gold} />
    <Text style={styles.menuItemText}>Level Up</Text>
  </TouchableOpacity>



  <View style={styles.menuDivider} />

  <TouchableOpacity
    style={styles.menuItem}
    onPress={() => { setMenuVisible(false); setTimeout(() => restCallback?.(), 300); }}
  >
    <Ionicons name="moon" size={20} color={colors.accentSoft} />
    <Text style={styles.menuItemText}>Take a Rest</Text>
  </TouchableOpacity>

  <View style={styles.menuDivider} />

  {/* THIS IS WHAT'S MISSING */}
  <TouchableOpacity
    style={styles.menuItem}
    onPress={() => { setMenuVisible(false); setTimeout(() => setCreateWeaponVisible(true), 300); }}
  >
    <Ionicons name="construct-outline" size={20} color={colors.accentSoft} />
    <Text style={styles.menuItemText}>Create Weapon</Text>
  </TouchableOpacity>
</View>

        </TouchableOpacity>
      </Modal>

      <View style={styles.menuDivider} />


    </SafeAreaView>
  );  // ← end of return
}   // ← end of function

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

  weaponLabel: {
  color: colors.textMuted,
  fontSize: 11,
  fontWeight: 'bold',
  letterSpacing: 1,
  textTransform: 'uppercase',
  marginBottom: spacing.xs,
},
typeChip: {
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderRadius: radius.sm,
  backgroundColor: colors.surfaceDeep,
  borderWidth: 1,
  borderColor: 'transparent',
  marginRight: spacing.xs,
},
typeChipActive: {
  borderColor: colors.accent,
  backgroundColor: colors.surface,
},
typeChipText: {
  color: colors.textMuted,
  fontSize: 12,
  fontWeight: '600',
},
typeChipTextActive: {
  color: colors.accent,
},

chipGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: spacing.xs,
  marginBottom: spacing.md,
},


});

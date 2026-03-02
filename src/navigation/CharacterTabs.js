import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, TextInput, Alert, StyleSheet, SafeAreaView, Keyboard, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, sharedStyles,shadows } from '../styles/theme';
import { Character } from '../models/Character';

import OverviewScreen  from '../screens/OverviewScreen';
import SkillsScreen    from '../screens/SkillsScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ReferenceScreen from '../screens/ReferenceScreen';
import { saveCharacter } from '../utils/CharacterStore';


import { getClassData } from '../utils/ClassStore';
import MagicScreen from '../screens/MagicScreen';

export default function CharacterTabs({ route, navigation }) {
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
    equipped: true, // Auto-equip so it immediately shows on OverviewScreen!
    attuned: weaponAttunement,
    charges: null,
    isCustomWeapon: true,
    Name: weaponName.trim(),       
    ObjectType: 'Weapon',          
    Type: weaponType,
    damageDie: weaponDice,
    modifier: weaponModifier,
    BonusWeapon: parseInt(weaponBonusWeapon, 10),
    Attunement: weaponAttunement ? 'Yes' : 'No',
    description: weaponDescription.trim(),
    Description: weaponDescription.trim(), 
  };

  try {
    // 1. Create a fresh clone of the character to force React to re-render
    const updatedCharacter = Object.assign(new Character(character), character);
    
    // 2. Add the weapon to the new inventory array
    updatedCharacter.inventory = [...(updatedCharacter.inventory ?? []), newEntry];
    
    // 3. Save to device storage
    await saveCharacter(updatedCharacter);
    
    // 4. Force React Navigation to update, instantly revealing the weapon on all tabs!
    navigation.setParams({ character: updatedCharacter });
    
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
<View style={styles.attunementRow}>
  <Text style={styles.weaponLabel}>Requires Attunement</Text>
  <Switch
    value={weaponAttunement}
    onValueChange={setWeaponAttunement}
    trackColor={{ false: colors.surfaceDeep, true: colors.accentDim }}
    thumbColor={weaponAttunement ? colors.accent : colors.textMuted}
  />
</View>




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
  backgroundColor: colors.accent, // Fills the button with your accent color
},
typeChipText: {
  color: colors.textMuted,
  fontSize: 12,
  fontWeight: '600',
},
typeChipTextActive: {
  color: colors.background, // Turns the text to your dark/light background color for high contrast
},

chipGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: spacing.xs,
  marginBottom: spacing.md,
},
// Add or replace these in your StyleSheet.create({})
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center', // This ensures horizontal centering
    paddingVertical: spacing.xl,
    width: '100%', // Force full width
  },
  fancyModalBox: {
    width: '90%', // Controls modal width reliably
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceDeep,
    ...shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceDeep,
    paddingBottom: spacing.sm,
  },
  modalTitleLarge: {
    ...typography.heading,
    fontSize: 20,
    color: colors.textPrimary,
  },
  inputSection: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.label,
    color: colors.accent,
    marginBottom: spacing.xs,
    fontSize: 10,
  },
  themedInput: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  miniChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  miniChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceDeep,
    minWidth: 45,
    alignItems: 'center',
  },
  miniChipActive: {
    backgroundColor: colors.accentSoft,
  },
  miniChipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
  },
  miniChipTextActive: {
    color: colors.background,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
    backgroundColor: colors.surfaceDeep,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: spacing.xs,
    borderRadius: radius.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
  },
  toggleBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: colors.background,
  },
  bonusPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bonusLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  bonusNum: {
    fontSize: 14,
    color: colors.textDisabled,
    fontWeight: 'bold',
  },
  bonusNumActive: {
    color: colors.gold,
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelLink: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  cancelLinkText: {
    color: colors.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },

attunementRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: spacing.md,
},

});

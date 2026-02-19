import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchItems, getItemByName } from '../utils/ItemStore';
import { getEquippedBonuses, MAX_ATTUNEMENT } from '../utils/BonusEngine';
import ItemCard from '../components/ItemCard';
import { saveCharacter } from '../utils/CharacterStore';
import { colors, spacing, radius, typography, shadows, sharedStyles } from '../styles/theme';

function rarityColor(rarity) {
  if (!rarity) return colors.rarity.common;
  const key = rarity.toLowerCase().replace(/\s/g, '');
  return colors.rarity[key] ?? colors.rarity.common;
}

export default function InventoryScreen({ route }) {
  const { character } = route.params;

  const [inventory, setInventory]         = useState(character.inventory ?? []);
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem]   = useState(null);

  const { attunedCount } = getEquippedBonuses(inventory);

  const updateInventory = useCallback(async (newInventory) => {
    setInventory(newInventory);
    character.inventory = newInventory;
    await saveCharacter(character);
  }, [character]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    setSearchResults(searchItems(text));
  };

  const handleAddItem = (item) => {
    const existing = inventory.find(e => e.itemName === item.Name);
    if (existing) {
      updateInventory(inventory.map(e =>
        e.itemName === item.Name ? { ...e, quantity: e.quantity + 1 } : e
      ));
    } else {
      updateInventory([...inventory, {
        itemName: item.Name,
        quantity: 1,
        equipped: false,
        attuned: false,
        charges: item.Charges ?? null,
      }]);
    }
    setSelectedItem(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleToggleEquip = (itemName) => {
    const entry    = inventory.find(e => e.itemName === itemName);
    const itemData = getItemByName(itemName);
    if (!entry.equipped && itemData?.Attunement === 'Yes' && attunedCount >= MAX_ATTUNEMENT) {
      Alert.alert('Attunement Full', `You can only be attuned to ${MAX_ATTUNEMENT} items at once.`);
      return;
    }
    updateInventory(inventory.map(e =>
      e.itemName === itemName
        ? { ...e, equipped: !e.equipped, attuned: !e.equipped && itemData?.Attunement === 'Yes' }
        : e
    ));
  };

  const handleQuantityChange = (itemName, val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) return;
    if (num === 0) {
      Alert.alert('Remove Item', `Remove ${itemName} from inventory?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive',
          onPress: () => updateInventory(inventory.filter(e => e.itemName !== itemName)) },
      ]);
    } else {
      updateInventory(inventory.map(e =>
        e.itemName === itemName ? { ...e, quantity: num } : e
      ));
    }
  };

  const handleChargeChange = (itemName, val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) return;
    updateInventory(inventory.map(e =>
      e.itemName === itemName ? { ...e, charges: num } : e
    ));
  };

  const renderInventoryItem = ({ item: entry }) => {
    const itemData  = getItemByName(entry.itemName);
    const rColor    = rarityColor(itemData?.Rarity);
    return (
      <View style={[styles.inventoryRow, { borderLeftColor: rColor }]}>
        <View style={styles.inventoryTop}>
          <View style={styles.inventoryTitleRow}>
            <Text style={styles.inventoryName}>{entry.itemName}</Text>
            {itemData?.Rarity && (
              <Text style={[styles.rarityBadge, { color: rColor }]}>
                {itemData.Rarity}
              </Text>
            )}
          </View>
          {itemData?.ObjectType && (
            <Text style={styles.itemType}>{itemData.ObjectType}</Text>
          )}
        </View>

        <View style={styles.inventoryControls}>
          {/* Quantity */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>QTY</Text>
            <TextInput
              style={styles.controlInput}
              keyboardType="numeric"
              value={String(entry.quantity)}
              onChangeText={(v) => handleQuantityChange(entry.itemName, v)}
            />
          </View>

          {/* Charges */}
          {entry.charges !== null && (
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>CHARGES</Text>
              <View style={styles.chargeRow}>
                <Ionicons name="flash" size={10} color={colors.gold} />
                <TextInput
                  style={[styles.controlInput, { color: colors.gold }]}
                  keyboardType="numeric"
                  value={String(entry.charges)}
                  onChangeText={(v) => handleChargeChange(entry.itemName, v)}
                />
              </View>
            </View>
          )}

          {/* Equip */}
          <TouchableOpacity
            style={[styles.equipButton, entry.equipped && styles.equipButtonActive]}
            onPress={() => handleToggleEquip(entry.itemName)}
          >
            <Ionicons
              name={entry.equipped ? 'shield-checkmark' : 'shield-outline'}
              size={12}
              color={entry.equipped ? colors.textPrimary : colors.textMuted}
            />
            <Text style={[styles.equipButtonText, entry.equipped && styles.equipButtonTextActive]}>
              {entry.equipped ? 'Equipped' : 'Equip'}
            </Text>
          </TouchableOpacity>
        </View>

        {entry.attuned && (
          <View style={styles.attunedRow}>
            <Ionicons name="sparkles" size={10} color={colors.gold} />
            <Text style={styles.attunedText}>Attuned</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={sharedStyles.screen}>

      {/* Attunement bar */}
      <View style={styles.attunementBar}>
        <Ionicons name="sparkles" size={14} color={colors.gold} />
        <Text style={styles.attunementText}>
          Attunement  {attunedCount} / {MAX_ATTUNEMENT}
        </Text>
        <View style={styles.attunementPips}>
          {Array.from({ length: MAX_ATTUNEMENT }).map((_, i) => (
            <View
              key={i}
              style={[styles.attunementPip, i < attunedCount && styles.attunementPipFilled]}
            />
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items to add..."
          placeholderTextColor={colors.textDisabled}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          {searchResults.map((item, index) => (
            <TouchableOpacity
              key={`${item.Name}-${index}`}
              style={styles.searchResultRow}
              onPress={() => { setSelectedItem(item); setSearchResults([]); }}
            >
              <View style={styles.searchResultLeft}>
                <Text style={styles.searchResultName}>{item.Name}</Text>
                <Text style={styles.searchResultType}>{item.ObjectType}</Text>
              </View>
              {item.Rarity && (
                <Text style={[styles.searchResultRarity, { color: rarityColor(item.Rarity) }]}>
                  {item.Rarity}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Inventory list */}
      <FlatList
        data={inventory}
        keyExtractor={(item, index) => `${item.itemName}-${index}`}
        renderItem={renderInventoryItem}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={40} color={colors.textDisabled} />
            <Text style={styles.emptyText}>No items in inventory</Text>
            <Text style={styles.emptySubtext}>Search above to add items</Text>
          </View>
        }
      />

      <ItemCard
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAdd={handleAddItem}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  // Attunement bar
  attunementBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceDeep,
  },
  attunementText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
    flex: 1,
  },
  attunementPips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  attunementPip: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: 'transparent',
  },
  attunementPipFilled: {
    backgroundColor: colors.gold,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    margin: spacing.md,
    marginBottom: 4,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: spacing.sm,
  },
  searchResults: {
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: spacing.md,
    borderRadius: radius.sm,
    marginBottom: 4,
    maxHeight: 220,
    ...shadows.card,
  },
  searchResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceDeep,
  },
  searchResultLeft: { flex: 1 },
  searchResultName: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  searchResultType: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  searchResultRarity: { fontSize: 11, fontWeight: 'bold' },

  // Inventory rows
  inventoryRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    ...shadows.card,
  },
  inventoryTop: { marginBottom: spacing.sm },
  inventoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inventoryName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  rarityBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  itemType: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  inventoryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  controlGroup: { alignItems: 'center' },
  controlLabel: {
    ...typography.label,
    marginBottom: 2,
  },
  controlInput: {
    backgroundColor: colors.surfaceDeep,
    color: colors.textPrimary,
    borderRadius: radius.sm,
    width: 44,
    textAlign: 'center',
    padding: spacing.xs,
    fontSize: 14,
  },
  chargeRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  equipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  equipButtonActive: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  equipButtonText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  equipButtonTextActive: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  attunedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  attunedText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: spacing.md,
  },
  emptySubtext: {
    color: colors.textDisabled,
    fontSize: 13,
    marginTop: spacing.xs,
  },
});

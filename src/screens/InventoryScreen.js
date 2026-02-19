import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchItems } from '../utils/ItemStore';
import { getEquippedBonuses, MAX_ATTUNEMENT } from '../utils/BonusEngine';
import ItemCard from '../components/ItemCard';
import { saveCharacter } from '../utils/CharacterStore';

export default function InventoryScreen({ route }) {
  const { character } = route.params;

  const [inventory, setInventory] = useState(character.inventory ?? []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const { attunedCount } = getEquippedBonuses(inventory);

  // Persist inventory changes
  const updateInventory = useCallback(async (newInventory) => {
    setInventory(newInventory);
    character.inventory = newInventory;
    await saveCharacter(character);
  }, [character]);

  // Search handler
  const handleSearch = (text) => {
    setSearchQuery(text);
    setSearchResults(searchItems(text));
  };

  // Add item from ItemCard
  const handleAddItem = (item) => {
    const existing = inventory.find(e => e.itemName === item.Name);
    if (existing) {
      // Increment quantity if already present
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

  // Toggle equipped
  const handleToggleEquip = (itemName) => {
    const entry = inventory.find(e => e.itemName === itemName);
    const itemData = searchItems(itemName, 1)[0]; // get CSV data
    // Attunement check
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

  // Update quantity
  const handleQuantityChange = (itemName, val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) return;
    if (num === 0) {
      Alert.alert('Remove Item', `Remove ${itemName} from inventory?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () =>
          updateInventory(inventory.filter(e => e.itemName !== itemName))
        },
      ]);
    } else {
      updateInventory(inventory.map(e =>
        e.itemName === itemName ? { ...e, quantity: num } : e
      ));
    }
  };

  // Update charges
  const handleChargeChange = (itemName, val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) return;
    updateInventory(inventory.map(e =>
      e.itemName === itemName ? { ...e, charges: num } : e
    ));
  };

  const renderInventoryItem = ({ item: entry }) => (
    <View style={styles.inventoryRow}>
      <View style={styles.inventoryMain}>
        <Text style={styles.inventoryName}>{entry.itemName}</Text>
        <View style={styles.inventoryControls}>
          {/* Quantity */}
          <TextInput
            style={styles.qtyInput}
            keyboardType="numeric"
            value={String(entry.quantity)}
            onChangeText={(v) => handleQuantityChange(entry.itemName, v)}
          />
          {/* Charges (if applicable) */}
          {entry.charges !== null && (
            <View style={styles.chargeRow}>
              <Ionicons name="flash" size={12} color="#f0c040" />
              <TextInput
                style={styles.chargeInput}
                keyboardType="numeric"
                value={String(entry.charges)}
                onChangeText={(v) => handleChargeChange(entry.itemName, v)}
              />
            </View>
          )}
          {/* Equip toggle */}
          <TouchableOpacity
            style={[styles.equipButton, entry.equipped && styles.equipButtonActive]}
            onPress={() => handleToggleEquip(entry.itemName)}
          >
            <Text style={styles.equipButtonText}>
              {entry.equipped ? 'Equipped' : 'Equip'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {entry.attuned && (
        <Text style={styles.attunedBadge}>✦ Attuned</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Attunement counter */}
      <View style={styles.attunementBar}>
        <Ionicons name="sparkles" size={14} color="#f0c040" />
        <Text style={styles.attunementText}>
          Attunement: {attunedCount} / {MAX_ATTUNEMENT}
        </Text>
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search items..."
        placeholderTextColor="#666"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Search results dropdown */}
      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          {searchResults.map((item, index) => (
            <TouchableOpacity
              key={`${item.Name}-${index}`}
              style={styles.searchResultRow}
              onPress={() => { setSelectedItem(item); setSearchResults([]); }}
            >
             <Text style={styles.searchResultName}>{item.Name}</Text>
    <Text style={styles.searchResultType}>{item.ObjectType}</Text>
  </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Inventory list */}
      <FlatList
        data={inventory}
          keyExtractor={(item, index) => `${item.itemName}-${index}`}        renderItem={renderInventoryItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No items in inventory. Search above to add.</Text>
        }
      />

      {/* Item detail card */}
      <ItemCard
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAdd={handleAddItem}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 12 },
  attunementBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  attunementText: { color: '#f0c040', marginLeft: 6, fontSize: 13 },
  searchInput: {
    backgroundColor: '#16213e', color: '#fff', borderRadius: 8,
    padding: 10, fontSize: 14, marginBottom: 4,
  },
  searchResults: { backgroundColor: '#0f3460', borderRadius: 8, marginBottom: 8, maxHeight: 200 },
  searchResultRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#16213e' },
  searchResultName: { color: '#fff', fontSize: 13, flex: 1 },
  searchResultType: { color: '#aaa', fontSize: 11 },
  inventoryRow: { backgroundColor: '#16213e', borderRadius: 8, padding: 10, marginBottom: 6 },
  inventoryMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inventoryName: { color: '#fff', fontSize: 14, flex: 1 },
  inventoryControls: { flexDirection: 'row', alignItems: 'center' },
  qtyInput: {
    backgroundColor: '#0f3460', color: '#fff', borderRadius: 6,
    width: 40, textAlign: 'center', padding: 4, marginRight: 8,
  },
  chargeRow: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  chargeInput: {
    backgroundColor: '#0f3460', color: '#f0c040', borderRadius: 6,
    width: 36, textAlign: 'center', padding: 4,
  },
  equipButton: { backgroundColor: '#0f3460', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  equipButtonActive: { backgroundColor: '#e94560' },
  equipButtonText: { color: '#fff', fontSize: 12 },
  attunedBadge: { color: '#f0c040', fontSize: 11, marginTop: 4 },
  emptyText: { color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
});

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveCharacter } from '../utils/CharacterStore';
import { getItemByName } from '../utils/ItemStore';
import { Character } from '../models/Character';
import { initWeaponStore, getWeaponDamageByName } from '../utils/WeaponStore';
import { getClassData } from '../utils/ClassStore';
import { getFeats } from '../utils/DataLoader';
import { applyFeatEffects, FEAT_EFFECTS } from '../data/featEffects';
import { formatFeatSummary } from '../utils/featUtils';
import {
  colors, spacing, radius, typography,
  shadows, sharedStyles
} from '../styles/theme';




function rollDie(faces) {
  return Math.floor(Math.random() * faces) + 1;
}

function BreakdownRow({ label, value, isTotal }) {
  return (
    <View style={[styles.breakdownRow, isTotal && styles.breakdownRowTotal]}>
      <Text style={[styles.breakdownLabel, isTotal && styles.breakdownLabelTotal]}>
        {label}
      </Text>
      <Text style={[styles.breakdownValue, isTotal && styles.breakdownValueTotal]}>
        {value}
      </Text>
    </View>
  );
}

export default function OverviewScreen({ route, onRegisterActions }) {
  const raw       = route.params.character;
  const character = raw instanceof Character ? raw : new Character(raw);
  const classData = getClassData(character.classId);

  const [hpCurrent, setHpCurrent]               = useState(character.hpCurrent);
  const [hpTemp, setHpTemp]                     = useState(character.hpTemp ?? 0);
  const [moxie, setMoxie]                       = useState(character.getMoxieCurrent());
  const [hitDiceRemaining, setHitDiceRemaining] = useState(character.hitDiceRemaining ?? character.level);
  const [inspiration, setInspiration]           = useState(character.inspiration ?? 0);
  const [hpModalVisible, setHpModalVisible]     = useState(false);
  const [hpInput, setHpInput]                   = useState('');
  const [restModalVisible, setRestModalVisible] = useState(false);
  const [hitDiceModalVisible, setHitDiceModalVisible] = useState(false);
  const [diceToSpend, setDiceToSpend]           = useState(1);
  const [lastRollResult, setLastRollResult]     = useState(null);
  const [equippedModalVisible, setEquippedModalVisible] = useState(false);
  const [levelUpModalVisible, setLevelUpModalVisible]   = useState(false);
  const safeLevel = parseInt(character.level, 10) || 1;
  const [characterLevel, setCharacterLevel] = useState(safeLevel);
  const [breakdownModalVisible, setBreakdownModalVisible] = useState(false);
  const [overrideModalVisible, setOverrideModalVisible]   = useState(false);
  const [overrideInput, setOverrideInput]                 = useState('');
  const [weaponStoreReady, setWeaponStoreReady]           = useState(false);
  const [secondWindUsed, setSecondWindUsed] = useState(character.secondWindUsed ?? 0);
  const [actionSurgeUsed, setActionSurgeUsed] = useState(character.actionSurgeUsed ?? 0);
  const [featDetail, setFeatDetail] = useState(null);
  const [featDetailVisible, setFeatDetailVisible] = useState(false);
  const [asiChoice, setAsiChoice]         = useState(null);   // 'asi' or 'feat'
  const [asiStats, setAsiStats]           = useState([]);      // up to 2 stats for ASI
  const [asiStat1, setAsiStat1]           = useState(null);    // first stat
  const [asiStat2, setAsiStat2]           = useState(null);    // second stat (optional)
  const [selectedFeat, setSelectedFeat]   = useState(null);    // chosen feat object
  const [featChoices, setFeatChoices]     = useState({});      // ability choice for feat
  const [featModalVisible, setFeatModalVisible] = useState(false); // stat choice modal
  const [pendingFeat, setPendingFeat]     = useState(null);
  const ASI_LEVELS = {
  default: [4, 8, 12, 16, 19],
  fighter: [4, 6, 8, 12, 14, 16, 19],
  rogue:   [4, 8, 10, 12, 16, 19],
};

const FEATS_BY_NAME = useMemo(() => {
  const all = getFeats();
  return Object.fromEntries(all.map(f => [f.name, f]));
}, []);


const grantsASI = (classId, level) => {
  const levels = ASI_LEVELS[classId] ?? ASI_LEVELS.default;
  return levels.includes(level);
};



  const meetsPrerequisites = (feat, char, newLevel) => {
    if (!feat.prerequisite) return true;
    return feat.prerequisite.every(prereq => {
      if (prereq.level && newLevel < prereq.level) return false;
      if (prereq.ability) {
        return prereq.ability.every(ab =>
          Object.entries(ab).every(([stat, min]) =>
            (char.abilities?.[stat] ?? 0) >= min
          )
        );
      }
      return true;
    });
  };



  const isFighter = character.classId === 'fighter';
  const fighterLevelData = isFighter ? classData?.levels?.[characterLevel] : null;
  const actionSurgeMax = isFighter
    ? character.level >= 17
      ? 2
      : character.level >= 2
      ? 1
      : 0
    : 0;
  const breakdownRef        = useRef(null);
  const overrideKeyRef      = useRef(null);
  const selectedEquippedRef = useRef(null);

  const isBarbarian = character.classId === 'barbarian';
  // Barbarian rage values
// Barbarian rage values - now looking at characterLevel state
  const rageMax = isBarbarian
    ? (classData?.ragesPerRest?.[characterLevel] ?? 0)
    : 0;

  const rageDamageBonus = isBarbarian
    ? (classData?.rageDamage?.[characterLevel] ?? 2)
    : 0;

const [ragesUsed, setRagesUsed] = useState(character.ragesUsed ?? 0);
const [isRaging, setIsRaging]   = useState(character.isRaging ?? false);

const toggleRage = () => {
  if (!isBarbarian || rageMax === 0) return;

  // If already raging, end rage without changing ragesUsed
  if (isRaging) {
    setIsRaging(false);
    persist({ isRaging: false });
    return;
  }


  // Start a new rage if we have uses left
  if (ragesUsed >= rageMax && rageMax !== 999) return;

  const newUsed = rageMax === 999 ? 0 : ragesUsed + 1;
  setRagesUsed(newUsed);
  setIsRaging(true);
  persist({ ragesUsed: newUsed, isRaging: true });
};


  useEffect(() => {
    initWeaponStore().then(() => setWeaponStoreReady(true));
  }, []);

  useEffect(() => {
    onRegisterActions?.({
      openRest:    () => setRestModalVisible(true),
      openLevelUp: () => setLevelUpModalVisible(true),
    });
  }, []);


// 1. Fetch the raw attacks from the character model
  const rawAttacks = weaponStoreReady
    ? (character.getEquippedWeaponAttacks?.() ?? [])
    : [];

  // 2. Map over them to inject the base damage from the WeaponStore
  const equippedAttacks = rawAttacks.map(atk => {
    // Pass the name directly, exactly as InventoryScreen does!
    const dmgInfo = getWeaponDamageByName(atk.name);
    
    return {
      ...atk,
      // Grab the dice string (e.g., '1d8') and type (e.g., 'slashing')
      damageDie: dmgInfo ? dmgInfo.dice : (atk.damageDie ?? '—'),
      damageType: dmgInfo ? dmgInfo.type : '',
    };
  });

  const moxieMax    = character.getMoxieMax();
  const hitDice     = character.getHitDice();
  const hitDieFaces = parseInt(hitDice.split('d')[1], 10);
  const conMod      = character.getAbilityMod('con');
  const hpPercent   = Math.max(0, hpCurrent / character.hpMax);
  const equippedItems = (character.inventory ?? []).filter(i => i.equipped);



  const persist = async (updates) => {
    Object.assign(character, updates);
    await saveCharacter(character);
  };

  const hpBarColor = hpPercent > 0.5
    ? colors.success
    : hpPercent > 0.25
      ? colors.warning
      : colors.accent;

  const applyHp = (mode) => {
    const val = parseInt(hpInput, 10);
    if (isNaN(val) || val <= 0) return;
    let newHp   = hpCurrent;
    let newTemp = hpTemp;
    if (mode === 'damage') {
      if (newTemp > 0) {
        const absorbed  = Math.min(newTemp, val);
        newTemp         = newTemp - absorbed;
        const remainder = val - absorbed;
        newHp           = Math.max(0, newHp - remainder);
      } else {
        newHp = Math.max(0, newHp - val);
      }
    }
    if (mode === 'healing') newHp   = Math.min(character.hpMax, hpCurrent + val);
    if (mode === 'temp')    newTemp = val;
    setHpCurrent(newHp);
    setHpTemp(newTemp);
    persist({ hpCurrent: newHp, hpTemp: newTemp });
    setHpModalVisible(false);
    setHpInput('');
  };

  const rollHitDice = () => {
    if (diceToSpend < 1 || diceToSpend > hitDiceRemaining) return;
    let total = 0;
    const rolls = [];
    for (let i = 0; i < diceToSpend; i++) {
      const roll = rollDie(hitDieFaces);
      rolls.push(roll);
      total += roll + conMod;
    }
    total = Math.max(0, total);
    const newHp        = Math.min(character.hpMax, hpCurrent + total);
    const newRemaining = hitDiceRemaining - diceToSpend;
    setHpCurrent(newHp);
    setHitDiceRemaining(newRemaining);
    setLastRollResult({ rolls, conMod, total, newHp });
    persist({ hpCurrent: newHp, hitDiceRemaining: newRemaining });
  };

  const closeHitDiceModal = () => {
    setHitDiceModalVisible(false);
    setDiceToSpend(1);
    setLastRollResult(null);
  };

  const doShortRest = () => {
      if (isBarbarian && rageMax !== 0 && rageMax !== 999) {
    const newRagesUsed = Math.max(0, ragesUsed - 1);
    setRagesUsed(newRagesUsed);
    persist({ ragesUsed: newRagesUsed });
  }

    setRestModalVisible(false);
    setTimeout(() => setHitDiceModalVisible(true), 300);
  };

  const doLongRest = () => {
    const newHp    = character.hpMax;
    const newMoxie = moxieMax;
    const newDice  = character.level;
    
    setHpCurrent(newHp);
    setHpTemp(0);
    setMoxie(newMoxie);
    setHitDiceRemaining(newDice);
    
    // THE FIX: Actually update the local state so the UI refreshes instantly!
    if (isBarbarian) {
      setRagesUsed(0);
      setIsRaging(false);
    }

    persist({ 
      hpCurrent: newHp, 
      hpTemp: 0, 
      ragesUsed: 0, 
      isRaging: false, // Automatically turn off rage while sleeping
      moxieCurrent: newMoxie, 
      spellSlotsUsed: {}, 
      hitDiceRemaining: newDice 
    });
    
    setRestModalVisible(false);
    Alert.alert('Long Rest', 'HP, Moxie, Hit Dice, and Rages fully restored.');
  };

const calcLevelUp = () => {
    // 1. Force the current level to be a solid number, no matter what state it's in
    const currentLvl = parseInt(characterLevel, 10) || parseInt(character.level, 10) || 1;
    const newLevel = currentLvl + 1;
    
    if (newLevel > 20) return null;

    const levelData = classData?.levels?.[newLevel];
    const newProfBonus = character._calcProfBonus(newLevel);
    
    // 2. Force hit dice and CON modifier to be solid numbers
    const safeHitDieFaces = parseInt(hitDieFaces, 10) || 12; // Fallback to Barbarian d12
    const safeConMod = parseInt(conMod, 10) || 0;
    
    const hitDieAvg = Math.floor(safeHitDieFaces / 2) + 1;
    const hpIncrease = Math.max(1, hitDieAvg + safeConMod);
    
    // 3. Force HP Max to be a solid number
    const safeHpMax = parseInt(character.hpMax, 10) || 10;
    const newHpMax = safeHpMax + hpIncrease;

    return {
      newLevel,
      newHpMax,
      hpIncrease,
      newProfBonus,
      levelData: levelData ?? {
        fisticuffs: '—',
        moxiePoints: 0,
        features: [],
      },
    };
  };
const doLevelUp = () => {
  const calc = calcLevelUp();
  if (!calc) return;

  const { newLevel, newHpMax, hpIncrease, newProfBonus } = calc;

  const safeHpCurrent     = parseInt(hpCurrent, 10) || parseInt(character.hpCurrent, 10) || 10;
  const newHpCurrent      = safeHpCurrent + hpIncrease;
  const safeDiceRemaining = parseInt(hitDiceRemaining, 10) || parseInt(character.hitDiceRemaining, 10) || 1;
  const newDiceRemaining  = safeDiceRemaining + 1;

  // Base updates
  let updatedAbilities    = { ...character.abilities };
  let updatedFeats        = [...(character.feats ?? [])];
  let updatedProficiencies = { ...character.proficiencies };

  // Apply ASI
  if (asiChoice === 'asi' && asiStats.length > 0) {
    if (asiStats.length === 1) {
      updatedAbilities[asiStats[0]] = (updatedAbilities[asiStats[0]] ?? 10) + 2;
    } else {
      for (const stat of asiStats) {
        updatedAbilities[stat] = (updatedAbilities[stat] ?? 10) + 1;
      }
    }
  }

  // Apply feat
  if (asiChoice === 'feat' && selectedFeat) {
    const applied = applyFeatEffects(
      { ...character, abilities: updatedAbilities, proficiencies: updatedProficiencies },
      selectedFeat.name,
      featChoices
    );
    updatedAbilities     = applied.abilities;
    updatedProficiencies = applied.proficiencies;
    updatedFeats.push({
      name:        selectedFeat.name,
      source:      selectedFeat.source,
      takenAtLevel: newLevel,
    });
  }

  // Update local state
  setCharacterLevel(newLevel);
  setHpCurrent(newHpCurrent);
  setHitDiceRemaining(newDiceRemaining);

  // Update character instance immediately
  character.level            = newLevel;
  character.hpMax            = newHpMax;
  character.hpCurrent        = newHpCurrent;
  character.hitDiceRemaining = newDiceRemaining;
  character.proficiencyBonus = newProfBonus;
  character.abilities        = updatedAbilities;
  character.feats            = updatedFeats;
  character.proficiencies    = updatedProficiencies;

  // Persist
  persist({
    level:            newLevel,
    hpMax:            newHpMax,
    hpCurrent:        newHpCurrent,
    hitDiceRemaining: newDiceRemaining,
    proficiencyBonus: newProfBonus,
    abilities:        updatedAbilities,
    feats:            updatedFeats,
    proficiencies:    updatedProficiencies,
  });

  // Reset choice state
  setAsiChoice(null);
  setAsiStats([]);
  setAsiStat1(null);
  setAsiStat2(null);
  setSelectedFeat(null);
  setFeatChoices({});
  setLevelUpModalVisible(false);
};

  
  const getItemBonusSummary = (item) => {
    if (!item) return null;
    const parts = [];
    if (item.BonusAC)     parts.push(`+${item.BonusAC} AC`);
    if (item.BonusWeapon) parts.push(`+${item.BonusWeapon} ATK/DMG`);
    if (item.BonusStr)    parts.push(`+${item.BonusStr} STR`);
    if (item.BonusDex)    parts.push(`+${item.BonusDex} DEX`);
    if (item.BonusCon)    parts.push(`+${item.BonusCon} CON`);
    if (item.BonusInt)    parts.push(`+${item.BonusInt} INT`);
    if (item.BonusWis)    parts.push(`+${item.BonusWis} WIS`);
    if (item.BonusCha)    parts.push(`+${item.BonusCha} CHA`);
    if (item.bonusAC)     parts.push(`+${item.bonusAC} AC`);
    if (item.bonusWeapon) parts.push(`+${item.bonusWeapon} ATK/DMG`);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        
        {/* TOP ROW: HP + HIT DICE */}
        <View style={styles.topRow}>
          
          {/* HP: 2/3 width */}
          <TouchableOpacity
            style={styles.hpBarContainer}
    onPress={() => {
      setHpInput('');
      setHpModalVisible(true);
    }}
    activeOpacity={0.8}
  >
    <View style={styles.hpBarHeader}>
      <Text style={styles.hpBarLabel}>HIT POINTS</Text>
      <Text style={styles.hpBarValue}>
        {hpCurrent} <Text style={styles.hpBarMax}>/ {character.hpMax}</Text>
      </Text>
    </View>
    <View style={styles.hpBarTrack}>
      <View
        style={[
          styles.hpBarFill,
          { width: `${hpPercent * 100}%`, backgroundColor: hpBarColor },
        ]}
      />
    </View>
    {hpTemp > 0 && (
      <Text style={styles.hpTempBadge}>+{hpTemp} temporary</Text>
    )}
  </TouchableOpacity>

  {/* Right column: Hit Dice only */}
  <View style={styles.topRightCol}>
    <TouchableOpacity
      style={styles.hitDiceCard}
      onPress={() => setHitDiceModalVisible(true)}
      activeOpacity={0.8}
    >
      <Text style={styles.cardLabel}>HIT DICE</Text>
      <Text style={styles.cardValue}>{hitDiceRemaining}</Text>
      <Text style={styles.cardSub}>
        of {character.level} d{hitDieFaces}
      </Text>
    </TouchableOpacity>
  </View>
</View>

 {/* STATS GRID */}
<Text style={sharedStyles.sectionHeader}>Combat Stats</Text>
<View style={styles.grid}>
  {[
    {
      label: 'AC',
      value: character.getArmorClass(),
      color: colors.accentSoft,
      onLongPress: () => {
        breakdownRef.current = character.getACBreakdown();
        setBreakdownModalVisible(true);
      },
    },
    {
      label: 'Initiative',
      value: `+${character.getInitiativeBonus()}`,
      color: colors.accentSoft,
    },
    {
      label: 'Prof.',
      value: `+${character.proficiencyBonus}`,
      color: colors.accentSoft,
    },
    {
      label: 'Speed',
      value: `${character.speed}ft`,
      color: colors.accentSoft,
    },
    {
      label: 'Pass. Perc',
      value: character.getPassivePerception(),
      color: colors.accentSoft,
    },
    {
      label: 'Inspiration',
      value: inspiration ? '✦' : '—',
      color: colors.gold,
      onPress: () => {
        const newVal = inspiration ? 0 : 1;
        setInspiration(newVal);
        persist({ inspiration: newVal });
      },
    },
    // Fighter-only: always show Second Wind; Action Surge only if level >= 2
    ...(isFighter
      ? [
          {
            label: 'Second Wind',
            value: secondWindUsed ? 'Used' : 'Ready',
            color: secondWindUsed ? colors.textMuted : colors.accentSoft,
            onPress: () => {
              const used = secondWindUsed ? 0 : 1;
              setSecondWindUsed(used);
              persist({ secondWindUsed: used });
            },
          },
          ...(character.level >= 2
            ? [
                {
                  label: 'Action Surge',
                  value: `${actionSurgeUsed}/${actionSurgeMax}`,
                  color: colors.accentSoft,
                  onPress: () => {
                    const next = (actionSurgeUsed + 1) % (actionSurgeMax + 1);
                    setActionSurgeUsed(next);
                    persist({ actionSurgeUsed: next });
                  },
                },
              ]
            : []),
        ]
      : []),
   // Barbarian-only: Rage
      ...(isBarbarian
        ? [
            {
              // Swap label based on state
              label: isRaging ? 'Active' : 'Rage',
              
              // Swap value to a bold RAGING! or the uses remaining
              value: isRaging
                ? 'RAGING!'
                : (rageMax === 999 ? '∞ uses' : `${Math.max(0, rageMax - ragesUsed)}/${rageMax}`),
                
              color: isRaging ? colors.accent : colors.accentSoft,
              
              onPress: () => {
                if (rageMax === 0) return;

                // If already raging, turn it off (doesn't refund the use)
                if (isRaging) {
                  setIsRaging(false);
                  persist({ isRaging: false });
                  return;
                }

                // Start a new rage if we have uses left (ignore cap at 20 with 999)
                if (ragesUsed >= rageMax && rageMax !== 999) return;

                const newUsed = rageMax === 999 ? 0 : ragesUsed + 1;
                setRagesUsed(newUsed);
                setIsRaging(true);
                persist({ ragesUsed: newUsed, isRaging: true });
              },
            },
          ]
        : []),

  ].map((stat) => (
    <TouchableOpacity
      key={stat.label}
      style={styles.gridCell}
      onPress={stat.onPress}
      onLongPress={stat.onLongPress}
      delayLongPress={400}
      activeOpacity={stat.onPress || stat.onLongPress ? 0.7 : 1}
    >
      <Text style={[styles.gridValue, { color: stat.color }]}>{stat.value}</Text>
      <Text style={styles.gridLabel}>{stat.label}</Text>
    </TouchableOpacity>
  ))}
</View>



        {/* ATTACKS */}
        {(() => {
          const unarmed = character.getUnarmedAttack();
          if (!unarmed) return null;
          
          const appliedRageBonus = (isBarbarian && isRaging) ? rageDamageBonus : 0;
          const finalDamageBonus = (unarmed.damageBonus || 0) + appliedRageBonus;

          return (
            <TouchableOpacity
              style={styles.attackRow}
              onLongPress={() => {
                breakdownRef.current = {
                  type:        'attack',
                  ...unarmed,
                  attackTotal: unarmed.attackBonus,
                  appliedRageBonus, // Pass to the modal
                  finalDamageBonus, // Pass to the modal
                };
                setBreakdownModalVisible(true);
              }}
              delayLongPress={400}
              activeOpacity={0.7}
            >
              <View style={styles.attackNameCol}>
                <Text style={styles.attackName}>{unarmed.name}</Text>
                <Text style={styles.attackTag}>{unarmed.tag} · hold for breakdown</Text>
              </View>
              <View style={styles.attackStatCol}>
                <Text style={styles.attackStatLabel}>ATK</Text>
                <Text style={styles.attackStat}>+{unarmed.attackBonus}</Text>
              </View>
              <View style={styles.attackStatCol}>
                <Text style={styles.attackStatLabel}>DMG</Text>
                <Text style={styles.attackStat}>
                  {unarmed.damageDie}{finalDamageBonus >= 0 ? '+' : ''}{finalDamageBonus}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })()}

        {/* ACTIVE FEATS */}
{(character.feats?.length ?? 0) > 0 && (
  <View style={{ marginTop: spacing.lg }}>
    <Text style={sharedStyles.sectionHeader}>Feats
    Feats: {character.feats.map(f => f.name).join(', ')}</Text>
    {character.feats.map((feat, i) => {
      const full = FEATS_BY_NAME[feat.name];
      return (
        <TouchableOpacity
          key={`${feat.name}-${i}`}
          style={styles.featChip}
          delayLongPress={400}
          activeOpacity={0.7}
          onLongPress={() => {
            setFeatDetail(full ?? feat);
            setFeatDetailVisible(true);
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.featChipName}>{feat.name}</Text>
            {full && (
              <Text style={styles.featChipMeta} numberOfLines={1}>
                {formatFeatSummary(full)}
              </Text>
            )}
          </View>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      );
    })}
  </View>
)}


        {equippedAttacks.map((atk, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.attackRow, styles.attackRowWeapon]}
            onLongPress={() => {
              breakdownRef.current = {
                type:             'attack',
                name:             atk.name,
                strMod:           atk.strMod,
                profBonus:        character.proficiencyBonus,
                isProficient:     atk.isProficient,
                magicBonus:       atk.magicBonus,
                attackTotal:      atk.attackBonus,
                damageDie:        atk.damageDie,
                damageBonus:      atk.damageBonus, // Base modifier (STR)
                appliedRageBonus: atk.appliedRageBonus,
                featDamageBonus:  atk.featDamageBonus,
                finalDamageBonus: atk.finalDamageBonus,
              };
              setBreakdownModalVisible(true);
            }}
            delayLongPress={400}
            activeOpacity={0.7}
          >
            <View style={styles.attackNameCol}>
              <Text style={styles.attackName}>{atk.name}</Text>
              <Text style={styles.attackTag}>Weapon · hold for breakdown</Text>
            </View>
            <View style={styles.attackStatCol}>
              <Text style={styles.attackStatLabel}>ATK</Text>
              <Text style={styles.attackStat}>+{atk.attackBonus}</Text>
            </View>
            <View style={styles.attackStatCol}>
              <Text style={styles.attackStatLabel}>DMG</Text>
              <Text style={styles.attackStat}>
                {atk.damageDie}{atk.finalDamageBonus >= 0 ? '+' : ''}{atk.finalDamageBonus} {atk.damageType}
              
              </Text>

            </View>
          </TouchableOpacity>
        ))}


        {equippedAttacks.length === 0 && (
          <Text style={styles.emptyText}>Equip a weapon in Inventory to add attacks</Text>
        
        )}

        

        {/* EQUIPPED ITEMS */}
        <Text style={sharedStyles.sectionHeader}>Equipped Items</Text>

        {equippedItems.length === 0 ? (
          <Text style={styles.emptyText}>No items currently equipped</Text>
        ) : (
          equippedItems.map((item, i) => {
            const fullItem = getItemByName(item.itemName) ?? {};
            const merged   = { ...fullItem, ...item };
            const bonus    = getItemBonusSummary(merged);
            return (
              <TouchableOpacity
                key={i}
                style={styles.equippedRow}
                onLongPress={() => {
                  selectedEquippedRef.current = merged;
                  setEquippedModalVisible(true);
                }}
                delayLongPress={400}
                activeOpacity={0.7}
              >
                <Text style={styles.equippedName} numberOfLines={1}>{item.itemName}</Text>
                {item.attuned && <Text style={styles.attunedBadge}>◈</Text>}
                {bonus        && <Text style={styles.equippedBonus}>{bonus}</Text>}
                <Text style={styles.equippedType}>{fullItem.ObjectType ?? '—'}</Text>
              </TouchableOpacity>
            );
          })
        )}

      </ScrollView>

      {/* HP MODAL */}
      <Modal visible={hpModalVisible} transparent animationType="slide">
        <View style={sharedStyles.modalOverlay}>
          <View style={sharedStyles.modalBox}>
            <Text style={sharedStyles.modalTitle}>Adjust Hit Points</Text>
            <TextInput
              style={[sharedStyles.input, styles.largeInput]}
              keyboardType="numeric"
              value={hpInput}
              onChangeText={setHpInput}
              placeholder="0"
              placeholderTextColor={colors.textDisabled}
              autoFocus
            />
            <Text style={styles.modalHint}>Tap an action to apply</Text>
            <View style={styles.modeRow}>
              {[
                { mode: 'damage',  label: 'Damage',  icon: 'skull-outline' },
                { mode: 'healing', label: 'Heal',    icon: 'heart-outline' },
                { mode: 'temp',    label: 'Temp HP', icon: 'shield-outline' },
              ].map(({ mode, label, icon }) => (
                <TouchableOpacity
                  key={mode}
                  style={styles.modeButton}
                  onPress={() => applyHp(mode)}
                >
                  <Ionicons
                    name={icon}
                    size={20}
                    color={
                      mode === 'damage'  ? colors.accent :
                      mode === 'healing' ? colors.success :
                      colors.accentSoft
                    }
                    style={{ marginBottom: 4 }}
                  />
                  <Text style={styles.modeButtonText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => { setHpModalVisible(false); setHpInput(''); }}>
              <Text style={sharedStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* REST MODAL */}
      <Modal visible={restModalVisible} transparent animationType="fade">
        <View style={sharedStyles.modalOverlay}>
          <View style={sharedStyles.modalBox}>
            <Text style={sharedStyles.modalTitle}>Take a Rest</Text>
            <TouchableOpacity style={styles.restButton} onPress={doShortRest}>
              <Ionicons name="partly-sunny" size={22} color={colors.accentSoft} style={{ marginRight: spacing.md }} />
              <View>
                <Text style={styles.restButtonTitle}>Short Rest</Text>
                <Text style={styles.restButtonSub}>Spend hit dice to recover HP</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.restButton, { borderColor: colors.accentDim }]} onPress={doLongRest}>
              <Ionicons name="moon" size={22} color={colors.gold} style={{ marginRight: spacing.md }} />
              <View>
                <Text style={styles.restButtonTitle}>Long Rest</Text>
                <Text style={styles.restButtonSub}>Restore all HP, Moxie &amp; Hit Dice</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRestModalVisible(false)}>
              <Text style={sharedStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* HIT DICE MODAL */}
      <Modal visible={hitDiceModalVisible} transparent animationType="slide">
        <View style={sharedStyles.modalOverlay}>
          <View style={sharedStyles.modalBox}>
            <Text style={sharedStyles.modalTitle}>Spend Hit Dice</Text>
            <Text style={styles.modalSub}>
              {hitDiceRemaining} / {character.level} d{hitDieFaces} remaining
            </Text>
            <Text style={styles.modalSub}>
              CON {conMod >= 0 ? `+${conMod}` : conMod} added per die
            </Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setDiceToSpend(Math.max(1, diceToSpend - 1))}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{diceToSpend}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setDiceToSpend(Math.min(hitDiceRemaining, diceToSpend + 1))}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            {lastRollResult && (
              <View style={styles.rollResult}>
                <Text style={styles.rollDice}>[{lastRollResult.rolls.join(' + ')}]</Text>
                <Text style={styles.rollMeta}>
                  {conMod >= 0 ? `+${conMod}` : conMod} CON × {lastRollResult.rolls.length}
                </Text>
                <Text style={styles.rollTotal}>
                  +{lastRollResult.total} HP → {lastRollResult.newHp} / {character.hpMax}
                </Text>
              </View>
            )}
            {!lastRollResult ? (
              <TouchableOpacity
                style={[sharedStyles.primaryButton, hitDiceRemaining === 0 && { backgroundColor: colors.textDisabled }]}
                onPress={rollHitDice}
                disabled={hitDiceRemaining === 0}
              >
                <Text style={sharedStyles.primaryButtonText}>Roll {diceToSpend}d{hitDieFaces}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={sharedStyles.primaryButton} onPress={closeHitDiceModal}>
                <Text style={sharedStyles.primaryButtonText}>Done</Text>
              </TouchableOpacity>
            )}
            {!lastRollResult && (
              <TouchableOpacity onPress={closeHitDiceModal}>
                <Text style={sharedStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
<Modal
  visible={featDetailVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setFeatDetailVisible(false)}
>
  <View style={sharedStyles.modalOverlay}>
    <View style={sharedStyles.modalBox}>
      <Text style={sharedStyles.modalTitle}>
        {featDetail?.name ?? 'Feat'}
      </Text>

      {featDetail && (
        <>
          {featDetail.abilityBonus && (
            <Text style={styles.featDetailMeta}>
              {formatFeatSummary(featDetail)}
            </Text>
          )}
           <ScrollView style={{ maxHeight: 260, marginTop: spacing.sm }}>
              <Text style={styles.featDetailText}>
                {Array.isArray(featDetail.entries)
                  ? featDetail.entries
                      .map(e => (typeof e === 'string' ? e : e?.text ?? e?.entries?.join(' ') ?? ''))
                      .join('\n\n')
                  : featDetail.entries ?? 'No description available.'}
              </Text>
           </ScrollView>

        </>
      )}

      <TouchableOpacity
        onPress={() => setFeatDetailVisible(false)}
        style={{ marginTop: spacing.md }}
      >
        <Text style={sharedStyles.cancelText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      {/* EQUIPPED ITEM MODAL */}
      <Modal visible={equippedModalVisible} transparent animationType="fade">
        <View style={sharedStyles.modalOverlay}>
          <View style={sharedStyles.modalBox}>
            <Text style={sharedStyles.modalTitle}>
              {selectedEquippedRef.current?.itemName ?? selectedEquippedRef.current?.Name ?? '—'}
            </Text>
            <Text style={styles.equippedModalType}>
              {selectedEquippedRef.current?.ObjectType ?? '—'}
              {selectedEquippedRef.current?.Rarity ? `  ·  ${selectedEquippedRef.current.Rarity}` : ''}
              {selectedEquippedRef.current?.attuned ? '  ◈ Attuned' : ''}
            </Text>
            {getItemBonusSummary(selectedEquippedRef.current) ? (
              <Text style={styles.equippedModalBonus}>
                {getItemBonusSummary(selectedEquippedRef.current)}
              </Text>
            ) : null}
            {selectedEquippedRef.current?.Description ? (
              <ScrollView style={styles.equippedModalDescScroll}>
                <Text style={styles.equippedModalDesc}>
                  {selectedEquippedRef.current.Description}
                </Text>
              </ScrollView>
            ) : (
              <Text style={styles.equippedModalDesc}>No description available.</Text>
            )}
            <TouchableOpacity
              style={[sharedStyles.primaryButton, { marginTop: spacing.md }]}
              onPress={() => setEquippedModalVisible(false)}
            >
              <Text style={sharedStyles.primaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* LEVEL UP MODAL */}
<Modal visible={levelUpModalVisible} transparent animationType="slide">
  <View style={sharedStyles.modalOverlay}>
    <View style={sharedStyles.modalBox}>
      <Text style={sharedStyles.modalTitle}>Level Up</Text>
      {(() => {
        const calc = calcLevelUp();
        if (!calc) return (
          <Text style={styles.modalSub}>Already at maximum level!</Text>
        );

        const { newLevel, hpIncrease, newProfBonus, levelData } = calc;
        const isASILevel = grantsASI(character.classId, newLevel);

        return (
          <>
            {/* Stats preview */}
            <View style={styles.levelUpPreview}>
              <View style={styles.levelUpRow}>
                <Text style={styles.levelUpLabel}>Level</Text>
                <Text style={styles.levelUpValue}>
                  {characterLevel} → <Text style={{ color: colors.gold }}>{newLevel}</Text>
                </Text>
              </View>
              <View style={styles.levelUpRow}>
                <Text style={styles.levelUpLabel}>Hit Points</Text>
                <Text style={styles.levelUpValue}>
                  +<Text style={{ color: colors.success }}>{hpIncrease}</Text>
                  <Text style={styles.levelUpMeta}>
                    {' '}(avg d{hitDieFaces} {conMod >= 0 ? `+${conMod}` : conMod} CON)
                  </Text>
                </Text>
              </View>
              <View style={styles.levelUpRow}>
                <Text style={styles.levelUpLabel}>Proficiency</Text>
                <Text style={styles.levelUpValue}>
                  +<Text style={{ color: colors.accentSoft }}>{newProfBonus}</Text>
                </Text>
              </View>
              {levelData.fisticuffs != null && (
                <View style={styles.levelUpRow}>
                  <Text style={styles.levelUpLabel}>Fisticuffs</Text>
                  <Text style={styles.levelUpValue}>
                    <Text style={{ color: colors.accent }}>{levelData.fisticuffs}</Text>
                  </Text>
                </View>
              )}
              {levelData.resourceMax != null && (
                <View style={styles.levelUpRow}>
                  <Text style={styles.levelUpLabel}>{classData?.resource?.name ?? 'Resource'}</Text>
                  <Text style={styles.levelUpValue}>
                    <Text style={{ color: colors.gold }}>{levelData.resourceMax}</Text>
                  </Text>
                </View>
              )}
            </View>

            {/* ASI / Feat choice — only shown at appropriate levels */}
            {isASILevel && (
              <View style={styles.asiSection}>
                <Text style={styles.asiTitle}>Ability Score Improvement</Text>

                {/* Toggle buttons */}
                <View style={styles.asiToggle}>
                  <TouchableOpacity
                    style={[styles.asiToggleBtn, asiChoice === 'asi' && styles.asiToggleBtnActive]}
                    onPress={() => { setAsiChoice('asi'); setSelectedFeat(null); setFeatChoices({}); }}
                  >
                    <Text style={[styles.asiToggleText, asiChoice === 'asi' && styles.asiToggleTextActive]}>
                      +2 Ability Score
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.asiToggleBtn, asiChoice === 'feat' && styles.asiToggleBtnActive]}
                    onPress={() => { setAsiChoice('feat'); setAsiStats([]); }}
                  >
                    <Text style={[styles.asiToggleText, asiChoice === 'feat' && styles.asiToggleTextActive]}>
                      Take a Feat
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* ASI stat picker */}
                {asiChoice === 'asi' && (
                  <View>
                    <Text style={styles.asiHint}>
                      {asiStats.length === 0 && 'Tap a stat to add +2, or tap two stats for +1 each'}
                      {asiStats.length === 1 && `+2 ${asiStats[0].toUpperCase()} — or tap another for +1/+1`}
                      {asiStats.length === 2 && `+1 ${asiStats[0].toUpperCase()}, +1 ${asiStats[1].toUpperCase()}`}
                    </Text>
                    <View style={styles.asiStatGrid}>
                      {['str','dex','con','int','wis','cha'].map(stat => {
                        const isChosen = asiStats.includes(stat);
                        return (
                          <TouchableOpacity
                            key={stat}
                            style={[styles.asiStatBtn, isChosen && styles.asiStatBtnActive]}
                            onPress={() => {
                              if (isChosen) {
                                setAsiStats(prev => prev.filter(s => s !== stat));
                              } else if (asiStats.length < 2) {
                                setAsiStats(prev => [...prev, stat]);
                              }
                            }}
                          >
                            <Text style={[styles.asiStatLabel, isChosen && styles.asiStatLabelActive]}>
                              {stat.toUpperCase()}
                            </Text>const full = featByName[feat.name];
                            <Text style={[styles.asiStatScore, isChosen && styles.asiStatLabelActive]}>
                              {character.abilities?.[stat] ?? 10}
                              {isChosen && (
                                <Text style={{ color: colors.success }}>
                                  {asiStats.length === 1 ? '+2' : '+1'}
                                </Text>
                              )}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Feat picker */}
                {asiChoice === 'feat' && (
                  <ScrollView style={{ maxHeight: 240 }}>
                    {getFeats()
                      .filter(f =>
                        f.source === 'XPHB' &&
                        f.category !== 'O' &&        // exclude background feats
                        f.category !== 'EB' &&       // exclude epic boons
                        meetsPrerequisites(f, character, newLevel) &&
                        !(character.feats ?? []).some(cf => cf.name === f.name)
                      )
                      .map(feat => {
                        const isSelected = selectedFeat?.name === feat.name;
                        return (
                          <TouchableOpacity
                            key={feat.name}
                            style={[styles.featRow, isSelected && styles.featRowSelected]}
                            onPress={() => {
                              const effect = FEAT_EFFECTS[feat.name];
                              if (effect?.abilityBonus?.type === 'choice') {
                                setPendingFeat(feat);
                                setFeatModalVisible(true);
                              } else {
                                setSelectedFeat(feat);
                                setFeatChoices({});
                              }
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={styles.featName}>{feat.name}</Text>
                              <Text style={styles.featMeta}>{formatFeatSummary(feat)}</Text>
                            </View>
                            {isSelected && (
                              <Ionicons name="checkmark" size={18} color={colors.accent} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                  </ScrollView>
                )}
              </View>
            )}

            {/* Confirm button — disabled if ASI level but no choice made */}
            <TouchableOpacity
              style={[
                sharedStyles.primaryButton,
                { backgroundColor: colors.gold },
                isASILevel && !asiChoice && { opacity: 0.4 },
                isASILevel && asiChoice === 'asi' && asiStats.length === 0 && { opacity: 0.4 },
                isASILevel && asiChoice === 'feat' && !selectedFeat && { opacity: 0.4 },
              ]}
              onPress={doLevelUp}
              disabled={
                isASILevel && (
                  !asiChoice ||
                  (asiChoice === 'asi' && asiStats.length === 0) ||
                  (asiChoice === 'feat' && !selectedFeat)
                )
              }
            >
              <Text style={[sharedStyles.primaryButtonText, { color: colors.background }]}>
                Confirm Level Up to {newLevel}
              </Text>
            </TouchableOpacity>
          </>
        );
      })()}

      <TouchableOpacity onPress={() => {
        setLevelUpModalVisible(false);
        setAsiChoice(null);
        setAsiStats([]);
        setSelectedFeat(null);
        setFeatChoices({});
      }}>
        <Text style={sharedStyles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

{/* Feat ability choice modal */}
<Modal visible={featModalVisible} transparent animationType="fade">
  <View style={sharedStyles.modalOverlay}>
    <View style={sharedStyles.modalBox}>
      <Text style={sharedStyles.modalTitle}>{pendingFeat?.name}</Text>
      <Text style={styles.modalSub}>Choose one ability score to increase by 1:</Text>
      <View style={styles.asiStatGrid}>
        {FEAT_EFFECTS[pendingFeat?.name]?.abilityBonus?.from?.map(stat => {
          const isChosen = featChoices.abilityStat === stat;
          return (
            <TouchableOpacity
              key={stat}
              style={[styles.asiStatBtn, isChosen && styles.asiStatBtnActive]}
              onPress={() => setFeatChoices({ abilityStat: stat })}
            >
              <Text style={[styles.asiStatLabel, isChosen && styles.asiStatLabelActive]}>
                {stat.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity
        style={[sharedStyles.primaryButton, !featChoices.abilityStat && { opacity: 0.4 }]}
        disabled={!featChoices.abilityStat}
        onPress={() => {
          setSelectedFeat(pendingFeat);
          setPendingFeat(null);
          setFeatModalVisible(false);
        }}
      >
        <Text style={sharedStyles.primaryButtonText}>Confirm</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {
        setPendingFeat(null);
        setFeatChoices({});
        setFeatModalVisible(false);
      }}>
        <Text style={sharedStyles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


      {/* BREAKDOWN MODAL — AC and weapon attacks */}
      <Modal visible={breakdownModalVisible} transparent animationType="fade">
        <View style={sharedStyles.modalOverlay}>
          <View style={sharedStyles.modalBox}>
            {breakdownRef.current?.type === 'attack' ? (
              <>
                <Text style={sharedStyles.modalTitle}>{breakdownRef.current.name}</Text>
                <Text style={styles.breakdownSub}>Attack &amp; Damage Breakdown</Text>
                <View style={styles.breakdownTable}>
                  <BreakdownRow label="STR Modifier" value={`+${breakdownRef.current.strMod}`} />
                  <BreakdownRow
                    label="Proficiency"
                    value={breakdownRef.current.isProficient
                      ? `+${breakdownRef.current.profBonus}`
                      : '— (not proficient)'}
                  />
                  {breakdownRef.current.magicBonus > 0 && (
                    <BreakdownRow label="Magic Bonus" value={`+${breakdownRef.current.magicBonus}`} />
                  )}
                  <BreakdownRow label="To Hit Total" value={`+${breakdownRef.current.attackTotal}`} isTotal />
                  <View style={styles.breakdownDivider} />
                  <BreakdownRow label="Damage Die"   value={breakdownRef.current.damageDie} />
                  <BreakdownRow label="STR/DEX Modifier" value={`+${breakdownRef.current.damageBonus}`} />
                  
                  {breakdownRef.current.magicBonus > 0 && (
                    <BreakdownRow label="Magic Bonus" value={`+${breakdownRef.current.magicBonus}`} />
                  )}
                  
                  {/* Show Rage Bonus if it's active! */}
                  {breakdownRef.current.appliedRageBonus > 0 && (
                    <BreakdownRow label="Rage Bonus" value={`+${breakdownRef.current.appliedRageBonus}`} />
                  )}
                  {breakdownRef.current.featDamageBonus > 0 &&
                  <BreakdownRow label="Feat Bonus"      value={`+${breakdownRef.current.featDamageBonus}`} />}
                  
                  <BreakdownRow label="Total Damage" value={`+${breakdownRef.current.finalDamageBonus}`} isTotal />
                </View>
              </>
            ) : (
              <>
               <Text style={sharedStyles.modalTitle}>Armour Class</Text>
                <Text style={styles.breakdownSub}>{breakdownRef.current?.formula}</Text>
                <View style={styles.breakdownTable}>
                  
                  <BreakdownRow label="Base" value={String(breakdownRef.current?.base ?? 0)} />
                  
                  {/* Safely handle positive and negative DEX modifiers */}
                  {(breakdownRef.current?.dexApplied ?? 0) !== 0 && (
                    <BreakdownRow 
                      label="DEX Modifier" 
                      value={(breakdownRef.current.dexApplied > 0 ? '+' : '') + breakdownRef.current.dexApplied} 
                    />
                  )}
                  
                  {(breakdownRef.current?.shieldBonus ?? 0) > 0 && (
                    <BreakdownRow label="Shield" value={`+${breakdownRef.current.shieldBonus}`} />
                  )}
                  
                  {(breakdownRef.current?.magicBonus ?? 0) > 0 && (
                    <BreakdownRow label="Magic Bonus" value={`+${breakdownRef.current.magicBonus}`} />
                  )}
                  
                  <BreakdownRow label="Total AC" value={String(breakdownRef.current?.total ?? 0)} isTotal />
                  
                  {breakdownRef.current?.isOverride && (
                    <Text style={styles.overrideNote}>⚠ Manual override active</Text>
                  )}
                  
                </View>
                <TouchableOpacity
                  style={[sharedStyles.primaryButton, { marginTop: spacing.md }]}
                  onPress={() => {
                    overrideKeyRef.current = 'ac';
                    setOverrideInput(
                      breakdownRef.current?.isOverride
                        ? String(breakdownRef.current.total)
                        : ''
                    );
                    setBreakdownModalVisible(false);
                    setTimeout(() => setOverrideModalVisible(true), 300);
                  }}
                >
                  <Text style={sharedStyles.primaryButtonText}>
                    {breakdownRef.current?.isOverride ? 'Edit Override' : 'Set Override'}
                  </Text>
                </TouchableOpacity>
                {breakdownRef.current?.isOverride && (
                  <TouchableOpacity
                    style={[sharedStyles.primaryButton, { backgroundColor: colors.surfaceDeep, marginTop: spacing.sm }]}
                    onPress={() => {
                      const newOverrides = { ...character.overrides };
                      delete newOverrides.ac;
                      character.overrides = newOverrides;
                      persist({ overrides: newOverrides });
                      setBreakdownModalVisible(false);
                    }}
                  >
                    <Text style={[sharedStyles.primaryButtonText, { color: colors.textMuted }]}>
                      Clear Override
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            <TouchableOpacity
              style={[sharedStyles.primaryButton, { marginTop: spacing.md }]}
              onPress={() => setBreakdownModalVisible(false)}
            >
              <Text style={sharedStyles.primaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* OVERRIDE INPUT MODAL */}
      <Modal visible={overrideModalVisible} transparent animationType="slide">
        <View style={sharedStyles.modalOverlay}>
          <View style={sharedStyles.modalBox}>
            <Text style={sharedStyles.modalTitle}>
              Override {overrideKeyRef.current?.toUpperCase()}
            </Text>
            <Text style={styles.breakdownSub}>Enter a value to manually set this stat</Text>
            <TextInput
              style={[sharedStyles.input, styles.largeInput]}
              keyboardType="numeric"
              value={overrideInput}
              onChangeText={setOverrideInput}
              autoFocus
            />
            <TouchableOpacity
              style={sharedStyles.primaryButton}
              onPress={() => {
                const val = parseInt(overrideInput, 10);
                if (isNaN(val)) return;
                character.overrides = { ...character.overrides, [overrideKeyRef.current]: val };
                persist({ overrides: character.overrides });
                setOverrideModalVisible(false);
                setOverrideInput('');
              }}
            >
              <Text style={sharedStyles.primaryButtonText}>Apply Override</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[sharedStyles.primaryButton, { backgroundColor: colors.surfaceDeep, marginTop: spacing.sm }]}
              onPress={() => {
                const newOverrides = { ...character.overrides };
                delete newOverrides[overrideKeyRef.current];
                character.overrides = newOverrides;
                persist({ overrides: newOverrides });
                setOverrideModalVisible(false);
                setOverrideInput('');
              }}
            >
              <Text style={[sharedStyles.primaryButtonText, { color: colors.textMuted }]}>
                Reset to Calculated
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setOverrideModalVisible(false); setOverrideInput(''); }}>
              <Text style={sharedStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );



}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },

topRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
    alignItems: 'stretch', // Ensures both columns stretch to the height of the tallest item
  },

  topRightCol: {
    flex: 1,
    // Removed justifyContent: 'flex-start' so the card can stretch to full height
  },

  hpBarContainer: {
    ...sharedStyles.card,
    flex: 2,
    justifyContent: 'center', // Centers the HP content vertically
    // Removed marginBottom: spacing.md 
  },

  hitDiceCard: {
    ...sharedStyles.card,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Centers the text vertically to match the HP bar
    // Notice: No borderTopWidth or borderTopColor here!
  },
  hpBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  hpBarLabel: {
    ...typography.label,
    letterSpacing: 1,
  },
  hpBarValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  hpBarMax: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: 'normal',
  },
  hpBarTrack: {
    height: 8,
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  hpTempBadge: {
    color: colors.accentSoft,
    fontSize: 11,
    marginTop: spacing.xs,
    textAlign: 'right',
  },

  // Cards row
  cardRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  card: {
    ...sharedStyles.card,
    flex: 1,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: colors.accentSoft,
  },
  cardGold: {
    borderTopColor: colors.gold,
  },
  cardLabel: {
    ...typography.label,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  cardValue: {
    ...typography.value,
  },
  cardSub: {
    ...typography.subtitle,
    marginTop: spacing.xs,
  },

  // Stats grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
 gridCell: {
  width: '30%',
  flexGrow: 1,
  backgroundColor: colors.surface,
  borderRadius: radius.sm,
  padding: spacing.sm,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 60, // tweak to taste
  ...shadows.card,
},
  gridValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  gridLabel: {
    ...typography.label,
    textAlign: 'center',
  },

  // Attacks
  attackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    ...shadows.card,
  },
  attackRowWeapon: {
    borderLeftColor: colors.accentSoft,
  },
  attackNameCol: { flex: 2 },
  attackName: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  attackTag: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  attackStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  attackStatLabel: {
    ...typography.label,
    marginBottom: 2,
  },
  attackStat: {
    color: colors.accentSoft,
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyText: {
    color: colors.textMuted,
    fontStyle: 'italic',
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },

  // Equipped items
  equippedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    gap: spacing.sm,
    ...shadows.card,
  },
  equippedName: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  equippedType: {
    color: colors.textMuted,
    fontSize: 11,
  },
  attunedBadge: {
    color: colors.gold,
    fontSize: 13,
  },
  equippedBonus: {
    color: colors.accentSoft,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Equipped item modal
  equippedModalType: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  equippedModalBonus: {
    color: colors.accentSoft,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  equippedModalDescScroll: {
    maxHeight: 200,
    marginBottom: spacing.sm,
  },
  equippedModalDesc: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
  },

  // Breakdown modal
  breakdownSub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  breakdownTable: {
    width: '100%',
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  breakdownRowTotal: {
    borderBottomWidth: 0,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceAlt,
  },
  breakdownLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  breakdownLabelTotal: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  breakdownValue: {
    color: colors.accentSoft,
    fontSize: 13,
    fontWeight: 'bold',
  },
  breakdownValueTotal: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: colors.surfaceAlt,
    marginVertical: spacing.sm,
  },
  overrideHint: {
    color: colors.textDisabled,
    fontSize: 9,
    marginTop: 2,
  },
  overrideNote: {
    color: colors.warning,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Level up modal
  levelUpPreview: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    width: '100%',
  },
  levelUpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  levelUpLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  levelUpValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  levelUpMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: 'normal',
  },

  // HP modal
  largeInput: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  modalHint: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modeButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceDeep,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  modeButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Rest modal
  restButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceDeep,
  },
  restButtonTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  restButtonSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },

  // Hit dice modal
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    color: colors.textPrimary,
    fontSize: 24,
    lineHeight: 28,
  },
  stepperValue: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: 'bold',
    marginHorizontal: spacing.xl,
  },
  rollResult: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  rollDice: {
    color: colors.accentSoft,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  rollMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  rollTotal: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  devLevelDownButton: {
  position: 'absolute',
  bottom: spacing.xl + 80,
  right: spacing.lg,
  backgroundColor: colors.surfaceDeep,
  borderRadius: radius.md,
  padding: spacing.sm,
  borderWidth: 1,
  borderColor: colors.surfaceDeep,
},
asiSection: {
  borderTopWidth: 1,
  borderTopColor: colors.surfaceDeep,
  paddingTop: spacing.md,
  marginTop: spacing.md,
},
asiTitle: {
  fontSize: 13,
  fontWeight: 'bold',
  color: colors.textMuted,
  letterSpacing: 1,
  textTransform: 'uppercase',
  marginBottom: spacing.sm,
},
asiToggle: {
  flexDirection: 'row',
  backgroundColor: colors.surfaceDeep,
  borderRadius: radius.md,
  padding: 3,
  marginBottom: spacing.md,
},
asiToggleBtn: {
  flex: 1,
  paddingVertical: spacing.sm,
  alignItems: 'center',
  borderRadius: radius.sm,
},
asiToggleBtnActive: {
  backgroundColor: colors.accent,
},
asiToggleText: {
  fontSize: 13,
  fontWeight: '600',
  color: colors.textMuted,
},
asiToggleTextActive: {
  color: colors.textPrimary,
},
asiHint: {
  ...typography.subtitle,
  fontSize: 11,
  textAlign: 'center',
  marginBottom: spacing.sm,
},
asiStatGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: spacing.sm,
  justifyContent: 'center',
},
asiStatBtn: {
  width: 52,
  height: 52,
  borderRadius: radius.md,
  backgroundColor: colors.surfaceDeep,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: 'transparent',
},
asiStatBtnActive: {
  borderColor: colors.accent,
  backgroundColor: colors.surface,
},
asiStatLabel: {
  fontSize: 11,
  fontWeight: 'bold',
  color: colors.textMuted,
  letterSpacing: 1,
},
asiStatLabelActive: {
  color: colors.accent,
},
asiStatScore: {
  fontSize: 16,
  fontWeight: 'bold',
  color: colors.textPrimary,
},
featRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: radius.sm,
  marginBottom: 2,
},
featRowSelected: {
  backgroundColor: colors.surfaceDeep,
},
featName: {
  fontSize: 14,
  fontWeight: '600',
  color: colors.textPrimary,
},
featMeta: {
  ...typography.subtitle,
  fontSize: 11,
  marginTop: 1,
},

featChip: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: colors.surface,
  borderRadius: radius.md,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.md,
  marginBottom: spacing.xs,
  ...shadows.card,
},
featChipName: {
  fontSize: 14,
  fontWeight: '600',
  color: colors.textPrimary,
},
featChipMeta: {
  ...typography.subtitle,
  fontSize: 11,
  marginTop: 2,
},
featDetailMeta: {
  ...typography.subtitle,
  fontSize: 12,
  marginTop: spacing.xs,
},
featDetailText: {
  fontSize: 13,
  color: colors.textPrimary,
  lineHeight: 18,
},


});
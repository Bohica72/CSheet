import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getRaces, getClasses, getSubclassesForClass, getBackgrounds } from '../utils/DataLoader';
import { addCharacter } from '../utils/CharacterStore';
import { Character } from '../models/Character';
import { getBackgroundFeats } from '../utils/DataLoader';
import { applyFeatEffects, FEAT_EFFECTS } from '../data/featEffects';
import { formatFeatSummary } from '../utils/featUtils';





import { colors, spacing, typography, radius, shadows, sharedStyles } from '../styles/theme';

// ─── Step constants ───────────────────────────────────────────────────────────
const STEPS = {
  NAME:       'NAME',
  RACE:       'RACE',
  CLASS:      'CLASS',
  SUBCLASS:   'SUBCLASS',
  BACKGROUND: 'BACKGROUND',
  FEAT:       'FEAT',
  ABILITIES:  'ABILITIES',
  REVIEW:     'REVIEW',
};

const STEP_ORDER = [
  STEPS.NAME,
  STEPS.RACE,
  STEPS.CLASS,
  STEPS.SUBCLASS,
  STEPS.BACKGROUND,
  STEPS.FEAT,
  STEPS.ABILITIES,
  STEPS.REVIEW,
];

const STEP_TITLES = {
  NAME:       'Name Your Character',
  RACE:       'Choose a Race',
  CLASS:      'Choose a Class',
  SUBCLASS:   'Choose a Subclass',
  BACKGROUND: 'Choose a Background',
  ABILITIES:  'Ability Scores',
  REVIEW:     'Review Character',
};

// ─── Stat Constants ───────────────────────────────────────────────────────────
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const STAT_LABELS = {
  str: 'Strength',     dex: 'Dexterity',  con: 'Constitution',
  int: 'Intelligence', wis: 'Wisdom',     cha: 'Charisma',
};
const STAT_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

// ─── Initial wizard state ─────────────────────────────────────────────────────
const INITIAL_STATE = {
  name:       '',
  race:       null,
  charClass:  null,
  subclass:   null,
  background: null,
  feat:      null,
  featChoices: {},
  abilities: {
    str: null, dex: null, con: null,
    int: null, wis: null, cha: null,
  },
  abilityMode: 'standard',  // 'standard' | 'roll'
};

export default function CharacterCreationWizard() {
  const navigation = useNavigation();
  const [stepIndex, setStepIndex] = useState(0);
  const [wizard, setWizard]       = useState(INITIAL_STATE);
  const [raceSearch, setRaceSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [backgroundSearch, setBackgroundSearch] = useState('');

  const currentStep = STEP_ORDER[stepIndex];
  const isLastStep  = stepIndex === STEP_ORDER.length - 1;

  // ─── Navigation helpers ───────────────────────────────────────────────────
  const goNext = () => {
    if (!isLastStep) setStepIndex(i => i + 1);
  };

  const goBack = () => {
    if (stepIndex === 0) {
      navigation.goBack();
    } else {
      setStepIndex(i => i - 1);
    }
  };

  const update = (key, value) => {
    setWizard(w => {
      const next = { ...w, [key]: value };
      if (key === 'charClass') next.subclass = null;  // reset subclass on class change
      return next;
    });
  };

  // ─── Validation — is the current step complete enough to proceed? ─────────
  const canProceed = () => {
    switch (currentStep) {
      case STEPS.NAME:       return wizard.name.trim().length >= 1;
      case STEPS.RACE:       return wizard.race !== null;
      case STEPS.CLASS:      return wizard.charClass !== null;
      case STEPS.SUBCLASS:   return true;   // optional — can skip
      case STEPS.FEAT:
            return true; // optional
      case STEPS.BACKGROUND: return wizard.background !== null;
      case STEPS.ABILITIES:
          return Object.values(wizard.abilities).every(v => v !== null);
      case STEPS.REVIEW: return true;
      default:               return false;
    }
  };

  // ─── Finish — build and save the character ────────────────────────────────
  const handleFinish = async () => {
    const race       = wizard.race;
    const charClass  = wizard.charClass;
    const background = wizard.background;
    const abilities  = wizard.abilities;

    // Apply racial ability bonuses on top of assigned scores
    const racialBonuses = { str:0, dex:0, con:0, int:0, wis:0, cha:0 };
    for (const bonus of (race?.abilityBonuses ?? [])) {
      if (bonus.type === 'fixed') {
        for (const [stat, val] of Object.entries(bonus.bonuses)) {
          racialBonuses[stat] = (racialBonuses[stat] ?? 0) + val;
        }
      }
    }


    const finalAbilities = {
      str: (abilities.str ?? 8)  + racialBonuses.str,
      dex: (abilities.dex ?? 8)  + racialBonuses.dex,
      con: (abilities.con ?? 8)  + racialBonuses.con,
      int: (abilities.int ?? 8)  + racialBonuses.int,
      wis: (abilities.wis ?? 8)  + racialBonuses.wis,
      cha: (abilities.cha ?? 8)  + racialBonuses.cha,
    };

    const conMod = Math.floor((finalAbilities.con - 10) / 2);
    const hpMax  = (charClass?.hd ?? 8) + conMod;

    const newChar = {
      id:             'char_' + Date.now(),
      name:           wizard.name.trim(),
      race:           race?.name ?? null,
      raceSource:     race?.source ?? null,
      level:          1,

      // Save as nested object — Character.js reads this.abilities.str etc.
      abilities: {
        str: finalAbilities.str,
        dex: finalAbilities.dex,
        con: finalAbilities.con,
        int: finalAbilities.int,
        wis: finalAbilities.wis,
        cha: finalAbilities.cha,
      },

      classId:        charClass?.name?.toLowerCase().replace(/\s+/g, '_') ?? null,
      classSource:    charClass?.source ?? null,
      subclassId:     wizard.subclass?.shortName?.toLowerCase().replace(/\s+/g, '_') ?? null,
      subclassSource: wizard.subclass?.source ?? null,
      background:     background?.name ?? null,
      backgroundSource: background?.source ?? null,

      proficiencyBonus: 2,

      proficiencies: {
        saves:     charClass?.proficiency ?? [],
        skills:    buildStartingSkills(background),
        expertise: [],
        weapons:   [],
        armor:     [],
      },

      skills:       buildStartingSkills(background),
      hpMax,
      hpCurrent:    hpMax,
      hpTemp:       0,
      ac:           10,
      speed:        race?.speed ?? 30,
      darkvision:   race?.darkvision ?? 0,
      inventory:    [],
      resources:    [],
      spells:       [],
      spellcastingAbility: charClass?.spellcastingAbility ?? null,
    };

// Apply feat effects
let newCharWithFeat = wizard.feat
  ? applyFeatEffects(newChar, wizard.feat.name, wizard.featChoices)
  : newChar;

// Save feat to character
newCharWithFeat.feats = wizard.feat
  ? [{ name: wizard.feat.name, source: wizard.feat.source, takenAtLevel: 1 }]
  : [];

await addCharacter(newCharWithFeat);
const created = new Character(newCharWithFeat);
navigation.replace('Character', { character: created });

};


  function buildStartingSkills(background) {
  if (!background) return [];
  return background.skillProficiencies?.fixed ?? [];
}


  // ─── Render steps ─────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {
      case STEPS.NAME: return <NameStep wizard={wizard} update={update} />;
      case STEPS.RACE: return (
        <RaceStep
          wizard={wizard}
          update={update}
          search={raceSearch}
          setSearch={setRaceSearch}
        />
      );
      case STEPS.CLASS: return (
        <ClassStep
          wizard={wizard}
          update={update}
          search={classSearch}
          setSearch={setClassSearch}
        />
      );
      case STEPS.SUBCLASS: return (
        <SubclassStep
          wizard={wizard}
          update={update}
        />
      );
      case STEPS.BACKGROUND: return (
        <BackgroundStep
          wizard={wizard}
          update={update}
          search={backgroundSearch}
          setSearch={setBackgroundSearch}
        />
      );
      case STEPS.FEAT:
        return <FeatStep wizard={wizard} update={update} />;

      case STEPS.ABILITIES: return (
        <AbilitiesStep wizard={wizard} update={update} setWizard={setWizard} />
      );
      case STEPS.REVIEW: return (
        <ReviewStep
          wizard={wizard}
          onEdit={(step) => setStepIndex(STEP_ORDER.indexOf(step))}
          onCancel={() => navigation.goBack()}
          onConfirm={handleFinish}
        />
      );
      default: return null;
    }
  };

  return (
    <View style={sharedStyles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Progress bar */}
      <View style={styles.progressBar}>
        {STEP_ORDER.map((step, i) => (
          <View
            key={step}
            style={[
              styles.progressSegment,
              i <= stepIndex && styles.progressSegmentActive,
            ]}
          />
        ))}
      </View>

      {/* Step title */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{STEP_TITLES[currentStep]}</Text>
        <Text style={styles.stepCount}>
          Step {stepIndex + 1} of {STEP_ORDER.length}
        </Text>
      </View>

      {/* Step content */}
      <View style={styles.stepContent}>
        {renderStep()}
      </View>

      {/* Bottom navigation — hidden on review screen */}
      {currentStep !== STEPS.REVIEW && (
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Ionicons name="arrow-back" size={18} color={colors.textMuted} />
            <Text style={styles.backButtonText}>
              {stepIndex === 0 ? 'Cancel' : 'Back'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
            onPress={goNext}
            disabled={!canProceed()}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Step: Name ───────────────────────────────────────────────────────────────
function NameStep({ wizard, update }) {
  return (
    <ScrollView contentContainerStyle={styles.stepInner}>
      <Text style={styles.stepDescription}>
        What is your character's name?
      </Text>
      <TextInput
        style={styles.nameInput}
        value={wizard.name}
        onChangeText={v => update('name', v)}
        placeholder="Enter a name..."
        placeholderTextColor={colors.textDisabled}
        autoFocus
        maxLength={40}
        returnKeyType="next"
      />
    </ScrollView>
  );
}

// ─── Step: Race ───────────────────────────────────────────────────────────────
function RaceStep({ wizard, update, search, setSearch }) {
  const allRaces = getRaces();

  const filtered = allRaces.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search races..."
          placeholderTextColor={colors.textDisabled}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {wizard.race && (
        <View style={styles.selectedCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedName}>{wizard.race.name}</Text>
            <Text style={styles.selectedMeta}>
              {formatAbilityBonuses(wizard.race.abilityBonuses)}
              {wizard.race.speed ? `  ·  Speed ${wizard.race.speed}ft` : ''}
              {wizard.race.darkvision ? `  ·  Darkvision ${wizard.race.darkvision}ft` : ''}
            </Text>
          </View>
          <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => `${item.name}-${item.source}-${i}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.raceRow,
              wizard.race?.name === item.name &&
              wizard.race?.source === item.source &&
              styles.raceRowSelected,
            ]}
            onPress={() => update('race', item)}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.raceRowTop}>
                <Text style={styles.raceName}>{item.name}</Text>
                <Text style={styles.raceSource}>{item.source}</Text>
              </View>
              <Text style={styles.raceMeta}>
                {formatAbilityBonuses(item.abilityBonuses)}
                {item.speed ? `  ·  ${item.speed}ft` : ''}
                {item.darkvision ? `  ·  Darkvision` : ''}
                {item.skillProficiencies?.length > 0 ? `  ·  Skills` : ''}
              </Text>
            </View>
            {wizard.race?.name === item.name &&
             wizard.race?.source === item.source && (
              <Ionicons name="checkmark" size={18} color={colors.accent} />
            )}
          </TouchableOpacity>
        )}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

// ─── Step: Class ──────────────────────────────────────────────────────────────
function ClassStep({ wizard, update, search, setSearch }) {
  const allClasses = getClasses();

  const deduped = allClasses.reduce((acc, c) => {
    const existing = acc.find(x => x.name === c.name);
    if (!existing) {
      acc.push(c);
    } else if (c.source === 'PHB' || c.source === 'XPHB') {
      const idx = acc.indexOf(existing);
      acc[idx] = c;
    }
    return acc;
  }, []);

  const filtered = deduped.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search classes..."
          placeholderTextColor={colors.textDisabled}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {wizard.charClass && (
        <View style={styles.selectedCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedName}>{wizard.charClass.name}</Text>
            <Text style={styles.selectedMeta}>
              d{wizard.charClass.hd} Hit Die
              {wizard.charClass.spellcastingAbility
                ? `  ·  Spellcasting (${wizard.charClass.spellcastingAbility.toUpperCase()})`
                : '  ·  No spellcasting'}
              {'  ·  Saves: '}
              {wizard.charClass.proficiency.map(s => s.toUpperCase()).join(', ')}
            </Text>
          </View>
          <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => `${item.name}-${item.source}-${i}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.raceRow,
              wizard.charClass?.name === item.name && styles.raceRowSelected,
            ]}
            onPress={() => update('charClass', item)}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.raceRowTop}>
                <Text style={styles.raceName}>{item.name}</Text>
                <Text style={styles.raceSource}>{item.source}</Text>
                <Text style={styles.raceSource}>d{item.hd}</Text>
              </View>
              <Text style={styles.raceMeta}>
                {item.spellcastingAbility
                  ? `Spellcasting (${item.spellcastingAbility.toUpperCase()})`
                  : 'No spellcasting'}
                {'  ·  Saves: '}
                {item.proficiency.map(s => s.toUpperCase()).join(', ')}
              </Text>
            </View>
            {wizard.charClass?.name === item.name && (
              <Ionicons name="checkmark" size={18} color={colors.accent} />
            )}
          </TouchableOpacity>
        )}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

// ─── Step: Subclass ───────────────────────────────────────────────────────────
function SubclassStep({ wizard, update }) {
  const subclasses = wizard.charClass
    ? getSubclassesForClass(wizard.charClass.name, wizard.charClass.source)
    : [];

  const [expanded, setExpanded] = useState(null);

  if (!wizard.charClass) {
    return (
      <View style={styles.stepInner}>
        <Text style={typography.subtitle}>No class selected.</Text>
      </View>
    );
  }

  if (subclasses.length === 0) {
    return (
      <View style={styles.stepInner}>
        <Text style={typography.subtitle}>
          No subclasses found for {wizard.charClass.name}. You can skip this step.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <Text style={styles.stepDescription}>
        {`Choose a ${wizard.charClass.subclassTitle ?? 'subclass'} for your ${wizard.charClass.name}. You can also skip this and choose later.`}
      </Text>

      {subclasses.map((sc, i) => {
        const isSelected = wizard.subclass?.shortName === sc.shortName &&
                           wizard.subclass?.source === sc.source;
        const isExpanded = expanded === i;

        return (
          <View key={`${sc.shortName}-${sc.source}-${i}`}>
            <TouchableOpacity
              style={[styles.raceRow, isSelected && styles.raceRowSelected]}
              onPress={() => update('subclass', isSelected ? null : sc)}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.raceRowTop}>
                  <Text style={styles.raceName}>{sc.name}</Text>
                  <Text style={styles.raceSource}>{sc.source}</Text>
                </View>
                <Text style={styles.raceMeta}>
                  {`Features at levels: `}
                  {sc.features.map(f => f.level).join(', ')}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                {isSelected && (
                  <Ionicons name="checkmark" size={18} color={colors.accent} />
                )}
                <TouchableOpacity onPress={() =>
                  setExpanded(isExpanded ? null : i)
                }>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {isExpanded && sc.features.length > 0 && (
              <View style={styles.featurePreview}>
                {sc.features.map((feat, fi) => (
                  <View key={fi} style={styles.featureRow}>
                    <Text style={styles.featureLevel}>Lv {feat.level}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.featureName}>{feat.name}</Text>
                      {feat.entries ? (
                        <Text style={styles.featureText} numberOfLines={3}>
                          {feat.entries}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── Step: Background ─────────────────────────────────────────────────────────
function BackgroundStep({ wizard, update, search, setSearch }) {
  const allBackgrounds = getBackgrounds();

  const filtered = allBackgrounds.filter(bg =>
    bg.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search backgrounds..."
          placeholderTextColor={colors.textDisabled}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {wizard.background && (
        <View style={styles.selectedCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedName}>{wizard.background.name}</Text>
            <Text style={styles.selectedMeta}>
              {formatBackgroundSummary(wizard.background.summary)}
            </Text>
          </View>
          <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => `${item.name}-${item.source}-${i}`}
        renderItem={({ item }) => {
          const isSelected = wizard.background?.name === item.name &&
                             wizard.background?.source === item.source;
          return (
            <TouchableOpacity
              style={[styles.raceRow, isSelected && styles.raceRowSelected]}
              onPress={() => update('background', item)}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.raceRowTop}>
                  <Text style={styles.raceName}>{item.name}</Text>
                  <Text style={styles.raceSource}>{item.source}</Text>
                </View>
                <Text style={styles.raceMeta}>
                  {formatBackgroundSummary(item.summary)}
                </Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark" size={18} color={colors.accent} />
              )}
            </TouchableOpacity>
          );
        }}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

function FeatStep({ wizard, update }) {
  const feats = getBackgroundFeats();
  const [expanded, setExpanded] = useState(null);
  const [pendingFeat, setPendingFeat] = useState(null);  // feat awaiting choice
  const [chosenStat, setChosenStat] = useState(null);    // selected stat in modal

  const handleFeatPress = (feat, isSelected) => {
    if (isSelected) {
      // Deselect — clear feat and any stored choices
      update('feat', null);
      update('featChoices', {});
      return;
    }

    const effect = FEAT_EFFECTS[feat.name];
    if (effect?.abilityBonus?.type === 'choice') {
      // Needs a choice — open modal first
      setPendingFeat(feat);
      setChosenStat(null);
    } else {
      // No choice needed — select immediately
      update('feat', feat);
      update('featChoices', {});
    }
  };

  const confirmChoice = () => {
    if (!pendingFeat || !chosenStat) return;
    update('feat', pendingFeat);
    update('featChoices', { abilityStat: chosenStat });
    setPendingFeat(null);
    setChosenStat(null);
  };

  const dismissModal = () => {
    setPendingFeat(null);
    setChosenStat(null);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <Text style={styles.stepDescription}>
        Choose a background feat. You can also skip this and choose later.
      </Text>

      {/* Currently selected */}
      {wizard.feat && (
        <View style={styles.selectedCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedName}>{wizard.feat.name}</Text>
            <Text style={styles.selectedMeta}>
              {wizard.feat.entries?.slice(0, 80)}...
            </Text>
            {wizard.featChoices?.abilityStat && (
              <Text style={styles.selectedMeta}>
                +1 {wizard.featChoices.abilityStat.toUpperCase()}
              </Text>
            )}
          </View>
          <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
        </View>
      )}

      {feats.map((feat, i) => {
        const isSelected = wizard.feat?.name === feat.name;
        const isExpanded = expanded === i;

        return (
          <View key={feat.name}>
            <TouchableOpacity
              style={[styles.raceRow, isSelected && styles.raceRowSelected]}
              onPress={() => handleFeatPress(feat, isSelected)}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.raceRowTop}>
                  <Text style={styles.raceName}>{feat.name}</Text>
                </View>
                <Text style={styles.raceMeta}>
                  {formatFeatSummary(feat)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                {isSelected && (
                  <Ionicons name="checkmark" size={18} color={colors.accent} />
                )}
                <TouchableOpacity onPress={() => setExpanded(isExpanded ? null : i)}>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.featurePreview}>
                <Text style={styles.featureText}>{feat.entries}</Text>
              </View>
            )}
          </View>
        );
      })}

      {/* Ability choice modal */}
      <Modal
        visible={!!pendingFeat}
        transparent
        animationType="fade"
        onRequestClose={dismissModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{pendingFeat?.name}</Text>
            <Text style={styles.modalSubtitle}>
              Choose one ability score to increase by 1:
            </Text>

            <View style={styles.modalOptions}>
              {FEAT_EFFECTS[pendingFeat?.name]?.abilityBonus?.from?.map(stat => (
                <TouchableOpacity
                  key={stat}
                  style={[
                    styles.modalStatButton,
                    chosenStat === stat && styles.modalStatButtonSelected,
                  ]}
                  onPress={() => setChosenStat(stat)}
                >
                  <Text style={[
                    styles.modalStatText,
                    chosenStat === stat && styles.modalStatTextSelected,
                  ]}>
                    {stat.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={dismissModal}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmButton, !chosenStat && styles.nextButtonDisabled]}
                onPress={confirmChoice}
                disabled={!chosenStat}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}



// ─── Step: Abilities ──────────────────────────────────────────────────────────
function rollStat() {
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  rolls.sort((a, b) => a - b);
  const dropped = rolls[0];
  const kept    = rolls.slice(1);
  return { total: kept.reduce((a, b) => a + b, 0), rolls, dropped };
}

function AbilitiesStep({ wizard, update, setWizard }) {
  const mode = wizard.abilityMode;
  const [pendingValue, setPendingValue] = useState(null);
  const [rollResults, setRollResults] = useState({});

  const racialBonuses = { str:0, dex:0, con:0, int:0, wis:0, cha:0 };
  for (const bonus of (wizard.race?.abilityBonuses ?? [])) {
    if (bonus.type === 'fixed') {
      for (const [stat, val] of Object.entries(bonus.bonuses)) {
        racialBonuses[stat] += val;
      }
    }
  }

  const switchMode = (newMode) => {
    update('abilityMode', newMode);
    setWizard(w => ({
      ...w,
      abilityMode: newMode,
      abilities: { str:null, dex:null, con:null, int:null, wis:null, cha:null },
    }));
    setPendingValue(null);
    setRollResults({});
  };

  const assignedValues  = Object.values(wizard.abilities).filter(v => v !== null);
  const availableValues = STANDARD_ARRAY.filter(v => !assignedValues.includes(v) || v === pendingValue);

  const handleValuePress = (val) => {
    setPendingValue(prev => prev === val ? null : val);
  };

  const handleStatPress = (stat) => {
    if (mode === 'standard') {
      if (pendingValue === null) {
        update('abilities', { ...wizard.abilities, [stat]: null });
      } else {
        update('abilities', { ...wizard.abilities, [stat]: pendingValue });
        setPendingValue(null);
      }
    }
  };

  const handleRollStat = (stat) => {
    const result = rollStat();
    setRollResults(prev => ({ ...prev, [stat]: result }));
    update('abilities', { ...wizard.abilities, [stat]: result.total });
  };

  const handleRollAll = () => {
    const newAbilities = {};
    const newResults   = {};
    for (const stat of STAT_KEYS) {
      const result = rollStat();
      newAbilities[stat] = result.total;
      newResults[stat]   = result;
    }
    setRollResults(newResults);
    update('abilities', newAbilities);
  };

  const conScore = (wizard.abilities.con ?? 0) + racialBonuses.con;
  const conMod   = wizard.abilities.con !== null
    ? Math.floor((conScore - 10) / 2)
    : null;
  const hpPreview = conMod !== null && wizard.charClass
    ? (wizard.charClass.hd ?? 8) + conMod
    : null;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'standard' && styles.modeButtonActive]}
          onPress={() => switchMode('standard')}
        >
          <Text style={[styles.modeButtonText, mode === 'standard' && styles.modeButtonTextActive]}>
            Standard Array
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'roll' && styles.modeButtonActive]}
          onPress={() => switchMode('roll')}
        >
          <Text style={[styles.modeButtonText, mode === 'roll' && styles.modeButtonTextActive]}>
            Roll Stats
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'standard' && (
        <View style={styles.arrayChips}>
          <Text style={styles.arrayHint}>
            {pendingValue
              ? `Tap a stat to assign ${pendingValue}`
              : 'Tap a value, then tap a stat to assign it'}
          </Text>
          <View style={styles.chipRow}>
            {STANDARD_ARRAY.map(val => {
              const isUsed     = assignedValues.includes(val) && val !== pendingValue;
              const isSelected = pendingValue === val;
              return (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                    isUsed     && styles.chipUsed,
                  ]}
                  onPress={() => !isUsed && handleValuePress(val)}
                  disabled={isUsed}
                >
                  <Text style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                    isUsed     && styles.chipTextUsed,
                  ]}>
                    {val}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {mode === 'roll' && (
        <TouchableOpacity style={styles.rollAllButton} onPress={handleRollAll}>
          <Ionicons name="dice" size={18} color={colors.textPrimary} />
          <Text style={styles.rollAllText}>Roll All Stats</Text>
        </TouchableOpacity>
      )}

      {STAT_KEYS.map(stat => {
        const baseVal    = wizard.abilities[stat];
        const racial     = racialBonuses[stat];
        const finalVal   = baseVal !== null ? baseVal + racial : null;
        const modifier   = finalVal !== null ? Math.floor((finalVal - 10) / 2) : null;
        const modString  = modifier !== null
          ? (modifier >= 0 ? `+${modifier}` : `${modifier}`)
          : '—';
        const rollResult = rollResults[stat];
        const isPending  = mode === 'standard' && pendingValue !== null;

        return (
          <TouchableOpacity
            key={stat}
            style={[
              styles.statRow,
              isPending && baseVal === null && styles.statRowHighlight,
              baseVal !== null && styles.statRowFilled,
            ]}
            onPress={() => mode === 'standard' && handleStatPress(stat)}
            disabled={mode === 'roll'}
            activeOpacity={mode === 'standard' ? 0.7 : 1}
          >
            <View style={styles.statRowLeft}>
              <Text style={styles.statLabel}>{STAT_LABELS[stat]}</Text>
              <Text style={styles.statKey}>{stat.toUpperCase()}</Text>
            </View>

            {mode === 'roll' && (
              <TouchableOpacity
                style={styles.diceButton}
                onPress={() => handleRollStat(stat)}
              >
                <Ionicons name="dice-outline" size={16} color={colors.accentSoft} />
                <Text style={styles.diceButtonText}>
                  {rollResult
                    ? `[${rollResult.kept ?? rollResult.rolls.slice(1).join(',')}]`
                    : 'Roll'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.statScoreBox}>
              {baseVal !== null ? (
                <>
                  <Text style={styles.statScore}>
                    {finalVal}
                    {racial !== 0 && (
                      <Text style={styles.statRacial}>
                        {` (${baseVal}+${racial})`}
                      </Text>
                    )}
                  </Text>
                  <Text style={styles.statMod}>{modString}</Text>
                </>
              ) : (
                <Text style={styles.statEmpty}>—</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      {hpPreview !== null && (
        <View style={styles.hpPreview}>
          <Ionicons name="heart" size={14} color={colors.accent} />
          <Text style={styles.hpPreviewText}>
            {`Starting HP: ${hpPreview}  (d${wizard.charClass?.hd ?? 8} max + CON ${conMod >= 0 ? '+' : ''}${conMod})`}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Step: Review ─────────────────────────────────────────────────────────────
function ReviewStep({ wizard, onEdit, onCancel, onConfirm }) {
  const race      = wizard.race;
  const charClass = wizard.charClass;
  const subclass  = wizard.subclass;
  const bg        = wizard.background;
  const abilities = wizard.abilities;

  const racialBonuses = { str:0, dex:0, con:0, int:0, wis:0, cha:0 };
  for (const bonus of (race?.abilityBonuses ?? [])) {
    if (bonus.type === 'fixed') {
      for (const [stat, val] of Object.entries(bonus.bonuses)) {
        racialBonuses[stat] += val;
      }
    }
  }

  const finalAbilities = {};
  for (const stat of STAT_KEYS) {
    finalAbilities[stat] = (abilities[stat] ?? 8) + racialBonuses[stat];
  }

  const conMod    = Math.floor((finalAbilities.con - 10) / 2);
  const hpMax     = (charClass?.hd ?? 8) + conMod;
  const modString = (val) => {
    const m = Math.floor((val - 10) / 2);
    return m >= 0 ? `+${m}` : `${m}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.reviewContainer}>
      <View style={styles.reviewBanner}>
        <Text style={styles.reviewCharName}>{wizard.name}</Text>
        <View style={styles.reviewHpBadge}>
          <Ionicons name="heart" size={12} color={colors.accent} />
          <Text style={styles.reviewHpText}>{hpMax} HP</Text>
        </View>
      </View>

      <ReviewSection label="Race" onEdit={() => onEdit(STEPS.RACE)}>
        <Text style={styles.reviewValue}>{race?.name ?? '—'}</Text>
        {race && (
          <Text style={styles.reviewMeta}>
            {formatAbilityBonuses(race.abilityBonuses)}
            {race.speed ? `  ·  Speed ${race.speed}ft` : ''}
            {race.darkvision ? `  ·  Darkvision ${race.darkvision}ft` : ''}
          </Text>
        )}
      </ReviewSection>

      <ReviewSection label="Class" onEdit={() => onEdit(STEPS.CLASS)}>
        <Text style={styles.reviewValue}>
          {charClass?.name ?? '—'}
          {subclass ? ` — ${subclass.name}` : ''}
        </Text>
        {charClass && (
          <Text style={styles.reviewMeta}>
            {`d${charClass.hd} Hit Die`}
            {charClass.spellcastingAbility
              ? `  ·  Spellcasting (${charClass.spellcastingAbility.toUpperCase()})`
              : ''}
          </Text>
        )}
        {!subclass && charClass && (
          <TouchableOpacity onPress={() => onEdit(STEPS.SUBCLASS)}>
            <Text style={styles.reviewEditInline}>+ Choose subclass</Text>
          </TouchableOpacity>
        )}
      </ReviewSection>

      <ReviewSection label="Background" onEdit={() => onEdit(STEPS.BACKGROUND)}>
        <Text style={styles.reviewValue}>{bg?.name ?? '—'}</Text>
        {bg && (
          <Text style={styles.reviewMeta}>
            {formatBackgroundSummary(bg.summary)}
          </Text>
        )}
      </ReviewSection>

      <ReviewSection label="Ability Scores" onEdit={() => onEdit(STEPS.ABILITIES)}>
        <View style={styles.reviewAbilities}>
          {STAT_KEYS.map(stat => (
            <View key={stat} style={styles.reviewAbilityBox}>
              <Text style={styles.reviewAbilityScore}>
                {finalAbilities[stat] ?? '—'}
              </Text>
              <Text style={styles.reviewAbilityMod}>
                {finalAbilities[stat] ? modString(finalAbilities[stat]) : ''}
              </Text>
              <Text style={styles.reviewAbilityStat}>
                {stat.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      </ReviewSection>

      <TouchableOpacity style={styles.createButton} onPress={onConfirm}>
        <Ionicons name="checkmark-circle" size={20} color={colors.textPrimary} />
        <Text style={styles.createButtonText}>Create Character</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Review section wrapper ───────────────────────────────────────────────────
function ReviewSection({ label, onEdit, children }) {
  return (
    <View style={styles.reviewSection}>
      <View style={styles.reviewSectionHeader}>
        <Text style={styles.reviewSectionLabel}>{label}</Text>
        <TouchableOpacity onPress={onEdit} style={styles.reviewEditButton}>
          <Ionicons name="pencil-outline" size={14} color={colors.accentSoft} />
          <Text style={styles.reviewEditText}>Edit</Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatAbilityBonuses(bonuses) {
  if (!bonuses || bonuses.length === 0) return 'No ability bonuses';
  return bonuses.map(b => {
    if (b.type === 'choice') return `+${b.amount} to any`;
    return Object.entries(b.bonuses)
      .map(([k, v]) => `${k.toUpperCase()} +${v}`)
      .join(', ');
  }).join(', ');
}

function formatBackgroundSummary(summary) {
  if (!summary) return '';
  const parts = [];
  if (summary.skills?.length)        parts.push(`Skills: ${summary.skills.join(', ')}`);
  if (summary.abilityBonuses?.length) parts.push(summary.abilityBonuses.join(', '));
  if (summary.languageCount > 0)     parts.push(`${summary.languageCount} language${summary.languageCount > 1 ? 's' : ''}`);
  if (summary.hasToolProficiency)    parts.push('Tool proficiency');
  return parts.join('  ·  ');
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceDeep,
  },
  progressSegmentActive: {
    backgroundColor: colors.accent,
  },
  stepHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  stepCount: {
    ...typography.subtitle,
    fontSize: 11,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  stepInner: {
    paddingBottom: spacing.xl,
  },
  stepDescription: {
    ...typography.subtitle,
    marginBottom: spacing.lg,
  },

  // Name step
  nameInput: {
    backgroundColor: colors.surfaceDeep,
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceDeep,
  },

  // Race step
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
    ...shadows.card,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  selectedMeta: {
    ...typography.subtitle,
    fontSize: 11,
    marginTop: 2,
  },
  raceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    marginBottom: 2,
  },
  raceRowSelected: {
    backgroundColor: colors.surfaceDeep,
  },
  raceRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  raceName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  raceSource: {
    fontSize: 10,
    color: colors.textMuted,
    backgroundColor: colors.surfaceDeep,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  raceMeta: {
    ...typography.subtitle,
    fontSize: 11,
    marginTop: 1,
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceDeep,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  backButtonText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  nextButtonDisabled: {
    backgroundColor: colors.surfaceDeep,
    ...shadows.none,
  },
  nextButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  featurePreview: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  featureLevel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.accent,
    width: 32,
    paddingTop: 2,
  },
  featureName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  featureText: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },

  // Mode toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.lg,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  modeButtonActive: {
    backgroundColor: colors.accent,
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  modeButtonTextActive: {
    color: colors.textPrimary,
  },

  // Standard array chips
  arrayChips: {
    marginBottom: spacing.lg,
  },
  arrayHint: {
    ...typography.subtitle,
    fontSize: 12,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  chipUsed: {
    opacity: 0.3,
  },
  chipText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.accent,
  },
  chipTextUsed: {
    color: colors.textMuted,
  },

  // Stat rows
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statRowHighlight: {
    borderColor: colors.accentDim,
    backgroundColor: colors.surfaceDeep,
  },
  statRowFilled: {
    backgroundColor: colors.surface,
  },
  statRowLeft: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statKey: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  statScoreBox: {
    alignItems: 'center',
    minWidth: 60,
  },
  statScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statRacial: {
    fontSize: 11,
    color: colors.accentSoft,
    fontWeight: 'normal',
  },
  statMod: {
    fontSize: 11,
    color: colors.textMuted,
  },
  statEmpty: {
    fontSize: 20,
    color: colors.textDisabled,
  },

  // Roll mode
  rollAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  rollAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  diceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.md,
  },
  diceButtonText: {
    fontSize: 12,
    color: colors.accentSoft,
  },

  // HP preview
  hpPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.md,
  },
  hpPreviewText: {
    fontSize: 13,
    color: colors.textPrimary,
  },

  // Review screen
  reviewContainer: {
    paddingBottom: spacing.xl,
  },
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  reviewCharName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  reviewHpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  reviewHpText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.accent,
  },
  reviewSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  reviewSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reviewSectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  reviewEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reviewEditText: {
    fontSize: 12,
    color: colors.accentSoft,
  },
  reviewEditInline: {
    fontSize: 12,
    color: colors.accentSoft,
    marginTop: spacing.xs,
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  reviewMeta: {
    ...typography.subtitle,
    fontSize: 11,
    marginTop: 2,
  },
  reviewAbilities: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  reviewAbilityBox: {
    alignItems: 'center',
    flex: 1,
  },
  reviewAbilityScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  reviewAbilityMod: {
    fontSize: 12,
    color: colors.accentSoft,
    fontWeight: '600',
  },
  reviewAbilityStat: {
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 1,
  },

  // Action buttons
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  cancelButton: {
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  cancelButtonText: {
    fontSize: 14,
    color: colors.textMuted,
  },

  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.7)',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: spacing.lg,
},
modalCard: {
  backgroundColor: colors.surface,
  borderRadius: radius.md,
  padding: spacing.lg,
  width: '100%',
  ...shadows.card,
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: colors.textPrimary,
  marginBottom: spacing.xs,
},
modalSubtitle: {
  ...typography.subtitle,
  marginBottom: spacing.lg,
},
modalOptions: {
  flexDirection: 'row',
  gap: spacing.sm,
  justifyContent: 'center',
  marginBottom: spacing.lg,
},
modalStatButton: {
  width: 56,
  height: 56,
  borderRadius: radius.md,
  backgroundColor: colors.surfaceDeep,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: 'transparent',
},
modalStatButtonSelected: {
  borderColor: colors.accent,
  backgroundColor: colors.surface,
},
modalStatText: {
  fontSize: 14,
  fontWeight: 'bold',
  color: colors.textMuted,
},
modalStatTextSelected: {
  color: colors.accent,
},
modalActions: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: spacing.md,
},
modalCancelButton: {
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.lg,
},
modalCancelText: {
  color: colors.textMuted,
  fontSize: 15,
},
modalConfirmButton: {
  backgroundColor: colors.accent,
  borderRadius: radius.md,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.lg,
  ...shadows.card,
},
modalConfirmText: {
  color: colors.textPrimary,
  fontSize: 15,
  fontWeight: '600',
},

});
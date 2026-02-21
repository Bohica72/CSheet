// src/utils/DataLoader.js

import spellData      from '../data/raw/spells.json';
import raceData       from '../data/raw/races.json';
import featData       from '../data/raw/feats.json';
import backgroundData from '../data/raw/backgrounds.json';

import classBarbarian from '../data/raw/class-barbarian.json';
import classBard      from '../data/raw/class-bard.json';
import classCleric    from '../data/raw/class-cleric.json';
import classDruid     from '../data/raw/class-druid.json';
import classFighter   from '../data/raw/class-fighter.json';
import classMonk      from '../data/raw/class-monk.json';
import classPaladin   from '../data/raw/class-paladin.json';
import classRanger    from '../data/raw/class-ranger.json';
import classRogue     from '../data/raw/class-rogue.json';
import classSorcerer  from '../data/raw/class-sorcerer.json';
import classWarlock   from '../data/raw/class-warlock.json';
import classWizard    from '../data/raw/class-wizard.json';
import classPugilist  from '../data/raw/class-pugilist.json';

const CLASS_FILES = [
  classBarbarian, classBard,    classCleric,  classDruid,
  classFighter,   classMonk,    classPaladin, classRanger,
  classRogue,     classSorcerer, classWarlock, classWizard,
  classPugilist,
];

// ─── Internal state ───────────────────────────────────────────────────────────
let _races         = [];
let _classes       = [];
let _subclassIndex = {};
let _spells        = [];
let _spellsByClass = {};
let _backgrounds   = [];
let _feats         = [];
let _initialised   = false;

// ─── Keys ─────────────────────────────────────────────────────────────────────
function subclassKey(className, classSource, shortName, subclassSource) {
  return `${className}|${classSource}|${shortName}|${subclassSource}`.toLowerCase();
}

function classFeatureKey(name, className, classSource, level) {
  return `${name}|${className}|${classSource}|${level}`.toLowerCase();
}

// ─── _copy resolver ───────────────────────────────────────────────────────────
// Some subclass and subclassFeature entries use _copy to reference another
// entry rather than duplicating text. We resolve these after building the index.
function resolveCopies(items, getOriginal) {
  return items.map(item => {
    if (!item._copy) return item;
    const original = getOriginal(item._copy);
    if (!original) {
      console.warn(`[DataLoader] _copy: could not resolve`, item._copy);
      return item;
    }
    const preserve = item._copy._preserve ?? {};
    const resolved = { ...original, ...item };
    // Restore any fields marked _preserve from the copy target
    for (const [key, val] of Object.entries(preserve)) {
      if (val) resolved[key] = item[key] ?? original[key];
    }
    delete resolved._copy;
    return resolved;
  });
}

// ─── Entry renderer ───────────────────────────────────────────────────────────
export function renderEntries(entries) {
  if (!entries) return '';
  if (typeof entries === 'string') return cleanTags(entries);
  return entries.map(entry => {
    if (typeof entry === 'string')       return cleanTags(entry);
    if (!entry || typeof entry !== 'object') return '';
    switch (entry.type) {
      case 'entries':
      case 'section':
        return [
          entry.name ? entry.name : '',
          renderEntries(entry.entries),
        ].filter(Boolean).join('\n');
      case 'list':
        return (entry.items ?? [])
          .map(i => `• ${renderEntries(typeof i === 'string' ? [i] : [i])}`)
          .join('\n');
      case 'table':
        return renderTable(entry);
      case 'inset':
        return `[${entry.name ?? 'Note'}]\n${renderEntries(entry.entries)}`;
      case 'quote':
        return `"${renderEntries(entry.entries)}"`;
      case 'abilityDc':
      case 'abilityAttackMod':
        return ''; // formula blocks — not useful as plain text
      case 'refSubclassFeature':
        return ''; // cross-references — resolved separately
      default:
        return entry.entries ? renderEntries(entry.entries) : '';
    }
  }).filter(Boolean).join('\n\n');
}

function renderTable(table) {
  const header = (table.colLabels ?? []).map(cleanTags).join(' | ');
  const rows = (table.rows ?? []).map(row =>
    row.map(cell =>
      typeof cell === 'string'
        ? cleanTags(cell)
        : cell?.value !== undefined ? String(cell.value) : ''
    ).join(' | ')
  );
  return [header, ...rows].filter(Boolean).join('\n');
}

function cleanTags(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\{@dice ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@damage ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@hit ([^|}]+)[^}]*\}/g, '+$1')
    .replace(/\{@h\}/g, 'Hit: ')
    .replace(/\{@variantrule ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@condition ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@status ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@skill ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@sense ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@action ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@spell ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@item ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@creature ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@feat ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@class ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@subclass ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@book ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@filter ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@5etools ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@note ([^|}]+)[^}]*\}/g, '[$1]')
    .replace(/\{@b ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@i ([^|}]+)[^}]*\}/g, '$1')
    .replace(/\{@[a-zA-Z]+ ([^|}]+)(?:\|[^}]*)?\}/g, '$1')  // catch-all
    .trim();
}

function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Races ────────────────────────────────────────────────────────────────────
function parseRaces(data) {
  const base = (data.race ?? []).map(r => parseRace(r, false));
  const subraces = (data.subrace ?? []).map(sr => parseSubrace(sr));
  return [...base, ...subraces];
}

function parseRace(r, isSubrace) {
  return {
    name:               r.name,
    source:             r.source,
    speed:              typeof r.speed === 'object' ? (r.speed.walk ?? 30) : (r.speed ?? 30),
    size:               r.size?.[0] ?? 'M',
    darkvision:         r.darkvision ?? 0,
    abilityBonuses:     parseAbilityBonuses(r.ability),
    traits:             (r.entries ?? []).map(parseTrait),
    languages:          r.languageProficiencies ?? [],
    skillProficiencies: r.skillProficiencies ?? [],
    resistances:        r.resist ?? [],
    isSubrace,
  };
}

function parseSubrace(sr) {
  return {
    name:               `${sr.name} (${sr.raceName})`,
    source:             sr.source ?? sr.raceSource,
    speed:              sr.speed ?? null,
    size:               sr.size?.[0] ?? null,
    darkvision:         sr.darkvision ?? null,
    abilityBonuses:     parseAbilityBonuses(sr.ability),
    traits:             (sr.entries ?? []).map(parseTrait),
    languages:          sr.languageProficiencies ?? [],
    skillProficiencies: sr.skillProficiencies ?? [],
    resistances:        sr.resist ?? [],
    isSubrace:          true,
    parentName:         sr.raceName,
    parentSource:       sr.raceSource,
  };
}

function parseAbilityBonuses(abilityArr) {
  if (!abilityArr) return [];
  const statKeys = ['str','dex','con','int','wis','cha'];
  return abilityArr.map(entry => {
    if (entry.choose) {
      return {
        type:   'choice',
        from:   entry.choose.from ?? statKeys,
        count:  entry.choose.count ?? 1,
        amount: entry.choose.amount ?? 1,
      };
    }
    const bonuses = {};
    for (const key of statKeys) {
      if (entry[key]) bonuses[key] = entry[key];
    }
    return { type: 'fixed', bonuses };
  });
}

function parseTrait(entry) {
  if (typeof entry === 'string') return { name: '', text: cleanTags(entry) };
  return {
    name: entry.name ?? '',
    text: renderEntries(entry.entries ?? []),
  };
}

// ─── Classes, classFeatures, subclasses, subclassFeatures ─────────────────────
function parseAllClasses(classFiles) {
  const parsedClasses  = [];
  const subclassIndex  = {};

  // Pass 1 — build raw lists from all files
  const rawSubclasses        = [];
  const rawSubclassFeatures  = [];
  const classFeatureIndex    = {}; // key → rendered text

  for (const data of classFiles) {

    // Index classFeature content (the actual text blocks)
    for (const cf of (data.classFeature ?? [])) {
      if (cf._copy) continue; // resolve later
      const key = classFeatureKey(cf.name, cf.className, cf.classSource, cf.level);
      classFeatureIndex[key] = renderEntries(cf.entries ?? []);
    }

    // Parse class definitions
    for (const c of (data.class ?? [])) {
      parsedClasses.push({
        name:                  c.name,
        source:                c.source,
        edition:               c.edition ?? 'classic',
        hd:                    c.hd?.faces ?? 8,
        proficiency:           c.proficiency ?? [],       // saving throws
        spellcastingAbility:   c.spellcastingAbility ?? null,
        casterProgression:     c.casterProgression ?? null, // 'full'|'1/2'|'1/3'|'pact'
        cantripProgression:    c.cantripProgression ?? [],
        spellsKnownProgression: c.spellsKnownProgressionFixed ?? [],
        preparedSpells:        c.preparedSpells ?? null,
        preparedSpellsProgression: c.preparedSpellsProgression ?? null,
        subclassTitle:         c.subclassTitle ?? 'Subclass',
        classFeatures:         parseClassFeatureRefs(c.classFeatures ?? []),
        classTableGroups:      c.classTableGroups ?? [],
        startingProficiencies: parseStartingProficiencies(c.startingProficiencies),
        startingEquipment:     c.startingEquipment ?? {},
        multiclassing:         c.multiclassing ?? null,
        featProgression:       c.featProgression ?? [],
      });
    }

    // Collect raw subclasses
    for (const sc of (data.subclass ?? [])) {
      rawSubclasses.push(sc);
    }

    // Collect raw subclass features
    for (const sf of (data.subclassFeature ?? [])) {
      rawSubclassFeatures.push(sf);
    }
  }

  // Pass 2 — resolve _copy on subclasses
  const resolvedSubclasses = resolveCopies(rawSubclasses, copyRef => {
    return rawSubclasses.find(sc =>
      sc.name === copyRef.name &&
      sc.source === copyRef.source &&
      sc.shortName === copyRef.shortName &&
      sc.className === copyRef.className &&
      sc.classSource === copyRef.classSource
    );
  });

  // Pass 3 — resolve _copy on subclassFeatures
  const resolvedSubclassFeatures = resolveCopies(rawSubclassFeatures, copyRef => {
    return rawSubclassFeatures.find(sf =>
      sf.name === copyRef.name &&
      sf.source === copyRef.source &&
      sf.className === copyRef.className &&
      sf.classSource === copyRef.classSource &&
      sf.subclassShortName === copyRef.subclassShortName &&
      sf.subclassSource === copyRef.subclassSource &&
      sf.level === copyRef.level
    );
  });

  // Pass 4 — build subclass index from resolved definitions
  for (const sc of resolvedSubclasses) {
    const key = subclassKey(sc.className, sc.classSource, sc.shortName, sc.source);
    subclassIndex[key] = {
      name:                sc.name,
      shortName:           sc.shortName,
      source:              sc.source,
      className:           sc.className,
      classSource:         sc.classSource,
      edition:             sc.edition ?? 'classic',
      spellcastingAbility: sc.spellcastingAbility ?? null,
      additionalSpells:    sc.additionalSpells ?? [],
      features:            [],
    };
  }

  // Pass 5 — attach resolved subclass features
  for (const sf of resolvedSubclassFeatures) {
    const key = subclassKey(
      sf.className, sf.classSource,
      sf.subclassShortName, sf.subclassSource,
    );

    if (subclassIndex[key]) {
      // Skip header=0 entries — these are section wrappers that use
      // refSubclassFeature to point at the real features
      if ((sf.header ?? 1) === 0) continue;

      subclassIndex[key].features.push({
        name:    sf.name,
        level:   sf.level,
        header:  sf.header ?? 1,
        entries: renderEntries(sf.entries ?? []),
      });
    } else {
      console.warn(
        `[DataLoader] Orphaned subclassFeature: "${sf.name}" ` +
        `(${sf.className}|${sf.classSource}|${sf.subclassShortName}|${sf.subclassSource})`
      );
    }
  }

  // Sort features by level within each subclass
  for (const sc of Object.values(subclassIndex)) {
    sc.features.sort((a, b) => a.level - b.level);
  }

  return { parsedClasses, subclassIndex, classFeatureIndex };
}

function parseClassFeatureRefs(featureArr) {
  // Each entry is either a pipe-delimited string or an object with
  // { classFeature, gainSubclassFeature }
  return featureArr.map(entry => {
    if (typeof entry === 'string') {
      return parseFeatureRef(entry, false);
    }
    if (entry.classFeature) {
      return {
        ...parseFeatureRef(entry.classFeature, false),
        gainSubclassFeature: entry.gainSubclassFeature ?? false,
      };
    }
    return null;
  }).filter(Boolean);
}

function parseFeatureRef(refString, isSubclass) {
  // Format: "Name|ClassName|ClassSource|Level|Source"
  // ClassSource and Source may be empty strings
  const parts = refString.split('|');
  return {
    name:        parts[0] ?? '',
    className:   parts[1] ?? '',
    classSource: parts[2] ?? '',
    level:       parseInt(parts[3] ?? parts[parts.length - 1], 10) || 1,
    source:      parts[4] ?? parts[2] ?? '',
    isSubclass,
  };
}

function parseStartingProficiencies(profs) {
  if (!profs) return {};
  return {
    armor:   (profs.armor ?? []).map(cleanTags),
    weapons: (profs.weapons ?? []).map(cleanTags),
    tools:   (profs.tools ?? []).map(cleanTags),
    skills:  profs.skills ?? [],  // keep raw — choices need wizard-step handling
  };
}

// ─── Spells ───────────────────────────────────────────────────────────────────
function parseSpells(data) {
  return (data.spell ?? []).map(s => ({
    name:        s.name,
    source:      s.source,
    level:       s.level,
    school:      s.school,
    castingTime: s.time?.[0] ?? {},
    range:       s.range ?? {},
    components:  s.components ?? {},
    duration:    s.duration?.[0] ?? {},
    ritual:      s.meta?.ritual ?? false,
    concentration: s.duration?.[0]?.concentration ?? false,
    classes:     extractSpellClasses(s),
    entries:     renderEntries(s.entries ?? []),
    entriesHigherLevel: renderEntries(s.entriesHigherLevel ?? []),
  }));
}

function extractSpellClasses(spell) {
  const fromList     = spell.classes?.fromClassList?.map(c => c.name) ?? [];
  const fromSubclass = spell.classes?.fromSubclass?.map(c => c.class?.name).filter(Boolean) ?? [];
  return [...new Set([...fromList, ...fromSubclass])];
}

function buildSpellIndex(spells) {
  const byClass = {};
  for (const spell of spells) {
    for (const cls of spell.classes) {
      if (!byClass[cls]) byClass[cls] = [];
      byClass[cls].push(spell);
    }
  }
  return byClass;
}

// ─── Backgrounds ──────────────────────────────────────────────────────────────
function parseBackgrounds(data) {
  return (data.background ?? []).map(bg => ({
    name:               bg.name,
    source:             bg.source,
    skillProficiencies: flattenProficiencyChoices(bg.skillProficiencies),
    toolProficiencies:  flattenProficiencyChoices(bg.toolProficiencies),
    languageCount:      bg.languageProficiencies?.[0]?.anyStandard ?? 0,
    abilityBonuses:     parseAbilityBonuses(bg.ability),
    startingEquipment:  bg.startingEquipment ?? [],
    entries:            renderEntries(bg.entries ?? []),
    summary:            buildBackgroundSummary(bg),
  }));
}

function buildBackgroundSummary(bg) {
  const rawSkills  = bg.skillProficiencies?.[0] ?? {};
  const skills = Object.keys(rawSkills)
    .filter(k => k !== 'choose' && rawSkills[k] === true)
    .map(capitalise);

  const choiceSkills = rawSkills.choose
    ? [`Any ${rawSkills.choose.count ?? 1} skill`]
    : [];

  const abilityBonuses = (bg.ability ?? [])
    .flatMap(a => Object.entries(a)
      .filter(([k]) => ['str','dex','con','int','wis','cha'].includes(k))
      .map(([k, v]) => `${k.toUpperCase()} +${v}`)
    );

  return {
    skills:             [...skills, ...choiceSkills],
    abilityBonuses,
    languageCount:      bg.languageProficiencies?.[0]?.anyStandard ?? 0,
    hasToolProficiency: !!(bg.toolProficiencies?.length),
  };
}

function flattenProficiencyChoices(profArray) {
  if (!profArray) return { fixed: [], choices: [] };
  const fixed   = [];
  const choices = [];
  for (const entry of profArray) {
    for (const [key, val] of Object.entries(entry)) {
      if (key === 'choose') {
        choices.push({ from: val.from ?? [], count: val.count ?? 1 });
      } else if (val === true) {
        fixed.push(key);
      }
    }
  }
  return { fixed, choices };
}

// ─── Feats ────────────────────────────────────────────────────────────────────
function parseFeats(data) {
  return (data.feat ?? []).map(f => ({
    name:           f.name,
    source:         f.source,
    prerequisite:   f.prerequisite ?? null,
    abilityBonuses: parseAbilityBonuses(f.ability),
    entries:        renderEntries(f.entries ?? []),
    proficiency:    f.proficiency ?? null,
    category:       f.category ?? null,   // e.g. 'EB' for Epic Boon feats
  }));
}

// ─── Initialise ───────────────────────────────────────────────────────────────
export function initialiseData() {
  if (_initialised) return;

  _races       = parseRaces(raceData);
  _spells      = parseSpells(spellData);
  _spellsByClass = buildSpellIndex(_spells);
  _backgrounds = parseBackgrounds(backgroundData);
  _feats       = parseFeats(featData);

  const { parsedClasses, subclassIndex } = parseAllClasses(CLASS_FILES);
  _classes       = parsedClasses;
  _subclassIndex = subclassIndex;

  _initialised = true;
  console.log(
    `[DataLoader] Loaded: ${_races.length} races, ` +
    `${_classes.length} classes, ` +
    `${Object.keys(_subclassIndex).length} subclasses, ` +
    `${_spells.length} spells, ` +
    `${_backgrounds.length} backgrounds, ` +
    `${_feats.length} feats`
  );
}

// ─── Public accessors ─────────────────────────────────────────────────────────
export const getRaces       = () => _races;
export const getClasses     = () => _classes;
export const getBackgrounds = () => _backgrounds;
export const getFeats       = () => _feats;

export function getSubclassesForClass(className, classSource) {
  return Object.values(_subclassIndex).filter(
    sc => sc.className === className && sc.classSource === classSource
  );
}

export function getSubclass(className, classSource, shortName, subclassSource) {
  return _subclassIndex[subclassKey(className, classSource, shortName, subclassSource)] ?? null;
}

export function getSpellsForClass(className, level = null) {
  const spells = _spellsByClass[className] ?? [];
  return level !== null ? spells.filter(s => s.level === level) : spells;
}

export function getSpellByName(name) {
  return _spells.find(s => s.name === name) ?? null;
}

export function getClassByName(name, source = null) {
  return _classes.find(c =>
    c.name === name && (source === null || c.source === source)
  ) ?? null;
}

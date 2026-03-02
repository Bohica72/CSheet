// src/data/classes/index.js
import { BARBARIAN } from './barbarian';
import { FIGHTER } from './fighter';
import { WIZARD } from './wizard';
// import { WIZARD } from './wizard'; 

const CLASS_REGISTRY = {
  barbarian: BARBARIAN,
  fighter: FIGHTER, 
  wizard: WIZARD,
};

export function getClassData(classId) {
  if (!classId) return null;
  return CLASS_REGISTRY[classId.toLowerCase()] ?? null;
}

export function getAllClasses() {
  return Object.values(CLASS_REGISTRY);
}


import { PUGILIST_CLASS } from '../data/pugilist_data';

// Registry — add new classes here as they're created
const CLASS_REGISTRY = {
  pugilist: PUGILIST_CLASS,
};

export function getClassById(classId) {
  return CLASS_REGISTRY[classId] ?? null;
}

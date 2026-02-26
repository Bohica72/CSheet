import { PUGILIST_CLASS, PUGILIST_SUBCLASSES } from './pugilist_data';
import { FIGHTER_CLASS, FIGHTER_SUBCLASSES } from './fighter_data';

const CLASS_REFERENCE_MAP = {
  pugilist: { classData: PUGILIST_CLASS, subclasses: PUGILIST_SUBCLASSES },
  fighter:  { classData: FIGHTER_CLASS,  subclasses: FIGHTER_SUBCLASSES },
};

export const getClassReferenceData = (classId) => {
  const key = classId?.toLowerCase().replace(/\s+/g, '_');
  return CLASS_REFERENCE_MAP[key] ?? { classData: null, subclasses: {} };
};


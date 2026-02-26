import { PUGILIST_CLASS, PUGILIST_SUBCLASSES } from './pugilist_data';
import { FIGHTER_CLASS, FIGHTER_SUBCLASSES } from './fighter_data'
// Add more imports here as you build out other class data files

const CLASS_REFERENCE_MAP = {
  pugilist: { classData: PUGILIST_CLASS, subclasses: PUGILIST_SUBCLASSES },
  // wizard:  { classData: WIZARD_CLASS,  subclasses: WIZARD_SUBCLASSES },
  fighter: { classData: FIGHTER_CLASS, subclasses: FIGHTER_SUBCLASSES },
};

export const getClassReferenceData = (classId) => {
  return CLASS_REFERENCE_MAP[classId?.toLowerCase()] ?? { classData: null, subclasses: {} };
};

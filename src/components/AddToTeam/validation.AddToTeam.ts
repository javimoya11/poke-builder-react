import {
  IAddToTeamErrors,
  IAddToTeamForm,
  MAX_HAPPINESS,
  MAX_IV,
  MAX_LEVEL,
  MAX_SINGLE_EV,
  MAX_TOTAL_EV,
  MIN_LEVEL,
  MOVE_SLOTS
} from './types.AddToTeam';

export const validateAddToTeam = (values: IAddToTeamForm): IAddToTeamErrors => {
  const errors: IAddToTeamErrors = {};

  if (!values.teamId) {
    errors.teamId = 'You must select a team.';
  }

  const evFields = {
    ev_hp: values.ev_hp,
    ev_atk: values.ev_atk,
    ev_def: values.ev_def,
    ev_spatk: values.ev_spatk,
    ev_spdef: values.ev_spdef,
    ev_spd: values.ev_spd
  } as const;

  for (const [field, value] of Object.entries(evFields) as [
    keyof typeof evFields,
    number
  ][]) {
    if (value < 0 || value > MAX_SINGLE_EV) {
      errors[field] = `Must be between 0 and ${MAX_SINGLE_EV}.`;
    }
  }

  const total = Object.values(evFields).reduce((sum, v) => sum + v, 0);
  if (total > MAX_TOTAL_EV) {
    errors.evTotal = `Total EVs cannot exceed ${MAX_TOTAL_EV} (currently ${total}).`;
  }

  const ivFields = {
    iv_hp: values.iv_hp,
    iv_atk: values.iv_atk,
    iv_def: values.iv_def,
    iv_spatk: values.iv_spatk,
    iv_spdef: values.iv_spdef,
    iv_spd: values.iv_spd
  } as const;

  for (const [field, value] of Object.entries(ivFields) as [
    keyof typeof ivFields,
    number
  ][]) {
    if (value < 0 || value > MAX_IV) {
      errors[field] = `Must be between 0 and ${MAX_IV}.`;
    }
  }

  if (values.level < MIN_LEVEL || values.level > MAX_LEVEL) {
    errors.level = `Must be between ${MIN_LEVEL} and ${MAX_LEVEL}.`;
  }

  if (values.happiness < 0 || values.happiness > MAX_HAPPINESS) {
    errors.happiness = `Must be between 0 and ${MAX_HAPPINESS}.`;
  }

  const filledMoves = MOVE_SLOTS.map((s) => values[s]).filter(Boolean);

  const uniqueMoves = new Set(filledMoves);
  if (uniqueMoves.size < filledMoves.length) {
    errors.moves = 'Moves cannot be repeated.';
  }

  if (!values.ability) {
    errors.ability = 'You must select an ability.';
  }

  if (!values.nature) {
    errors.nature = 'You must select a nature.';
  }

  return errors;
};

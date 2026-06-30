import {
  IAddToTeamErrors,
  IAddToTeamForm,
  MAX_SINGLE_EV,
  MAX_TOTAL_EV,
  MOVE_SLOTS,
} from './types.AddToTeam';

export const validateAddToTeam = (values: IAddToTeamForm): IAddToTeamErrors => {
  const errors: IAddToTeamErrors = {};

  if (!values.teamId) {
    errors.teamId = 'You must select a team.';
  }

  const evFields = {
    ev_hp:    values.ev_hp,
    ev_atk:   values.ev_atk,
    ev_def:   values.ev_def,
    ev_spatk: values.ev_spatk,
    ev_spdef: values.ev_spdef,
    ev_spd:   values.ev_spd,
  } as const;

  for (const [field, value] of Object.entries(evFields) as [keyof typeof evFields, number][]) {
    if (value < 0 || value > MAX_SINGLE_EV) {
      errors[field] = `Must be between 0 and ${MAX_SINGLE_EV}.`;
    }
  }

  const total = Object.values(evFields).reduce((sum, v) => sum + v, 0);
  if (total > MAX_TOTAL_EV) {
    errors.evTotal = `Total EVs cannot exceed ${MAX_TOTAL_EV} (currently ${total}).`;
  }

  const filledMoves = MOVE_SLOTS.map((s) => values[s]).filter(Boolean);
  if (filledMoves.length === 0) {
    errors.moves = 'At least one move is required.';
  }

  const uniqueMoves = new Set(filledMoves);
  if (uniqueMoves.size < filledMoves.length) {
    errors.moves = 'Moves cannot be repeated.';
  }

  if (!values.ability) {
    errors.ability = 'You must select an ability.';
  }

  return errors;
};

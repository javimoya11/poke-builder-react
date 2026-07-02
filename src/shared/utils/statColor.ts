/**
 * Maps a base-stat value to the colour used across the app for stat bars
 * (the AddToTeam stats table).
 * @param value - The base-stat value (0–255).
 * @returns A CSS colour keyword.
 */
export const statColor = (value: number): string => {
  if (value < 40) return 'red';
  if (value < 50) return 'tomato';
  if (value < 80) return 'sandybrown';
  if (value < 100) return 'gold';
  if (value < 120) return 'forestgreen';
  return 'lime';
};

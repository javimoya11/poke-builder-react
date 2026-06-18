/**
 * Extracts the numeric ID from a PokeAPI resource URL
 * (e.g. ".../pokemon/25/" -> "25"). Returns undefined when there is no match.
 * @param url - The PokeAPI resource URL.
 * @returns The ID as a string, or undefined if the URL does not match.
 */
export const idFromUrl = (url: string): string | undefined =>
  url.match(/(?<=\/pokemon\/)\d+/gm)?.[0];

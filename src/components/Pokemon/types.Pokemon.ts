export interface PokemonProps {
  id?: string;
  name: string;
  index: number;
}

export const PLACEHOLDER_IMG =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

/**
 * Varieties that are technically `is_battle_only` in PokeAPI, or are
 * otherwise not selectable ahead of time when building a team (they trigger
 * automatically mid-battle and revert afterwards, or never appear outside a
 * single fixed encounter). Verified against the PokeAPI data on 2026-07-02,
 * not from memory: some names one might expect here (e.g. `-crowned`,
 * `-power-construct`, `zygarde-complete`) are intentionally NOT in this list
 * — see the POKEMON_FILTER doc comment for why each is still kept.
 */
const BATTLE_ONLY_FORMS = new Set([
  'darmanitan-zen',
  'darmanitan-galar-zen',
  'meloetta-pirouette',
  'greninja-ash',
  'greninja-mega',
  'zygarde-mega',
  'floette-mega',
  'cramorant-gulping',
  'cramorant-gorging',
  'eiscue-noice',
  'morpeko-hangry',
  'castform-sunny',
  'castform-rainy',
  'castform-snowy',
  'aegislash-blade',
  'mimikyu-busted',
  'mimikyu-totem-busted',
  'urshifu-single-strike-gmax',
  'urshifu-rapid-strike-gmax',
  'palafin-hero',
  'terapagos-terastal',
  'terapagos-stellar',
  'pikachu-gmax',
  'eevee-gmax',
  'alcremie-gmax'
]);

/**
 * Varieties that are technically selectable (not battle-only) but are
 * excluded for product/UX reasons: pure cosmetic duplicates, event-only
 * forms with no practical availability, or a boss-only form that can never
 * be added to a team. See BATTLE_ONLY_FORMS for the battle-trigger cases.
 */
const NON_BATTLE_EXCLUDED_FORMS = new Set([
  'eternatus-eternamax',
  'keldeo-resolute',
  'mimikyu-totem-disguised',
  'floette-eternal',
  'zygarde-10-power-construct',
  'zygarde-50-power-construct',
  'pikachu-cosplay',
  'pikachu-rock-star',
  'pikachu-belle',
  'pikachu-pop-star',
  'pikachu-phd',
  'pikachu-libre',
  'pikachu-original-cap',
  'pikachu-hoenn-cap',
  'pikachu-sinnoh-cap',
  'pikachu-unova-cap',
  'pikachu-kalos-cap',
  'pikachu-alola-cap',
  'pikachu-partner-cap',
  'pikachu-world-cap'
]);

/**
 * Returns `true` for Pokémon variant names that should be hidden from the
 * list and from team-building: battle-only transformations (see
 * BATTLE_ONLY_FORMS) plus non-competitive/event-only duplicates (see
 * NON_BATTLE_EXCLUDED_FORMS), and every Gigantamax variety.
 *
 * Notable forms that are intentionally KEPT as pickable, navigable cards
 * because they are permanent and change stats/type/ability for team
 * building: Mega/Primal and Zacian/Zamazenta Crowned (both resolved to a
 * base species with a preselected held item — see MEGA_STONE_MAP,
 * getForcedItem, isMegaOrPrimal in components/AddToTeam/types.AddToTeam),
 * regional forms, Zygarde 10%/50%/Complete (the ability choice between
 * Aura Break and Power Construct for 10%/50% is handled inside AddToTeam —
 * see ABILITY_FORM_MAP), Necrozma Dusk-Mane/Dawn-Wings/Ultra, Urshifu
 * Single/Rapid Strike, Rotom appliances, Deoxys forms, Wormadam, Shaymin
 * Sky, Giratina Origin, Hoopa Unbound, Tornadus/Thundurus/Landorus
 * Incarnate/Therian, Kyurem Black/White, Minior "core" colors, Calyrex
 * Ice/Shadow Rider, Ogerpon masks, Basculin colors (distinct ability each).
 * Pumpkaboo/Gourgeist size varieties are collapsed to "average" only.
 * Pikachu's "-starter" (Let's Go) variety is kept because it has genuinely
 * different base stats; every other Pikachu costume is excluded as purely
 * cosmetic (see NON_BATTLE_EXCLUDED_FORMS).
 *
 * @param name - Pokémon name as returned by the PokéAPI.
 */
export const POKEMON_FILTER = (name: string): boolean =>
  BATTLE_ONLY_FORMS.has(name) ||
  NON_BATTLE_EXCLUDED_FORMS.has(name) ||
  name.includes('-gmax') ||
  name.includes('-small') ||
  name.includes('-large') ||
  name.includes('-super') ||
  name.includes('-meteor');

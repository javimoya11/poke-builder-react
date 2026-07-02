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
  // Darmanitan: Zen Mode triggers only mid-battle and reverts after.
  'darmanitan-zen',
  'darmanitan-galar-zen',
  // Meloetta: Pirouette is entered via Relic Song mid-battle.
  'meloetta-pirouette',
  // Greninja: Ash form only appears after a KO with Battle Bond; the
  // "greninja-mega" entry is a PokeAPI artifact with no in-game Mega.
  'greninja-ash',
  'greninja-mega',
  // "zygarde-mega" is a PokeAPI artifact with no in-game Mega. Note
  // zygarde-complete is intentionally NOT here: although it's normally only
  // reached mid-battle via Power Construct, it's kept as a pickable card so
  // a team can be built around that fixed state from the start.
  'zygarde-mega',
  // Floette: PokeAPI artifact, no in-game Mega Floette exists.
  'floette-mega',
  // Cramorant's Gulping/Gorging trigger only after eating Prey in battle.
  'cramorant-gulping',
  'cramorant-gorging',
  // Eiscue's Noice Face triggers only after Ice Face breaks in battle.
  'eiscue-noice',
  // Morpeko's Hangry switch is automatic each turn, not selectable.
  'morpeko-hangry',
  // Castform's weather forms revert once the weather clears.
  'castform-sunny',
  'castform-rainy',
  'castform-snowy',
  // Aegislash's Blade Forme is Stance Change automation; Shield is chosen
  // as the base form when building the team.
  'aegislash-blade',
  // Mimikyu's Busted forms trigger only once its disguise breaks in battle.
  'mimikyu-busted',
  'mimikyu-totem-busted',
  // Urshifu Gmax styles are a temporary in-battle Gigantamax, not a build.
  'urshifu-single-strike-gmax',
  'urshifu-rapid-strike-gmax',
  // Palafin's Hero form activates on the first mid-battle switch-in and
  // reverts outside of battle; it cannot be set ahead of time.
  'palafin-hero',
  // Terapagos: Terastal/Stellar are battle-only Tera transformations.
  'terapagos-terastal',
  'terapagos-stellar',
  // Any Gigantamax variety (temporary, battle-only by design).
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
  // Boss-only form from the Sword/Shield story fight; never obtainable or
  // usable in a normal team despite not being flagged battle-only.
  'eternatus-eternamax',
  // Cosmetic-only: identical stats/type to keldeo-ordinary.
  'keldeo-resolute',
  // Cosmetic-only, exclusive to a closed SM/USUM Totem event encounter.
  'mimikyu-totem-disguised',
  // Cosmetic ability-only variant from a closed XY event gift.
  'floette-eternal',
  // Zygarde 10%/50% "-power-construct" varieties only exist to carry the
  // Power Construct ability (identical stats/type to the base variety,
  // which only has Aura Break). The base "zygarde-10"/"zygarde-50" varieties
  // are shown instead, ability-agnostic, and AddToTeam resolves which form
  // to save from the ability chosen in the form — see ABILITY_FORM_MAP.
  'zygarde-10-power-construct',
  'zygarde-50-power-construct',
  // Pikachu's Cosplay and every "-cap" costume (event/Let's Go promo
  // outfits) are 100% identical to the base variety — same stats, type and
  // abilities, only the sprite differs. "pikachu-starter" (Let's Go) is
  // deliberately NOT here: it has genuinely different base stats.
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
  // Minior: keep the existing behavior of showing only the "core" (no
  // shell) colors and hiding the "-meteor" (shelled) forms.
  name.includes('-meteor');

-- Data integrity constraints for teams / team_pokemon.
-- These mirror validation already enforced client-side (see
-- src/components/AddToTeam/validation.AddToTeam.ts and NewTeam.tsx) so that
-- invalid rows cannot be written by a bug, a race condition, or a direct
-- API call from an authenticated user bypassing the UI.
--
-- Guard: abort with a clear message instead of a raw constraint-violation
-- error if existing rows would already violate one of these constraints.
do $$
begin
  if exists (
    select 1 from public.teams
    where char_length(btrim(name)) not between 1 and 50
  ) then
    raise exception 'Migration aborted: teams has rows with an empty or >50 char name. Fix or remove them before re-running this migration.';
  end if;

  if exists (
    select 1 from public.team_pokemon
    where level not between 1 and 100
       or happiness not between 0 and 255
       or ev_hp not between 0 and 255
       or ev_atk not between 0 and 255
       or ev_def not between 0 and 255
       or ev_spatk not between 0 and 255
       or ev_spdef not between 0 and 255
       or ev_spd not between 0 and 255
       or (ev_hp + ev_atk + ev_def + ev_spatk + ev_spdef + ev_spd) > 510
       or iv_hp not between 0 and 31
       or iv_atk not between 0 and 31
       or iv_def not between 0 and 31
       or iv_spatk not between 0 and 31
       or iv_spdef not between 0 and 31
       or iv_spd not between 0 and 31
       or slot not between 1 and 6
  ) then
    raise exception 'Migration aborted: team_pokemon has rows violating the new range/EV/IV/slot constraints. Fix or remove them before re-running this migration.';
  end if;

  if exists (
    select team_id, slot from public.team_pokemon
    group by team_id, slot
    having count(*) > 1
  ) then
    raise exception 'Migration aborted: team_pokemon has duplicate (team_id, slot) rows. Resolve the duplicates before re-running this migration.';
  end if;
end $$;

-- teams -----------------------------------------------------------------

alter table public.teams
  add constraint teams_name_length check (char_length(btrim(name)) between 1 and 50);

-- team_pokemon ------------------------------------------------------------

alter table public.team_pokemon
  add constraint team_pokemon_level_range check (level between 1 and 100),
  add constraint team_pokemon_happiness_range check (happiness between 0 and 255),
  add constraint team_pokemon_ev_hp_range check (ev_hp between 0 and 255),
  add constraint team_pokemon_ev_atk_range check (ev_atk between 0 and 255),
  add constraint team_pokemon_ev_def_range check (ev_def between 0 and 255),
  add constraint team_pokemon_ev_spatk_range check (ev_spatk between 0 and 255),
  add constraint team_pokemon_ev_spdef_range check (ev_spdef between 0 and 255),
  add constraint team_pokemon_ev_spd_range check (ev_spd between 0 and 255),
  add constraint team_pokemon_ev_total check (
    (ev_hp + ev_atk + ev_def + ev_spatk + ev_spdef + ev_spd) <= 510
  ),
  add constraint team_pokemon_iv_hp_range check (iv_hp between 0 and 31),
  add constraint team_pokemon_iv_atk_range check (iv_atk between 0 and 31),
  add constraint team_pokemon_iv_def_range check (iv_def between 0 and 31),
  add constraint team_pokemon_iv_spatk_range check (iv_spatk between 0 and 31),
  add constraint team_pokemon_iv_spdef_range check (iv_spdef between 0 and 31),
  add constraint team_pokemon_iv_spd_range check (iv_spd between 0 and 31),
  add constraint team_pokemon_slot_range check (slot between 1 and 6),
  add constraint team_pokemon_unique_slot unique (team_id, slot);

-- Explicit WITH CHECK on the existing RLS policies -------------------------
-- Both policies were created with only a USING clause. Postgres reuses
-- USING as an implicit WITH CHECK for INSERT/UPDATE when the policy command
-- is ALL, so this does not change current behavior — it makes the intent
-- explicit so the guarantee survives if the policies are ever split into
-- per-command policies (SELECT/INSERT/UPDATE/DELETE).

alter policy "teams: owner access"
  on public.teams
  with check (auth.uid() = user_id);

alter policy "team_pokemon: owner access"
  on public.team_pokemon
  with check (
    exists (
      select 1
      from public.teams
      where teams.id = team_pokemon.team_id
        and teams.user_id = auth.uid()
    )
  );

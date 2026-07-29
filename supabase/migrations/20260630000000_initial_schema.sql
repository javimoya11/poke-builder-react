-- Baseline schema for teams / team_pokemon.
-- These tables were originally created by hand in the Supabase dashboard,
-- before this project started tracking schema changes as migrations.
-- This migration reconstructs that baseline so a fresh environment (or a
-- fresh read of history) has the full picture. It uses IF NOT EXISTS /
-- guarded DDL throughout so it is a no-op against the existing production
-- database, where these objects already exist.

-- teams -----------------------------------------------------------------

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.teams enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'teams'
      and policyname = 'teams: owner access'
  ) then
    create policy "teams: owner access"
      on public.teams
      for all
      using (auth.uid() = user_id);
  end if;
end $$;

-- team_pokemon ------------------------------------------------------------

create table if not exists public.team_pokemon (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  slot smallint not null,
  pokemon_name text not null,
  pokemon_id text not null,
  nickname text,
  held_item text,
  ability text not null,
  nature text,
  level smallint not null default 50,
  gender text check (gender in ('male', 'female', 'genderless')),
  shiny boolean not null default false,
  happiness smallint not null default 255,
  tera_type text,
  ev_hp smallint not null default 0,
  ev_atk smallint not null default 0,
  ev_def smallint not null default 0,
  ev_spatk smallint not null default 0,
  ev_spdef smallint not null default 0,
  ev_spd smallint not null default 0,
  iv_hp smallint not null default 31,
  iv_atk smallint not null default 31,
  iv_def smallint not null default 31,
  iv_spatk smallint not null default 31,
  iv_spdef smallint not null default 31,
  iv_spd smallint not null default 31,
  move_1 text,
  move_2 text,
  move_3 text,
  move_4 text
);

alter table public.team_pokemon enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'team_pokemon'
      and policyname = 'team_pokemon: owner access'
  ) then
    create policy "team_pokemon: owner access"
      on public.team_pokemon
      for all
      using (
        exists (
          select 1
          from public.teams
          where teams.id = team_pokemon.team_id
            and teams.user_id = auth.uid()
        )
      );
  end if;
end $$;

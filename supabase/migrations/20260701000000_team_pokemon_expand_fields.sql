-- Expand team_pokemon with the fields required by the Showdown-style set definition.
-- New: IVs (per stat), level, gender, shiny, happiness, tera_type, nickname.
-- Naming follows the existing snake_case / spatk-spdef convention used by the EV columns.

alter table public.team_pokemon
  -- Individual Values (0–31). Default 31 (competitive standard).
  add column if not exists iv_hp    smallint not null default 31 check (iv_hp    between 0 and 31),
  add column if not exists iv_atk   smallint not null default 31 check (iv_atk   between 0 and 31),
  add column if not exists iv_def   smallint not null default 31 check (iv_def   between 0 and 31),
  add column if not exists iv_spatk smallint not null default 31 check (iv_spatk between 0 and 31),
  add column if not exists iv_spdef smallint not null default 31 check (iv_spdef between 0 and 31),
  add column if not exists iv_spd   smallint not null default 31 check (iv_spd   between 0 and 31),

  -- Level (1–100). Default 50 (VGC / official doubles format).
  add column if not exists level smallint not null default 50 check (level between 1 and 100),

  -- Gender. Nullable; constrained to the three valid values.
  add column if not exists gender text check (gender in ('male', 'female', 'genderless')),

  -- Shiny flag.
  add column if not exists shiny boolean not null default false,

  -- Happiness / friendship (0–255). Default 255.
  add column if not exists happiness smallint not null default 255 check (happiness between 0 and 255),

  -- Tera type. Nullable; stored as the type name (e.g. 'fire').
  add column if not exists tera_type text,

  -- Nickname. Nullable.
  add column if not exists nickname text;

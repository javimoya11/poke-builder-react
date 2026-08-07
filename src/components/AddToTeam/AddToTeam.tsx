import { DeleteItem } from 'components/DeleteItem/DeleteItem';
import { PokemonArtworkModal } from 'components/PokemonArtworkModal/PokemonArtworkModal';
import { Spinner } from 'components/Spinner/Spinner';
import { Modal } from 'feature/Modal/Modal';
import { Switch } from 'feature/Switch/Switch';
import { cachedImage, spriteUrl } from 'utils/cachedImage';
import { idFromUrl } from 'utils/idFromUrl';
import { prettify, prettifyItem } from 'utils/string-utils';
import { MovesFieldset } from './MovesFieldset';
import { StatsFieldset } from './StatsFieldset';
import styles from './AddToTeam.module.css';
import {
  availableGenders,
  GENDERS,
  IAddToTeam,
  IAddToTeamForm,
  MAX_HAPPINESS,
  MAX_LEVEL,
  MIN_LEVEL,
  NATURE_STAT,
  TERA_TYPES
} from './types.AddToTeam';
import { useAddToTeamData } from './useAddToTeamData';
import { useAddToTeamForm } from './useAddToTeamForm';

export const AddToTeam = ({
  open,
  onClose,
  pokemon,
  editing,
  teamId,
  lockTeam
}: IAddToTeam) => {
  const data = useAddToTeamData(pokemon, editing);

  return (
    <Modal isOpen={open} onClose={onClose} className={styles.modal}>
      {!data.dataReady ? (
        <Spinner />
      ) : (
        <AddToTeamForm
          onClose={onClose}
          editing={editing}
          teamId={teamId}
          lockTeam={lockTeam}
          data={data}
        />
      )}
    </Modal>
  );
};

const AddToTeamForm = ({
  onClose,
  editing,
  teamId,
  lockTeam,
  data
}: {
  onClose: () => void;
  editing?: IAddToTeam['editing'];
  teamId?: string;
  lockTeam?: boolean;
  data: ReturnType<typeof useAddToTeamData>;
}) => {
  const {
    effectivePokemon,
    abilityFormRule,
    altAbilityFormPokemon,
    forcedItem,
    originForcedForm,
    natures,
    species,
    heldItems,
    heldItemsLoading,
    moves,
    typeIconMap,
    teams,
    user,
    queryClient
  } = data;

  const isEditing = !!editing;

  const {
    form,
    set,
    levelInput,
    onLevelChange,
    onLevelBlur,
    evInputs,
    onEvChange,
    onEvBlur,
    errors,
    loading,
    formError,
    formRef,
    deleteOpen,
    setDeleteOpen,
    artworkOpen,
    setArtworkOpen,
    pokemonToSave,
    abilityOptions,
    matchedMegaForm,
    megaViewRequested,
    setMegaViewRequested,
    displayPokemon,
    itemForcedFormItems,
    teamFull,
    remainingEv,
    usedMoves,
    submitHandler,
    deleteHandler
  } = useAddToTeamForm({
    editing,
    teamId,
    effectivePokemon,
    abilityFormRule,
    altAbilityFormPokemon,
    forcedItem,
    originForcedForm,
    natures,
    species,
    teams,
    user,
    queryClient,
    onClose
  });

  const typeIcons = displayPokemon?.types
    ? displayPokemon.types.map((entry) => ({
        name: entry.type.name,
        icon: typeIconMap[entry.type.url] ?? null
      }))
    : [];

  const genderOptions = isEditing
    ? GENDERS
    : availableGenders(species?.genderRate);

  const selectedNature = natures.find((n) => n.name === form.nature);
  const natureIncreasedStat = selectedNature?.increased_stat
    ? (NATURE_STAT[selectedNature.increased_stat] ?? null)
    : null;
  const natureDecreasedStat = selectedNature?.decreased_stat
    ? (NATURE_STAT[selectedNature.decreased_stat] ?? null)
    : null;

  const itemOptions = (() => {
    const extraNames = [
      ...new Set([...(forcedItem ? [forcedItem] : []), ...itemForcedFormItems])
    ].filter((name) => !heldItems.some((i) => i.name === name));
    if (extraNames.length === 0) return heldItems;
    return [...extraNames.map((name) => ({ name, url: '' })), ...heldItems];
  })();

  return (
    <>
      <form
        ref={formRef}
        className={styles.addToTeamForm}
        onSubmit={async (e) => {
          e.preventDefault();
          await submitHandler();
        }}
      >
        <header className={styles.formHeader}>
          <div className={styles.headerIdentity}>
            {displayPokemon && (
              <button
                type="button"
                className={styles.headerSpriteButton}
                onClick={() => setArtworkOpen(true)}
                aria-label={`View larger image of ${prettify(displayPokemon.name)}`}
              >
                <img
                  src={cachedImage(spriteUrl(displayPokemon.id, form.shiny), 48)}
                  alt={displayPokemon.name}
                  className={styles.headerSprite}
                />
              </button>
            )}
            <div className={styles.headerNameGroup}>
              <span className={styles.headerNameLine}>
                <span className={styles.headerDex}>
                  #{idFromUrl(effectivePokemon?.species.url ?? '')}
                </span>
                <span className={styles.headerName}>
                  {prettify(effectivePokemon?.name ?? '')}
                </span>
              </span>
              {typeIcons.length > 0 && (
                <span className={styles.headerTypes}>
                  {typeIcons.map(
                    (type) =>
                      type.icon && (
                        <img key={type.name} src={type.icon} alt={type.name} />
                      )
                  )}
                </span>
              )}
            </div>
          </div>

          <div className={styles.headerFields}>
            <label htmlFor="nickname" className={styles.headerField}>
              Nickname
              <input
                id="nickname"
                type="text"
                value={form.nickname}
                placeholder={prettify(effectivePokemon?.name ?? '')}
                maxLength={30}
                onChange={(e) => set('nickname', e.target.value)}
              />
            </label>

            <label htmlFor="level" className={styles.headerFieldNarrow}>
              Level
              <input
                id="level"
                type="number"
                min={MIN_LEVEL}
                max={MAX_LEVEL}
                step={1}
                value={levelInput}
                onChange={(e) => onLevelChange(e.target.value)}
                onBlur={onLevelBlur}
                aria-invalid={!!errors.level}
              />
              {errors.level && (
                <span className={styles.fieldError}>{errors.level}</span>
              )}
            </label>
          </div>
        </header>
        <div className={styles.formInputs}>
          <div className={styles.formLeft}>
            <div className={styles.row}>
              <label htmlFor="team-name">
                Team
                <select
                  id="team-name"
                  value={form.teamId}
                  onChange={(e) => set('teamId', e.target.value)}
                  aria-invalid={!!errors.teamId}
                  disabled={lockTeam}
                >
                  <option value="" disabled hidden>
                    Select a team...
                  </option>
                  {teams.map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                      disabled={
                        (t.team_pokemon?.length ?? 0) >= 6 &&
                        String(t.id) !== teamId
                      }
                    >
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.teamId && (
                  <span className={styles.fieldError}>{errors.teamId}</span>
                )}
                {teamFull && (
                  <span className={styles.fieldError}>
                    This team is full (6/6).
                  </span>
                )}
              </label>

              <label htmlFor="item">
                Held item
                <select
                  id="item"
                  value={form.held_item}
                  onChange={(e) => set('held_item', e.target.value)}
                  disabled={heldItemsLoading}
                >
                  <option value="">
                    {heldItemsLoading ? 'Loading...' : 'None'}
                  </option>
                  {itemOptions.map((item) => (
                    <option key={item.name} value={item.name}>
                      {prettifyItem(item.name)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.row}>
              <label htmlFor="ability">
                Ability
                <select
                  id="ability"
                  value={form.ability}
                  onChange={(e) => set('ability', e.target.value)}
                  aria-invalid={!!errors.ability}
                >
                  <option value="" disabled hidden>
                    Select an ability...
                  </option>
                  {abilityOptions.map(({ ability }) => (
                    <option key={ability.name} value={ability.name}>
                      {prettifyItem(ability.name)}
                    </option>
                  ))}
                </select>
                {errors.ability && (
                  <span className={styles.fieldError}>{errors.ability}</span>
                )}
              </label>

              <label htmlFor="nature">
                Nature
                <select
                  id="nature"
                  value={form.nature}
                  onChange={(e) => set('nature', e.target.value)}
                  aria-invalid={!!errors.nature}
                >
                  <option value="" disabled hidden>
                    Select a nature...
                  </option>
                  {natures.map((n) => (
                    <option key={n.name} value={n.name}>
                      {prettifyItem(n.name)}
                      {n.increased_stat &&
                      n.decreased_stat &&
                      n.increased_stat !== n.decreased_stat
                        ? ` (+${prettifyItem(n.increased_stat)} / -${prettifyItem(n.decreased_stat)})`
                        : ''}
                    </option>
                  ))}
                </select>
                {errors.nature && (
                  <span className={styles.fieldError}>{errors.nature}</span>
                )}
              </label>
            </div>

            <div className={styles.row}>
              <label htmlFor="tera">
                <span className={styles.labelWithIcon}>
                  Tera type
                  {form.tera_type && typeIconMap[form.tera_type] && (
                    <img
                      src={typeIconMap[form.tera_type] as string}
                      alt={form.tera_type}
                    />
                  )}
                </span>
                <select
                  id="tera"
                  value={form.tera_type}
                  onChange={(e) =>
                    set(
                      'tera_type',
                      e.target.value as IAddToTeamForm['tera_type']
                    )
                  }
                >
                  <option value="">None</option>
                  {TERA_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {prettifyItem(type)}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="gender">
                Gender
                <select
                  id="gender"
                  value={form.gender}
                  onChange={(e) =>
                    set('gender', e.target.value as IAddToTeamForm['gender'])
                  }
                >
                  <option value="" disabled hidden>
                    Select a gender...
                  </option>
                  {genderOptions.map((g) => (
                    <option key={g} value={g}>
                      {prettifyItem(g)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.row}>
              <label htmlFor="happiness">
                Happiness
                <input
                  id="happiness"
                  type="number"
                  min={0}
                  max={MAX_HAPPINESS}
                  step={1}
                  value={form.happiness}
                  onChange={(e) =>
                    set(
                      'happiness',
                      Math.min(
                        MAX_HAPPINESS,
                        Math.max(0, Number(e.target.value))
                      )
                    )
                  }
                  aria-invalid={!!errors.happiness}
                />
                {errors.happiness && (
                  <span className={styles.fieldError}>{errors.happiness}</span>
                )}
              </label>

              <label htmlFor="shiny" className={styles.shinyLabel}>
                <Switch
                  id="shiny"
                  checked={form.shiny}
                  onChange={(checked) => set('shiny', checked)}
                />
                Shiny
              </label>
            </div>
          </div>

          <div className={styles.formRight}>
            <StatsFieldset
              form={form}
              set={set}
              displayPokemon={displayPokemon}
              natureIncreasedStat={natureIncreasedStat}
              natureDecreasedStat={natureDecreasedStat}
              evInputs={evInputs}
              onEvChange={onEvChange}
              onEvBlur={onEvBlur}
              errors={errors}
              remainingEv={remainingEv}
              matchedMegaForm={matchedMegaForm}
              megaViewRequested={megaViewRequested}
              setMegaViewRequested={setMegaViewRequested}
            />
          </div>
        </div>

        <MovesFieldset
          form={form}
          set={set}
          moves={moves}
          typeIconMap={typeIconMap}
          errors={errors}
          usedMoves={usedMoves}
        />

        {formError && (
          <div
            className={`${styles.banner} ${styles.bannerError}`}
            role="alert"
          >
            {formError}
          </div>
        )}

        <div className={styles.formFooter}>
          {isEditing && (
            <button
              type="button"
              className={styles.delete}
              onClick={() => setDeleteOpen(true)}
            >
              {loading ? (
                <span className="button-spinner" aria-label="Loading" />
              ) : (
                'Delete Pokémon'
              )}
            </button>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={
              loading ||
              !user ||
              !effectivePokemon ||
              !pokemonToSave ||
              !form.teamId ||
              teamFull
            }
          >
            {loading ? (
              <span className="button-spinner" aria-label="Loading" />
            ) : isEditing ? (
              'Update Pokémon'
            ) : (
              'Add to team'
            )}
          </button>
        </div>

        {!user && (
          <p className={styles.loginHint}>Log in to add Pokémon to a team</p>
        )}
      </form>
      {deleteOpen && editing && (
        <DeleteItem
          open
          onClose={() => {
            setDeleteOpen(false);
          }}
          item={{
            ...editing,
            name: form.nickname.length
              ? form.nickname
              : prettify(editing.pokemon_name)
          }}
          itemType="Pokémon"
          handler={deleteHandler}
          onCancel={() => setDeleteOpen(false)}
        />
      )}
      {displayPokemon && (
        <PokemonArtworkModal
          open={artworkOpen}
          onClose={() => setArtworkOpen(false)}
          pokemonId={displayPokemon.id}
          name={displayPokemon.name}
          shiny={form.shiny}
        />
      )}
    </>
  );
};

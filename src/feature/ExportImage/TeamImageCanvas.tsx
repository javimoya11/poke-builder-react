import { formatEvs, formatIvs } from 'feature/ExportShowdown/showdownExport.utils';
import { Team } from 'hooks/useTeams';
import { CSSProperties, forwardRef } from 'react';
import { prettify, prettifyItem } from 'utils/string-utils';
import styles from './ExportImage.module.css';
import { ExportMode } from './types.ExportImage';
import { TeamImageData } from './useTeamImageData';

export const TeamImageCanvas = forwardRef<
  HTMLDivElement,
  {
    team: Team;
    mode: ExportMode;
    data: TeamImageData;
    columns: number;
    style?: CSSProperties;
  }
>(({ team, mode, data, columns, style }, ref) => {
  const { moveType, typeIcon, spriteUrlFor, typeIconUrlFor, resolve } = data;
  const extended = mode === 'extended';

  return (
    <div ref={ref} className={styles.canvas} style={style}>
      <h2 className={styles.title}>{team.name}</h2>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: 6 }, (_, i) => {
          const p = team.team_pokemon[i];
          if (!p) return <div key={i} className={styles.empty} />;
          const evsText = formatEvs(p);
          const ivsText = formatIvs(p);
          return (
            <div key={i} className={styles.mon}>
              <img src={resolve(spriteUrlFor(p.pokemon_id, p.shiny))} alt="" />
              <span className={styles.nick}>
                {p.nickname ?? prettify(p.pokemon_name)}
              </span>

              <div className={styles.moves}>
                {[p.move_1, p.move_2, p.move_3, p.move_4]
                  .filter((mv): mv is string => Boolean(mv))
                  .map((mv) => {
                    const type = moveType[mv];
                    const icon = type ? typeIcon[type] : null;
                    return (
                      <span key={mv} className={styles.move}>
                        <span className={styles.moveName}>{prettify(mv)}</span>
                        {icon && (
                          <img src={resolve(typeIconUrlFor(icon))} alt="" />
                        )}
                      </span>
                    );
                  })}
              </div>

              {extended && (
                <div className={styles.detail}>
                  <span>
                    Lv {p.level}
                    {p.shiny && ' ✦'}
                    {p.gender && p.gender !== 'genderless'
                      ? ` ${prettifyItem(p.gender)}`
                      : ''}
                  </span>
                  <span>Ability: {prettify(p.ability)}</span>
                  {p.held_item && (
                    <span>Held Item: {prettify(p.held_item)}</span>
                  )}
                  {p.tera_type && (
                    <span>Tera Type: {prettify(p.tera_type)}</span>
                  )}
                  {evsText && <span>EVs: {evsText}</span>}
                  {p.nature && <span>{prettify(p.nature)} Nature</span>}
                  {ivsText && <span>IVs: {ivsText}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

TeamImageCanvas.displayName = 'TeamImageCanvas';

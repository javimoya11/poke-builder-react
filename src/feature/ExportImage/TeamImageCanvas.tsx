import { Team } from 'hooks/useTeams';
import { CSSProperties, forwardRef } from 'react';
import { prettify } from 'utils/string-utils';
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
                        {prettify(mv)}
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
                    {p.shiny && ' ✦'} {p.gender ?? ''}
                  </span>
                  <span>{prettify(p.ability)}</span>
                  {p.held_item && <span>@ {prettify(p.held_item)}</span>}
                  {p.nature && <span>{prettify(p.nature)}</span>}
                  <span>
                    EV {p.ev_hp}/{p.ev_atk}/{p.ev_def}/{p.ev_spatk}/{p.ev_spdef}
                    /{p.ev_spd}
                  </span>
                  <span>
                    IV {p.iv_hp}/{p.iv_atk}/{p.iv_def}/{p.iv_spatk}/{p.iv_spdef}
                    /{p.iv_spd}
                  </span>
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

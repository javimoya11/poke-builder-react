import { Modal } from 'feature/Modal/Modal';
import { useEffect, useRef, useState } from 'react';
import styles from './ExportImage.module.css';
import { TeamImageCanvas } from './TeamImageCanvas';
import { ExportMode, IExportImageModal } from './types.ExportImage';
import { useTeamExport } from './useTeamExport';
import { useTeamImageData } from './useTeamImageData';

/** Below this viewport width the preview stacks into a single column. */
const MOBILE_BREAKPOINT = 560;

export const ExportImageModal = ({
  open,
  onClose,
  team
}: IExportImageModal) => {
  const [mode, setMode] = useState<ExportMode>('basic');
  const [previewColumns, setPreviewColumns] = useState(3);
  const captureRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { download, busy } = useTeamExport(captureRef, team.name);
  const data = useTeamImageData(team);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const apply = (width: number) => {
      setPreviewColumns(width < MOBILE_BREAKPOINT ? 1 : 3);
    };
    apply(viewport.clientWidth);
    const observer = new ResizeObserver((entries) => {
      apply(entries[0].contentRect.width);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [open]);

  return (
    <Modal isOpen={open} onClose={onClose}>
      <div className={styles.controls}>
        <button
          onClick={() => setMode('basic')}
          aria-pressed={mode === 'basic'}
        >
          Basic
        </button>
        <button
          onClick={() => setMode('extended')}
          aria-pressed={mode === 'extended'}
        >
          Extended
        </button>
      </div>

      <div ref={viewportRef} className={styles.previewViewport}>
        <TeamImageCanvas
          team={team}
          mode={mode}
          data={data}
          columns={previewColumns}
          style={{ width: '100%' }}
        />
      </div>

      <div className={styles.captureLayer} aria-hidden="true">
        <TeamImageCanvas
          ref={captureRef}
          team={team}
          mode={mode}
          data={data}
          columns={3}
        />
      </div>

      <button className={styles.download} onClick={download} disabled={busy}>
        {busy ? 'Generating...' : 'Download PNG'}
      </button>
    </Modal>
  );
};

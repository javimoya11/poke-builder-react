import { toPng } from 'html-to-image';
import { RefObject, useState } from 'react';

/**
 * Exports the referenced node to a downloadable PNG. Images inside the node
 * are expected to be inlined as data URIs already (see TeamImageCanvas), so
 * this doesn't fetch or cache-bust anything: doing so is what made
 * html-to-image collapse proxied images into a single one.
 * @param ref - The node to capture.
 * @param fileName - The download file name, without extension.
 */
export const useTeamExport = (
  ref: RefObject<HTMLDivElement | null>,
  fileName: string
) => {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    const node = ref.current;
    if (!node) return;
    setBusy(true);
    try {
      const opts = { pixelRatio: 2 };
      await toPng(node, opts);
      const dataUrl = await toPng(node, opts);

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${fileName}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  return { download, busy };
};

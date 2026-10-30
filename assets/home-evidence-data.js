/* Contest-safe evidence-card fallback.
 * The original photo bundle is unavailable on the published site.
 * Preserve any real images supplied by future versions.
 */
(() => {
  const existing = Array.isArray(window.homeEvidenceImages)
    ? window.homeEvidenceImages
    : [];
  const labels = [
    'THE SECRET ALLIANCE',
    'THE PLANNING ROOM',
    'THE ROBOT ARMY',
    'THE REVENGE NOTE'
  ];
  function placeholder(index) {
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'assets/villain-reference.jpg';
    const background = ctx.createLinearGradient(0, 0, 960, 540);
    background.addColorStop(0, '#111e2b');
    background.addColorStop(1, '#273446');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 960, 540);
    ctx.strokeStyle = '#caa56a';
    ctx.lineWidth = 5;
    ctx.strokeRect(32, 32, 896, 476);
    ctx.fillStyle = '#e9d4aa';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('HEROIC SHOWDOWN  /  CASE FILE', 74, 105);
    ctx.fillStyle = '#f4e8d5';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(labels[index], 74, 284);
    ctx.fillStyle = '#d3c1a4';
    ctx.font = '24px sans-serif';
    ctx.fillText('Evidence image not available on this build', 74, 350);
    ctx.fillStyle = '#b4a18a';
    ctx.font = '20px monospace';
    ctx.fillText('FILE 0' + (index + 1) + '  •  ARCHIVED RECORD', 74, 448);
    return canvas.toDataURL('image/png');
  }
  window.homeEvidenceImages = Array.from(
    { length: 4 },
    (_, index) => existing[index] || placeholder(index)
  );
})();

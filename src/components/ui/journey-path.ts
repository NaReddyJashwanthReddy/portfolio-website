/** Align each chapter with the guardian as the panorama crosses the viewport. */
export function journeyGeometry(progress: number, width: number, count: number,
  contact: { direction?: 1 | -1; chapter?: number; guardianWidth?: number } = {}) {
  const p = Math.max(0, Math.min(1, progress));
  const mobile = width < 760;
  const step = mobile ? width * 1.04 : Math.max(390, width * .35);
  const last = Math.max(0, count - 1);
  const distance = step * last;
  // Keep the original centered path and selection timing on mobile.
  const inset = Math.min(width / 2, Math.max(190, width * .16));
  const anchor = mobile ? width * .5 : inset + p * (width - inset * 2);
  const guardianAnchor = anchor;
  let chapter = Math.round(p * last);
  if (!mobile) {
    // A chapter is touched when the dragon's leading edge reaches its stem.
    const size = contact.guardianWidth ?? Math.max(170, Math.min(190, width * .15));
    const reach = size * .4 / step;
    const forward = contact.direction !== -1;
    const previous = contact.chapter ?? (forward ? 0 : last);
    const touched = forward ? Math.floor(p * last + reach + 1e-9) : Math.ceil(p * last - reach - 1e-9);
    // Reversing between chapter points must not select an untouched neighbor.
    chapter = Math.max(0, Math.min(last, forward ? Math.max(previous, touched) : Math.min(previous, touched)));
  }
  return { step, anchor, guardianAnchor, offset: anchor - distance * p, trackWidth: distance + width,
    chapter };
}

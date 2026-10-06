/** Align each chapter with the guardian as the panorama crosses the viewport. */
export function journeyGeometry(progress: number, width: number, count: number) {
  const p = Math.max(0, Math.min(1, progress));
  const mobile = width < 760;
  const step = mobile ? width * 1.04 : Math.max(390, width * .35);
  const anchor = width * (mobile ? .5 : .31 + p * .38);
  const distance = step * Math.max(0, count - 1);
  // The guardian leads the current chapter across the bridge, clear of its copy.
  const guardianAnchor = mobile ? anchor : Math.min(width - 110, anchor + step * .5);
  return { step, anchor, guardianAnchor, offset: anchor - distance * p, trackWidth: distance + width,
    chapter: Math.round(p * Math.max(0, count - 1)) };
}

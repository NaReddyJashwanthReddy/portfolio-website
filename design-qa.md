# Journey and Contact design QA

No remaining actionable P0/P1/P2 findings in the verified states.

## Source and intentional adaptation

Source: C:/Users/tangw/.codex/attachments/1bb392c3-1d8c-4c1e-b284-0af519aaa3c4/Pasted text.txt. Its original alternating chapters and horizontally scrubbed line are preserved in output/journey-contact/reference-timeline.tsx and rendered in reference.html for comparison. The approved heavenly-sky-v2.webp, supplied signature and approved guardian atlases establish the visual identity. The supplied dossier imagery establishes gold/ivory/black styling only; no character lore is imported.

The gold bridge replaces the reference line, and the approved animated dragon leads the current career chapter instead of a dot. Real career stories replace fictional roadmap copy. Persistent portfolio navigation and chapter-jump controls are added. Mobile places chapters below the bridge for readability. This is a themed adaptation, not a pixel-identical clone.

## Evidence and normalization

Evidence folder: C:/Users/tangw/Documents/email-freelancer/output/journey-contact/qa/.

- Source reference-layout.png and implementation journey-desktop.png are both 1265 x 712 pixels at CSS 1280 x 720, mid-scroll with alternating chapters. The browser capture trims scrollbar/borders; both use the same capture method/density. They were placed together in journey-comparison.png (1800 x 555), opened and visually reviewed.
- Final opening chapter: journey-final-preview.png, default CSS 1280 x 720. Tall desktop: journey-desktop-tall.png, 1265 x 889 at CSS 1280 x 900. Tablet: journey-tablet.png, 1009 x 887 at CSS 1024 x 900.
- Phone: journey-mobile.png, 375 x 827 at CSS 390 x 860. Compact phone after repair: journey-small-phone.png, 305 x 667 at CSS 320 x 700. Heading, dragon, active chapter and footer controls have separate space.
- Contact source art is public/assets/journey/contact-observatory.webp (1536 x 1024). Contact desktop capture is contact-desktop.png (1280 x 900). Source is normalized by object-cover cropping; contact-comparison.png (1800 x 670) puts both together and was opened and reviewed.
- Contact tablet: contact-tablet.png (1024 x 900). Phone: contact-mobile.png (375 x 827 at CSS 390 x 860). Compact phone: contact-small-phone.png and contact-small-phone-bottom.png (305 x 667 at CSS 320 x 700). Ordinary scrolling reaches email actions, profile links and footer.
- Focused comparison: detail-comparison.png (1150 x 420), opened to inspect chapter typography/context and email/action/link spacing. Contact source art contains no UI text; live controls inherit the approved portfolio styling.

## Comparison history and repairs

1. P1: General inside-page sizing overrode Journey's dragon size, and measuring its temporarily scaled bounding box contaminated its position. Fixed intrinsic offsetWidth measurement, rule specificity and placement ahead of current copy. Rechecked journey-final-preview.png, journey-desktop.png and journey-tablet.png.
2. P2: Compact-phone dragon overlapped the page heading. Shifted the short-viewport bridge downward, reduced guardian size to 175px and adjusted chapter spacing. Rechecked journey-small-phone.png; no overlap remains.
3. P2: A fixed bridge overhang could leave a gap at large widths. Geometry tests caught this at 1920px. Changed overhang to one viewport on both sides; 707 crossing checks now pass.
4. P2: Lower desktop context approached the control divider. Lifted below-bridge copy and tuned short-desktop typography. Rechecked journey-desktop.png and detail-comparison.png.
5. Contact title sizing was refined at 320px so the long italic word stays inside the content width. Rechecked both compact Contact captures. Document scrollWidth is 305px for the 320px viewport with its scrollbar.

## Required fidelity surfaces

- Typography: Georgia display titles continue the realm's serif character; Arial handles readable stories and compact UI. Active chapters, date labels and email wrap cleanly.
- Spacing/layout: desktop/tablet retain alternating chronological chapters. The dragon leads their progression. Mobile shows one lower chapter with accessible navigation; Contact follows title, introduction, email, links and footer.
- Color: forest/charcoal, warm ivory and champagne gold connect both pages to the existing landing/Work theme. Active chapters are emphasized; adjacent chapters are intentionally subdued.
- Images: genuine generated bridge/observatory artwork and approved dragon atlases. No illustration substitutes or fantasy text. Bridge alpha matches the original exactly after quality-90 WebP compression. Assets are saved in the project: bridge 433292 bytes, Contact 270608 bytes.
- Copy: existing seven verified career chapters, exact known date precision, 2028 explicitly expected. Reference fictional roadmap content is absent. Contact uses the existing email and profile destinations.

## Functional and accessibility verification

- Production build and TypeScript passed. Existing large-chunk warnings remain for legacy optional Spline/Three bundles.
- Journey checks passed: 49 chapter alignments at seven widths, 707 viewport crossings, guardian bounds and endpoint clamps. Existing Work catalogue and guardian roaming checks passed.
- Browser verified forward/right and backward/left atlas travel, chapter jumps, final chapter/progress 1, and paused ambient frames while chapter navigation still works.
- Copy email resolves and displays Copied plus live status. Email/subject, GitHub, Kaggle and resume destinations checked; public resume.pdf exists. No email sent.
- Notes dialog opens/focuses close and dismisses with Escape. Headings receive focus after navigation. Motion pause and the same non-ambient reduced-motion path keep navigation usable.
- Contact-to-Journey verified centre phase, inert main, mounted smoke overlay, destination commit, guided=true and busy=false. Early exhale frame saved as dragon-breath-transition.png.
- Final clean-reload console check: zero new errors. Temporary viewport override reset. Local Journey preview remains open and marked deliverable.

## Follow-up polish and limits

P3: Legacy Spline/Three bundles retain large-chunk warnings; a separate performance pass could split optional older routes further. Email uses the visitor's composer. Clipboard-denied fallback is implemented but was not forced during QA.

## Checklist

- [x] Supplied chronology adapted to a heavenly bridge.
- [x] Persistent approved dragon follows scroll and turns with travel direction.
- [x] Black-smoke page transitions preserved.
- [x] Contact email, copy, profile and resume actions finished.
- [x] Desktop/tablet/phone visual comparisons and repaired states captured.
- [x] Build, meaningful geometry/regression checks and clean console passed.

final result: passed

## Desktop companion port — 8 October 2026

- Imported the finalized 480-frame left/right body loops, 20-frame fuller-mane hover, cloud formation/drift/dissolve, rotating-orb human form and 410-frame black/scarlet flame sequence. Alpha and common foot registration are preserved; clouds retain their source proportions.
- Added five-second greetings, manual drag/drop, double-click/tap or keyboard transformation, occasional automatic transformation/breath and a planner that avoids the six most recent destination regions. Human poses retain the desktop's increased height, with a narrower silhouette than the dragon.
- Desktop and phone texture profiles load nearby WebP pages on demand. Decoded page references are limited to eight. Missing pages hold the last complete pose; a manifest failure keeps the registered poster and leaves navigation's existing fallback usable.
- Existing full-screen smoke navigation and guided journey behaviour remain. Body feet match the bridge marker within one CSS pixel on desktop and phone. Continuous scrolling wakes the renderer without resetting its animation clock.
- Production TypeScript/Vite build, four regression scripts, 900 new remembered-destination trials, complete atlas-page checks and texture-cache recovery tests passed. Existing optional legacy bundle-size warnings remain.
- Private Chrome checks covered desktop/phone loading, five-second greeting expiry, human transformation, ambient flame placement and recovery, Work/Journey/Contact smoke navigation, bridge alignment, drag/drop, pause/resume, resizing, reduced motion and a forced manifest failure. No unexpected runtime errors occurred in normal-loading checks.
- Visual evidence: `output/portfolio-guardian-qa/desktop-hover.png`, `desktop-human.png`, `desktop-fire.png`, `desktop-journey-mid.png`, `production-mobile-travel.png`, `production-mobile-human.png` and `production-mobile-journey.png`. Evidence and intermediate native assets remain local; only web assets are published.
- A live cold-cache check exposed scrolling stutter from requesting body pages faster than they decoded. Body playback now waits for decoded frames, starts a new pose at its prefetched first frame and retains its clock across pause/resume. Two pages are prefetched ahead; delayed-download checks cover this path.
- Page transitions now use the same black/scarlet flame frames as the companion's breath. A muzzle-anchored cone expands into feathered rolling banks, with opaque coverage beneath the animated curls before committing the route. The gather phase preloads textures; late or blocked downloads use a stable matching vector fallback. Desktop, phone and blocked-download tests passed for colour, every corner's coverage, Work/Journey/Contact navigation and overlay cleanup. Visuals: `matching-flame-desktop.png`, `matching-flame-expanded-desktop.png` and the mobile/fallback equivalents in the same QA folder.

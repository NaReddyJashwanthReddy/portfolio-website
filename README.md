# Jashwanth Reddy - AI Portfolio

A React/TypeScript portfolio with a heavenly realm, an animated dragon guardian, a categorized Work archive, a scroll-driven Journey bridge and Contact links.

## Local development

```sh
npm ci
npm run dev
npm run build
```

Open http://127.0.0.1:5173/. React 19, TypeScript, Vite, Tailwind, Framer Motion and Lucide power the current experience. Shared components live in `src/components/ui`, with the `@` alias pointing to `src`.

## Current application

- `src/SkygardenPortfolio.tsx`: root navigation, landing and dragon-smoke transitions.
- `src/components/ui/realm-guardian.tsx`: approved breathing/cloud-travel atlases, hover greeting and roaming behavior.
- `src/components/ui/work-realm.tsx` and `src/data/work-catalog.ts`: six categories and fifteen selected career/project entries.
- `src/components/ui/heavenly-journey.tsx`: alternating career chapters along a heavenly bridge. The guardian follows scroll direction; chapter buttons work with motion paused.
- `src/components/ui/heavenly-contact.tsx`: email composer links, copy-email action, profiles and resume download.
- `public/resume.pdf`: current downloadable resume. `scripts/jake_resume.py` generates a Jake-inspired draft at `output/pdf/jashwanth_resume_latest.pdf`; set `PORTFOLIO_URL` to the verified production URL. Review the draft before copying it into `public/resume.pdf` and deploying.

The project widgets illustrate the user's work and do not call project backends. AgentForge remains labeled in development. Uncertain medical-model scores are excluded. The supplied visual references inform the theme; their fictional lore is not portfolio content. The optional GLB preview stays on the visitor's device.

The earlier `/motion` and legacy routes remain available. Asset source attribution is in `scripts/21st-sources.md`; generated assets are bundled under `public/assets`.

## Checks

```sh
node scripts/test-guardian-routes.mjs
node scripts/test-work-catalog.mjs
node scripts/test-journey-path.mjs
npm run build
```

Local design evidence is summarized in `design-qa.md`. Generated QA images, original art intermediates and unrelated local files are excluded from the repository. Vercel uses `vercel.json` for Vite builds and SPA route fallback.

## Publication

- Repository: https://github.com/NaReddyJashwanthReddy/portfolio-website (branch `main`).
- Production: https://jashwanth-ai-portfolio.vercel.app
- Vercel project: `jashwanth-ai-portfolio`, scope `longnidhoggs-projects`.

The previous portfolio address remains unchanged. This project was deployed from `tmp/deploy-heavenly`, explicitly linked to the new Vercel project. The local root `.vercel` mapping now also points to this new project; the previous mapping is backed up in `output/previous-vercel-project.json`. Automatic Git deployments are not connected. The new resume draft is awaiting review; the current website download has not been replaced.

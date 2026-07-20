# Khaos Nexus Embed Studio

A standalone, browser-based Discord embed builder and live preview studio for Khaos Nexus game modules.

## Included in the first release

- Responsive red-and-black Khaos Nexus interface
- Discord-style live message and button preview
- Message, embed, field, media, footer, timestamp, and action-row editing
- Templates for Palworld, ARK, maintenance, announcements, and incidents
- Discord character-limit and component validation
- Clean Discord JSON import, export, and clipboard copy
- Local browser autosave with no account or backend required
- Automated type checking, tests, production builds, and GitHub Pages deployment

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run typecheck
npm test
npm run build
```

## Security boundary

This repository is a static builder. Never commit Discord tokens, Supabase service-role keys, Palworld REST credentials, RCON passwords, or encryption keys. Live polling and privileged Discord actions belong in authenticated backend services.

## GitHub Pages

Repository settings must use **Settings → Pages → Source: GitHub Actions**. Merges to `main` are deployed automatically.
